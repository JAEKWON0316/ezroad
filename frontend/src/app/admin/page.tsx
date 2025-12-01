'use client';

import { useState, useEffect } from 'react';
import { Users, Store, MessageSquare, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Loading from '@/components/common/Loading';

interface DashboardStats {
  totalMembers: number;
  totalRestaurants: number;
  totalReviews: number;
  totalReservations: number;
  todayMembers: number;
  todayReservations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: '전체 회원', value: stats?.totalMembers || 0, icon: Users, color: 'bg-blue-500' },
    { label: '전체 식당', value: stats?.totalRestaurants || 0, icon: Store, color: 'bg-green-500' },
    { label: '전체 리뷰', value: stats?.totalReviews || 0, icon: MessageSquare, color: 'bg-purple-500' },
    { label: '전체 예약', value: stats?.totalReservations || 0, icon: Calendar, color: 'bg-orange-500' },
  ];

  const todayStats = [
    { label: '오늘 가입', value: stats?.todayMembers || 0, trend: 'up' },
    { label: '오늘 예약', value: stats?.todayReservations || 0, trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">EzRoad 관리자 대시보드입니다.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todayStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              {stat.trend === 'up' ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
