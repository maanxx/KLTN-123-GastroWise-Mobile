import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Route,
  MapPin,
  Navigation,
  Clock,
  Leaf,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react-native';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [itinerary, setItinerary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItineraryDetail();
    }
  }, [id]);

  const fetchItineraryDetail = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/itineraries/${id}`);
      setItinerary(res);
    } catch (e) {
      console.log('Lỗi lấy chi tiết lộ trình:', e);
      // Fallback sample mock if endpoint fails or ID mock
      setItinerary({
        _id: id,
        title: 'Food Tour Ẩm Thực Gò Vấp',
        prompt: 'Lẩu nướng & trà sữa ở Gò Vấp',
        budget: 350000,
        start_time: 'Buổi Tối (18:00 - 21:30)',
        stops: [
          {
            stop_id: '1',
            order_index: 0,
            restaurant_name: 'Nhà Hàng Lẩu Nướng King BBQ',
            restaurant_id: 'r1',
            address: '12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM',
            lat: 10.822,
            lng: 106.687,
          },
          {
            stop_id: '2',
            order_index: 1,
            restaurant_name: 'Lẩu Haidilao Phạm Văn Đồng',
            restaurant_id: 'r2',
            address: 'L3-01 Vincom Plaza, Gò Vấp, TP.HCM',
            lat: 10.828,
            lng: 106.69,
          },
          {
            stop_id: '3',
            order_index: 2,
            restaurant_name: 'Phúc Long Coffee & Tea',
            restaurant_id: 'r3',
            address: 'Phan Văn Trị, Gò Vấp, TP.HCM',
            lat: 10.831,
            lng: 106.695,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMaps = (stop: any) => {
    const query = stop.address ? encodeURIComponent(stop.address) : `${stop.lat},${stop.lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={{ marginTop: 12, color: COLORS.slate[500], fontSize: 14 }}>Đang tải lộ trình Food Tour...</Text>
      </View>
    );
  }

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
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900], flex: 1 }} numberOfLines={1}>
          {itinerary?.title || 'Chi Tiết Lộ Trình Food Tour'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Overview Banner Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.slate[200],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Sparkles size={20} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900] }}>
              Hành Trình Đã Tối Ưu Bằng AI
            </Text>
          </View>

          <Text style={{ fontSize: 13, color: COLORS.slate[600], marginBottom: 14 }}>
            💬 Yêu cầu: "{itinerary?.prompt}"
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ backgroundColor: COLORS.slate[100], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>
                📍 {itinerary?.stops?.length || 0} Điểm Dừng
              </Text>
            </View>

            {itinerary?.budget ? (
              <View style={{ backgroundColor: COLORS.primary[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>
                  💵 Ngân sách: {itinerary.budget.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            ) : null}

            <View style={{ backgroundColor: COLORS.emerald[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Leaf size={12} color={COLORS.emerald[600]} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.emerald[700] }}>
                Tiết kiệm ~1.5kg CO2
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Stops */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 14 }}>
          Lịch Trình Di Chuyển Từng Chặng (Stops)
        </Text>

        {(itinerary?.stops || []).map((stop: any, index: number) => (
          <View
            key={stop.stop_id || index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
              position: 'relative',
            }}
          >
            {/* Step Number Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: COLORS.slate[900],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>{index + 1}</Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], flex: 1 }}>
                {stop.restaurant_name}
              </Text>
            </View>

            {stop.address && (
              <Text style={{ fontSize: 13, color: COLORS.slate[500], marginBottom: 12, marginLeft: 38 }}>
                📍 {stop.address}
              </Text>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginLeft: 38 }}>
              <TouchableOpacity
                onPress={() => handleOpenMaps(stop)}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.primary[50],
                  paddingVertical: 10,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Navigation size={14} color={COLORS.primary[700]} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>
                  Chỉ Đường Maps
                </Text>
              </TouchableOpacity>

              {stop.restaurant_id && (
                <TouchableOpacity
                  onPress={() => router.push(`/restaurant/${stop.restaurant_id}`)}
                  style={{
                    backgroundColor: COLORS.slate[100],
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>Xem Quán</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
