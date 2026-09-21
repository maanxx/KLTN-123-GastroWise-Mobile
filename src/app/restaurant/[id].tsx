import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  CalendarCheck,
  Utensils,
  Share2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react-native';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState('MAIN');

  useEffect(() => {
    if (id) {
      fetchRestaurantDetail();
    }
  }, [id]);

  const fetchRestaurantDetail = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/restaurants/${id}`);
      setRestaurant(res);
    } catch (e) {
      console.log('Lỗi lấy chi tiết nhà hàng:', e);
      // Fallback mock nếu API lỗi
      setRestaurant({
        _id: id,
        name: 'Nhà Hàng Lẩu Nướng King BBQ',
        address: '12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh',
        phone: '0912345678',
        rating: 4.8,
        priceRange: '199.000đ - 399.000đ',
        cuisineType: 'Lẩu & Nướng Hàn Quốc',
        openHours: '10:00 - 22:30',
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        aiSummary: {
          positives: ['Thịt nướng sốt đậm đà, tươi ngon', 'Không gian rộng rãi, máy lạnh mát rượi', 'Phục vụ nhanh nhẹn'],
          negatives: ['Quán đông vào giờ cao điểm cuối tuần'],
        },
        menu: [
          { id: '1', category: 'MAIN', name: 'Combo Thịt Bò Mỹ Thượng Hạng', price: '299.000đ', image: 'https://images.unsplash.com/photo-1544025162-d76694265947' },
          { id: '2', category: 'MAIN', name: 'Lẩu Kim Chi Hải Sản Đặc Biệt', price: '249.000đ', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd' },
          { id: '3', category: 'SIDE', name: 'Kim Chi Muối Truyền Thống', price: '35.000đ' },
          { id: '4', category: 'DRINK', name: 'Trà Sữa Oolong Kem Béo', price: '45.000đ' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallPhone = () => {
    const phoneNumber = restaurant?.phone || restaurant?.soDienThoai || '0912345678';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleOpenMaps = () => {
    const address = restaurant?.address || restaurant?.diaChi || 'Gò Vấp, TP. Hồ Chí Minh';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={{ marginTop: 12, color: COLORS.slate[500], fontSize: 14 }}>Đang tải thông tin nhà hàng...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Cover Image & Header Actions */}
        <View style={{ position: 'relative', height: 260 }}>
          <Image
            source={{ uri: restaurant?.coverImage || restaurant?.image || restaurant?.hinhAnh || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Top Bar Floating Buttons */}
          <View style={{ position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Main Info Header */}
        <View style={{ padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: COLORS.slate[200] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 10 }}>
              {restaurant?.name || restaurant?.tenQuan || 'Nhà Hàng GastroWise'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Star size={16} color="#d97706" fill="#d97706" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#b45309' }}>
                {restaurant?.rating || restaurant?.diemTrungBinh || '4.8'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <MapPin size={16} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: COLORS.slate[600], flex: 1 }} numberOfLines={2}>
              {restaurant?.address || restaurant?.diaChi || 'Gò Vấp, TP. Hồ Chí Minh'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
            <TouchableOpacity
              onPress={handleCallPhone}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.slate[100],
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Phone size={16} color={COLORS.slate[800]} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800] }}>Gọi Điện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenMaps}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.slate[100],
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <MapPin size={16} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary[700] }}>Chỉ Đường</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Sentiment Review Summary Card */}
        <View style={{ margin: 20, padding: 16, backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1, borderColor: COLORS.slate[200] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Sparkles size={18} color={COLORS.primary[600]} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900] }}>
              Tóm Tắt Đánh Giá Bằng AI
            </Text>
          </View>

          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <ThumbsUp size={14} color={COLORS.emerald[600]} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.emerald[700] }}>Ưu điểm nổi bật:</Text>
            </View>
            {(restaurant?.aiSummary?.positives || ['Thực đơn phong phú', 'Không gian sạch sẽ']).map((pos: string, idx: number) => (
              <Text key={idx} style={{ fontSize: 12, color: COLORS.slate[600], marginLeft: 20, marginBottom: 2 }}>
                • {pos}
              </Text>
            ))}
          </View>

          {restaurant?.aiSummary?.negatives && restaurant.aiSummary.negatives.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <ThumbsDown size={14} color="#f43f5e" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e11d48' }}>Điểm cần lưu ý:</Text>
              </View>
              {restaurant.aiSummary.negatives.map((neg: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 12, color: COLORS.slate[600], marginLeft: 20, marginBottom: 2 }}>
                  • {neg}
                </Text>
              ))}
            </View>
          )}

          {/* Write Review Button */}
          <TouchableOpacity
            onPress={() => router.push(`/restaurant/review/${restaurant?._id || id}`)}
            style={{
              marginTop: 14,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: COLORS.slate[100],
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[900] }}>
              ✍️ Viết Đánh Giá & AI Scan Cảm Xúc
            </Text>
          </TouchableOpacity>
        </View>

        {/* Digital Menu Grid */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
            Thực Đơn Nhà Hàng
          </Text>

          {/* Menu Category Switcher */}
          <View style={{ flexDirection: 'row', backgroundColor: COLORS.slate[200], borderRadius: 12, padding: 3, marginBottom: 16 }}>
            {['MAIN', 'SIDE', 'DRINK'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveMenuTab(cat)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: activeMenuTab === cat ? '#ffffff' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeMenuTab === cat ? COLORS.slate[900] : COLORS.slate[600] }}>
                  {cat === 'MAIN' ? 'Món Chính' : cat === 'SIDE' ? 'Món Phụ' : 'Đồ Uống'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Menu Items */}
          {(restaurant?.menu || [])
            .filter((m: any) => m.category === activeMenuTab || !m.category)
            .map((item: any, index: number) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                }}
              >
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 60, height: 60, borderRadius: 10, marginRight: 12 }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900] }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[600], marginTop: 4 }}>
                    {item.price}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderTopWidth: 1,
          borderTopColor: COLORS.slate[200],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 12, color: COLORS.slate[500] }}>Mức giá tham khảo</Text>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.primary[600] }}>
            {restaurant?.priceRange || '199.000đ - 399.000đ'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/ai-planner?initialPrompt=${encodeURIComponent(`Food tour kết hợp với ${restaurant?.name || 'nhà hàng này'}`)}`)}
          style={{
            backgroundColor: COLORS.slate[900],
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Sparkles size={18} color={COLORS.primary[500]} style={{ marginRight: 8 }} />
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
            TẠO LỘ TRÌNH AI
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
