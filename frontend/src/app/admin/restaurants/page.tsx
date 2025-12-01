'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, Eye } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Restaurant, PageResponse } from '@/types';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: '전체' },
  { value: 'ACTIVE', label: '운영중' },
  { value: 'INACTIVE', label: '휴업' },
  { value: 'DELETED', label: '삭제됨' },
];

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-yellow-100 text-yellow-700',
  DELETED: 'bg-red-100 text-red-700',
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
      const response: PageResponse<Restaurant> = await adminApi.getRestaurants(page, 20, keyword || undefined);
      setRestaurants(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      toast.error('식당 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, statusFilter, page]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">식당 관리</h1>
        <p className="text-gray-500 mt-1">등록된 식당을 관리합니다.</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="식당 이름으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button type="submit">검색</Button>
        </form>
      </div>

      {/* Restaurants Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100">
                  {restaurant.thumbnail ? (
                    <img src={restaurant.thumbnail} alt={restaurant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[restaurant.status as keyof typeof statusColors]}`}>
                      {statusOptions.find(s => s.value === restaurant.status)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {restaurant.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {restaurant.avgRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {restaurant.viewCount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActionModal({ type: 'status', restaurant }); setNewStatus(restaurant.status); }}
                      className="flex-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      상태 변경
                    </button>
                    <button
                      onClick={() => setActionModal({ type: 'delete', restaurant })}
                      className="flex-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Status Change Modal */}
      <Modal
        isOpen={actionModal?.type === 'status'}
        onClose={() => setActionModal(null)}
        title="상태 변경"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">{actionModal?.restaurant?.name}</span>의 상태를 변경합니다.
          </p>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {statusOptions.filter(s => s.value).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1" onClick={handleStatusChange} isLoading={isSubmitting}>변경</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={actionModal?.type === 'delete'}
        onClose={() => setActionModal(null)}
        title="식당 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말 <span className="font-medium">{actionModal?.restaurant?.name}</span>을(를) 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setActionModal(null)}>취소</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleDelete} isLoading={isSubmitting}>삭제</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
