import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Flame, Sparkles, SlidersHorizontal, Bell } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

const CATEGORIES = [
  { id: '1', name: 'Lẩu & Nướng', icon: '🍲' },
  { id: '2', name: 'Nhật Bản', icon: '🍣' },
  { id: '3', name: 'Buffet', icon: '🥩' },
  { id: '4', name: 'Hải Sản', icon: '🦀' },
  { id: '5', name: 'Món Việt', icon: '🍜' },
  { id: '6', name: 'Cà Phê & Bánh', icon: '☕' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/restaurants');
      const data = Array.isArray(res) ? res : res?.data || [];
      setRestaurants(data);
    } catch (e) {
      console.log('Lỗi lấy danh sách nhà hàng:', e);
    } finally {
      setIsLoading(false);
    }
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
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[200],
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 13, color: COLORS.slate[500], fontWeight: '500' }}>
              Vị trí của bạn
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MapPin size={16} color={COLORS.primary[600]} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900] }}>
                Gò Vấp, Hồ Chí Minh
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.slate[100],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} color={COLORS.slate[700]} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.slate[100],
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 46,
            marginTop: 14,
          }}
        >
          <Search size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: COLORS.slate[900] }}
            placeholder="Tìm nhà hàng, món ăn, khu vực..."
            placeholderTextColor={COLORS.slate[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={{ padding: 4 }}>
            <SlidersHorizontal size={18} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Banner AI Gợi ý */}
        <TouchableOpacity
          onPress={() => router.push('/ai-planner')}
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 12,
            padding: 16,
            borderRadius: 18,
            backgroundColor: COLORS.slate[900],
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Sparkles size={24} color={COLORS.primary[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
              AI Food Tour Planner
            </Text>
            <Text style={{ color: COLORS.slate[400], fontSize: 12, marginTop: 2 }}>
              Lên lịch trình ăn uống + tự động tối ưu đường đi ngắn nhất
            </Text>
          </View>
        </TouchableOpacity>

        {/* Dynamic Weather & Context Recommendation */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, padding: 14, backgroundColor: '#fef3c7', borderRadius: 16, borderWidth: 1, borderColor: '#fde68a', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>☀️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#b45309' }}>
              Gợi Ý Theo Thời Tiết Nắng Nóng (32°C)
            </Text>
            <Text style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
              Nên dùng các món thanh mát: Trà sữa kem béo, Chè Thái, Phở cuốn & Hải sản tươi ngon.
            </Text>
          </View>
        </View>

        {/* Category Horizontal Slider */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], paddingHorizontal: 20, marginBottom: 12 }}>
            Danh Mục Ẩm Thực
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginHorizontal: 4,
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                  flexDirection: 'row',
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 6 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800] }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Restaurants List */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Flame size={20} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                Nhà Hàng Nổi Bật
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary[600] }}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginVertical: 30 }} />
          ) : (
            restaurants.slice(0, 6).map((item) => (
              <TouchableOpacity
                key={item._id || item.id}
                onPress={() => router.push(`/restaurant/${item._id || item.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 16,
                  marginBottom: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                }}
              >
                <Image
                  source={{ uri: item.image || item.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 8 }}>
                      {item.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Star size={14} color="#d97706" fill="#d97706" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#b45309' }}>
                        {item.rating || '4.8'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 13, color: COLORS.slate[500], marginTop: 4 }} numberOfLines={1}>
                    📍 {item.address || 'Gò Vấp, TP. Hồ Chí Minh'}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.slate[100] }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[600] }}>
                      {item.priceRange || '150.000đ - 350.000đ'}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.slate[500], fontWeight: '500' }}>
                      {item.cuisineType || 'Ẩm thực Á - Âu'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
