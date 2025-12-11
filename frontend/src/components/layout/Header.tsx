'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import {
  Menu,
  X,
  User,
  LogOut,
  Store,
  Heart,
  Calendar,
  MapPin,
  Star,
  ChevronDown,
} from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { href: '/restaurants', label: '맛집 찾기', icon: Store },
    { href: '/reviews', label: '리뷰', icon: Star },
    { href: '/map', label: '지도', icon: MapPin },
  ];

  const userMenuLinks = isAuthenticated
    ? [
      { href: '/mypage', label: '마이페이지', icon: User },
      { href: '/mypage/favorites', label: '찜한 식당', icon: Heart },
      { href: '/mypage/reservations', label: '예약 내역', icon: Calendar },
      ...(user?.role === 'BUSINESS'
        ? [{ href: '/partner', label: '사업자 페이지', icon: Store }]
        : []),
    ]
    : [];

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo3.png"
                alt="Linkisy"
                width={200}
                height={56}
                priority
                className="h-10 w-auto group-hover:opacity-90 transition-opacity"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/restaurants"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
              >
                맛집 찾기
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <Link
                href="/themes"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
              >
                테마
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <Link
                href="/reviews"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
              >
                리뷰
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <Link
                href="/map"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
              >
                지도
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors relative group"
              >
                고객지원
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {isLoading ? (
                // 로딩 중 스켈레톤
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-500"
                  >
                    <div className="relative w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <Image src={user.profileImage} alt={user.nickname || ''} fill sizes="32px" className="object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <span>{user?.nickname}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                      {userMenuLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      ))}
                      <hr className="my-2" />
                      <button onClick={handleLogoutClick} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-orange-500">로그인</Link>
                  <Link href="/register" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">회원가입</Link>
                </>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', pathname === link.href ? 'bg-orange-50 text-orange-500' : 'text-gray-600 hover:bg-gray-50')} onClick={() => setIsMobileMenuOpen(false)}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <hr className="my-4" />
              {isLoading ? (
                // 모바일 로딩 스켈레톤
                <div className="px-4 space-y-2">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <>
                  {userMenuLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                  <button onClick={handleLogoutClick} className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50">
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link href="/login" className="flex-1 text-center py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>로그인</Link>
                  <Link href="/register" className="flex-1 text-center py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600" onClick={() => setIsMobileMenuOpen(false)}>회원가입</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <Modal isOpen={isLogoutModalOpen} onClose={handleLogoutCancel} title="로그아웃" size="sm">
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-gray-600">정말 로그아웃 하시겠습니까?</p>
            <p className="text-sm text-gray-400 mt-1">30분간 활동이 없으면 자동으로 로그아웃됩니다.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleLogoutCancel} disabled={isLoggingOut}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleLogoutConfirm} isLoading={isLoggingOut}>로그아웃</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
