import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, QrCode, CheckCircle2, Copy } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function TwoFactorScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);

  const handleGenerate2FA = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/2fa/generate');
      setQrCodeUrl(res?.qrCodeDataUrl || res?.qrCodeUrl || '');
      setSecretKey(res?.secret || '');
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', err?.message || 'Không thể tạo mã QR Code 2FA!');
    }
  };

  const handleEnable2FA = async () => {
    if (!totpCode.trim() || totpCode.trim().length !== 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đủ 6 chữ số từ ứng dụng Google Authenticator!');
      return;
    }

    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/2fa/enable', {
        totpCode: totpCode.trim(),
      });
      setIsLoading(false);
      setIs2FAEnabled(true);
      Alert.alert('Thành Công', res?.message || 'Đã kích hoạt Bảo mật 2FA thành công!');
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', err?.message || 'Mã 2FA không chính xác!');
    }
  };

  return (
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
          Bảo Mật 2FA (Google Authenticator)
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Status Card */}
        <View
          style={{
            backgroundColor: is2FAEnabled ? COLORS.primary[50] : '#ffffff',
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: is2FAEnabled ? COLORS.primary[200] : COLORS.slate[200],
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: is2FAEnabled ? COLORS.primary[100] : COLORS.slate[100],
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <ShieldCheck size={24} color={is2FAEnabled ? COLORS.primary[600] : COLORS.slate[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900] }}>
              Trạng Thái Bảo Mật 2FA
            </Text>
            <Text style={{ fontSize: 13, color: is2FAEnabled ? COLORS.primary[700] : COLORS.slate[500], marginTop: 2 }}>
              {is2FAEnabled ? 'Đã kích hoạt 2FA thành công' : 'Chưa bật xác thực 2 lớp'}
            </Text>
          </View>
        </View>

        {/* Action Panel */}
        {!is2FAEnabled && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              Hướng Dẫn Kích Hoạt 2FA:
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.slate[600], lineHeight: 20, marginBottom: 16 }}>
              1. Tải ứng dụng <Text style={{ fontWeight: 'bold' }}>Google Authenticator</Text> từ App Store / Google Play.{'\n'}
              2. Nhấn nút "Tạo Mã QR Code" bên dưới và dùng ứng dụng để quét mã.{'\n'}
              3. Nhập mã 6 chữ số sinh ra từ ứng dụng để hoàn tất.
            </Text>

            {!qrCodeUrl ? (
              <TouchableOpacity
                onPress={handleGenerate2FA}
                disabled={isLoading}
                style={{
                  backgroundColor: COLORS.slate[900],
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>
                    TẠO MÃ QR CODE 2FA
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                {qrCodeUrl && (
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 14 }}
                  />
                )}

                {secretKey && (
                  <View style={{ backgroundColor: COLORS.slate[100], padding: 10, borderRadius: 8, marginBottom: 16, width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Mã Secret Key:</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 2, color: COLORS.slate[900] }}>
                      {secretKey}
                    </Text>
                  </View>
                )}

                {/* Input TOTP */}
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                    Nhập mã 6 chữ số xác nhận
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: COLORS.slate[200],
                      borderRadius: 12,
                      height: 48,
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 'bold',
                      letterSpacing: 4,
                      backgroundColor: COLORS.slate[50],
                    }}
                    placeholder="123456"
                    value={totpCode}
                    onChangeText={setTotpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleEnable2FA}
                  disabled={isLoading}
                  style={{
                    backgroundColor: COLORS.primary[600],
                    paddingVertical: 14,
                    width: '100%',
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>
                      KÍCH HOẠT BẢO MẬT 2FA
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
