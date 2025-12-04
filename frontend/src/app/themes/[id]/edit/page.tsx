'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { themeApi, restaurantApi, fileApi } from '@/lib/api';
import type { Restaurant, ThemeDetail, ThemeUpdateRequest } from '@/types';

export default function EditThemePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const themeId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ThemeUpdateRequest>({
    title: '',
    description: '',
    thumbnail: '',
    isPublic: true,
  });
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [originalRestaurantIds, setOriginalRestaurantIds] = useState<number[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요합니다');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTheme();
    }
  }, [themeId, isAuthenticated]);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const theme = await themeApi.getDetail(themeId);
      
      // 본인 테마인지 확인
      if (user && theme.member.id !== user.id) {
        alert('수정 권한이 없습니다');
        router.push(`/themes/${themeId}`);
        return;
      }

      setFormData({
        title: theme.title,
        description: theme.description || '',
        thumbnail: theme.thumbnail || '',
        isPublic: theme.isPublic,
      });

      // 식당 목록 변환
      const restaurants: Restaurant[] = theme.restaurants.map(tr => ({
        id: tr.restaurantId,
        name: tr.name,
        category: tr.category,
        address: tr.address,
        thumbnail: tr.thumbnail,
        avgRating: tr.avgRating,
        reviewCount: tr.reviewCount,
      } as Restaurant));
      
      setSelectedRestaurants(restaurants);
      setOriginalRestaurantIds(restaurants.map(r => r.id));
    } catch (err) {
      console.error('테마 로딩 실패:', err);
      alert('테마를 불러올 수 없습니다');
      router.push('/themes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await fileApi.upload(file, 'restaurant');
      setFormData({ ...formData, thumbnail: result.url });
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    try {
      setSearching(true);
      const response = await restaurantApi.getList({ keyword: searchKeyword, size: 10 });
      const filtered = response.content.filter(
        r => !selectedRestaurants.find(s => s.id === r.id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('식당 검색 실패:', err);
    } finally {
      setSearching(false);
    }
  };

  const addRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurants([...selectedRestaurants, restaurant]);
    setSearchResults(searchResults.filter(r => r.id !== restaurant.id));
  };

  const removeRestaurant = (restaurantId: number) => {
    setSelectedRestaurants(selectedRestaurants.filter(r => r.id !== restaurantId));
  };

  const moveRestaurant = (index: number, direction: 'up' | 'down') => {
    const newList = [...selectedRestaurants];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newList.length) return;
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setSelectedRestaurants(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('테마 제목을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      
      // 1. 테마 정보 수정
      await themeApi.update(themeId, formData);

      // 2. 식당 변경 처리
      const newIds = selectedRestaurants.map(r => r.id);
      
      // 삭제된 식당
      for (const id of originalRestaurantIds) {
        if (!newIds.includes(id)) {
          await themeApi.removeRestaurant(themeId, id);
        }
      }

      // 추가된 식당
      for (const id of newIds) {
        if (!originalRestaurantIds.includes(id)) {
          await themeApi.addRestaurant(themeId, { restaurantId: id });
        }
      }

      // 3. 순서 변경
      if (newIds.length > 0) {
        await themeApi.reorderRestaurants(themeId, { restaurantIds: newIds });
      }

      alert('테마가 수정되었습니다!');
      router.push(`/themes/${themeId}`);
    } catch (err) {
      console.error('테마 수정 실패:', err);
      alert('테마 수정에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">테마 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">테마 정보</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">썸네일</label>
            <div className="flex items-center gap-4">
              {formData.thumbnail && (
                <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                  <Image src={formData.thumbnail} alt="썸네일" fill className="object-cover" />
                </div>
              )}
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  {uploading ? '업로드 중...' : '이미지 변경'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              id="isPublic"
              className="w-4 h-4"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">공개 테마</label>
          </div>
        </div>

        {/* 식당 관리 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">식당 관리</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="식당 이름으로 검색"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button type="button" onClick={handleSearch} disabled={searching}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
              {searching ? '검색 중...' : '검색'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mb-4 border rounded-lg divide-y max-h-60 overflow-y-auto">
              {searchResults.map((restaurant) => (
                <div key={restaurant.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.category} · {restaurant.address}</p>
                  </div>
                  <button type="button" onClick={() => addRestaurant(restaurant)}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
                    추가
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">선택된 식당 ({selectedRestaurants.length}개)</h3>
            {selectedRestaurants.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center bg-gray-50 rounded-lg">식당을 검색해서 추가해보세요</p>
            ) : (
              <div className="space-y-2">
                {selectedRestaurants.map((restaurant, index) => (
                  <div key={restaurant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-gray-500">{restaurant.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveRestaurant(index, 'up')} disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveRestaurant(index, 'down')} disabled={index === selectedRestaurants.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => removeRestaurant(restaurant.id)}
                        className="p-1 text-red-400 hover:text-red-600">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">취소</button>
          <button type="submit" disabled={submitting}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
            {submitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
