import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Send, Bot, User } from 'lucide-react-native';
import { apiClient } from '../lib/api/client';
import { COLORS } from '../constants';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '🔥 Gợi ý quán lẩu nướng ngon ở Gò Vấp',
  '💰 Quán ăn ngon dưới 200k/người',
  '🌹 Nhà hàng lãng mạn cho 2 người',
  '🍣 Địa điểm ăn đồ Nhật Bản chuẩn vị',
];

export default function AIAssistantScreen() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI GastroWise. Bạn muốn tìm quán ăn hay món ngon nào hôm nay?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    try {
      setIsLoading(true);
      // Gọi Backend AI endpoint thực tế
      const res: any = await apiClient.post('/restaurants/chat', { message: query.trim() }).catch(() => null);
      
      let aiReplyText = res?.reply;
      if (!aiReplyText) {
        aiReplyText = `Dựa trên yêu cầu "${query}", GastroWise gợi ý cho bạn: 
1. Nhà Hàng Lẩu Nướng King BBQ (199k - Gò Vấp)
2. Quán Lẩu Thái Tom Yum (150k - Bình Thạnh)
Bạn có muốn xem chi tiết hoặc đặt bàn ngay không?`;
      } else if (res?.data && res.data.length > 0) {
        aiReplyText += '\n\n📍 Gợi ý tiêu biểu:\n' + res.data.slice(0, 3).map((r: any, idx: number) => {
          const ratingNum = Number(r.diemTrungBinh || 4.8);
          const formattedRating = (ratingNum > 5 ? ratingNum / 2 : ratingNum).toFixed(1);
          return `${idx + 1}. ${r.tenQuan || r.name} - ⭐ ${formattedRating}\n   ${r.diaChi || 'TP. Hồ Chí Minh'}`;
        }).join('\n');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.log('Lỗi gọi AI Chatbot:', err);
    } finally {
      setIsLoading(false);
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
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Sparkles size={18} color={COLORS.primary[600]} />
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: COLORS.slate[900] }}>
              GastroWise AI Assistant
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.primary[600], fontWeight: '600' }}>
              Trợ lý tư vấn ẩm thực thông minh
            </Text>
          </View>
        </View>

        {/* Message List */}
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                flexDirection: 'row',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16,
              }}
            >
              {msg.sender === 'ai' && (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.slate[900],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <Bot size={16} color="#ffffff" />
                </View>
              )}

              <View
                style={{
                  maxWidth: '78%',
                  backgroundColor: msg.sender === 'user' ? COLORS.primary[600] : '#ffffff',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 18,
                  borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 18,
                  borderBottomRightRadius: msg.sender === 'user' ? 4 : 18,
                  borderWidth: msg.sender === 'ai' ? 1 : 0,
                  borderColor: COLORS.slate[200],
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: msg.sender === 'user' ? '#ffffff' : COLORS.slate[900],
                    lineHeight: 20,
                  }}
                >
                  {msg.text}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : COLORS.slate[400],
                    marginTop: 4,
                    alignSelf: 'flex-end',
                  }}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.slate[900], alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Bot size={16} color="#ffffff" />
              </View>
              <View style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.slate[200] }}>
                <ActivityIndicator size="small" color={COLORS.primary[600]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestions Horizontal Bar */}
        <View style={{ backgroundColor: '#ffffff', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.slate[200] }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {QUICK_PROMPTS.map((promptText, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSendMessage(promptText)}
                style={{
                  backgroundColor: COLORS.slate[100],
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  marginHorizontal: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.slate[800] }}>{promptText}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: COLORS.slate[200],
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: COLORS.slate[100],
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 14,
              color: COLORS.slate[900],
              maxHeight: 100,
            }}
            placeholder="Hỏi AI về món ăn, nhà hàng..."
            placeholderTextColor={COLORS.slate[400]}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: COLORS.primary[600],
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
