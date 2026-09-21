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
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    try {
      await login({ email: email.trim(), password: password.trim() });
      Alert.alert('Thành công', 'Đăng nhập thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err?.message || 'Email hoặc mật khẩu không chính xác!');
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
        {/* Header / Logo */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: COLORS.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: COLORS.primary[100],
            }}
          >
            <UtensilsCrossed size={36} color={COLORS.primary[600]} />
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.slate[900] }}>
            GastroWise
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.slate[600], marginTop: 4, textAlign: 'center' }}>
            Hệ thống Tìm kiếm & Đặt bàn Nhà hàng Thông minh
          </Text>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Đăng nhập
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.slate[600], marginTop: 2 }}>
            Nhập tài khoản để tiếp tục trải nghiệm ẩm thực
          </Text>
        </View>

        {/* Input: Email */}
        <View style={{ marginBottom: 16 }}>
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
              placeholder="nhapemail@example.com"
              placeholderTextColor={COLORS.slate[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Input: Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
            Mật khẩu
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              {showPassword ? (
                <EyeOff size={18} color={COLORS.slate[400]} />
              ) : (
                <Eye size={18} color={COLORS.slate[400]} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember me & Forgot Password */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: rememberMe ? COLORS.primary[600] : COLORS.slate[400],
                backgroundColor: rememberMe ? COLORS.primary[600] : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              {rememberMe && <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 13, color: COLORS.slate[600] }}>Ghi nhớ tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary[600] }}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.slate[900],
            height: 52,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>
                Đăng Nhập
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Footer: Navigate to Register */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
          <Text style={{ fontSize: 14, color: COLORS.slate[600] }}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary[600] }}>
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
