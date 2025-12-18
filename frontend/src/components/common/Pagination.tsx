'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; // 0-based (Spring Data와 동일)
  totalPages: number;
  onPageChange: (page: number) => void; // 0-based page를 전달
  showPageNumbers?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = 5,
}: PaginationProps) {
  // 페이지가 1개 이하면 페이지네이션 표시 안함
  if (totalPages <= 1) return null;

  // 표시할 페이지 번호 계산 (1-based로 표시)
  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    
    // 총 페이지가 showPageNumbers 이하면 모두 표시
    if (totalPages <= showPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 현재 페이지를 중심으로 표시 (1-based 기준)
    const currentDisplay = currentPage + 1; // 0-based → 1-based
    const half = Math.floor(showPageNumbers / 2);
    
    let start = currentDisplay - half;
    let end = currentDisplay + half;

    // 범위 조정
    if (start < 1) {
      start = 1;
      end = showPageNumbers;
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - showPageNumbers + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // 페이지 클릭 핸들러 (displayNum은 1-based, API는 0-based 필요)
  const handlePageClick = (displayNum: number) => {
    const apiPage = displayNum - 1; // 1-based → 0-based
    if (apiPage !== currentPage && apiPage >= 0 && apiPage < totalPages) {
      onPageChange(apiPage);
    }
  };

  // 이전 페이지
  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;
  const currentDisplay = currentPage + 1; // 표시용 (1-based)

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="페이지네이션">
      {/* 이전 버튼 */}
      <button
        onClick={handlePrev}
        disabled={isFirstPage}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isFirstPage
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* 첫 페이지 + ... (필요시) */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageClick(1)}
            className="min-w-[40px] h-10 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* 페이지 번호들 */}
      {visiblePages.map((pageNum) => {
        const isActive = pageNum === currentDisplay;
        return (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            className={cn(
              'min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors',
              isActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-label={`${pageNum} 페이지`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* ... + 마지막 페이지 (필요시) */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => handlePageClick(totalPages)}
            className="min-w-[40px] h-10 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={isLastPage}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isLastPage
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
