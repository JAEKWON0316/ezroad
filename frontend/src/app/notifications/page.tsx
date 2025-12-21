'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, ChevronLeft, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Button from '@/components/common/Button';

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/notifications');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-sm font-medium text-white bg-orange-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-blue-600 hover:text-blue-800"
            >
              <Check className="w-4 h-4 mr-1" />
              모두 읽음
            </Button>
          )}
        </div>

        {/* 알림 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">알림이 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">
                새로운 소식이 있으면 여기서 확인할 수 있어요
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id || notification.createdAt}
                  notification={notification}
                  onMarkAsRead={() => notification.id && markAsRead(notification.id)}
                  onDelete={() => notification.id && deleteNotification(notification.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

// referenceType과 referenceId를 기반으로 URL 생성
function getNotificationUrl(notification: Notification): string | null {
  // linkUrl이 있으면 검증 후 사용
  if (notification.linkUrl) {
    // 잘못된 URL 수정
    if (notification.linkUrl === '/partner/reservations') {
      // 파트너 대시보드로 이동 (특정 레스토랑 ID가 없으므로)
      return '/partner';
    }
    if (notification.linkUrl === '/partner/waitings') {
      return '/partner';
    }
    return notification.linkUrl;
  }

  // referenceType과 referenceId로 URL 생성
  if (!notification.referenceType || !notification.referenceId) {
    return null;
  }

  switch (notification.referenceType) {
    case 'RESERVATION':
      return '/mypage/reservations';
    case 'WAITING':
      return '/mypage/waitings';
    case 'REVIEW':
      return `/reviews/${notification.referenceId}`;
    case 'RESTAURANT':
      return `/restaurants/${notification.referenceId}`;
    case 'MEMBER':
      return `/mypage/followers`;
    case 'THEME':
      return `/themes/${notification.referenceId}`;
    default:
      return null;
  }
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead();
    }
    
    const url = getNotificationUrl(notification);
    if (url) {
      router.push(url);
    }
  };

  const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <li
      className={`group relative px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <span className="text-2xl flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </span>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{notification.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
            </div>
            {!notification.isRead && (
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">{formattedTime}</p>
        </div>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
          aria-label="알림 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

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
