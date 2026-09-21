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
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }

    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.message || 'Có lỗi xảy ra khi tạo tài khoản!');
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
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            alignSelf: 'flex-start',
          }}
        >
          <ArrowLeft size={20} color={COLORS.slate[600]} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.slate[600], marginLeft: 6 }}>
            Quay lại
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Tạo tài khoản mới
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.slate[600], marginTop: 4 }}>
            Khám phá và đặt bàn tại hàng trăm nhà hàng hàng đầu
          </Text>
        </View>

        {/* Input: Name */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
            Họ và tên
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
            <User size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={COLORS.slate[400]}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Input: Phone */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.slate[800], marginBottom: 6 }}>
            Số điện thoại
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
            <Phone size={18} color={COLORS.slate[400]} style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: COLORS.slate[900] }}
              placeholder="0912345678"
              placeholderTextColor={COLORS.slate[400]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Input: Email */}
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

        {/* Input: Password */}
        <View style={{ marginBottom: 24 }}>
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
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor={COLORS.slate[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={18} color={COLORS.slate[400]} />
              ) : (
                <Eye size={18} color={COLORS.slate[400]} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.slate[900],
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
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>
                Đăng Ký Tài Khoản
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Footer: Navigate to Login */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 14, color: COLORS.slate[600] }}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary[600] }}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
