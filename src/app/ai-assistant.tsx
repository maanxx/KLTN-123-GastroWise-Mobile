import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Sparkles, Send, Bot, MapPin, 
  Calendar, Flame, Compass, ChevronRight, Star 
} from 'lucide-react-native';
import { apiClient } from '../lib/api/client';
import { tracker } from '../lib/analytics/tracker';
import { COLORS } from '../constants';

interface ActionCard {
  type: string;
  title?: string;
  button_text?: string;
  action?: string;
  district?: string;
  budget?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  serving?: string;
  prompts?: string[];
  query?: string;
  params?: Record<string, any>;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  intent?: string;
  actionCard?: ActionCard;
  results?: any[];
}

const QUICK_PROMPTS = [
  '🔥 Gợi ý quán lẩu nướng ngon ở Gò Vấp',
  '💰 Lên lịch trình ẩm thực Quận 1 dưới 300k',
  '🥗 Phở bò có bao nhiêu calo?',
  '📍 Tìm quán ăn ngon gần tôi',
  '🍣 Địa điểm ăn đồ Nhật Bản chuẩn vị',
];

export default function AIAssistantScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI GastroWise. Bạn muốn tìm quán ăn, tính calo món ngon hay muốn tôi lên lịch trình food tour tối ưu hôm nay?',
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
      tracker.track({
        eventType: 'search',
        targetType: 'search_query',
        targetId: query.trim(),
        metadata: { source: 'ai_copilot' },
      });

      // Gọi Backend AI Copilot NLU endpoint
      const res: any = await apiClient.post('/restaurants/chat', { 
        message: query.trim(),
        userLat: '10.7769',
        userLon: '106.7009'
      }).catch(() => null);

      let aiReplyText = res?.reply;
      if (!aiReplyText) {
        aiReplyText = `GastroWise đã nhận yêu cầu "${query}". Bạn có thể xem gợi ý và các tác vụ nhanh bên dưới nhé!`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res?.intent,
        actionCard: res?.action_card,
        results: res?.results || res?.data || [],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.log('Lỗi gọi AI Chatbot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionCardPress = (card: ActionCard) => {
    if (card.action === 'open_planner') {
      router.push({
        pathname: '/ai-planner',
        params: {
          district: card.district || 'Quận 1',
          budget: card.budget ? String(card.budget) : '300000',
        },
      });
    } else if (card.action === 'open_ai_nutri') {
      router.push('/ai-nutri');
    } else if (card.action === 'open_explore_nearby') {
      router.push('/(tabs)/explore');
    } else if (card.action === 'open_explore_search') {
      router.push({
        pathname: '/(tabs)/explore',
        params: { search: card.query || '' },
      });
    } else if (card.action === 'search_dish') {
      handleSendMessage(`Tìm quán bán ${card.query}`);
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
              GastroWise AI Copilot
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.primary[600], fontWeight: '600' }}>
              Trợ lý ẩm thực NLU & Lộ trình thông minh
            </Text>
          </View>
        </View>

        {/* Message List */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
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
                    maxWidth: '82%',
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
                      lineHeight: 21,
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

              {/* [TASK-P5-01] STRUCTURED ACTION CARDS */}
              {msg.sender === 'ai' && msg.actionCard && (
                <View style={{ marginLeft: 40, marginTop: 10, maxWidth: '82%' }}>
                  {/* Nutrition Breakdown Card */}
                  {msg.actionCard.type === 'nutrition_card' && (
                    <View
                      style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: 16,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#bbf7d0',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Flame size={18} color="#16a34a" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#15803d' }}>
                          {msg.actionCard.title || 'Thông Tin Dinh Dưỡng'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16a34a' }}>
                            {msg.actionCard.calories}
                          </Text>
                          <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Calories</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[800] }}>
                            {msg.actionCard.protein_g}g
                          </Text>
                          <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Đạm</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[800] }}>
                            {msg.actionCard.carbs_g}g
                          </Text>
                          <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Carbs</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.slate[800] }}>
                            {msg.actionCard.fat_g}g
                          </Text>
                          <Text style={{ fontSize: 11, color: COLORS.slate[500] }}>Béo</Text>
                        </View>
                      </View>

                      {msg.actionCard.button_text && (
                        <TouchableOpacity
                          onPress={() => handleActionCardPress(msg.actionCard!)}
                          style={{
                            backgroundColor: '#16a34a',
                            paddingVertical: 9,
                            borderRadius: 10,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>
                            {msg.actionCard.button_text}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Planner Quick Action Card */}
                  {msg.actionCard.type === 'planner_action' && (
                    <View
                      style={{
                        backgroundColor: COLORS.slate[900],
                        borderRadius: 16,
                        padding: 14,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Sparkles size={18} color={COLORS.primary[400]} style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#ffffff' }}>
                          {msg.actionCard.title || 'Lên Lộ Trình Food Tour'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: COLORS.slate[300], marginBottom: 12 }}>
                        Khu vực: {msg.actionCard.district || 'TP.HCM'} • Ngân sách: {Number(msg.actionCard.budget || 200000).toLocaleString('vi-VN')}đ
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleActionCardPress(msg.actionCard!)}
                        style={{
                          backgroundColor: COLORS.primary[600],
                          paddingVertical: 10,
                          borderRadius: 10,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff', marginRight: 4 }}>
                          {msg.actionCard.button_text || 'Khởi Tạo Lộ Trình'}
                        </Text>
                        <ChevronRight size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* General Navigate Action Card */}
                  {(msg.actionCard.type === 'navigate_action' || msg.actionCard.type === 'explore_action' || msg.actionCard.type === 'search_results_action') && (
                    <TouchableOpacity
                      onPress={() => handleActionCardPress(msg.actionCard!)}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: COLORS.primary[300],
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Compass size={18} color={COLORS.primary[600]} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary[700] }}>
                          {msg.actionCard.button_text || msg.actionCard.title}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                  )}

                  {/* Quick Prompts List */}
                  {msg.actionCard.type === 'quick_prompts' && msg.actionCard.prompts && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {msg.actionCard.prompts.map((p, pIdx) => (
                        <TouchableOpacity
                          key={pIdx}
                          onPress={() => handleSendMessage(p)}
                          style={{
                            backgroundColor: '#ffffff',
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: COLORS.slate[200],
                          }}
                        >
                          <Text style={{ fontSize: 12, color: COLORS.slate[800], fontWeight: '500' }}>
                            {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Restaurant Results Mini Cards */}
              {msg.results && msg.results.length > 0 && (
                <View style={{ marginLeft: 40, marginTop: 10 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {msg.results.slice(0, 4).map((r, rIdx) => {
                      const id = r._id || r.id;
                      return (
                        <TouchableOpacity
                          key={rIdx}
                          onPress={() => router.push(`/restaurant/${id}`)}
                          style={{
                            width: 190,
                            backgroundColor: '#ffffff',
                            borderRadius: 14,
                            marginRight: 10,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: COLORS.slate[200],
                          }}
                        >
                          <Image
                            source={{ uri: r.image || r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80' }}
                            style={{ width: '100%', height: 90 }}
                            resizeMode="cover"
                          />
                          <View style={{ padding: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.slate[900] }} numberOfLines={1}>
                              {r.tenQuan || r.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                              <Star size={11} color="#d97706" fill="#d97706" style={{ marginRight: 3 }} />
                              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#b45309' }}>
                                {Number(r.rating || r.diemTrungBinh || 4.8).toFixed(1)}
                              </Text>
                              <Text style={{ fontSize: 11, color: COLORS.slate[400], marginLeft: 6 }}>
                                📍 {r.distance ? `${r.distance}km` : 'Gần bạn'}
                              </Text>
                            </View>
                            {r.explanation && (
                              <Text style={{ fontSize: 10, color: COLORS.primary[700], marginTop: 4 }} numberOfLines={1}>
                                {r.explanation}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
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
            placeholder="Hỏi AI về món ăn, dinh dưỡng, food tour..."
            placeholderTextColor={COLORS.slate[400]}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: inputText.trim() && !isLoading ? COLORS.primary[600] : COLORS.slate[200],
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
