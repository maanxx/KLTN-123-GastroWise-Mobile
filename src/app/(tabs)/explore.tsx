import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, Filter, Star, MapPin, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

const FILTERS = ['Tất cả', 'Gần bạn (1-3km)', 'Đánh giá cao (4.5+★)', 'Giá tốt'];

export default function ExploreScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/restaurants');
      const data = Array.isArray(res) ? res : res?.data || [];
      setRestaurants(data);
    } catch (e) {
      console.log('Lỗi lấy danh sách khám phá:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Compass size={24} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Khám Phá Nhà Hàng
          </Text>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.slate[100],
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 46,
          }}
        >
          <Search size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: COLORS.slate[900] }}
            placeholder="Tìm theo tên nhà hàng, loại hình..."
            placeholderTextColor={COLORS.slate[400]}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={{ backgroundColor: '#ffffff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.slate[200] }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedFilter(item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginHorizontal: 4,
                backgroundColor: selectedFilter === item ? COLORS.slate[900] : COLORS.slate[100],
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: selectedFilter === item ? '#ffffff' : COLORS.slate[700],
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Restaurant List */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginVertical: 30 }} />
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item._id || item.id}
              onPress={() => router.push(`/restaurant/${item._id || item.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                marginBottom: 16,
                flexDirection: 'row',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: COLORS.slate[200],
              }}
            >
              <Image
                source={{ uri: item.image || item.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
                style={{ width: 110, height: 110 }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900] }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.slate[500], marginTop: 2 }} numberOfLines={1}>
                    📍 {item.address || 'Gò Vấp, Hồ Chí Minh'}
                  </Text>
                </View>

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
        )}
      </ScrollView>
    </View>
  );
}
