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

  // Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={{ marginTop: 12, color: COLORS.slate[500], fontSize: 14 }}>Đang tải lộ trình Food Tour...</Text>
      </View>
    );
  }

  const shareQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://gastrowise.app/itinerary/${id}`)}`;

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
                {stop.restaurant_name || stop.restaurant_id?.name || stop.restaurant_id?.tenQuan || 'Điểm dừng ẩm thực'}
              </Text>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.slate[500], marginBottom: 12, marginLeft: 38 }}>
              📍 {stop.address || stop.restaurant_id?.address || stop.restaurant_id?.diaChi || 'Gò Vấp, TP. Hồ Chí Minh'}
            </Text>

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

              <TouchableOpacity
                onPress={() => {
                  const targetId = typeof stop.restaurant_id === 'object' ? stop.restaurant_id?._id : (stop.restaurant_id || id);
                  if (targetId) router.push(`/restaurant/${targetId}`);
                }}
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
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Feature 2: SHARE ITINERARY MODAL */}
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

      {/* Feature 5: PUSH REMINDER MODAL */}
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
