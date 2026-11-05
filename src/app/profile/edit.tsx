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
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, Camera, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api/client';
import { COLORS, STORAGE_KEYS } from '../../constants';
import * as SecureStore from 'expo-secure-store';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(user?.name || 'Nguyễn Văn A');
  const [phone, setPhone] = useState(user?.phone || '0912345678');
  const [email] = useState(user?.email || 'user@gastrowise.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Họ và tên không được để trống!');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.patch('/auth/profile', {
        firstName: name.trim(),
        phone: phone.trim(),
      });

      if (user) {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          await useAuthStore.getState().setAuth({ ...user, name: name.trim(), phone: phone.trim() }, token);
        }
      }

      setIsLoading(false);

      Alert.alert('Thành Công! 🎉', 'Thông tin cá nhân đã được cập nhật!', [
        {
          text: 'Quay lại Hồ sơ',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Cập nhật thất bại', err?.message || 'Không thể cập nhật thông tin lúc này.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        {/* Header */}
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
            Cập Nhật Thông Tin Cá Nhân
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Avatar Section */}
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: COLORS.primary[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.primary[600],
                }}
              >
                <User size={46} color={COLORS.primary[700]} />
              </View>

              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: COLORS.slate[900],
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.slate[500], marginTop: 10 }}>
              Chạm vào biểu tượng camera để đổi ảnh đại diện
            </Text>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 16 }}>
            {/* Name */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800], marginBottom: 6 }}>
                Họ và Tên
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: COLORS.slate[200] }}>
                <User size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: COLORS.slate[900] }}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nhập họ tên..."
                />
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800], marginBottom: 6 }}>
                Số Điện Thoại
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: COLORS.slate[200] }}>
                <Phone size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 14, color: COLORS.slate[900] }}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại..."
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email (Disabled) */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800], marginBottom: 6 }}>
                Địa Chỉ Email (Cố định)
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.slate[100], borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: COLORS.slate[200] }}>
                <Mail size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 14, color: COLORS.slate[500] }}>{email}</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={isLoading}
            style={{
              backgroundColor: COLORS.primary[600],
              height: 52,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginTop: 30,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <CheckCircle2 size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                  LƯU THÔNG TIN
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
