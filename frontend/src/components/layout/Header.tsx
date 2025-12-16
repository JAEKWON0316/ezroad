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
  Utensils,
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
    { href: '/themes', label: '테마', icon: Utensils }, // Added Themes link
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
              <div className="relative group/dropdown">
                <button
                  className="flex items-center gap-1 text-gray-700 hover:text-orange-500 font-medium transition-colors py-4"
                >
                  고객지원
                  <ChevronDown className="h-4 w-4 transition-transform group-hover/dropdown:rotate-180" />
                </button>
                <div className="absolute top-full right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform translate-y-2 group-hover/dropdown:translate-y-0 z-50">
                  <div className="py-2">
                    <Link href="/notice" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      공지사항
                    </Link>
                    <Link href="/faq" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      자주 묻는 질문
                    </Link>
                    <Link href="/contact" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      1:1 문의
                    </Link>
                  </div>
                </div>
              </div>
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Fullscreen Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-white overflow-y-auto md:hidden animate-fade-in-up">
            <div className="flex flex-col min-h-screen">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image src="/logo3.png" alt="Linkisy" width={140} height={40} className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 flex-1">
                {/* Auth Status & Actions */}
                {isAuthenticated ? (
                  <div className="bg-orange-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-orange-100">
                        {user?.profileImage ? (
                          <Image src={user.profileImage} alt={user.nickname || ''} fill className="object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user?.nickname}님</p>
                        <p className="text-xs text-orange-600">환영합니다!</p>
                      </div>
                    </div>
                    <button onClick={handleLogoutClick} className="text-xs font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link href="/login" className="flex justify-center items-center py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      로그인
                    </Link>
                    <Link href="/register" className="flex justify-center items-center py-3 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      회원가입
                    </Link>
                  </div>
                )}

                {/* Main Navigation - Grid Layout */}
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase px-1">메뉴</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200',
                        pathname === link.href
                          ? 'bg-orange-50 border-orange-200 text-orange-600'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-orange-100 hover:shadow-md'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`p-3 rounded-full mb-2 ${pathname === link.href ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                        <link.icon className="h-6 w-6" />
                      </div>
                      <span className="font-bold text-sm">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* User Links (if authenticated) */}
                {isAuthenticated && (
                  <>
                    <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase px-1">마이페이지</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                      {userMenuLinks.map((link, idx) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${idx !== userMenuLinks.length - 1 ? 'border-b border-gray-50' : ''}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <link.icon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{link.label}</span>
                          <ChevronDown className="h-4 w-4 text-gray-300 ml-auto -rotate-90" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {/* Support Links - Horizontal Scroll or Grid */}
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase px-1">고객지원</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Link href="/notice" className="flex-none flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>📢 공지사항</span>
                  </Link>
                  <Link href="/faq" className="flex-none flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>❓ FAQ</span>
                  </Link>
                  <Link href="/contact" className="flex-none flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>📞 1:1 문의</span>
                  </Link>
                </div>
              </div>
            </div>
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
