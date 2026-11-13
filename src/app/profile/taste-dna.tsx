import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Dna,
  Save,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Flame,
} from 'lucide-react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../lib/api/client';
import { COLORS } from '../../constants';
import { tracker } from '../../lib/analytics/tracker';

const CUISINE_OPTIONS = [
  'Món Việt Truyền Thống',
  'Lẩu & Nướng Hàn/Nhật',
  'Hải Sản Tươi Sống',
  'Đồ Ăn Chay',
  'Cà Phê & Trà Sữa',
  'Món Âu & Pizza',
  'Món Thái Cay',
  'Dimsum & Điểm Tâm',
];

const DIETARY_OPTIONS = [
  'Ăn thuần chay (Vegan)',
  'Không cay',
  'Không mì chính / Bột ngọt',
  'Dị ứng hải sản',
  'Ít đường / Low-carb',
  'Kiêng dầu mỡ',
];

export default function TasteDnaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 6-Dimensional Taste Vector (0.0 to 1.0)
  const [spicy, setSpicy] = useState(0.5);
  const [sweet, setSweet] = useState(0.5);
  const [sour, setSour] = useState(0.5);
  const [salty, setSalty] = useState(0.5);
  const [umami, setUmami] = useState(0.5);
  const [bitter, setBitter] = useState(0.5);

  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>(['Món Việt Truyền Thống']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [budgetPreference, setBudgetPreference] = useState('medium');
  const [confidenceScore, setConfidenceScore] = useState(0.5);
  const [interactionCount, setInteractionCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    tracker.trackView('cuisine', 'taste_dna_profile');
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/taste-dna/me');
      if (res) {
        setSpicy(res.spicy ?? 0.5);
        setSweet(res.sweet ?? 0.5);
        setSour(res.sour ?? 0.5);
        setSalty(res.salty ?? 0.5);
        setUmami(res.umami ?? 0.5);
        setBitter(res.bitter ?? 0.5);
        setFavoriteCuisines(res.favoriteCuisines || ['Món Việt Truyền Thống']);
        setDietaryRestrictions(res.dietaryRestrictions || []);
        setBudgetPreference(res.budgetPreference || 'medium');
        setConfidenceScore(res.confidenceScore ?? 0.5);
        setInteractionCount(res.interactionCount ?? 0);
      }
    } catch (error: any) {
      console.log('Lỗi tải Taste DNA:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        spicy: Number(spicy.toFixed(2)),
        sweet: Number(sweet.toFixed(2)),
        sour: Number(sour.toFixed(2)),
        salty: Number(salty.toFixed(2)),
        umami: Number(umami.toFixed(2)),
        bitter: Number(bitter.toFixed(2)),
        favoriteCuisines,
        dietaryRestrictions,
        budgetPreference,
      };

      await apiClient.patch('/taste-dna/me', payload);
      tracker.trackClick('cuisine', 'taste_dna_save', payload);

      Alert.alert(
        'Thành công',
        'Hồ sơ khẩu vị Taste DNA 6-D đã được cập nhật! GastroWise sẽ tối ưu các đề xuất nhà hàng phù hợp hơn cho bạn.',
        [{ text: 'Đồng ý' }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu hồ sơ khẩu vị.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCuisine = (item: string) => {
    setFavoriteCuisines((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const toggleDietary = (item: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const adjustValue = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setter((prev) => Math.max(0.0, Math.min(1.0, Number((prev + delta).toFixed(2)))));
  };

  // Radar Chart Geometry Calculation
  const size = 260;
  const center = size / 2;
  const radius = size * 0.38;
  const angles = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);
  const labels = ['Cay nồng', 'Ngọt ngào', 'Chua thanh', 'Mặn mà', 'Đậm đà', 'Đắng nhẹ'];
  const values = [spicy, sweet, sour, salty, umami, bitter];

  const getPoints = (scaleVals: number[]) => {
    return scaleVals
      .map((val, i) => {
        const r = radius * val;
        const x = center + r * Math.sin(angles[i]);
        const y = center - r * Math.cos(angles[i]);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const radarPolygonPoints = getPoints(values);
  const outerHexagonPoints = getPoints([1, 1, 1, 1, 1, 1]);
  const middleHexagonPoints = getPoints([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={{ marginTop: 12, color: COLORS.slate[500], fontSize: 14 }}>
          Đang tải hồ sơ Taste DNA 6-D...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: '#ffffff',
          paddingTop: Math.max(insets.top + 8, 44),
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.slate[200],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color={COLORS.slate[700]} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.slate[900] }}>
            Hồ Sơ Khẩu Vị Taste DNA
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.primary[600], fontWeight: '600' }}>
            Multi-Dimensional Flavor Vector
          </Text>
        </View>
        <TouchableOpacity
          onPress={fetchProfile}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' }}
        >
          <RotateCcw size={18} color={COLORS.slate[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Radar Chart Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 16,
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.slate[200],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 12 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Dna size={18} color={COLORS.primary[600]} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900] }}>
                Bản Đồ Khẩu Vị 6 Chiều
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.slate[500] }}>
                Dựa trên phân tích tương tác và món ăn yêu thích
              </Text>
            </View>
          </View>

          {/* SVG Hexagonal Radar Chart */}
          <Svg width={size} height={size}>
            {/* Outer Hexagon Grid */}
            <Polygon points={outerHexagonPoints} stroke={COLORS.slate[300]} strokeWidth={1} fill="none" />
            <Polygon points={middleHexagonPoints} stroke={COLORS.slate[200]} strokeWidth={1} strokeDasharray="4,4" fill="none" />

            {/* Axis Lines */}
            {angles.map((ang, i) => {
              const x2 = center + radius * Math.sin(ang);
              const y2 = center - radius * Math.cos(ang);
              return <Line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke={COLORS.slate[200]} strokeWidth={1} />;
            })}

            {/* User Taste DNA Polygon */}
            <Polygon points={radarPolygonPoints} stroke={COLORS.primary[600]} strokeWidth={2.5} fill="rgba(16, 185, 129, 0.25)" />

            {/* Vertex Circles */}
            {values.map((val, i) => {
              const r = radius * val;
              const cx = center + r * Math.sin(angles[i]);
              const cy = center - r * Math.cos(angles[i]);
              return <Circle key={i} cx={cx} cy={cy} r={4} fill={COLORS.primary[700]} />;
            })}

            {/* Labels */}
            {angles.map((ang, i) => {
              const labelRadius = radius + 22;
              const lx = center + labelRadius * Math.sin(ang);
              const ly = center - labelRadius * Math.cos(ang) + 4;
              return (
                <SvgText
                  key={i}
                  x={lx}
                  y={ly}
                  fontSize="11"
                  fontWeight="bold"
                  fill={COLORS.slate[700]}
                  textAnchor="middle"
                >
                  {labels[i]}
                </SvgText>
              );
            })}
          </Svg>

          {/* Maturity Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.slate[50],
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 16,
              marginTop: 10,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <Sparkles size={14} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.slate[700] }}>
              Độ tin cậy AI: {Math.round(confidenceScore * 100)}% ({interactionCount} lượt tương tác)
            </Text>
          </View>
        </View>

        {/* 6 Dimension Sliders */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 14 }}>
            Tinh Chỉnh Hương Vị Khẩu Vị
          </Text>

          {[
            { label: 'Cay nồng (Spicy)', value: spicy, setter: setSpicy },
            { label: 'Ngọt ngào (Sweet)', value: sweet, setter: setSweet },
            { label: 'Chua thanh (Sour)', value: sour, setter: setSour },
            { label: 'Mặn mà (Salty)', value: salty, setter: setSalty },
            { label: 'Đậm đà / Umami', value: umami, setter: setUmami },
            { label: 'Đắng nhẹ (Bitter)', value: bitter, setter: setBitter },
          ].map((item, index) => (
            <View key={index} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.slate[800] }}>{item.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary[600] }}>
                  {Math.round(item.value * 100)}%
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => adjustValue(item.setter, -0.05)}
                  style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={16} color={COLORS.slate[700]} />
                </TouchableOpacity>

                {/* Progress Bar Container */}
                <View style={{ flex: 1, height: 10, backgroundColor: COLORS.slate[100], borderRadius: 5, marginHorizontal: 12, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(item.value * 100)}%`, height: '100%', backgroundColor: COLORS.primary[500], borderRadius: 5 }} />
                </View>

                <TouchableOpacity
                  onPress={() => adjustValue(item.setter, 0.05)}
                  style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={16} color={COLORS.slate[700]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Favorite Cuisines Multi-Select */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 6 }}>
            Ẩm Thực Ưa Thích
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.slate[500], marginBottom: 12 }}>
            Chọn các phong cách ẩm thực bạn muốn AI ưu tiên đề xuất
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CUISINE_OPTIONS.map((cuisine) => {
              const isSelected = favoriteCuisines.includes(cuisine);
              return (
                <TouchableOpacity
                  key={cuisine}
                  onPress={() => toggleCuisine(cuisine)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? COLORS.primary[600] : COLORS.slate[100],
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {isSelected && <Check size={14} color="#ffffff" style={{ marginRight: 6 }} />}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#ffffff' : COLORS.slate[700] }}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 6 }}>
            Ràng Buộc & Dị Ứng
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.slate[500], marginBottom: 12 }}>
            Các món chứa nguyên liệu này sẽ tự động bị loại khỏi lộ trình AI
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DIETARY_OPTIONS.map((item) => {
              const isSelected = dietaryRestrictions.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleDietary(item)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? '#ef4444' : COLORS.slate[100],
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {isSelected && <Check size={14} color="#ffffff" style={{ marginRight: 6 }} />}
                  <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#ffffff' : COLORS.slate[700] }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 12, 24),
          borderTopWidth: 1,
          borderTopColor: COLORS.slate[200],
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: COLORS.slate[900],
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Save size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                Lưu Hồ Sơ Taste DNA
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

