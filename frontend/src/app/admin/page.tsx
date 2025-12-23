'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  UserPlus,
  Clock
} from 'lucide-react';
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
      <div className="flex justify-center py-20">
        <Loading size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: '전체 회원',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      description: '가입된 모든 사용자 수'
    },
    {
      label: '전체 식당',
      value: stats?.totalRestaurants || 0,
      icon: Store,
      color: 'from-emerald-400 to-teal-600',
      description: '등록된 전체 레스토랑'
    },
    {
      label: '전체 리뷰',
      value: stats?.totalReviews || 0,
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-600',
      description: '사용자들이 남긴 소중한 리뷰'
    },
    {
      label: '전체 예약',
      value: stats?.totalReservations || 0,
      icon: Calendar,
      color: 'from-orange-400 to-orange-600',
      description: '완료 및 대기 중인 예약 건'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">대시보드</h1>
          <p className="text-gray-500 mt-1 font-medium">Linkisy 플랫폼의 실시간 현황을 확인하세요.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <Clock className="h-4 w-4" />
          마지막 업데이트: {new Date().toLocaleTimeString()}
        </motion.div>
      </div>

      {/* Main Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

            <div className="flex flex-col gap-6 relative z-10">
              <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-4xl font-black text-[#0F172A] tracking-tighter">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">{stat.description}</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-gray-300" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Today's Stats & Charts Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-3">
                <Activity className="h-5 w-5 text-orange-500" />
                오늘의 실시간 지표
              </h2>
              <button className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">상세보기</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 group hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-blue-500 shadow-sm">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600/60 uppercase">신규 회원</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black text-blue-900">{stats?.todayMembers || 0}</p>
                      <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 group hover:bg-orange-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-600/60 uppercase">신규 예약</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black text-orange-900">{stats?.todayReservations || 0}</p>
                      <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">+5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Placeholder Area */}
            <div className="mt-8 p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <Activity className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-bold">시간대별 트래픽 분석 차트 준비 중</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links / Recent Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-[#0F172A] rounded-[2rem] p-8 shadow-xl shadow-slate-200 text-white relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />

            <h2 className="text-xl font-black mb-8 relative z-10">빠른 관리 도구</h2>

            <div className="space-y-4 relative z-10">
              <button className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-left">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="font-bold">회원 권한 조정</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
              </button>

              <button className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-left">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold">신규 식당 승인</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
              </button>

              <button className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-left">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  <span className="font-bold">의심 리뷰 필터링</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
              </button>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg relative z-10">
              <p className="text-sm font-black text-white/80 uppercase mb-2 tracking-tight">System Notice</p>
              <p className="text-sm font-medium leading-relaxed">플랫폼 유지보수 점검이 오늘 오후 11시부터 진행될 예정입니다.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
