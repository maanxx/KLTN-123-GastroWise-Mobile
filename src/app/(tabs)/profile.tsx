import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  ShieldCheck,
  KeyRound,
  Heart,
  Headphones,
  LogOut,
  ChevronRight,
  LogIn,
  Camera,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng GastroWise?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: '#ffffff',
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[200],
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.slate[900] }}>
          Tài Khoản Cá Nhân
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* User Info Card */}
        {user ? (
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                borderWidth: 1,
                borderColor: COLORS.primary[100],
              }}
            >
              <User size={30} color={COLORS.primary[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900] }}>
                {user.name}
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.slate[500], marginTop: 2 }}>
                {user.email}
              </Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: COLORS.primary[50],
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 8,
                  marginTop: 6,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: COLORS.primary[700] }}>
                  {user.role === 'admin' ? 'Quản trị viên' : user.role === 'owner' ? 'Chủ nhà hàng' : 'Khách hàng VIP'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 4 }}>
              Bạn chưa đăng nhập
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.slate[500], textAlign: 'center', marginBottom: 16 }}>
              Đăng nhập ngay để quản lý đơn đặt bàn và lưu nhà hàng yêu thích
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{
                backgroundColor: COLORS.slate[900],
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <LogIn size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                Đăng Nhập Ngay
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Settings Section */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 8, marginBottom: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <User size={18} color={COLORS.slate[700]} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate[800] }}>
              Cập nhật thông tin cá nhân
            </Text>
            <ChevronRight size={18} color={COLORS.slate[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/favorites')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Heart size={18} color="#ef4444" />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate[800] }}>
              Hồ sơ Taste DNA & Yêu thích
            </Text>
            <ChevronRight size={18} color={COLORS.slate[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/ai-nutri')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Camera size={18} color={COLORS.primary[600]} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate[800] }}>
              AI Nutri Food Camera (Quét Calo)
            </Text>
            <ChevronRight size={18} color={COLORS.slate[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/two-factor')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <ShieldCheck size={18} color={COLORS.primary[600]} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate[800] }}>
              Bảo mật 2FA (Google Authenticator)
            </Text>
            <ChevronRight size={18} color={COLORS.slate[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/ai-assistant')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Headphones size={18} color={COLORS.slate[700]} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate[800] }}>
              Trợ lý AI & Liên hệ CSKH
            </Text>
            <ChevronRight size={18} color={COLORS.slate[400]} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        {user && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#fef2f2',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#fecaca',
            }}
          >
            <LogOut size={18} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 15 }}>
              Đăng Xuất Khỏi Tài Khoản
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
