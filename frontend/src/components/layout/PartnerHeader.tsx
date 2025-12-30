'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell } from '@/components/common/NotificationBell';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import {
    Home,
    ChevronDown,
    LogOut,
    LayoutDashboard,
    Store
} from 'lucide-react';
import { useState } from 'react';

interface PartnerHeaderProps {
    title?: string;
    showBackButton?: boolean;
}

export default function PartnerHeader({ title = 'Partner Center', showBackButton = false }: PartnerHeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Left Side: Logo & Title */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logo3.png"
                            alt="Linkisy"
                            width={120}
                            height={34}
                            priority
                            className="h-7 w-auto group-hover:opacity-90 transition-opacity"
                        />
                    </Link>
                    <div className="h-4 w-[1px] bg-gray-300 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
                            {title}
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                            Business
                        </span>
                    </div>
                </div>

                {/* Right Side: Navigation & User Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Dashboard Link */}
                    <Link href="/partner" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>대시보드</span>
                    </Link>

                    {/* Site Home Link */}
                    <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50">
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">사이트 홈</span>
                    </Link>

                    <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                    {/* Notifications */}
                    <NotificationBell />

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                        >
                            <Avatar src={user?.profileImage} alt={user?.nickname || ''} size="sm" />
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden transform origin-top-right transition-all">
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">접속 중인 계정</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{user?.nickname}</p>
                                        <p className="text-[10px] text-orange-600 font-semibold mt-0.5">사업자 회원</p>
                                    </div>

                                    <div className="p-1">
                                        <Link
                                            href="/mypage"
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                                <Store className="w-4 h-4" />
                                            </div>
                                            <span>마이페이지</span>
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-red-100/50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <span>로그아웃</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
