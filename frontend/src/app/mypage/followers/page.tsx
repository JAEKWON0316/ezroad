'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users, UserMinus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { followApi } from '@/lib/api';
import { Member, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

export default function FollowersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [followers, setFollowers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [removeModal, setRemoveModal] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchFollowers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Member> = await followApi.getFollowers(page, 20);
      setFollowers(response.content);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      toast.error('팔로워 목록을 불러오는데 실패했습니다');
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
      fetchFollowers();
    }
  }, [authLoading, isAuthenticated, router, fetchFollowers]);

  const handleRemoveFollower = async () => {
    if (!removeModal.member) return;
    
    setIsRemoving(true);
    try {
      await followApi.removeFollower(removeModal.member.id);
      toast.success('팔로워가 삭제되었습니다');
      setRemoveModal({ isOpen: false, member: null });
      fetchFollowers();
    } catch {
      toast.error('팔로워 삭제에 실패했습니다');
    } finally {
      setIsRemoving(false);
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
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">{user?.nickname}님의 팔로워</h1>
              <p className="text-sm text-gray-500">{totalCount}명</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 border-b -mx-4 px-4">
            <div className="px-4 py-2 border-b-2 border-orange-500 text-orange-500 font-medium">
              팔로워
            </div>
            <Link href="/mypage/following" className="px-4 py-2 text-gray-500 hover:text-gray-700">
              팔로잉
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : followers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">아직 팔로워가 없습니다</p>
            <p className="text-sm text-gray-400">
              리뷰를 작성하여 더 많은 사용자들을 만나보세요
            </p>
            <Link href="/reviews/write" className="mt-4 inline-block">
              <Button>리뷰 쓰러가기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {followers.map((follower) => (
                <div key={follower.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                      {follower.profileImage ? (
                        <img 
                          src={follower.profileImage} 
                          alt={follower.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-orange-500 font-medium text-lg">
                          {follower.nickname?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{follower.nickname}</p>
                      <p className="text-sm text-gray-500">{follower.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRemoveModal({ isOpen: true, member: follower })}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="팔로워 삭제"
                  >
                    <UserMinus className="h-5 w-5" />
                  </button>
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

      {/* Remove Modal */}
      <Modal
        isOpen={removeModal.isOpen}
        onClose={() => setRemoveModal({ isOpen: false, member: null })}
        title="팔로워 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">{removeModal.member?.nickname}</span>님을 팔로워 목록에서 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRemoveModal({ isOpen: false, member: null })}
            >
              취소
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={handleRemoveFollower}
              isLoading={isRemoving}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
