'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X, MoreHorizontal, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/common/Avatar';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead && notification.id) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-300 ${isOpen
          ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200'
          : 'text-gray-500 hover:bg-gray-100 hover:text-orange-500'
          }`}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm border-2 border-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-4 sm:w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 z-[100] max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-white/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">알림</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-lg">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold text-gray-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    모두 읽음
                  </button>
                )}
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="전체보기"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-gray-900 font-bold mb-1">받은 알림이 없습니다</h4>
                  <p className="text-sm text-gray-500">새로운 소식이 도착하면 알려드릴게요!</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {notifications.slice(0, 10).map((notification) => (
                    <NotificationItem
                      key={notification.id || notification.createdAt}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onDelete={() => notification.id && deleteNotification(notification.id)}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50/50 border-t border-gray-100/50">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-gray-600 hover:text-orange-600 bg-white hover:bg-orange-50 rounded-xl border border-gray-200 hover:border-orange-100 transition-all shadow-sm hover:shadow"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  전체 알림 보기
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
  const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const content = (
    <motion.div
      layout
      className={`group relative px-6 py-4 hover:bg-orange-50/30 cursor-pointer transition-colors ${!notification.isRead ? 'bg-orange-50/60' : ''
        }`}
    >
      <div className="flex gap-4">
        {/* Icon / Avatar */}
        <div className="flex-shrink-0 pt-1">
          {notification.senderProfileImage ? (
            <Avatar src={notification.senderProfileImage} alt="" size="md" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between mb-1">
            <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
              {notification.title}
            </p>
            <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-2">
              {formattedTime}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Unread Indicator & Delete Button */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          {!notification.isRead && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            aria-label="알림 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (notification.linkUrl) {
    return (
      <li onClick={onClick}>
        <Link href={notification.linkUrl} className="block">
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li onClick={onClick}>
      {content}
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
      return '👋';
    case 'NEW_REVIEW':
      return '💬';
    default:
      return '📢';
  }
}
