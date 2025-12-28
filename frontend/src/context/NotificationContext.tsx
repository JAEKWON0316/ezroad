'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export interface Notification {
  id: number | null;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  referenceType: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
  senderNickname?: string;
  senderProfileImage?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  lastNotification: Notification | null;
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🔔 새 알림 수신 처리 (WebSocket)
  const handleNotification = useCallback((notification: Notification) => {
    console.log('[Notification] Received:', notification);

    setLastNotification(notification);

    // 알림 목록 업데이트 (중복 방지)
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });

    // 읽지 않은 알림 수 증가
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // 토스트 표시
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 4000,
    });
  }, []);

  const { isConnected } = useWebSocket({
    onNotification: handleNotification,
  });

  // 알림 목록 조회 + 읽지 않은 수 동시 조회
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // 두 API를 병렬로 호출
      const [notificationsRes, unreadRes] = await Promise.all([
        api.get('/notifications?size=50'),
        api.get('/notifications/unread-count')
      ]);

      setNotifications(notificationsRes.data.content || []);
      setUnreadCount(unreadRes.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 단일 알림 읽음 처리
  const markAsRead = useCallback(async (id: number) => {
    // 이미 읽음 상태인지 확인
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.isRead) return;

    try {
      await api.patch(`/notifications/${id}/read`);
      
      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [notifications]);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [unreadCount]);

  // 알림 삭제
  const deleteNotification = useCallback(async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    
    try {
      await api.delete(`/notifications/${id}`);
      
      // 삭제한 알림이 읽지 않은 상태였으면 카운트 감소
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  // 로그인 / 로그아웃 시 처리
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLastNotification(null);
    }
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        lastNotification,
        unreadCount,
        isConnected,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }
  return context;
}

// 알림 타입별 아이콘
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'RESERVATION_NEW':
      return '📅';
    case 'RESERVATION_CONFIRMED':
      return '✅';
    case 'RESERVATION_CANCELLED':
      return '❌';
    case 'RESERVATION_COMPLETED':
      return '🎉';
    case 'WAITING_NEW':
      return '⏳';
    case 'WAITING_CALLED':
      return '🔔';
    case 'WAITING_CANCELLED':
      return '🚫';
    case 'NEW_FOLLOWER':
      return '👤';
    case 'NEW_REVIEW':
      return '⭐';
    default:
      return '📢';
  }
}
