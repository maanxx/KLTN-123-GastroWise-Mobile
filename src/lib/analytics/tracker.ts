// src/lib/analytics/tracker.ts
import { apiClient } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface InteractionEvent {
  eventType: 'view' | 'click' | 'search' | 'favorite' | 'unfavorite' | 'itinerary_add' | 'itinerary_complete' | 'review_submit' | 'share';
  targetType: 'restaurant' | 'menu_item' | 'itinerary' | 'search_query' | 'cuisine';
  targetId: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  sessionId?: string;
}

class AnalyticsTracker {
  private queue: InteractionEvent[] = [];
  private flushTimer: any = null;
  private sessionId: string = '';

  constructor() {
    this.initSession();
    // Khởi tạo interval tự động flush sự kiện mỗi 8 giây
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 8000);
  }

  private async initSession() {
    try {
      let sid = await SecureStore.getItemAsync('gastrowise_guest_session_id');
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
        await SecureStore.setItemAsync('gastrowise_guest_session_id', sid);
      }
      this.sessionId = sid;
    } catch {
      this.sessionId = 'sess_mem_' + Date.now();
    }
  }

  /**
   * Đẩy một sự kiện vào hàng đợi batching
   */
  public track(event: Omit<InteractionEvent, 'sessionId'>) {
    this.queue.push({
      ...event,
      sessionId: this.sessionId,
    });

    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  public trackView(targetType: InteractionEvent['targetType'], targetId: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'view',
      targetType,
      targetId,
      metadata,
    });
  }

  public trackClick(targetType: InteractionEvent['targetType'], targetId: string, metadata?: Record<string, any>) {
    this.track({
      eventType: 'click',
      targetType,
      targetId,
      metadata,
    });
  }

  public trackDwell(targetType: InteractionEvent['targetType'], targetId: string, durationMs: number, metadata?: Record<string, any>) {
    this.track({
      eventType: 'view',
      targetType,
      targetId,
      durationMs,
      metadata,
    });
  }

  public trackSearch(query: string, resultCount: number) {
    this.track({
      eventType: 'search',
      targetType: 'search_query',
      targetId: query,
      metadata: { resultCount },
    });
  }

  public trackFavorite(restaurantId: string, isFavorited: boolean) {
    this.track({
      eventType: isFavorited ? 'favorite' : 'unfavorite',
      targetType: 'restaurant',
      targetId: restaurantId,
    });
  }

  /**
   * Gửi hàng loạt sự kiện lên Backend API
   */
  public async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await apiClient.post('/interactions/batch', {
        events: eventsToSend,
      });
    } catch (error) {
      // Nếu mất mạng, hoàn lại tối đa 30 sự kiện vào queue
      this.queue = [...eventsToSend.slice(-30), ...this.queue];
    }
  }
}

export const tracker = new AnalyticsTracker();

