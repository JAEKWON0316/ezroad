'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, ChevronLeft, BellOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { getNotificationIcon, getNotificationUrl } from '@/utils/notificationUtils';

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
      <div className="min-h-screen flex items-center justify-center bg-orange-50/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-orange-50/20 to-white pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm hover:-translate-x-0.5"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black font-display text-gray-900">알림 센터</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-sm font-bold text-white bg-orange-500 rounded-full shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 font-bold rounded-xl"
            >
              <Check className="w-4 h-4 mr-1.5" />
              모두 읽음
            </Button>
          )}
        </div>

        {/* Notification List Panel */}
        <div className="glass-card rounded-3xl p-1 shadow-xl shadow-orange-500/5 overflow-hidden min-h-[500px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-[bounce_3s_infinite]">
                <BellOff className="w-10 h-10 text-orange-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">새로운 알림이 없습니다</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                아직 도착한 소식이 없네요.<br />
                다양한 활동을 통해 새로운 알림을 받아보세요!
              </p>
              <Link href="/" className="mt-8">
                <Button className="rounded-xl px-8 font-bold shadow-lg shadow-orange-500/20">
                  메인으로 가기
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              <AnimatePresence mode='popLayout'>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id || notification.createdAt}
                    notification={notification}
                    onMarkAsRead={async () => {
                      if (notification.id) await markAsRead(notification.id);
                    }}
                    onDelete={() => notification.id && deleteNotification(notification.id)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => Promise<void>;
  onDelete: () => void;
}

// Generate URL based on referenceType/Id

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!notification.isRead) {
      await onMarkAsRead();
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
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ backgroundColor: 'rgba(255,247,237, 0.5)' }}
      className={`group relative p-6 cursor-pointer transition-colors ${!notification.isRead ? 'bg-orange-50/60' : 'bg-transparent'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-5">
        {/* Icon / Avatar */}
        <div className="flex-shrink-0 pt-1">
          {notification.senderProfileImage ? (
            <Avatar src={notification.senderProfileImage} alt="" size="lg" className="ring-4 ring-white shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-base ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                {notification.title}
              </p>
              <p className="text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              {!notification.isRead && (
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm" />
              )}
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 mt-2">{formattedTime}</p>
        </div>

        {/* Delete Button (Hover) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          aria-label="알림 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.li>
  );
}

