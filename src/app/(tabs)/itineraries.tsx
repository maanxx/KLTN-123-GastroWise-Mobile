import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Route, Plus, MapPin, Sparkles, Navigation, Clock, Leaf, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function ItinerariesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/itineraries');
      const data = Array.isArray(res) ? res : res?.data || [];
      setItineraries(data);
    } catch (e) {
      console.log('Lỗi lấy danh sách lộ trình:', e);
      // Fallback sample data if not logged in or backend empty
      setItineraries([
        {
          _id: 'iti-1',
          title: 'Food Tour Lẩu & Nướng Đêm Gò Vấp',
          prompt: 'Ăn lẩu nướng buổi tối ở Gò Vấp',
          budget: 350000,
          created_at: '2026-09-20',
          stops: [
            { stop_id: '1', restaurant_name: 'King BBQ Gò Vấp' },
            { stop_id: '2', restaurant_name: 'Lẩu Haidilao Phạm Văn Đồng' },
            { stop_id: '3', restaurant_name: 'Phúc Long Coffee & Tea' },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItineraries();
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
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Route size={24} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Lộ Trình Food Tour
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/ai-planner')}
          style={{
            backgroundColor: COLORS.primary[600],
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>Tạo Mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary[600]]} />}
      >
        {/* Banner Create AI Itinerary */}
        <TouchableOpacity
          onPress={() => router.push('/ai-planner')}
          style={{
            backgroundColor: COLORS.slate[900],
            borderRadius: 18,
            padding: 18,
            marginBottom: 20,
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
              Lên Lộ Trình AI Tự Động
            </Text>
            <Text style={{ color: COLORS.slate[400], fontSize: 12, marginTop: 2 }}>
              Nhập khẩu vị & ngân sách -> AI tự động tối ưu hóa đường đi ngắn nhất
            </Text>
          </View>
        </TouchableOpacity>

        {/* List of Itineraries */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
          Lịch Sử Chuyến Đi Của Bạn
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginVertical: 40 }} />
        ) : itineraries.length > 0 ? (
          itineraries.map((item) => (
            <TouchableOpacity
              key={item._id || item.id}
              onPress={() => router.push(`/itinerary/${item._id || item.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], flex: 1, marginRight: 8 }}>
                  {item.title || 'Hành trình khám phá ẩm thực'}
                </Text>
                <ChevronRight size={20} color={COLORS.slate[400]} />
              </View>

              <Text style={{ fontSize: 13, color: COLORS.slate[500], marginBottom: 12 }}>
                💬 "{item.prompt || 'Trải nghiệm ẩm thực tự do'}"
              </Text>

              {/* Stops overview */}
              <View style={{ backgroundColor: COLORS.slate[50], padding: 12, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[700], marginBottom: 6 }}>
                  📍 Các điểm dừng ({item.stops?.length || 0} địa điểm):
                </Text>
                {(item.stops || []).map((stop: any, idx: number) => (
                  <Text key={idx} style={{ fontSize: 12, color: COLORS.slate[600], marginBottom: 3 }}>
                    {idx + 1}. {stop.restaurant_name || 'Điểm dừng ẩm thực'}
                  </Text>
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.emerald[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Leaf size={12} color={COLORS.emerald[600]} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.emerald[700] }}>
                    Giảm ~1.5kg CO2
                  </Text>
                </View>

                {item.budget ? (
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[600] }}>
                    Dự kiến: {item.budget.toLocaleString('vi-VN')}đ
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: COLORS.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Route size={32} color={COLORS.primary[600]} />
            </View>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900], textAlign: 'center' }}>
              Chưa có lộ trình Food Tour nào
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.slate[500], textAlign: 'center', marginTop: 6, maxWidth: 280 }}>
              Hãy bấm "Tạo Mới" để AI tự động thiết kế chuyến đi ăn uống tối ưu quãng đường di chuyển cho bạn!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
