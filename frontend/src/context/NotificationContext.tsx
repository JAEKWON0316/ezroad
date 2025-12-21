'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 새 알림 수신 처리
  const handleNotification = useCallback((notification: Notification) => {
    console.log('[Notification] Received:', notification);
    
    // 알림 목록 앞에 추가
    setNotifications(prev => [notification, ...prev]);
    
    // 읽지 않은 알림 수 증가
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // 토스트 알림 표시
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
      duration: 4000,
    });
  }, []);

  const { isConnected } = useWebSocket({
    onNotification: handleNotification,
  });

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/notifications?size=20');
      setNotifications(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 읽지 않은 알림 수 조회
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // 단일 알림 읽음 처리
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // 로그인 시 알림 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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
    throw new Error('useNotifications must be used within NotificationProvider');
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
