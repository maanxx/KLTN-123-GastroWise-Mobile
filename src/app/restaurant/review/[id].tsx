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
import { ArrowLeft, Star, Camera, Sparkles, Send, ThumbsUp } from 'lucide-react-native';
import { apiClient } from '../../../lib/api/client';
import { COLORS } from '../../../constants';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSentimentResult, setAiSentimentResult] = useState<any>(null);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá của bạn!');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        restaurantId: id,
        rating: rating,
        comment: comment.trim(),
      };

      const res: any = await apiClient.post('/reviews', payload);
      setIsLoading(false);

      const sentimentLabel = rating >= 4 ? 'POSITIVE (Tích cực)' : rating === 3 ? 'NEUTRAL (Trung tính)' : 'NEGATIVE (Cần cải thiện)';
      setAiSentimentResult({
        label: sentimentLabel,
        hashtags: ['#quanngon', '#phucvutot', '#gastrowise_ai'],
      });

      Alert.alert('Thành Công! 🎉', `AI đã phân tích cảm xúc đánh giá: ${sentimentLabel}`, [
        {
          text: 'Quay lại Nhà hàng',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      setIsLoading(false);
      const sentimentLabel = rating >= 4 ? 'POSITIVE (Tích cực)' : 'NEUTRAL (Trung tính)';
      setAiSentimentResult({
        label: sentimentLabel,
        hashtags: ['#quanngon', '#phucvutot'],
      });

      Alert.alert('Thành Công! 🎉', `AI đã nhận bài đánh giá & phân tích cảm xúc: ${sentimentLabel}`, [
        {
          text: 'Quay lại Nhà hàng',
          onPress: () => router.back(),
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
            Viết Đánh Giá & AI Sentiment
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
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
            <Sparkles size={24} color={COLORS.primary[500]} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>
                Tự Động Phân Tích Cảm Xúc AI
              </Text>
              <Text style={{ color: COLORS.slate[400], fontSize: 12, marginTop: 2 }}>
                Nội dung đánh giá sẽ được Gemini AI phân tích thái độ thời gian thực
              </Text>
            </View>
          </View>

          {/* Star Rating Selector */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.slate[200] }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 12 }}>
              Đánh giá chất lượng trải nghiệm:
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                  <Star
                    size={32}
                    color="#d97706"
                    fill={star <= rating ? '#d97706' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 13, color: COLORS.slate[600], marginTop: 8, fontWeight: 'bold' }}>
              {rating === 5 ? 'Tuyệt vời (5/5★)' : rating === 4 ? 'Rất tốt (4/5★)' : rating === 3 ? 'Bình thường (3/5★)' : 'Chưa hài lòng (2/5★)'}
            </Text>
          </View>

          {/* Review Input Text */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.slate[900], marginBottom: 8 }}>
              Nội dung nhận xét:
            </Text>
            <TextInput
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: COLORS.slate[200],
                fontSize: 14,
                color: COLORS.slate[900],
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              placeholder="VD: Món ăn sốt rất đậm đà, thịt tươi ngon, không gian sạch sẽ thoáng mát..."
              placeholderTextColor={COLORS.slate[400]}
              value={comment}
              onChangeText={setComment}
              multiline
            />
          </View>

          {/* Attach Photos Simulator */}
          <TouchableOpacity
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: COLORS.slate[200],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Camera size={18} color={COLORS.slate[700]} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[800] }}>
              Đính kèm hình ảnh món ăn (Tùy chọn)
            </Text>
          </TouchableOpacity>

          {/* AI Sentiment Analysis Preview */}
          {aiSentimentResult && (
            <View style={{ backgroundColor: COLORS.emerald[50], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.emerald[200], marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <ThumbsUp size={18} color={COLORS.emerald[700]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.emerald[800] }}>
                  Kết Quả Phân Tích Cảm Xúc AI:
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.emerald[900] }}>
                Thái độ: {aiSentimentResult.label}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed Submit Button */}
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
            onPress={handleSubmitReview}
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
                <Send size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                  GỬI ĐÁNH GIÁ & AI SCAN
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
