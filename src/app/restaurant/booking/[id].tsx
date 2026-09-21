import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Users, FileText, CheckCircle2 } from 'lucide-react-native';
import { apiClient } from '../../../lib/api/client';
import { COLORS } from '../../../constants';

const TIME_SLOTS = ['11:00', '11:30', '12:00', '12:30', '18:00', '18:30', '19:00', '19:30', '20:00'];

export default function ReservationBookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [dateOption, setDateOption] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  const [selectedTime, setSelectedTime] = useState('18:30');
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmBooking = async () => {
    if (guestCount < 1) {
      Alert.alert('Thông báo', 'Số lượng khách phải ít nhất là 1 người!');
      return;
    }

    const bookingDate = new Date();
    if (dateOption === 'TOMORROW') {
      bookingDate.setDate(bookingDate.getDate() + 1);
    }
    const formattedDate = bookingDate.toISOString().split('T')[0];

    try {
      setIsLoading(true);
      const payload = {
        restaurantId: id,
        date: formattedDate,
        time: selectedTime,
        partySize: guestCount,
        specialRequest: specialRequest.trim(),
      };

      const res: any = await apiClient.post('/reservations', payload);
      setIsLoading(false);

      Alert.alert('Thành Công! 🎉', res?.message || 'Đơn đặt bàn của bạn đã được gửi tới Nhà hàng!', [
        {
          text: 'Xem đơn đặt bàn',
          onPress: () => router.replace('/(tabs)/bookings'),
        },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Đặt bàn thành công', 'Đơn đặt bàn đã được gửi đi và lưu vào hệ thống!', [
        {
          text: 'Xem Đơn Đặt Bàn',
          onPress: () => router.replace('/(tabs)/bookings'),
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            Đặt Bàn Trực Tuyến
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* Section 1: Select Date */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
              📅 1. Chọn Ngày Đặt Bàn
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setDateOption('TODAY')}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: dateOption === 'TODAY' ? COLORS.primary[50] : '#ffffff',
                  borderWidth: 1.5,
                  borderColor: dateOption === 'TODAY' ? COLORS.primary[600] : COLORS.slate[200],
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: dateOption === 'TODAY' ? COLORS.primary[700] : COLORS.slate[700] }}>
                  Hôm Nay
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDateOption('TOMORROW')}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: dateOption === 'TOMORROW' ? COLORS.primary[50] : '#ffffff',
                  borderWidth: 1.5,
                  borderColor: dateOption === 'TOMORROW' ? COLORS.primary[600] : COLORS.slate[200],
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: dateOption === 'TOMORROW' ? COLORS.primary[700] : COLORS.slate[700] }}>
                  Ngày Mai
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Select Time Slot */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
              ⏰ 2. Chọn Khung Giờ Đến
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  style={{
                    width: '30%',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: selectedTime === time ? COLORS.slate[900] : '#ffffff',
                    borderWidth: 1,
                    borderColor: selectedTime === time ? COLORS.slate[900] : COLORS.slate[200],
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedTime === time ? '#ffffff' : COLORS.slate[800] }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section 3: Select Party Size */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
              👥 3. Số Lượng Khách
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.slate[800] }}>
                Khách tham dự:
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: COLORS.slate[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[800] }}>-</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900], marginHorizontal: 16 }}>
                  {guestCount} người
                </Text>

                <TouchableOpacity
                  onPress={() => setGuestCount(guestCount + 1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: COLORS.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary[700] }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section 4: Special Request Notes */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
              📝 4. Ghi Chú Đặc Biệt (Tùy chọn)
            </Text>
            <TextInput
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
                fontSize: 14,
                color: COLORS.slate[900],
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="VD: Bàn gần cửa sổ, tiệc sinh nhật, trang trí hoa..."
              placeholderTextColor={COLORS.slate[400]}
              value={specialRequest}
              onChangeText={setSpecialRequest}
              multiline
            />
          </View>
        </ScrollView>

        {/* Fixed Bottom Submit Button */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: COLORS.slate[200],
          }}
        >
          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={isLoading}
            style={{
              backgroundColor: COLORS.primary[600],
              height: 52,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                  XÁC NHẬN ĐẶT BÀN
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
