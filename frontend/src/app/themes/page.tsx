'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import type { Theme, PageResponse } from '@/types';
import { Search, Plus, Filter, Heart, Eye } from 'lucide-react';
import Loading from '@/components/common/Loading';

function ThemeListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt');

  const page = parseInt(searchParams.get('page') || '0');

  useEffect(() => {
    fetchThemes();
  }, [page, keyword, sort]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response: PageResponse<Theme> = await themeApi.getPublic(
        keyword || undefined,
        sort,
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
    const params = new URLSearchParams();
    if (searchInput) params.set('keyword', searchInput);
    params.set('sort', sort);
    params.set('page', '0');
    router.push(`/themes?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    params.set('sort', newSort);
    params.set('page', '0');
    router.push(`/themes?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    params.set('sort', sort);
    params.set('page', String(newPage));
    router.push(`/themes?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 text-white overflow-hidden mb-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-100 text-sm font-medium mb-4 animate-fade-in-up">
            Curated Collections
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up delay-100">
            나만의 미식 큐레이션
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl animate-fade-in-up delay-200">
            다른 사용자들이 직접 만든 특별한 맛집 리스트를 탐험해보세요.
          </p>

          {/* Floating Search Bar */}
          <div className="w-full max-w-2xl mt-8 animate-fade-in-up delay-300 relative z-10">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl md:rounded-full blur-md group-hover:blur-lg transition-all duration-300 transform group-hover:scale-105" />
              <div className="relative flex flex-col md:flex-row gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl md:rounded-full shadow-2xl">
                <div className="flex-1 flex items-center px-4">
                  <Search className="w-5 h-5 text-indigo-200 mr-3" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="어떤 테마를 찾고 계신가요?"
                    className="w-full bg-transparent border-none text-white placeholder-indigo-200 focus:ring-0 text-lg py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white text-indigo-600 px-8 py-3 rounded-xl md:rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  검색
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            {[
              { id: 'createdAt', label: '최신순' },
              { id: 'viewCount', label: '인기순' },
              { id: 'likeCount', label: '좋아요순' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sort === option.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <Link
              href="/themes/new"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>테마 만들기</span>
            </Link>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loading />
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 키워드로 검색해보거나 새로운 테마를 만들어보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <ThemeCard key={theme.id} theme={theme} index={index} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
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
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pageNum
                      ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme, index }: { theme: Theme; index: number }) {
  return (
    <Link href={`/themes/${theme.id}`} className="group h-full">
      <div
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Image Area */}
        <div className="relative h-48 overflow-hidden">
          {theme.thumbnail ? (
            <Image
              src={theme.thumbnail}
              alt={theme.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
              <span className="text-4xl filter drop-shadow-sm">🍽️</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white/90 text-xs px-2 py-1 rounded-full font-medium border border-white/10">
            {theme.restaurantCount} Places
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {theme.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
            {theme.description || '특별한 미식 경험을 위한 테마입니다.'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white">
                {theme.member.profileImage ? (
                  <Image
                    src={theme.member.profileImage}
                    alt={theme.member.nickname}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-[10px]">
                    {theme.member.nickname[0]}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">
                {theme.member.nickname}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1 group-hover/stats:text-pink-500 transition-colors">
                <Heart className="w-3.5 h-3.5" />
                {theme.likeCount}
              </div>
              <div className="flex items-center gap-1 group-hover/stats:text-indigo-500 transition-colors">
                <Eye className="w-3.5 h-3.5" />
                {theme.viewCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ThemesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loading size="lg" />
      </div>
    }>
      <ThemeListContent />
    </Suspense>
  );
}
