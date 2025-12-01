'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';

interface RestaurantFilterProps {
  onSearch: (keyword: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  selectedCategory?: string;
  selectedSort?: string;
  className?: string;
}

const categories = [
  { value: '', label: '전체' },
  { value: '한식', label: '한식' },
  { value: '중식', label: '중식' },
  { value: '일식', label: '일식' },
  { value: '양식', label: '양식' },
  { value: '카페', label: '카페' },
  { value: '패스트푸드', label: '패스트푸드' },
  { value: '기타', label: '기타' },
];

const sortOptions = [
  { value: 'createdAt', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'reviewCount', label: '리뷰많은순' },
  { value: 'distance', label: '거리순' },
];

export default function RestaurantFilter({
  onSearch,
  onCategoryChange,
  onSortChange,
  selectedCategory = '',
  selectedSort = 'createdAt',
  className,
}: RestaurantFilterProps) {
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword);
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="식당 이름, 메뉴, 지역 검색"
          className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {keyword && (
            <button type="button" onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFilters ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    selectedCategory === cat.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    selectedSort === opt.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 빠른 선택 (필터 닫혀있을 때) */}
      {!showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0',
                selectedCategory === cat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
