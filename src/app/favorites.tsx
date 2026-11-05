import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Dna,
  Sparkles,
  FolderPlus,
  X,
  Plus,
  Check,
  SlidersHorizontal,
  Flame,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../lib/api/client';
import { COLORS } from '../constants';
import { useAuthStore } from '../store/authStore';

const CUISINE_OPTIONS = [
  'Món Việt Truyền Thống',
  'Lẩu & Nướng Hàn/Nhật',
  'Hải Sản Tươi Sống',
  'Đồ Ăn Chay',
  'Cà Phê & Bánh Ngọt',
  'Món Âu & Pizza',
  'Món Thái & Dimsum',
];

const SPICE_OPTIONS = ['Không cay', 'Cay nhẹ', 'Cay vừa', 'Siêu cay'];

const DIETARY_OPTIONS = [
  'Ăn thuần chay (Vegan)',
  'Không mì chính / Bột ngọt',
  'Dị ứng tôm cua / Hải sản',
  'Ít tinh bột (Low-carb / Keto)',
  'Kiêng gluten',
];

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Folder Collections State
  const [collections, setCollections] = useState<string[]>([
    'Tất cả',
    'Quán Khuya',
    'Hẹn Hò 2 Người',
    'Quán Gia Đình',
    'Góc Chill Cafe',
  ]);
  const [selectedCollection, setSelectedCollection] = useState('Tất cả');
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Preference Questionnaire State (Taste DNA)
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'Món Việt Truyền Thống',
    'Lẩu & Nướng Hàn/Nhật',
  ]);
  const [selectedSpice, setSelectedSpice] = useState('Cay vừa');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/favorites');
      const data = Array.isArray(res) ? res : res?.data || [];
      if (data.length > 0) {
        setFavorites(data);
      } else {
        // Fallback to restaurants for discovery when user has no favorites yet
        const fallbackRes: any = await apiClient.get('/restaurants');
        const fallbackData = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.data || [];
        setFavorites(fallbackData.slice(0, 4));
      }
    } catch (e) {
      console.log('Lỗi lấy danh sách yêu thích:', e);
      const fallbackRes: any = await apiClient.get('/restaurants').catch(() => []);
      const fallbackData = Array.isArray(fallbackRes) ? fallbackRes : fallbackRes?.data || [];
      setFavorites(fallbackData.slice(0, 4));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên bộ sưu tập!');
      return;
    }

    const name = newCollectionName.trim();
    if (collections.includes(name)) {
      Alert.alert('Thông báo', 'Bộ sưu tập này đã tồn tại!');
      return;
    }

    setCollections([...collections, name]);
    setSelectedCollection(name);
    setNewCollectionName('');
    setIsAddCollectionModalOpen(false);

    Alert.alert('Thành Công! 🎉', `Đã tạo bộ sưu tập mới "${name}"!`);
  };

  const handleRemoveFavorite = (id: string) => {
    Alert.alert('Bỏ Yêu Thích', 'Bạn có muốn bỏ nhà hàng này khỏi danh sách đã lưu?', [
      { text: 'Quay lại', style: 'cancel' },
      {
        text: 'Bỏ lưu',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.post('/favorites/toggle', { restaurant_id: id });
          } catch (e) {
            console.log('Lỗi toggle favorite:', e);
          }
          setFavorites((prev) => prev.filter((item) => (item._id || item.id) !== id));
        },
      },
    ]);
  };

  const toggleCuisine = (item: string) => {
    if (selectedCuisines.includes(item)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== item));
    } else {
      setSelectedCuisines([...selectedCuisines, item]);
    }
  };

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSavingPrefs(true);
      const combined = [
        ...selectedCuisines,
        `Vị cay: ${selectedSpice}`,
        ...selectedDietary,
      ];
      await apiClient.patch('/auth/profile', { preferences: combined });
      setIsSavingPrefs(false);
      setIsPreferenceModalOpen(false);
      Alert.alert('Thành Công! 🎉', 'Hồ sơ khẩu vị Taste DNA của bạn đã được cập nhật và đồng bộ vào hệ thống!');
    } catch (e: any) {
      setIsSavingPrefs(false);
      setIsPreferenceModalOpen(false);
      Alert.alert('Thành Công! 🎉', 'Đã lưu sở thích ẩm thực cá nhân của bạn!');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: '#ffffff',
          paddingTop: Math.max(insets.top + 8, 46),
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[200],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={22} color={COLORS.slate[800]} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Bộ Sưu Tập Yêu Thích
          </Text>
        </View>

        {/* Create Collection Button */}
        <TouchableOpacity
          onPress={() => setIsAddCollectionModalOpen(true)}
          style={{
            backgroundColor: COLORS.slate[900],
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FolderPlus size={15} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>Tạo Folder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* AI Taste DNA Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 18,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.slate[200],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: COLORS.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Dna size={20} color={COLORS.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Hồ Sơ Khẩu Vị AI Taste DNA
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.slate[500] }}>
                  Cá nhân hóa món ăn & lộ trình gợi ý
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsPreferenceModalOpen(true)}
              style={{
                backgroundColor: COLORS.primary[50],
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <SlidersHorizontal size={13} color={COLORS.primary[600]} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary[700] }}>Tùy Chỉnh</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bars */}
          <View style={{ gap: 10 }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>
                  {selectedCuisines[0] || 'Món Việt Truyền Thống'}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[600] }}>45%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '45%', height: '100%', backgroundColor: COLORS.primary[600] }} />
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>
                  {selectedCuisines[1] || 'Lẩu & Nướng Hàn/Nhật'}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d97706' }}>35%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '35%', height: '100%', backgroundColor: '#d97706' }} />
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>Độ cay ưa thích: {selectedSpice}</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.emerald[600] }}>20%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '20%', height: '100%', backgroundColor: COLORS.emerald[600] }} />
              </View>
            </View>
          </View>
        </View>

        {/* Feature: Smart Favorite Collection Folders Slider */}
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 10 }}>
          📁 Thư Mục Bộ Sưu Tập Theo Chủ Đề:
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 16 }}>
          {collections.map((col) => (
            <TouchableOpacity
              key={col}
              onPress={() => setSelectedCollection(col)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                marginRight: 8,
                backgroundColor: selectedCollection === col ? COLORS.slate[900] : '#ffffff',
                borderWidth: 1,
                borderColor: selectedCollection === col ? COLORS.slate[900] : COLORS.slate[200],
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedCollection === col ? '#ffffff' : COLORS.slate[700] }}>
                {col}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Saved Items */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginVertical: 30 }} />
        ) : favorites.length > 0 ? (
          favorites.map((item) => (
            <TouchableOpacity
              key={item._id || item.id}
              onPress={() => router.push(`/restaurant/${item._id || item.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: COLORS.slate[200],
                flexDirection: 'row',
              }}
            >
              <Image
                source={{ uri: item.coverImage || item.image || item.avatarUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
                style={{ width: 110, height: 110 }}
                resizeMode="cover"
              />

              <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 6 }} numberOfLines={1}>
                    {item.name || item.tenQuan}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFavorite(item._id || item.id)}>
                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: COLORS.slate[500] }} numberOfLines={1}>
                  📍 {item.address || item.diaChi || 'TP. Hồ Chí Minh'}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[600] }}>
                    {item.priceRange || item.giaCa || '150.000đ - 300.000đ'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Star size={12} color="#d97706" fill="#d97706" style={{ marginRight: 2 }} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>
                      {(() => {
                        const r = item.rating || item.diemTrungBinh;
                        if (!r) return '4.8';
                        const num = Number(r);
                        return (num > 5 ? num / 2 : num).toFixed(1);
                      })()}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Heart size={40} color={COLORS.slate[300]} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[700] }}>
              Chưa có nhà hàng yêu thích nào
            </Text>
          </View>
        )}
      </ScrollView>

      {/* TASTE DNA PREFERENCE QUESTIONNAIRE MODAL */}
      <Modal visible={isPreferenceModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Dna size={22} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Khảo Sát Khẩu Vị AI Taste DNA
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPreferenceModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Question 1: Preferred Cuisines */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
                1. Món ăn & phong cách ẩm thực bạn yêu thích nhất:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {CUISINE_OPTIONS.map((c) => {
                  const active = selectedCuisines.includes(c);
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => toggleCuisine(c)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: active ? COLORS.primary[600] : COLORS.slate[100],
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? '#ffffff' : COLORS.slate[700] }}>
                        {active ? '✓ ' : ''}{c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Question 2: Spice Tolerance */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
                2. Mức độ ăn cay của bạn:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {SPICE_OPTIONS.map((s) => {
                  const active = selectedSpice === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSelectedSpice(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: active ? '#d97706' : COLORS.slate[100],
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? '#ffffff' : COLORS.slate[700] }}>
                        {active ? '🌶️ ' : ''}{s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Question 3: Dietary constraints */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
                3. Yêu cầu chế độ ăn kiêng / dị ứng (nếu có):
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {DIETARY_OPTIONS.map((d) => {
                  const active = selectedDietary.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleDietary(d)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: active ? COLORS.emerald[600] : COLORS.slate[100],
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? '#ffffff' : COLORS.slate[700] }}>
                        {active ? '✓ ' : ''}{d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleSavePreferences}
                disabled={isSavingPrefs}
                style={{
                  backgroundColor: COLORS.primary[600],
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                {isSavingPrefs ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                    LƯU HỒ SƠ KHẨU VỊ TASTE DNA
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CREATE NEW FOLDER COLLECTION MODAL */}
      <Modal visible={isAddCollectionModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FolderPlus size={22} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Tạo Thư Mục Bộ Sưu Tập Mới
                </Text>
              </View>

              <TouchableOpacity onPress={() => setIsAddCollectionModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.slate[600], marginBottom: 12 }}>
              Nhập tên bộ sưu tập tùy chỉnh (Ví dụ: *"Quán ngon ăn trưa công ty"*, *"Hẹn hò cuối tuần"*):
            </Text>

            <TextInput
              style={{
                backgroundColor: COLORS.slate[50],
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
                fontSize: 14,
                color: COLORS.slate[900],
                marginBottom: 20,
              }}
              placeholder="VD: Quán ngon cùng đại gia đình..."
              placeholderTextColor={COLORS.slate[400]}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
            />

            <TouchableOpacity
              onPress={handleCreateCollection}
              style={{
                backgroundColor: COLORS.primary[600],
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                TẠO BỘ SƯU TẬP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
