'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  Shield
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
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-gray-900 text-white h-16 fixed top-0 left-0 right-0 z-50 flex items-center px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-orange-500" />
          <span className="text-xl font-bold">EzRoad Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-300">{user?.name} 관리자</span>
          <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            사이트로 돌아가기
          </Link>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-4rem)] fixed left-0 top-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
