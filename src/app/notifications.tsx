import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  Sun,
  CalendarCheck,
  Tag,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

interface NotificationItem {
  id: string;
  type: 'itinerary' | 'weather' | 'booking' | 'promo';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  targetUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'itinerary',
    title: 'Lộ trình Food Tour đã sẵn sàng! 🎉',
    message: 'AI vừa tối ưu xong chuyến khám phá lẩu nướng Gò Vấp theo đúng thời gian và ngân sách của bạn.',
    time: '15 phút trước',
    isRead: false,
    targetUrl: '/(tabs)/itineraries',
  },
  {
    id: 'n2',
    type: 'weather',
    title: 'Gợi ý thời tiết hôm nay (32°C) ☀️',
    message: 'Trời nắng nóng, hãy giải nhiệt cùng các quán chè Thái, bingsu và trà sữa thanh mát gần bạn!',
    time: '2 giờ trước',
    isRead: false,
    targetUrl: '/(tabs)/explore',
  },
  {
    id: 'n3',
    type: 'promo',
    title: 'Mã ưu đãi GASTRO20 đã kích hoạt 🎁',
    message: 'Nhận ngay giảm giá 20% cho hóa đơn đặt món và dịch vụ trải nghiệm ẩm thực trong tuần này.',
    time: 'Hôm qua',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'booking',
    title: 'Lịch hẹn ẩm thực cuối tuần 📅',
    message: 'Đừng quên kiểm tra lịch trình và danh sách nhà hàng đã lưu trong bộ sưu tập yêu thích của bạn.',
    time: '2 ngày trước',
    isRead: true,
    targetUrl: '/favorites',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.isRead;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.targetUrl) {
      router.push(item.targetUrl as any);
    }
  };

  const clearAllNotifications = () => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc chắn muốn xóa toàn bộ thông báo?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: () => setNotifications([]),
      },
    ]);
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'itinerary':
        return <Sparkles size={18} color={COLORS.primary[600]} />;
      case 'weather':
        return <Sun size={18} color="#d97706" />;
      case 'booking':
        return <CalendarCheck size={18} color="#2563eb" />;
      case 'promo':
        return <Tag size={18} color={COLORS.rose[600]} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900] }}>
              Thông Báo
            </Text>
            {unreadCount > 0 && (
              <Text style={{ fontSize: 11, color: COLORS.primary[600], fontWeight: '600' }}>
                {unreadCount} thông báo chưa đọc
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={{ padding: 4 }}>
              <CheckCheck size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAllNotifications} style={{ padding: 4 }}>
              <Trash2 size={18} color={COLORS.slate[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#ffffff',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[100],
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setFilter('ALL')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: filter === 'ALL' ? COLORS.slate[900] : COLORS.slate[100],
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: filter === 'ALL' ? '#ffffff' : COLORS.slate[700],
            }}
          >
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('UNREAD')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: filter === 'UNREAD' ? COLORS.primary[600] : COLORS.slate[100],
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: filter === 'UNREAD' ? '#ffffff' : COLORS.slate[700],
            }}
          >
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {filteredNotifications.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Bell size={40} color={COLORS.slate[300]} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[700] }}>
              Không có thông báo nào
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.slate[400], marginTop: 4 }}>
              Bạn đã cập nhật hết mọi tin tức từ GastroWise
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNotificationPress(item)}
              style={{
                backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: item.isRead ? COLORS.slate[200] : COLORS.primary[200],
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: COLORS.slate[100],
                }}
              >
                {renderIcon(item.type)}
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: COLORS.slate[900],
                      flex: 1,
                      marginRight: 6,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: COLORS.primary[600],
                      }}
                    />
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.slate[600],
                    marginTop: 4,
                    lineHeight: 17,
                  }}
                >
                  {item.message}
                </Text>

                <Text style={{ fontSize: 11, color: COLORS.slate[400], marginTop: 8 }}>
                  {item.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

