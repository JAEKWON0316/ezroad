'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
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
      {/* 벨 아이콘 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 패널 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">알림</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  모두 읽음
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                전체보기
              </Link>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                알림이 없습니다
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
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

          {/* 푸터 */}
          {notifications.length > 10 && (
            <div className="px-4 py-2 border-t text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                더 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const content = (
    <div
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <span className="text-xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </span>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formattedTime}</p>
        </div>

        {/* 삭제 버튼 */}
        {isHovered && notification.id && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="알림 삭제"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 읽지 않음 표시 */}
        {!notification.isRead && !isHovered && (
          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        )}
      </div>
    </div>
  );

  if (notification.linkUrl) {
    return (
      <li>
        <Link href={notification.linkUrl} onClick={onClick}>
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
      return '👤';
    case 'NEW_REVIEW':
      return '⭐';
    default:
      return '📢';
  }
}
