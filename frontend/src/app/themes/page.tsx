'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import type { Theme, PageResponse } from '@/types';

function ThemeListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');
  
  const page = parseInt(searchParams.get('page') || '0');

  useEffect(() => {
    fetchThemes();
  }, [page, keyword]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response: PageResponse<Theme> = await themeApi.getPublic(
        keyword || undefined, 
        page, 
        12
      );
      setThemes(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('테마 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    router.push(`/themes?keyword=${encodeURIComponent(searchInput)}&page=0`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    params.set('page', String(newPage));
    router.push(`/themes?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">맛집 테마</h1>
          <p className="text-gray-600 mt-2">다른 사용자들이 만든 맛집 코스를 둘러보세요</p>
        </div>
        {isAuthenticated && (
          <Link
            href="/themes/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + 테마 만들기
          </Link>
        )}
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="테마 검색..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            검색
          </button>
        </div>
      </form>

      {/* 테마 목록 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            {keyword ? '검색 결과가 없습니다' : '등록된 테마가 없습니다'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
            if (pageNum >= totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border rounded-lg ${
                  page === pageNum
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Link href={`/themes/${theme.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* 썸네일 */}
        <div className="relative h-48 bg-gray-100">
          {theme.thumbnail ? (
            <Image
              src={theme.thumbnail}
              alt={theme.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          {/* 식당 수 뱃지 */}
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {theme.restaurantCount}개 식당
          </div>
        </div>

        {/* 내용 */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {theme.title}
          </h3>
          {theme.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {theme.description}
            </p>
          )}
          
          {/* 작성자 & 조회수 */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {theme.member.profileImage ? (
                <Image
                  src={theme.member.profileImage}
                  alt={theme.member.nickname}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
              )}
              <span>{theme.member.nickname}</span>
            </div>
            <span>👁 {theme.viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ThemesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ThemeListContent />
    </Suspense>
  );
}
