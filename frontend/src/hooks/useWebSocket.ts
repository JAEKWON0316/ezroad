'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://api.linkisy.kr/ws';

interface UseWebSocketOptions {
  onNotification?: (notification: any) => void;
  onWaitingUpdate?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const token = Cookies.get('accessToken');
    if (!user || !token || clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
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
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setConnectionError(null);

      // 개인 알림 구독
      client.subscribe(`/user/${user.id}/queue/notifications`, (message: IMessage) => {
        try {
          const notification = JSON.parse(message.body);
          options.onNotification?.(notification);
        } catch (e) {
          console.error('[WebSocket] Failed to parse notification:', e);
        }
      });

      // 대기열 업데이트 구독 (특정 식당)
      // 이 부분은 필요할 때 동적으로 구독
    };

    client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP Error:', frame.headers['message']);
      setConnectionError(frame.headers['message'] || 'Connection error');
    };

    client.activate();
    clientRef.current = client;
  }, [user, options]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 특정 식당의 대기열 구독
  const subscribeToWaitingQueue = useCallback((restaurantId: number, callback: (data: any) => void) => {
    if (!clientRef.current?.active) return null;

    const subscription = clientRef.current.subscribe(
      `/topic/restaurant/${restaurantId}/waiting`,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (e) {
          console.error('[WebSocket] Failed to parse waiting update:', e);
        }
      }
    );

    return subscription;
  }, []);

  // 연결 시작
  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (user && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToWaitingQueue,
    client: clientRef.current,
  };
}
