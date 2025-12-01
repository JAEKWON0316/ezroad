'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Navigation, Star, Utensils, X } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { Restaurant } from '@/types';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Link from 'next/link';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        initializeMap();
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;
    const kakao = (window as any).kakao;

    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 5,
    };

    const newMap = new kakao.maps.Map(mapRef.current, options);
    setMap(newMap);

    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          
          const moveLatLng = new kakao.maps.LatLng(latitude, longitude);
          newMap.setCenter(moveLatLng);
          
          // 현재 위치 마커 추가
          new kakao.maps.Marker({
            map: newMap,
            position: moveLatLng,
            image: new kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new kakao.maps.Size(24, 35)
            ),
          });

          fetchNearbyRestaurants(latitude, longitude);
        },
        () => {
          // 위치 권한 거부 시 기본 위치로 검색
          fetchNearbyRestaurants(37.5665, 126.978);
        }
      );
    } else {
      fetchNearbyRestaurants(37.5665, 126.978);
    }
  };

  const fetchNearbyRestaurants = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await restaurantApi.getList({
        lat,
        lng,
        radius: 3000,
        size: 50,
      });
      setRestaurants(response.content);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!map || restaurants.length === 0) return;
    const kakao = (window as any).kakao;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: any[] = [];

    restaurants.forEach((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude) return;

      const position = new kakao.maps.LatLng(
        restaurant.latitude,
        restaurant.longitude
      );

      const marker = new kakao.maps.Marker({
        map,
        position,
        title: restaurant.name,
      });

      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedRestaurant(restaurant);
        map.panTo(position);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, restaurants]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const kakao = (window as any).kakao;

    setIsLoading(true);
    try {
      const response = await restaurantApi.getList({
        keyword: searchQuery,
        size: 50,
      });
      setRestaurants(response.content);

      // 첫 번째 결과로 지도 이동
      if (response.content.length > 0) {
        const first = response.content[0];
        if (first.latitude && first.longitude && map) {
          const moveLatLng = new kakao.maps.LatLng(first.latitude, first.longitude);
          map.setCenter(moveLatLng);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    const kakao = (window as any).kakao;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({ lat: latitude, lng: longitude });

      if (map) {
        const moveLatLng = new kakao.maps.LatLng(latitude, longitude);
        map.setCenter(moveLatLng);
      }

      fetchNearbyRestaurants(latitude, longitude);
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소, 식당 검색"
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button type="submit" className="shadow-lg">
            검색
          </Button>
        </form>
      </div>

      {/* Current Location Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-24 right-4 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50"
      >
        <Navigation className="h-6 w-6 text-orange-500" />
      </button>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
          <Loading size="lg" />
        </div>
      )}

      {/* Selected Restaurant Card */}
      {selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <Link href={`/restaurants/${selectedRestaurant.id}`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {selectedRestaurant.thumbnail ? (
                    <img
                      src={selectedRestaurant.thumbnail}
                      alt={selectedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-orange-500 font-medium">
                    {selectedRestaurant.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {selectedRestaurant.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedRestaurant.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {selectedRestaurant.avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({selectedRestaurant.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
