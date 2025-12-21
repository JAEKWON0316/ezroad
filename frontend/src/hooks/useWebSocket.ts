'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/context/AuthContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://api.linkisy.kr/ws';

interface UseWebSocketOptions {
  onNotification?: (notification: any) => void;
  onWaitingUpdate?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, accessToken } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // ✅ 실무 패턴: options를 ref로 관리하여 콜백 변경 시 재연결 방지
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // ✅ 실무 패턴: 연결 상태 ref로 관리 (중복 연결 방지)
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    // 연결 조건 체크
    if (!user || !accessToken) {
      console.log('[WebSocket] No user or token, skipping connection');
      return;
    }
    
    // 이미 연결 중이거나 연결됨
    if (isConnectingRef.current || clientRef.current?.active) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    isConnectingRef.current = true;
    console.log('[WebSocket] Connecting to', WS_URL);

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('[WebSocket] ✅ Connected successfully');
      setIsConnected(true);
      setConnectionError(null);
      isConnectingRef.current = false;

      // ✅ 개인 알림 구독 (/user/queue/notifications)
      const destination = '/user/queue/notifications';
      console.log('[WebSocket] Subscribing to:', destination);
      
      const subscription = client.subscribe(destination, (message: IMessage) => {
        console.log('[WebSocket] 📩 Notification received:', message.body);
        try {
          const notification = JSON.parse(message.body);
          optionsRef.current.onNotification?.(notification);
        } catch (e) {
          console.error('[WebSocket] Failed to parse notification:', e);
        }
      });
      
      subscriptionsRef.current.set('user-notifications', subscription);
    };

    client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      isConnectingRef.current = false;
      subscriptionsRef.current.clear();
    };

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP Error:', frame.headers['message']);
      setConnectionError(frame.headers['message'] || 'Connection error');
      isConnectingRef.current = false;
    };

    client.onWebSocketError = (event) => {
      console.error('[WebSocket] WebSocket Error:', event);
      isConnectingRef.current = false;
    };

    client.activate();
    clientRef.current = client;
  }, [user, accessToken]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('[WebSocket] Disconnecting...');
      // 모든 구독 해제
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current.clear();
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, []);

  /**
   * 토픽 구독 (범용)
   * @param topic - 토픽 경로 (예: 'restaurant/1/waiting-count')
   * @param callback - 메시지 수신 콜백
   * @returns 구독 해제 함수
   */
  const subscribeToTopic = useCallback((
    topic: string,
    callback: (data: any) => void
  ): (() => void) | null => {
    if (!clientRef.current?.active) {
      console.log('[WebSocket] Cannot subscribe - not connected');
      return null;
    }

    const destination = `/topic/${topic}`;
    
    // 이미 같은 토픽에 구독 중이면 해제 후 재구독
    if (subscriptionsRef.current.has(topic)) {
      subscriptionsRef.current.get(topic)?.unsubscribe();
    }
    
    console.log('[WebSocket] Subscribing to topic:', destination);
    
    const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('[WebSocket] Failed to parse topic message:', e);
      }
    });

    subscriptionsRef.current.set(topic, subscription);

    // 구독 해제 함수 반환
    return () => {
      console.log('[WebSocket] Unsubscribing from topic:', destination);
      subscription.unsubscribe();
      subscriptionsRef.current.delete(topic);
    };
  }, []);

  /**
   * 식당 대기 인원 구독
   * @param restaurantId - 식당 ID
   * @param callback - 대기 인원 변경 시 콜백
   */
  const subscribeToWaitingCount = useCallback((
    restaurantId: number,
    callback: (data: { restaurantId: number; waitingCount: number; timestamp: string }) => void
  ): (() => void) | null => {
    return subscribeToTopic(`restaurant/${restaurantId}/waiting-count`, callback);
  }, [subscribeToTopic]);

  // ✅ user/token 변경 시 재연결
  useEffect(() => {
    if (user && accessToken) {
      const timer = setTimeout(() => {
        connect();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        disconnect();
      };
    } else {
      disconnect();
    }
  }, [user?.id, accessToken, connect, disconnect]);

  // ✅ 페이지 visibility 변경 시 재연결 (탭 복귀 시)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && accessToken) {
        if (!clientRef.current?.active) {
          console.log('[WebSocket] Tab visible, reconnecting...');
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, accessToken, connect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToTopic,
    subscribeToWaitingCount,
    client: clientRef.current,
  };
}
