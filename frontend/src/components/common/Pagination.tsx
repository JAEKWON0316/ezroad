'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-based (API와 동일)
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // 0-based currentPage를 1-based displayPage로 변환
  const displayPage = currentPage + 1;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(showPageNumbers / 2);
    let start = Math.max(1, displayPage - half);
    const end = Math.min(totalPages, start + showPageNumbers - 1);

    if (end - start + 1 < showPageNumbers) {
      start = Math.max(1, end - showPageNumbers + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="페이지네이션">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === 0
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
              ...
            </span>
          );
        }

        const pageNumber = page as number; // 1-based display number
        const isActive = pageNumber === displayPage;

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber - 1)} // Convert to 0-based for API
            className={cn(
              'min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors',
              isActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-label={`${pageNumber} 페이지`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage >= totalPages - 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
