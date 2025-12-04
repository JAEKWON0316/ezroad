'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import type { Theme, PageResponse } from '@/types';

export default function MyThemesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyThemes();
    }
  }, [isAuthenticated, page]);

  const fetchMyThemes = async () => {
    try {
      setLoading(true);
      const response: PageResponse<Theme> = await themeApi.getMy(page, 12);
      setThemes(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('테마 목록 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (themeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('정말 이 테마를 삭제하시겠습니까?')) return;

    try {
      setDeleting(themeId);
      await themeApi.delete(themeId);
      setThemes(themes.filter(t => t.id !== themeId));
      alert('테마가 삭제되었습니다');
    } catch (err) {
      console.error('테마 삭제 실패:', err);
      alert('테마 삭제에 실패했습니다');
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 테마</h1>
          <p className="text-gray-600 mt-2">내가 만든 맛집 테마를 관리하세요</p>
        </div>
        <Link
          href="/themes/new"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          + 새 테마
        </Link>
      </div>

      {/* 테마 목록 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg mb-4">아직 만든 테마가 없습니다</p>
          <Link
            href="/themes/new"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
          >
            첫 테마 만들기
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div key={theme.id} className="relative group">
                <Link href={`/themes/${theme.id}`}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                    {/* 썸네일 */}
                    <div className="relative h-40 bg-gray-100">
                      {theme.thumbnail ? (
                        <Image src={theme.thumbnail} alt={theme.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${theme.isPublic ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {theme.isPublic ? '공개' : '비공개'}
                        </span>
                        <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                          {theme.restaurantCount}개
                        </span>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{theme.title}</h3>
                      {theme.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-2">{theme.description}</p>
                      )}
                      <div className="text-sm text-gray-400">👁 {theme.viewCount}</div>
                    </div>
                  </div>
                </Link>

                {/* 액션 버튼 (호버 시 표시) */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                  <Link
                    href={`/themes/${theme.id}/edit`}
                    className="px-3 py-1 bg-white shadow rounded-lg text-sm hover:bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    수정
                  </Link>
                  <button
                    onClick={(e) => handleDelete(theme.id, e)}
                    disabled={deleting === theme.id}
                    className="px-3 py-1 bg-red-500 text-white shadow rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleting === theme.id ? '삭제중...' : '삭제'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {/* 하단 링크 */}
      <div className="mt-8 pt-8 border-t">
        <Link href="/mypage" className="text-gray-600 hover:text-gray-900">
          ← 마이페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
