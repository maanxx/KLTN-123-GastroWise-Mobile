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
import { ArrowLeft, Heart, Star, MapPin, Dna, Sparkles, FolderPlus, X, Plus, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../lib/api/client';
import { COLORS } from '../constants';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Feature 4: Folder Collections State
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

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/restaurants');
      const data = Array.isArray(res) ? res : res?.data || [];
      // Mock saved list
      setFavorites(data.slice(0, 4));
    } catch (e) {
      console.log('Lỗi lấy danh sách yêu thích:', e);
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
        onPress: () => {
          setFavorites((prev) => prev.filter((item) => (item._id || item.id) !== id));
        },
      },
    ]);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
                Phân tích tự động dựa trên các nhà hàng đã lưu
              </Text>
            </View>
          </View>

          {/* Progress bars */}
          <View style={{ gap: 10 }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>Món Việt Truyền Thống</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[600] }}>40%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '40%', height: '100%', backgroundColor: COLORS.primary[600] }} />
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>Lẩu & Nướng Hàn Quốc</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#d97706' }}>30%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '30%', height: '100%', backgroundColor: '#d97706' }} />
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700] }}>Cafe & Trà Sữa</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.emerald[600] }}>20%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.slate[100], borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: '20%', height: '100%', backgroundColor: COLORS.emerald[600] }} />
              </View>
            </View>
          </View>
        </View>

        {/* Feature 4: Smart Favorite Collection Folders Slider */}
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
                source={{ uri: item.coverImage || item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
                style={{ width: 110, height: 110 }}
                resizeMode="cover"
              />

              <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 6 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveFavorite(item._id || item.id)}>
                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, color: COLORS.slate[500] }} numberOfLines={1}>
                  📍 {item.address || 'Gò Vấp, TP. Hồ Chí Minh'}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[600] }}>
                    {item.priceRange || '150.000đ - 300.000đ'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Star size={12} color="#d97706" fill="#d97706" style={{ marginRight: 2 }} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>
                      {item.rating || '4.8'}
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

      {/* Feature 4: CREATE NEW FOLDER COLLECTION MODAL */}
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
