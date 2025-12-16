'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Plus, Trash2, Edit, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { themeApi } from '@/lib/api';
import type { Theme, PageResponse } from '@/types';
import Button from '@/components/common/Button';
import ThemeCardSkeleton from '@/components/theme/ThemeCardSkeleton';

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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">내 테마 관리</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ThemeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">내 테마 관리</h1>
          </div>

          <Link href="/themes/new">
            <Button size="sm" className="shadow-md shadow-orange-100">
              <Plus className="w-4 h-4 mr-1" /> 새 테마
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ThemeCardSkeleton key={i} />
            ))}
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <span className="text-6xl mb-4 block">🎨</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 만든 테마가 없습니다</h3>
            <p className="text-gray-500 mb-6">나만의 맛집 리스트를 만들어 공유해보세요!</p>
            <Link href="/themes/new">
              <Button size="lg" className="shadow-lg shadow-orange-200">첫 테마 만들기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {themes.map((theme, index) => (
                <div
                  key={theme.id}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link href={`/themes/${theme.id}`} className="block h-full">
                    {/* Thumbnail Area */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {theme.thumbnail ? (
                        <Image
                          src={theme.thumbnail}
                          alt={theme.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
                        </div>
                      )}

                      {/* Privacy Badge */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {theme.isPublic ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/90 text-white backdrop-blur shadow-sm">
                            <Globe className="w-3 h-3" /> 공개
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-700/90 text-white backdrop-blur shadow-sm">
                            <Lock className="w-3 h-3" /> 비공개
                          </span>
                        )}
                      </div>

                      {/* Count Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur">
                        {theme.restaurantCount}곳의 맛집
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors text-lg">
                        {theme.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {theme.description || '설명이 없습니다.'}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 pt-3 border-t border-gray-100">
                        <span className="flex-1">👁 조회수 {theme.viewCount}</span>
                        <span>{new Date(theme.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Actions Overlay (Visible on Hover) */}
                  <div className="absolute top-0 left-0 w-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex gap-2">
                      <Link
                        href={`/themes/${theme.id}/edit`}
                        className="p-2 bg-white/90 backdrop-blur text-gray-700 rounded-xl shadow-lg hover:text-orange-600 hover:bg-white transition-all transform hover:scale-105"
                        onClick={(e) => e.stopPropagation()}
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(theme.id, e)}
                        disabled={deleting === theme.id}
                        className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-105"
                        title="삭제"
                      >
                        {deleting === theme.id ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="flex items-center px-4 font-medium text-gray-600">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
