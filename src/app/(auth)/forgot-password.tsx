import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, QrCode, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react-native';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [method, setMethod] = useState<'EMAIL' | '2FA'>('EMAIL');
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Request OTP via Email
  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ Email!');
      return;
    }

    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setIsLoading(false);
      Alert.alert('Thành công', res?.message || 'Mã xác minh OTP đã được gửi tới email của bạn!');
      setStep('RESET');
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', err?.message || 'Email không tồn tại trong hệ thống!');
    }
  };

  // 2. Reset Password via Email OTP
  const handleResetWithOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã OTP 6 chữ số!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      setIsLoading(false);
      Alert.alert('Thành công', res?.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', err?.message || 'Đặt lại mật khẩu thất bại. Mã OTP không chính xác.');
    }
  };

  // 3. Reset Password via Google 2FA
  const handleResetWith2FA = async () => {
    if (!email.trim() || !totpCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập Email và Mã Google Authenticator 6 chữ số!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setIsLoading(true);
      const res: any = await apiClient.post('/auth/2fa/reset-password', {
        email: email.trim(),
        totpCode: totpCode.trim(),
        newPassword: newPassword.trim(),
      });
      setIsLoading(false);
      Alert.alert('Thành công', res?.message || 'Đặt lại mật khẩu bằng Google 2FA thành công!', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', err?.message || 'Mã 2FA không chính xác hoặc tài khoản chưa bật 2FA!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' }}
        >
          <ArrowLeft size={20} color={COLORS.slate[600]} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.slate[600], marginLeft: 6 }}>
            Quay lại Đăng nhập
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <KeyRound size={28} color={COLORS.primary[600]} style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Khôi phục mật khẩu
          </Text>
        </View>

        {/* Segmented Control Tab Switcher */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: COLORS.slate[100],
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMethod('EMAIL');
              setStep('REQUEST');
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              borderRadius: 10,
              backgroundColor: method === 'EMAIL' ? '#ffffff' : 'transparent',
              shadowColor: method === 'EMAIL' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: method === 'EMAIL' ? 1 : 0,
            }}
          >
            <Mail size={16} color={method === 'EMAIL' ? COLORS.primary[600] : COLORS.slate[500]} style={{ marginRight: 6 }} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: method === 'EMAIL' ? COLORS.slate[900] : COLORS.slate[500],
              }}
            >
              Email OTP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMethod('2FA')}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              borderRadius: 10,
              backgroundColor: method === '2FA' ? '#ffffff' : 'transparent',
              shadowColor: method === '2FA' ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: method === '2FA' ? 1 : 0,
            }}
          >
            <QrCode size={16} color={method === '2FA' ? COLORS.emerald[600] : COLORS.slate[500]} style={{ marginRight: 6 }} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: method === '2FA' ? COLORS.slate[900] : COLORS.slate[500],
              }}
            >
              Google 2FA
            </Text>
          </TouchableOpacity>
        </View>

        {/* METHOD 1: EMAIL OTP */}
        {method === 'EMAIL' && (
          <>
            {step === 'REQUEST' ? (
              <View>
                <Text style={{ fontSize: 14, color: COLORS.slate[600], marginBottom: 16 }}>
                  Nhập địa chỉ Email đăng ký của bạn. Hệ thống sẽ gửi mã xác minh OTP qua Email.
                </Text>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                    Địa chỉ Email
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: COLORS.slate[200],
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      height: 50,
                      backgroundColor: COLORS.slate[50],
                    }}
                  >
                    <Mail size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                      placeholder="user@example.com"
                      placeholderTextColor={COLORS.slate[400]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleRequestOtp}
                  disabled={isLoading}
                  style={{
                    backgroundColor: COLORS.primary[600],
                    height: 50,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                      Gửi Mã OTP Xác Minh
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 14, color: COLORS.slate[600], marginBottom: 16 }}>
                  Mã OTP 6 chữ số đã được gửi tới <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Vui lòng nhập mã và mật khẩu mới.
                </Text>

                {/* OTP Code */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                    Mã OTP 6 chữ số
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: COLORS.slate[200],
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      height: 50,
                      backgroundColor: COLORS.slate[50],
                      fontSize: 18,
                      fontWeight: 'bold',
                      letterSpacing: 4,
                      textAlign: 'center',
                      color: COLORS.slate[900],
                    }}
                    placeholder="123456"
                    placeholderTextColor={COLORS.slate[400]}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* New Password */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                    Mật khẩu mới
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: COLORS.slate[200],
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      height: 50,
                      backgroundColor: COLORS.slate[50],
                    }}
                  >
                    <Lock size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.slate[400]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color={COLORS.slate[400]} /> : <Eye size={18} color={COLORS.slate[400]} />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                    Xác nhận mật khẩu mới
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: COLORS.slate[200],
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      height: 50,
                      backgroundColor: COLORS.slate[50],
                    }}
                  >
                    <Lock size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.slate[400]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleResetWithOtp}
                  disabled={isLoading}
                  style={{
                    backgroundColor: COLORS.slate[900],
                    height: 50,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                      Cập Nhật Mật Khẩu Mới
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* METHOD 2: GOOGLE 2FA */}
        {method === '2FA' && (
          <View>
            <Text style={{ fontSize: 14, color: COLORS.slate[600], marginBottom: 16 }}>
              Nhập Email và Mã 6 chữ số từ ứng dụng <Text style={{ fontWeight: 'bold' }}>Google Authenticator</Text>.
            </Text>

            {/* Email */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                Địa chỉ Email
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: COLORS.slate[50],
                }}
              >
                <Mail size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                  placeholder="user@example.com"
                  placeholderTextColor={COLORS.slate[400]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* TOTP 2FA Code */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                Mã Google Authenticator (6 số)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: COLORS.slate[50],
                  fontSize: 18,
                  fontWeight: 'bold',
                  letterSpacing: 4,
                  textAlign: 'center',
                  color: COLORS.slate[900],
                }}
                placeholder="123456"
                placeholderTextColor={COLORS.slate[400]}
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {/* New Password */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                Mật khẩu mới
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: COLORS.slate[50],
                }}
              >
                <Lock size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate[400]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color={COLORS.slate[400]} /> : <Eye size={18} color={COLORS.slate[400]} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
                Xác nhận mật khẩu mới
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.slate[200],
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 50,
                  backgroundColor: COLORS.slate[50],
                }}
              >
                <Lock size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.slate[400]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetWith2FA}
              disabled={isLoading}
              style={{
                backgroundColor: COLORS.emerald[600],
                height: 50,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: 'bold' }}>
                  Xác Thực 2FA & Đặt Lại Mật Khẩu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
