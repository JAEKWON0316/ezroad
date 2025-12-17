'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { publicRestaurantApi, PublicRestaurantMap, BboxParams } from '@/lib/api';

interface UsePublicRestaurantsOptions {
  enabled?: boolean;
  defaultLimit?: number;
}

export function usePublicRestaurants(options: UsePublicRestaurantsOptions = {}) {
  const { enabled = true, defaultLimit = 500 } = options;
  
  const [publicRestaurants, setPublicRestaurants] = useState<PublicRestaurantMap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPublicData, setShowPublicData] = useState(false);
  
  // 중복 요청 방지
  const lastBboxRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchByBbox = useCallback(async (params: BboxParams) => {
    if (!enabled || !showPublicData) return;

    // 같은 영역 중복 요청 방지
    const bboxKey = `${params.minLat.toFixed(4)}_${params.maxLat.toFixed(4)}_${params.minLng.toFixed(4)}_${params.maxLng.toFixed(4)}`;
    if (bboxKey === lastBboxRef.current) return;
    lastBboxRef.current = bboxKey;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const data = await publicRestaurantApi.getByBbox({
        ...params,
        limit: params.limit || defaultLimit,
      });
      setPublicRestaurants(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('공공데이터를 불러오는데 실패했습니다');
        console.error('Failed to fetch public restaurants:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, showPublicData, defaultLimit]);

  const togglePublicData = useCallback(() => {
    setShowPublicData(prev => !prev);
    if (showPublicData) {
      // 끄면 데이터 초기화
      setPublicRestaurants([]);
      lastBboxRef.current = '';
    }
  }, [showPublicData]);

  const clearPublicData = useCallback(() => {
    setPublicRestaurants([]);
    lastBboxRef.current = '';
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    publicRestaurants,
    isLoading,
    error,
    showPublicData,
    fetchByBbox,
    togglePublicData,
    clearPublicData,
  };
}
