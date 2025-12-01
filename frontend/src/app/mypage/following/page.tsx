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

export default function FollowingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [following, setFollowing] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unfollowModal, setUnfollowModal] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const fetchFollowing = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<Member> = await followApi.getFollowing(page, 20);
      setFollowing(response.content);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch following:', error);
      toast.error('팔로잉 목록을 불러오는데 실패했습니다');
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
      fetchFollowing();
    }
  }, [authLoading, isAuthenticated, router, fetchFollowing]);

  const handleUnfollow = async () => {
    if (!unfollowModal.member) return;
    
    setIsUnfollowing(true);
    try {
      await followApi.unfollowMember(unfollowModal.member.id);
      toast.success('팔로우가 취소되었습니다');
      setUnfollowModal({ isOpen: false, member: null });
      fetchFollowing();
    } catch {
      toast.error('팔로우 취소에 실패했습니다');
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
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">{user?.nickname}님의 팔로잉</h1>
              <p className="text-sm text-gray-500">{totalCount}명</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex mt-4 border-b -mx-4 px-4">
            <Link href="/mypage/followers" className="px-4 py-2 text-gray-500 hover:text-gray-700">
              팔로워
            </Link>
            <div className="px-4 py-2 border-b-2 border-orange-500 text-orange-500 font-medium">
              팔로잉
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : following.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">아직 팔로잉하는 사용자가 없습니다</p>
            <p className="text-sm text-gray-400">
              다른 사용자의 리뷰를 보고 팔로우해보세요
            </p>
            <Link href="/reviews" className="mt-4 inline-block">
              <Button>리뷰 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {following.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                      {member.profileImage ? (
                        <img 
                          src={member.profileImage} 
                          alt={member.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-orange-500 font-medium text-lg">
                          {member.nickname?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.nickname}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUnfollowModal({ isOpen: true, member })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    팔로잉
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

      {/* Unfollow Modal */}
      <Modal
        isOpen={unfollowModal.isOpen}
        onClose={() => setUnfollowModal({ isOpen: false, member: null })}
        title="팔로우 취소"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">{unfollowModal.member?.nickname}</span>님의 팔로우를 취소하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setUnfollowModal({ isOpen: false, member: null })}
            >
              아니오
            </Button>
            <Button
              className="flex-1"
              onClick={handleUnfollow}
              isLoading={isUnfollowing}
            >
              팔로우 취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
