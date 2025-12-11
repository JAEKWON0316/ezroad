'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Heart, MapPin, Star, HeartOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { followApi } from '@/lib/api';
import { Restaurant, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

export default function MyFavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unfollowModal, setUnfollowModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
    isOpen: false,
    id: null,
    name: '',
  });
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Restaurant> = await followApi.getMyFollowedRestaurants(page, 12);
      setFavorites(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      toast.error('찜 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [authLoading, isAuthenticated, router, fetchFavorites]);

  const handleUnfollow = async () => {
    if (!unfollowModal.id) return;
    
    setIsUnfollowing(true);
    try {
      await followApi.unfollowRestaurant(unfollowModal.id);
      toast.success('찜이 해제되었습니다');
      setUnfollowModal({ isOpen: false, id: null, name: '' });
      fetchFavorites();
    } catch {
      toast.error('찜 해제에 실패했습니다');
    } finally {
      setIsUnfollowing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="font-semibold text-gray-900">찜한 맛집</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">찜한 맛집이 없습니다</p>
            <Link href="/restaurants">
              <Button>맛집 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <Link href={`/restaurants/${restaurant.id}`}>
                    <div className="relative h-40 bg-gray-100">
                      {restaurant.thumbnail ? (
                        <Image
                          src={restaurant.thumbnail}
                          alt={restaurant.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          🍽️
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
                          {restaurant.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/restaurants/${restaurant.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-orange-500 mb-1">
                        {restaurant.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 flex items-center mb-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{restaurant.avgRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-400">({restaurant.reviewCount || 0})</span>
                      </div>
                      
                      <button
                        onClick={() => setUnfollowModal({ 
                          isOpen: true, 
                          id: restaurant.id, 
                          name: restaurant.name 
                        })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Heart className="h-5 w-5 fill-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={unfollowModal.isOpen}
        onClose={() => setUnfollowModal({ isOpen: false, id: null, name: '' })}
        title="찜 해제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">{unfollowModal.name}</span>을(를) 찜 목록에서 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setUnfollowModal({ isOpen: false, id: null, name: '' })}
            >
              취소
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleUnfollow}
              isLoading={isUnfollowing}
            >
              찜 해제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
