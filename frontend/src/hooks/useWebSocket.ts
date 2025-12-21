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

      // ✅ 실무 패턴: /user/queue/notifications로 구독 (Spring이 자동으로 사용자 매핑)
      // Spring의 convertAndSendToUser()는 세션 기반으로 작동하므로
      // /user/{userId}/queue/... 가 아닌 /user/queue/... 로 구독해야 함
      const destination = '/user/queue/notifications';
      console.log('[WebSocket] Subscribing to:', destination);
      
      client.subscribe(destination, (message: IMessage) => {
        console.log('[WebSocket] 📩 Notification received:', message.body);
        try {
          const notification = JSON.parse(message.body);
          // ✅ ref를 통해 최신 콜백 호출
          optionsRef.current.onNotification?.(notification);
        } catch (e) {
          console.error('[WebSocket] Failed to parse notification:', e);
        }
      });
    };

    client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      isConnectingRef.current = false;
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
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, []);

  // 특정 식당의 대기열 구독
  const subscribeToWaitingQueue = useCallback((
    restaurantId: number, 
    callback: (data: any) => void
  ): StompSubscription | null => {
    if (!clientRef.current?.active) {
      console.log('[WebSocket] Cannot subscribe - not connected');
      return null;
    }

    const destination = `/topic/restaurant/${restaurantId}/waiting`;
    console.log('[WebSocket] Subscribing to waiting queue:', destination);
    
    const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (e) {
        console.error('[WebSocket] Failed to parse waiting update:', e);
      }
    });

    return subscription;
  }, []);

  // ✅ 실무 패턴: user/token 변경 시 재연결
  useEffect(() => {
    if (user && accessToken) {
      // 약간의 딜레이로 안정적 연결 (로그인 직후 토큰이 설정되는 시간)
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
    subscribeToWaitingQueue,
    client: clientRef.current,
  };
}
