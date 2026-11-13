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
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Flame, Sparkles, SlidersHorizontal, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api/client';
import { tracker } from '../../lib/analytics/tracker';
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
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [personalizedRestaurants, setPersonalizedRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalizedLoading, setIsPersonalizedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      fetchRestaurants(),
      fetchWeather(),
      fetchPersonalized(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const fetchWeather = async () => {
    try {
      const res: any = await apiClient.get('/restaurants/weather-recommend');
      if (res && res.weather) {
        setWeatherData(res.weather);
      }
    } catch (e) {
      console.log('Lỗi lấy gợi ý thời tiết:', e);
    }
  };

  const fetchPersonalized = async () => {
    try {
      setIsPersonalizedLoading(true);
      const res: any = await apiClient.get('/restaurants/recommended', {
        params: { lat: 10.7769, lon: 106.7009, limit: 8 },
      });
      const list = res?.data || (Array.isArray(res) ? res : []);
      setPersonalizedRestaurants(list);
    } catch (e) {
      console.log('Lỗi lấy gợi ý cá nhân hóa Taste DNA:', e);
    } finally {
      setIsPersonalizedLoading(false);
    }
  };

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

  const handleRestaurantPress = (item: any, source: string = 'featured') => {
    const id = item._id || item.id;
    tracker.track({
      eventType: 'click',
      targetType: 'restaurant',
      targetId: String(id),
      metadata: {
        source,
        score: item.aiScore,
        explanation: item.explanation,
      },
    });
    router.push(`/restaurant/${id}`);
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
                {weatherData?.city || 'Hồ Chí Minh'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/notifications')}
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
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                router.push({ pathname: '/(tabs)/explore', params: { search: searchQuery } });
              }
            }}
          />
          <TouchableOpacity 
            style={{ padding: 4 }}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <SlidersHorizontal size={18} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 30 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary[600]]} />
        }
      >
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
        <View style={{ marginHorizontal: 20, marginBottom: 20, padding: 14, backgroundColor: weatherData?.weather_type === 'rainy' ? '#e0f2fe' : '#fef3c7', borderRadius: 16, borderWidth: 1, borderColor: weatherData?.weather_type === 'rainy' ? '#bae6fd' : '#fde68a', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>
            {weatherData?.weather_type === 'rainy' ? '🌧️' : (weatherData?.weather_type === 'hot' ? '☀️' : '🌤️')}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: weatherData?.weather_type === 'rainy' ? '#0369a1' : '#b45309' }}>
              {weatherData?.banner_title || 'Gợi Ý Theo Thời Tiết Nắng Nóng (32°C)'}
            </Text>
            <Text style={{ fontSize: 12, color: weatherData?.weather_type === 'rainy' ? '#075985' : '#92400e', marginTop: 2 }}>
              {weatherData?.banner_desc || 'Nên dùng các món thanh mát: Trà sữa kem béo, Chè Thái, Phở cuốn & Hải sản tươi ngon.'}
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
                onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: cat.name } })}
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

        {/* [TASK-P2-01 & TASK-P2-02] DÀNH RIÊNG CHO KHẨU VỊ (TASTE DNA MATCH) */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sparkles size={18} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                Dành Riêng Cho Khẩu Vị
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile/taste-dna')}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary[700] }}>
                DNA của bạn →
              </Text>
            </TouchableOpacity>
          </View>

          {isPersonalizedLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary[600]} style={{ marginVertical: 20 }} />
          ) : personalizedRestaurants.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {personalizedRestaurants.map((item) => (
                <TouchableOpacity
                  key={`pers_${item._id || item.id}`}
                  onPress={() => handleRestaurantPress(item, 'taste_dna_carousel')}
                  style={{
                    width: 250,
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    marginHorizontal: 6,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: COLORS.slate[200],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item.image || item.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
                      style={{ width: '100%', height: 130 }}
                      resizeMode="cover"
                    />
                    {item.tasteScore ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(16, 185, 129, 0.95)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Sparkles size={11} color="#ffffff" style={{ marginRight: 3 }} />
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#ffffff' }}>
                          {Math.round(item.tasteScore * 100)}% Hợp gu
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={{ padding: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 6 }} numberOfLines={1}>
                        {item.name || item.tenQuan || 'Nhà Hàng GastroWise'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Star size={12} color="#d97706" fill="#d97706" style={{ marginRight: 2 }} />
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#b45309' }}>
                          {Number(item.rating || item.diemTrungBinh || 4.8).toFixed(1)}
                        </Text>
                      </View>
                    </View>

                    {/* Explainability Pill */}
                    <View
                      style={{
                        marginTop: 6,
                        backgroundColor: '#f0fdf4',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#bbf7d0',
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#15803d', fontWeight: '500' }} numberOfLines={1}>
                        {item.explanation || '✨ Gợi ý phù hợp khẩu vị của bạn'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.slate[100] }}>
                      <Text style={{ fontSize: 12, color: COLORS.slate[500] }}>
                        📍 {item.distance ? `${item.distance}km` : 'Gần bạn'}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[600] }}>
                        {item.giaCa || item.priceRange || '30.000đ+'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
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
                onPress={() => handleRestaurantPress(item, 'featured_feed')}
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
                      {item.name || item.tenQuan || 'Nhà Hàng GastroWise'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Star size={14} color="#d97706" fill="#d97706" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#b45309' }}>
                        {(() => {
                          const r = item.rating || item.diemTrungBinh;
                          if (!r) return '4.8';
                          const num = Number(r);
                          return (num > 5 ? (num / 2) : num).toFixed(1);
                        })()}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 13, color: COLORS.slate[500], marginTop: 4 }} numberOfLines={1}>
                    📍 {item.diaChi || item.address || 'TP. Hồ Chí Minh'}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.slate[100] }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[600] }}>
                      {item.giaCa || item.priceRange || '30.000đ - 150.000đ'}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.slate[500], fontWeight: '500' }}>
                      {item.tags ? item.tags.split(',')[0] : (item.cuisineType || 'Nhà hàng')}
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
