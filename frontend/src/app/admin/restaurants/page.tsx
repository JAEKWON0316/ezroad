'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Eye, Trash2, Edit3, Settings, Filter } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Restaurant, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: '전체 상태' },
  { value: 'ACTIVE', label: '운영 중' },
  { value: 'INACTIVE', label: '휴업 중' },
  { value: 'DELETED', label: '삭제됨' },
];

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  INACTIVE: 'bg-amber-50 text-amber-600 border-amber-100',
  DELETED: 'bg-rose-50 text-rose-600 border-rose-100',
};

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState<{ type: 'status' | 'delete'; restaurant: Restaurant } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Restaurant> = await adminApi.getRestaurants(
        page,
        12,
        keyword || undefined,
        statusFilter === '' ? undefined : statusFilter
      );
      setRestaurants(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      toast.error('식당 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, page, statusFilter]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRestaurants();
  };

  const handleStatusChange = async () => {
    if (!actionModal || actionModal.type !== 'status' || !newStatus) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateRestaurantStatus(actionModal.restaurant.id, newStatus);
      toast.success('상태가 변경되었습니다');
      setActionModal(null);
      fetchRestaurants();
    } catch {
      toast.error('상태 변경에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!actionModal || actionModal.type !== 'delete') return;

    setIsSubmitting(true);
    try {
      await adminApi.deleteRestaurant(actionModal.restaurant.id);
      toast.success('식당이 삭제되었습니다');
      setActionModal(null);
      fetchRestaurants();
    } catch {
      toast.error('식당 삭제에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">식당 관리</h1>
          <p className="text-gray-500 font-medium mt-1">플랫폼에 등록된 모든 식당을 효율적으로 관리하세요.</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
            <div className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100">
              식당 목록
            </div>
          </div>
        </motion.div>
      </header>

      {/* Glassmorphism search area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-xl shadow-gray-200/50"
      >
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="식당 이름, 주소 등으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="w-full pl-11 pr-4 h-12 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500 transition-all outline-none font-bold text-sm appearance-none cursor-pointer"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="h-12 px-8 rounded-2xl font-black shadow-lg shadow-orange-200">
              필터 적용
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Results counter */}
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          총 <span className="text-orange-600">{restaurants.length}</span>개의 식당이 검색됨
        </span>
      </div>

      {/* Grid display with animations */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <Loading size="lg" />
            <p className="mt-4 text-gray-400 font-bold animate-pulse">데이터를 불러오는 중...</p>
          </motion.div>
        ) : restaurants.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400 font-medium">검색어나 필터를 조정해 보세요.</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {restaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-orange-200/50 transition-all duration-300"
              >
                <div className="relative h-48 bg-gray-50 overflow-hidden">
                  {restaurant.thumbnail ? (
                    <Image
                      src={restaurant.thumbnail}
                      alt={restaurant.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-tighter shadow-sm ${statusStyles[restaurant.status as keyof typeof statusStyles] || 'bg-gray-50 text-gray-500'}`}>
                      {statusOptions.find(s => s.value === restaurant.status)?.label || restaurant.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-xs font-bold flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> 클릭하여 상태 변경
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 block">
                        {restaurant.category}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-xl">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-black text-yellow-700">
                          {restaurant.avgRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-xl">
                        <Eye className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm font-black text-blue-700">
                          {restaurant.viewCount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => { setActionModal({ type: 'status', restaurant }); setNewStatus(restaurant.status); }}
                      className="flex-1 h-11 flex items-center justify-center gap-2 text-sm font-black text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      관리
                    </button>
                    <button
                      onClick={() => setActionModal({ type: 'delete', restaurant })}
                      className="w-11 h-11 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                      title="식당 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Premium Modals */}
      <Modal
        isOpen={actionModal?.type === 'status'}
        onClose={() => setActionModal(null)}
        title="식당 상태 관리"
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm font-medium text-blue-800 leading-relaxed">
              <span className="font-black underline decoration-2">{actionModal?.restaurant?.name}</span>의 현재 상태를 변경합니다. 상태 변경 시 사용자들에게 즉시 노출 방식이 달라집니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">상태 선택</label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.filter(s => s.value).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewStatus(option.value)}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all border-2 ${newStatus === option.value
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100 scale-[1.02]'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                    }`}
                >
                  {option.label}
                  {newStatus === option.value && <Settings className="w-4 h-4 animate-spin-slow" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-orange-200" onClick={handleStatusChange} isLoading={isSubmitting}>변경사항 저장</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={actionModal?.type === 'delete'}
        onClose={() => setActionModal(null)}
        title="데이터 삭제 확인"
      >
        <div className="space-y-6 py-2">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-2">
            <Trash2 className="w-10 h-10" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900 mb-2">정말 삭제하시겠습니까?</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              <span className="text-rose-500 font-black">{actionModal?.restaurant?.name}</span>을(를) 시스템에서 영구적으로 삭제합니다.<br />이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 h-14 rounded-2xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100" onClick={handleDelete} isLoading={isSubmitting}>삭제 확인</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
