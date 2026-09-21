import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, ImagePlus, Sparkles, Flame, HeartPulse, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants';

const SAMPLE_DISHES = [
  {
    name: 'Phở Bò Tái Nạm Hà Nội',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    calories: 420,
    protein: 26,
    carbs: 54,
    fat: 12,
    advice: 'Bữa ăn cân bằng dinh dưỡng, giàu protein từ thịt bò tươi. Phù hợp nạp năng lượng cho buổi sáng.',
  },
  {
    name: 'Cơm Tấm Sườn Bì Chả Tiệm Quen',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    calories: 680,
    protein: 34,
    carbs: 72,
    fat: 28,
    advice: 'Món ăn giàu năng lượng và tinh bột. Nên kết hợp thêm 1 đĩa dưa leo cà chua để bổ sung chất xơ.',
  },
  {
    name: 'Salad Úc Sốt Chanh Dây & Hải Sản',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    calories: 280,
    protein: 22,
    carbs: 18,
    fat: 8,
    advice: 'Lựa chọn ăn uống vô cùng lành mạnh (Healthy), giàu vitamin và khoáng chất. Rất tốt cho sức khỏe!',
  },
];

export default function AiNutriScreen() {
  const router = useRouter();

  const [selectedDish, setSelectedDish] = useState<any>(SAMPLE_DISHES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSimulateScan = (index: number) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setSelectedDish(SAMPLE_DISHES[index]);
      setIsAnalyzing(false);
    }, 1000);
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
          AI Nutri Smart Food Camera
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Banner */}
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
              AI Quét Thị Giác & Dinh Dưỡng
            </Text>
            <Text style={{ color: COLORS.slate[400], fontSize: 12, marginTop: 2 }}>
              Tải/chụp ảnh đĩa ăn ➔ AI tự động nhận diện tên món & phân tích Calo
            </Text>
          </View>
        </View>

        {/* Scan / Upload Image Box */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 16,
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 2,
            borderColor: COLORS.primary[200],
            borderStyle: 'dashed',
          }}
        >
          <Image
            source={{ uri: selectedDish.image }}
            style={{ width: '100%', height: 200, borderRadius: 14, marginBottom: 14 }}
            resizeMode="cover"
          />

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <TouchableOpacity
              onPress={() => handleSimulateScan((SAMPLE_DISHES.indexOf(selectedDish) + 1) % SAMPLE_DISHES.length)}
              style={{
                flex: 1,
                backgroundColor: COLORS.primary[600],
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>Chụp Món Ăn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSimulateScan((SAMPLE_DISHES.indexOf(selectedDish) + 2) % SAMPLE_DISHES.length)}
              style={{
                flex: 1,
                backgroundColor: COLORS.slate[100],
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImagePlus size={18} color={COLORS.slate[800]} style={{ marginRight: 6 }} />
              <Text style={{ color: COLORS.slate[800], fontWeight: 'bold', fontSize: 13 }}>Chọn Từ Thư Viện</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Results Card */}
        {isAnalyzing ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
            <Text style={{ marginTop: 14, fontSize: 14, color: COLORS.slate[600], fontWeight: 'bold' }}>
              AI đang quét thị giác & phân tích dinh dưỡng đĩa ăn...
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900], flex: 1 }}>
                {selectedDish.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                <Flame size={14} color="#b45309" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#b45309' }}>
                  {selectedDish.calories} kcal
                </Text>
              </View>
            </View>

            {/* Macro Breakdown Grid */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: COLORS.slate[50], padding: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Đạm (Protein)</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.primary[700], marginTop: 2 }}>
                  {selectedDish.protein}g
                </Text>
              </View>

              <View style={{ flex: 1, backgroundColor: COLORS.slate[50], padding: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Tinh bột (Carbs)</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#d97706', marginTop: 2 }}>
                  {selectedDish.carbs}g
                </Text>
              </View>

              <View style={{ flex: 1, backgroundColor: COLORS.slate[50], padding: 12, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Chất béo (Fat)</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626', marginTop: 2 }}>
                  {selectedDish.fat}g
                </Text>
              </View>
            </View>

            {/* AI Health Advice Card */}
            <View style={{ backgroundColor: COLORS.emerald[50], padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.emerald[200] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <HeartPulse size={18} color={COLORS.emerald[700]} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.emerald[800] }}>
                  Lời Khuyên Dinh Dưỡng AI:
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.emerald[900], lineHeight: 18 }}>
                {selectedDish.advice}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
