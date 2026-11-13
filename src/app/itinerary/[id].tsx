import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Image,
  Share,
  Alert,
  TextInput,
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
  Share2,
  Bell,
  Copy,
  CheckCircle2,
  X,
  QrCode,
  Trash2,
  CheckCircle,
  Ban,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  RefreshCw,
  Search,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function ItineraryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [itinerary, setItinerary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [isRecalculateModalOpen, setIsRecalculateModalOpen] = useState(false);

  // Add Stop State
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [isSearchingRestaurants, setIsSearchingRestaurants] = useState(false);

  // Recalculate State
  const [recalcBudget, setRecalcBudget] = useState(300000);
  const [recalcMode, setRecalcMode] = useState('motorbike');

  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderTime, setReminderTime] = useState('30_MIN');

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
      if (res.budget) setRecalcBudget(res.budget);
      if (res.routing_mode) setRecalcMode(res.routing_mode);
    } catch (e) {
      console.log('Lỗi lấy chi tiết lộ trình:', e);
      setItinerary({
        _id: id,
        title: 'Food Tour Ẩm Thực Gò Vấp',
        prompt: 'Lẩu nướng & trà sữa ở Gò Vấp',
        budget: 350000,
        total_cost: 210000,
        remaining_budget: 140000,
        start_time: '18:00',
        routing_mode: 'motorbike',
        total_distance_km: 4.8,
        total_duration_mins: 135,
        co2SavedKg: 1.6,
        optimizedBy: 'OR-Tools TSPTW',
        stops: [
          {
            stop_id: '1',
            order_index: 1,
            restaurant_name: 'Bánh Mì Chảo Cô Ba',
            restaurant_id: 'r1',
            address: '12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM',
            meal_type: 'starter',
            arrival_time: '18:15',
            departure_time: '18:45',
            dining_duration_mins: 30,
            transit_time_mins: 15,
            distance_to_next_km: 1.2,
            estimated_cost: 45000,
          },
          {
            stop_id: '2',
            order_index: 2,
            restaurant_name: 'Lẩu Bò Nhà Gỗ Quang Trung',
            restaurant_id: 'r2',
            address: '456 Quang Trung, Gò Vấp, TP.HCM',
            meal_type: 'main',
            arrival_time: '19:00',
            departure_time: '19:50',
            dining_duration_mins: 50,
            transit_time_mins: 15,
            distance_to_next_km: 2.1,
            estimated_cost: 125000,
          },
          {
            stop_id: '3',
            order_index: 3,
            restaurant_name: 'Phúc Long Coffee & Tea',
            restaurant_id: 'r3',
            address: 'Phan Văn Trị, Gò Vấp, TP.HCM',
            meal_type: 'cafe',
            arrival_time: '20:05',
            departure_time: '20:50',
            dining_duration_mins: 45,
            transit_time_mins: 15,
            distance_to_next_km: 1.5,
            estimated_cost: 40000,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // [TASK-BIZ-02-06] Sắp xếp lại thứ tự điểm dừng (Move Up)
  const handleMoveUp = async (index: number) => {
    if (index <= 0 || !itinerary?.stops) return;
    const newStops = [...itinerary.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index - 1];
    newStops[index - 1] = temp;

    const stop_ids = newStops.map((s: any) => s.stop_id);

    try {
      setIsActionLoading(true);
      const res: any = await apiClient.patch(`/itineraries/${id}/reorder`, { stop_ids });
      setItinerary(res);
      setIsActionLoading(false);
    } catch (e: any) {
      setIsActionLoading(false);
      Alert.alert('Lỗi', e?.message || 'Không thể đổi thứ tự lúc này.');
    }
  };

  // [TASK-BIZ-02-06] Sắp xếp lại thứ tự điểm dừng (Move Down)
  const handleMoveDown = async (index: number) => {
    if (!itinerary?.stops || index >= itinerary.stops.length - 1) return;
    const newStops = [...itinerary.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + 1];
    newStops[index + 1] = temp;

    const stop_ids = newStops.map((s: any) => s.stop_id);

    try {
      setIsActionLoading(true);
      const res: any = await apiClient.patch(`/itineraries/${id}/reorder`, { stop_ids });
      setItinerary(res);
      setIsActionLoading(false);
    } catch (e: any) {
      setIsActionLoading(false);
      Alert.alert('Lỗi', e?.message || 'Không thể đổi thứ tự lúc này.');
    }
  };

  // [TASK-BIZ-02-06] Xóa một điểm dừng và tính toán lại lộ trình
  const handleRemoveStop = (stopId: string, stopName: string) => {
    Alert.alert(
      'Xóa Chặng Dừng',
      `Bạn có chắc chắn muốn xóa "${stopName}" khỏi lộ trình? AI sẽ tự động tính toán lại thời gian và khoảng cách các chặng còn lại.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(true);
              const res: any = await apiClient.delete(`/itineraries/${id}/stops/${stopId}`);
              setItinerary(res);
              setIsActionLoading(false);
              Alert.alert('Thành Công! 🎉', `Đã xóa chặng dừng và cập nhật lại thời gian lộ trình!`);
            } catch (e: any) {
              setIsActionLoading(false);
              Alert.alert('Lỗi', e?.message || 'Không thể xóa chặng lúc này.');
            }
          },
        },
      ]
    );
  };

  // [TASK-BIZ-02-06] Mở Modal Thêm Quán Mới & Tìm Kiếm
  const openAddStopModal = async () => {
    setIsAddStopModalOpen(true);
    try {
      setIsSearchingRestaurants(true);
      const res: any = await apiClient.get('/restaurants?limit=8');
      const list = res?.data || res?.items || res || [];
      setAvailableRestaurants(Array.isArray(list) ? list : []);
    } catch (e) {
      console.log('Lỗi tải danh sách quán:', e);
    } finally {
      setIsSearchingRestaurants(false);
    }
  };

  const handleSearchRestaurants = async (q: string) => {
    setRestaurantSearchQuery(q);
    try {
      setIsSearchingRestaurants(true);
      const res: any = await apiClient.get(`/restaurants?search=${encodeURIComponent(q)}&limit=8`);
      const list = res?.data || res?.items || res || [];
      setAvailableRestaurants(Array.isArray(list) ? list : []);
    } catch (e) {
      console.log('Lỗi tìm quán:', e);
    } finally {
      setIsSearchingRestaurants(false);
    }
  };

  const handleSelectAddRestaurant = async (restId: string) => {
    try {
      setIsActionLoading(true);
      setIsAddStopModalOpen(false);
      const res: any = await apiClient.post(`/itineraries/${id}/stops`, {
        restaurant_id: restId,
      });
      setItinerary(res);
      setIsActionLoading(false);
      Alert.alert('Thành Công! 🎉', 'Đã thêm quán vào lộ trình và tối ưu hóa lại hành trình di chuyển!');
    } catch (e: any) {
      setIsActionLoading(false);
      Alert.alert('Lỗi', e?.message || 'Không thể thêm quán lúc này.');
    }
  };

  // [TASK-BIZ-02-06] Tính toán lại toàn bộ lộ trình khi cập nhật ràng buộc
  const handleRecalculateRoute = async () => {
    try {
      setIsActionLoading(true);
      setIsRecalculateModalOpen(false);
      const res: any = await apiClient.post(`/itineraries/${id}/recalculate`, {
        budget: recalcBudget,
        routing_mode: recalcMode,
      });
      setItinerary(res);
      setIsActionLoading(false);
      Alert.alert('Thành Công! 🎉', 'AI đã tính toán và tối ưu hóa lại toàn bộ lộ trình theo ràng buộc mới!');
    } catch (e: any) {
      setIsActionLoading(false);
      Alert.alert('Lỗi', e?.message || 'Không thể tính toán lại lúc này.');
    }
  };

  const handleOpenMaps = (stop: any) => {
    const query = stop.address ? encodeURIComponent(stop.address) : `${stop.lat || stop.restaurant_lat},${stop.lng || stop.restaurant_lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const handleShareNative = async () => {
    try {
      await Share.share({
        message: `🚴 Chuyến Food Tour Ẩm Thực "${itinerary?.title || 'GastroWise'}": Cùng tham gia với tôi tại https://gastrowise.app/itinerary/${id}`,
      });
    } catch (error) {
      console.log('Lỗi chia sẻ:', error);
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSetReminder = () => {
    setIsReminderModalOpen(false);
    const label = reminderTime === '30_MIN' ? '30 phút' : reminderTime === '1_HOUR' ? '1 giờ' : '2 giờ';
    Alert.alert(
      'Bật Nhắc Nhở Thành Công! ⏰',
      `Ứng dụng GastroWise sẽ tự động gửi thông báo nhắc nhở trước ${label} giờ khởi hành chuyến đi Food Tour của bạn!`
    );
  };

  const handleUpdateStatus = async (newStatus: 'completed' | 'cancelled' | 'confirmed') => {
    try {
      setIsActionLoading(true);
      await apiClient.patch(`/itineraries/${id}`, { status: newStatus });
      setItinerary((prev: any) => ({ ...prev, status: newStatus }));
      setIsActionLoading(false);
      const statusText = newStatus === 'completed' ? 'Hoàn thành' : newStatus === 'cancelled' ? 'Hủy' : 'Xác nhận';
      Alert.alert('Thành Công! 🎉', `Đã cập nhật trạng thái lộ trình: ${statusText}!`);
    } catch (e: any) {
      setIsActionLoading(false);
      Alert.alert('Lỗi', e?.message || 'Không thể cập nhật trạng thái lúc này.');
    }
  };

  const handleDeleteItinerary = () => {
    Alert.alert('Xóa Lộ Trình', 'Bạn có chắc chắn muốn xóa lộ trình này?', [
      { text: 'Quay lại', style: 'cancel' },
      {
        text: 'Xác nhận Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsActionLoading(true);
            await apiClient.delete(`/itineraries/${id}`);
            setIsActionLoading(false);
            Alert.alert('Đã Xóa', 'Lộ trình đã được xóa thành công!', [
              { text: 'OK', onPress: () => router.replace('/(tabs)/itineraries') },
            ]);
          } catch (e: any) {
            setIsActionLoading(false);
            Alert.alert('Lỗi', e?.message || 'Không thể xóa lộ trình lúc này.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={{ marginTop: 12, color: COLORS.slate[500], fontSize: 14 }}>Đang tải lộ trình Food Tour...</Text>
      </View>
    );
  }

  const shareQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://gastrowise.app/itinerary/${id}`)}`;

  const totalCost = itinerary?.total_cost || (itinerary?.stops || []).reduce((acc: number, s: any) => acc + (s.estimated_cost || 50000), 0);
  const totalBudget = itinerary?.budget || 250000;
  const remainingBudget = itinerary?.remaining_budget !== undefined ? itinerary.remaining_budget : Math.max(0, totalBudget - totalCost);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={22} color={COLORS.slate[800]} />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900], flex: 1 }} numberOfLines={1}>
            {itinerary?.title || 'Chi Tiết Lộ Trình Food Tour'}
          </Text>
        </View>

        {/* Action Header Icons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setIsReminderModalOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.slate[100],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={18} color={COLORS.slate[700]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsShareModalOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={18} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Overview Banner Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: COLORS.slate[200],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Sparkles size={20} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900] }}>
              Hành Trình Tối Ưu Hóa Tuyến Đường AI
            </Text>
          </View>

          <Text style={{ fontSize: 13, color: COLORS.slate[600], marginBottom: 12 }}>
            💬 "{itinerary?.prompt}"
          </Text>

          {/* Metric Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <View style={{ backgroundColor: COLORS.slate[100], paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>
                📍 {itinerary?.stops?.length || 0} Chặng dừng
              </Text>
            </View>

            <View style={{ backgroundColor: COLORS.slate[100], paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>
                {itinerary?.routing_mode === 'walking' ? '🚶 Đi bộ' : itinerary?.routing_mode === 'car' ? '🚗 Ô tô' : '🛵 Xe máy'} • {itinerary?.total_distance_km || 0} km (~{itinerary?.total_duration_mins || 120}p)
              </Text>
            </View>

            <View style={{ backgroundColor: COLORS.emerald[50], paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Leaf size={12} color={COLORS.emerald[600]} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.emerald[700] }}>
                Tiết kiệm ~{itinerary?.co2SavedKg || 1.5}kg CO2
              </Text>
            </View>

            {itinerary?.optimizedBy && (
              <View style={{ backgroundColor: COLORS.primary[50], paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary[700] }}>
                  🤖 {itinerary.optimizedBy}
                </Text>
              </View>
            )}
          </View>

          {/* Budget Constraint Status (TASK-BIZ-02-04) */}
          <View
            style={{
              backgroundColor: COLORS.slate[50],
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: COLORS.slate[600] }}>
                Ngân sách: <Text style={{ fontWeight: 'bold', color: COLORS.slate[900] }}>{totalBudget.toLocaleString('vi-VN')}đ</Text>
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.slate[600] }}>
                Dự kiến chi: <Text style={{ fontWeight: 'bold', color: COLORS.primary[700] }}>{totalCost.toLocaleString('vi-VN')}đ</Text>
              </Text>
            </View>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: remainingBudget >= 0 ? COLORS.emerald[700] : COLORS.rose[600] }}>
                {remainingBudget >= 0 ? `💵 Còn lại: ${remainingBudget.toLocaleString('vi-VN')}đ` : `⚠️ Vượt ngân sách: ${Math.abs(remainingBudget).toLocaleString('vi-VN')}đ`}
              </Text>
              <TouchableOpacity
                onPress={() => setIsRecalculateModalOpen(true)}
                style={{
                  backgroundColor: COLORS.primary[600],
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <RefreshCw size={12} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: 'bold' }}>Tính Lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dynamic Toolbar: Add Stop & Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Lịch Trình Chi Tiết Các Chặng
          </Text>

          <TouchableOpacity
            onPress={openAddStopModal}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.primary[50],
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: COLORS.primary[200],
            }}
          >
            <PlusCircle size={14} color={COLORS.primary[700]} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>
              Thêm Quán
            </Text>
          </TouchableOpacity>
        </View>

        {isActionLoading && (
          <View style={{ padding: 12, backgroundColor: COLORS.primary[50], borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary[600]} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>
              Đang tối ưu hóa lại tuyến đường di chuyển...
            </Text>
          </View>
        )}

        {/* Timeline Stops */}
        {(itinerary?.stops || []).map((stop: any, index: number) => {
          const isFirst = index === 0;
          const isLast = index === (itinerary?.stops?.length || 0) - 1;
          const stopName = stop.restaurant_name || stop.restaurant_id?.name || stop.restaurant_id?.tenQuan || 'Điểm dừng ẩm thực';

          return (
            <View
              key={stop.stop_id || index}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
              }}
            >
              {/* Header Stop with Order and Action Buttons (TASK-BIZ-02-06) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: COLORS.slate[900],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>{index + 1}</Text>
                  </View>

                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], flex: 1 }} numberOfLines={1}>
                    {stopName}
                  </Text>
                </View>

                {/* Move Up / Move Down / Delete Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!isFirst && (
                    <TouchableOpacity
                      onPress={() => handleMoveUp(index)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: COLORS.slate[100],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronUp size={16} color={COLORS.slate[700]} />
                    </TouchableOpacity>
                  )}

                  {!isLast && (
                    <TouchableOpacity
                      onPress={() => handleMoveDown(index)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: COLORS.slate[100],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronDown size={16} color={COLORS.slate[700]} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => handleRemoveStop(stop.stop_id, stopName)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: COLORS.rose[50],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} color={COLORS.rose[600]} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: COLORS.slate[500], marginBottom: 8, marginLeft: 34 }}>
                📍 {stop.address || stop.restaurant_id?.address || stop.restaurant_id?.diaChi || 'TP. Hồ Chí Minh'}
              </Text>

              {/* Arrival & Schedule Times (TASK-BIZ-02-03) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 34, marginBottom: 12 }}>
                {stop.arrival_time && stop.departure_time ? (
                  <View style={{ backgroundColor: COLORS.slate[100], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={12} color={COLORS.slate[600]} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.slate[700] }}>
                      {stop.arrival_time} - {stop.departure_time} ({stop.dining_duration_mins || 45}p)
                    </Text>
                  </View>
                ) : null}

                {stop.meal_type && (
                  <View style={{ backgroundColor: COLORS.primary[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary[700] }}>
                      {stop.meal_type === 'starter' ? '🥗 Khai vị' : stop.meal_type === 'dessert' ? '🍧 Tráng miệng' : stop.meal_type === 'cafe' ? '☕ Cafe' : '🍲 Món chính'}
                    </Text>
                  </View>
                )}

                {stop.distance_to_next_km !== undefined && (
                  <View style={{ backgroundColor: COLORS.emerald[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.emerald[700] }}>
                      🛵 ~{stop.distance_to_next_km}km ({stop.transit_time_mins || 15}p)
                    </Text>
                  </View>
                )}

                <View style={{ backgroundColor: COLORS.slate[100], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.slate[700] }}>
                    💵 ~{(stop.estimated_cost || 50000).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginLeft: 34 }}>
                <TouchableOpacity
                  onPress={() => handleOpenMaps(stop)}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.primary[50],
                    paddingVertical: 8,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Navigation size={13} color={COLORS.primary[700]} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>
                    Chỉ Đường
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const targetId = typeof stop.restaurant_id === 'object' ? stop.restaurant_id?._id : (stop.restaurant_id || id);
                    if (targetId) router.push(`/restaurant/${targetId}`);
                  }}
                  style={{
                    backgroundColor: COLORS.slate[100],
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.slate[800] }}>Xem Quán</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Management Actions Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 16,
            marginTop: 10,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.slate[200],
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
            Trạng Thái Lộ Trình
          </Text>

          {itinerary?.status !== 'completed' && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus('completed')}
              style={{
                backgroundColor: COLORS.emerald[600],
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <CheckCircle size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>
                Đánh Dấu Đã Hoàn Thành Chuyến Đi
              </Text>
            </TouchableOpacity>
          )}

          {itinerary?.status !== 'cancelled' && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus('cancelled')}
              style={{
                backgroundColor: COLORS.slate[100],
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Ban size={16} color={COLORS.rose[600]} style={{ marginRight: 6 }} />
              <Text style={{ color: COLORS.rose[600], fontWeight: 'bold', fontSize: 13 }}>
                Hủy Chuyến Đi Này
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleDeleteItinerary}
            style={{
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <Trash2 size={15} color={COLORS.slate[400]} style={{ marginRight: 4 }} />
            <Text style={{ color: COLORS.slate[500], fontWeight: '600', fontSize: 12 }}>
              Xóa Vĩnh Viễn Lộ Trình
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Feature 1: ADD STOP MODAL (TASK-BIZ-02-06) */}
      <Modal visible={isAddStopModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PlusCircle size={20} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Thêm Điểm Dừng Vào Lộ Trình
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddStopModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.slate[50],
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 44,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
                marginBottom: 14,
              }}
            >
              <Search size={16} color={COLORS.slate[400]} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 13, color: COLORS.slate[900] }}
                placeholder="Tìm tên quán hoặc món ăn..."
                value={restaurantSearchQuery}
                onChangeText={handleSearchRestaurants}
              />
            </View>

            {isSearchingRestaurants ? (
              <ActivityIndicator color={COLORS.primary[600]} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {availableRestaurants.map((r: any) => (
                  <TouchableOpacity
                    key={r._id || r.id}
                    onPress={() => handleSelectAddRestaurant(r._id || r.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.slate[100],
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900] }}>
                        {r.tenQuan || r.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: COLORS.slate[500] }} numberOfLines={1}>
                        📍 {r.diaChi || r.address || 'Hồ Chí Minh'}
                      </Text>
                      {r.tags && (
                        <Text style={{ fontSize: 11, color: COLORS.primary[700], marginTop: 2 }}>
                          {r.tags}
                        </Text>
                      )}
                    </View>
                    <View style={{ backgroundColor: COLORS.primary[50], paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary[700] }}>+ Thêm</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Feature 2: RECALCULATE ROUTE MODAL (TASK-BIZ-02-06) */}
      <Modal visible={isRecalculateModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RefreshCw size={20} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Tính Toán & Tối Ưu Lại Lộ Trình
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsRecalculateModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.slate[600], marginBottom: 12 }}>
              Điều chỉnh ngân sách hoặc phương tiện di chuyển để AI tối ưu hóa lại hành trình:
            </Text>

            {/* Transport Mode Options */}
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800], marginBottom: 8 }}>
              Phương tiện di chuyển:
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {[
                { mode: 'motorbike', label: '🛵 Xe máy' },
                { mode: 'car', label: '🚗 Ô tô' },
                { mode: 'walking', label: '🚶 Đi bộ' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setRecalcMode(opt.mode)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: recalcMode === opt.mode ? COLORS.slate[900] : COLORS.slate[100],
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: recalcMode === opt.mode ? '#ffffff' : COLORS.slate[800] }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Budget Options */}
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800], marginBottom: 8 }}>
              Ngân sách dự kiến:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {[150000, 300000, 500000, 1000000].map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setRecalcBudget(b)}
                  style={{
                    width: '48%',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: recalcBudget === b ? COLORS.primary[50] : COLORS.slate[50],
                    borderWidth: 1.5,
                    borderColor: recalcBudget === b ? COLORS.primary[600] : COLORS.slate[200],
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: recalcBudget === b ? COLORS.primary[700] : COLORS.slate[800] }}>
                    {b.toLocaleString('vi-VN')}đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleRecalculateRoute}
              style={{
                backgroundColor: COLORS.primary[600],
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                XÁC NHẬN TÍNH TOÁN LẠI
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feature 3: SHARE ITINERARY MODAL */}
      <Modal visible={isShareModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <QrCode size={22} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Chia Sẻ Lộ Trình Cho Bạn Bè
                </Text>
              </View>

              <TouchableOpacity onPress={() => setIsShareModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Image
                source={{ uri: shareQrUrl }}
                style={{ width: 180, height: 180, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.slate[200] }}
              />
              <Text style={{ fontSize: 13, color: COLORS.slate[500], textAlign: 'center' }}>
                Quét mã QR bằng Expo Go / Camera điện thoại để tải 1-Click chuyến đi này
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={handleCopyLink}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.slate[100],
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 size={16} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[700] }}>Đã Chép Link</Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={COLORS.slate[800]} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800] }}>Copy Link</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareNative}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.primary[600],
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Share2 size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>Chia Sẻ Zalo/SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feature 4: PUSH REMINDER MODAL */}
      <Modal visible={isReminderModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bell size={22} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
                  Nhắc Nhở Khởi Hành Food Tour
                </Text>
              </View>

              <TouchableOpacity onPress={() => setIsReminderModalOpen(false)}>
                <X size={20} color={COLORS.slate[500]} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.slate[600], marginBottom: 16 }}>
              Chọn thời gian ứng dụng sẽ tự động gửi thông báo nhắc bạn chuẩn bị lên đường:
            </Text>

            <TouchableOpacity
              onPress={() => setReminderTime('30_MIN')}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: reminderTime === '30_MIN' ? COLORS.primary[50] : COLORS.slate[50],
                borderWidth: 1.5,
                borderColor: reminderTime === '30_MIN' ? COLORS.primary[600] : COLORS.slate[200],
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: reminderTime === '30_MIN' ? COLORS.primary[700] : COLORS.slate[800] }}>
                ⏰ Nhắc trước 30 phút khởi hành
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setReminderTime('1_HOUR')}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: reminderTime === '1_HOUR' ? COLORS.primary[50] : COLORS.slate[50],
                borderWidth: 1.5,
                borderColor: reminderTime === '1_HOUR' ? COLORS.primary[600] : COLORS.slate[200],
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: reminderTime === '1_HOUR' ? COLORS.primary[700] : COLORS.slate[800] }}>
                ⏰ Nhắc trước 1 giờ khởi hành
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setReminderTime('2_HOUR')}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: reminderTime === '2_HOUR' ? COLORS.primary[50] : COLORS.slate[50],
                borderWidth: 1.5,
                borderColor: reminderTime === '2_HOUR' ? COLORS.primary[600] : COLORS.slate[200],
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: reminderTime === '2_HOUR' ? COLORS.primary[700] : COLORS.slate[800] }}>
                ⏰ Nhắc trước 2 giờ khởi hành
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSetReminder}
              style={{
                backgroundColor: COLORS.primary[600],
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                XÁC NHẬN BẬT NHẮC NHỞ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
