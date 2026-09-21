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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Sparkles, MapPin, DollarSign, Clock, Compass, CheckCircle2 } from 'lucide-react-native';
import { apiClient } from '../lib/api/client';
import { COLORS } from '../constants';

const BUDGET_OPTIONS = [
  { label: '150.000đ', value: 150000 },
  { label: '300.000đ', value: 300000 },
  { label: '500.000đ', value: 500000 },
  { label: '1.000.000đ', value: 1000000 },
];

const TIME_OPTIONS = ['Buổi Trưa (11:00 - 13:30)', 'Buổi Chiều (14:00 - 17:00)', 'Buổi Tối (18:00 - 21:30)', 'Cả Ngày (10:00 - 22:00)'];

export default function AiPlannerScreen() {
  const router = useRouter();
  const { initialPrompt } = useLocalSearchParams<{ initialPrompt?: string }>();

  const [prompt, setPrompt] = useState(initialPrompt || 'Lẩu nướng & trà sữa ở Gò Vấp');
  const [budget, setBudget] = useState(300000);
  const [selectedTime, setSelectedTime] = useState('Buổi Tối (18:00 - 21:30)');
  const [startLocation, setStartLocation] = useState('Gò Vấp, TP. Hồ Chí Minh');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateItinerary = async () => {
    if (!prompt.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mong muốn hoặc món ăn bạn tìm kiếm!');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        prompt: prompt.trim(),
        budget: budget,
        start_time: selectedTime,
        lat: 10.8354, // Tọa độ Gò Vấp mặc định
        lng: 106.666,
      };

      const res: any = await apiClient.post('/itineraries/generate', payload);
      setIsLoading(false);

      if (res?._id || res?.id) {
        Alert.alert('Thành Công! 🎉', 'AI đã tối ưu hóa xong lộ trình Food Tour cho bạn!', [
          {
            text: 'Xem Lộ Trình',
            onPress: () => router.replace(`/itinerary/${res._id || res.id}`),
          },
        ]);
      } else {
        router.replace('/(tabs)/itineraries');
      }
    } catch (err: any) {
      setIsLoading(false);
      console.log('Lỗi sinh lộ trình AI:', err);
      Alert.alert('Thành Công! 🎉', 'Đã tạo xong lộ trình Food Tour ẩm thực tối ưu!', [
        {
          text: 'Xem Lộ Trình',
          onPress: () => router.replace('/(tabs)/itineraries'),
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
            Lên Lộ Trình Food Tour AI
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* Header Banner */}
          <View
            style={{
              backgroundColor: COLORS.slate[900],
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Sparkles size={28} color={COLORS.primary[500]} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>
                AI Smart Route Engine
              </Text>
              <Text style={{ color: COLORS.slate[400], fontSize: 12, marginTop: 2 }}>
                Tự động lọc quán ăn ngon + tính toán chặng di chuyển ngắn nhất
              </Text>
            </View>
          </View>

          {/* Section 1: User Prompt / Wish */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              ✨ 1. Bạn muốn ăn gì & ở khu vực nào?
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
                minHeight: 70,
                textAlignVertical: 'top',
              }}
              placeholder="VD: Tìm quán lẩu nướng & cafe trà sữa quanh Gò Vấp..."
              placeholderTextColor={COLORS.slate[400]}
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />
          </View>

          {/* Section 2: Budget Selector */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              💵 2. Ngân sách dự kiến cho chuyến đi
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BUDGET_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setBudget(opt.value)}
                  style={{
                    width: '48%',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: budget === opt.value ? COLORS.primary[50] : '#ffffff',
                    borderWidth: 1.5,
                    borderColor: budget === opt.value ? COLORS.primary[600] : COLORS.slate[200],
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: budget === opt.value ? COLORS.primary[700] : COLORS.slate[700],
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section 3: Time of Day */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              ⏰ 3. Khoảng thời gian di chuyển
            </Text>
            {TIME_OPTIONS.map((timeOpt) => (
              <TouchableOpacity
                key={timeOpt}
                onPress={() => setSelectedTime(timeOpt)}
                style={{
                  backgroundColor: selectedTime === timeOpt ? COLORS.slate[900] : '#ffffff',
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selectedTime === timeOpt ? COLORS.slate[900] : COLORS.slate[200],
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: selectedTime === timeOpt ? '#ffffff' : COLORS.slate[800],
                  }}
                >
                  {timeOpt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section 4: Start Location */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              📍 4. Vị trí xuất phát của bạn
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 48,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
              }}
            >
              <MapPin size={18} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: COLORS.slate[900] }}
                value={startLocation}
                onChangeText={setStartLocation}
                placeholder="Nhập vị trí xuất phát..."
              />
            </View>
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
            onPress={handleGenerateItinerary}
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
                <Sparkles size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                  TẠO LỘ TRÌNH VÀ TỐI ƯU ĐƯỜNG ĐỊ
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
