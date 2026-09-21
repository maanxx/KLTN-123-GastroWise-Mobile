import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, MapPin, Dna, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { apiClient } from '../lib/api/client';
import { COLORS } from '../constants';

const CATEGORY_FILTERS = ['Tất cả', 'Món Việt', 'Lẩu & Nướng', 'Cafe', 'Hải Sản'];

export default function FavoritesScreen() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/restaurants');
      const data = Array.isArray(res) ? res : res?.data || [];
      // Mock saved list
      setFavorites(data.slice(0, 3));
    } catch (e) {
      console.log('Lỗi lấy danh sách yêu thích:', e);
    } finally {
      setIsLoading(false);
    }
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
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[200],
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={22} color={COLORS.slate[800]} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900] }}>
          Bộ Sưu Tập Yêu Thích
        </Text>
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

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 16 }}>
          {CATEGORY_FILTERS.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                marginRight: 8,
                backgroundColor: selectedCategory === cat ? COLORS.slate[900] : '#ffffff',
                borderWidth: 1,
                borderColor: selectedCategory === cat ? COLORS.slate[900] : COLORS.slate[200],
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedCategory === cat ? '#ffffff' : COLORS.slate[700] }}>
                {cat}
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
    </View>
  );
}
