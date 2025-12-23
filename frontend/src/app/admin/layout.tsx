'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  MessageSquare,
  ChevronLeft,
  Shield,
  Bell,
  Search,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/members', icon: Users, label: '회원 관리' },
  { href: '/admin/restaurants', icon: Store, label: '식당 관리' },
  { href: '/admin/reviews', icon: MessageSquare, label: '리뷰 관리' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A]">
      {/* Sidebar Overlay for mobile (can be added later) */}

      {/* Premium Sidebar */}
      <aside className="w-72 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col p-6 z-40">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-gradient">EzRoad Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                      : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-orange-500 transition-colors'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate w-32">{user?.name}</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>

          <Link href="/" className="flex items-center justify-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            사이트 돌아가기
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 hover:bg-gray-100 rounded-xl relative text-gray-500 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-gray-100 mx-2" />
            <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors pr-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm overflow-hidden text-white flex items-center justify-center text-[10px] font-bold">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                ) : (
                  user?.nickname?.charAt(0)
                )}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold">{user?.nickname}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-tight">관리자</span>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
