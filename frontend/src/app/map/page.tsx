'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Navigation, Star, Utensils, X, ChevronRight, ChevronLeft, Layers, Route } from 'lucide-react';
import { restaurantApi, themeApi } from '@/lib/api';
import { Restaurant, Theme, ThemeDetail } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Link from 'next/link';

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-64px)] flex items-center justify-center"><Loading size="lg" /></div>}>
      <MapPageContent />
    </Suspense>
  );
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const themeIdParam = searchParams.get('theme');
  const { isAuthenticated } = useAuth();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polyline, setPolyline] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  // 테마 관련 상태
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const [myThemes, setMyThemes] = useState<Theme[]>([]);
  const [publicThemes, setPublicThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeDetail | null>(null);
  const [themeTab, setThemeTab] = useState<'my' | 'public'>('my');

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
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // URL 파라미터로 테마 로드
  useEffect(() => {
    if (themeIdParam && map) {
      loadTheme(parseInt(themeIdParam));
    }
  }, [themeIdParam, map]);

  // 테마 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchMyThemes();
    }
    fetchPublicThemes();
  }, [isAuthenticated]);

  const fetchMyThemes = async () => {
    try {
      const themes = await themeApi.getMyAll();
      setMyThemes(themes);
    } catch (error) {
      console.error('Failed to fetch my themes:', error);
    }
  };

  const fetchPublicThemes = async () => {
    try {
      const response = await themeApi.getPublic(undefined, 'createdAt', 0, 20);
      setPublicThemes(response.content);
    } catch (error) {
      console.error('Failed to fetch public themes:', error);
    }
  };

  const loadTheme = async (themeId: number) => {
    try {
      setIsLoading(true);
      const theme = await themeApi.getDetail(themeId);
      setSelectedTheme(theme);
      
      // 테마 식당들로 지도 업데이트 (ThemeRestaurant → Restaurant 변환)
      const themeRestaurants: Restaurant[] = theme.restaurants.map(tr => ({
        id: tr.restaurantId,
        name: tr.name,
        category: tr.category,
        address: tr.address,
        thumbnail: tr.thumbnail,
        avgRating: tr.avgRating,
        reviewCount: tr.reviewCount,
        latitude: tr.latitude,
        longitude: tr.longitude,
        viewCount: 0,
        status: 'ACTIVE' as const,
        createdAt: '',
      }));
      setRestaurants(themeRestaurants);
      
      // 첫 번째 식당으로 지도 이동
      if (themeRestaurants.length > 0 && map) {
        const first = themeRestaurants[0];
        if (first.latitude && first.longitude) {
          const kakao = (window as any).kakao;
          const moveLatLng = new kakao.maps.LatLng(first.latitude, first.longitude);
          map.setCenter(moveLatLng);
          map.setLevel(6); // 좀 더 넓게 보기
        }
      }
      
      setShowThemeSidebar(false);
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTheme = () => {
    setSelectedTheme(null);
    if (polyline) {
      polyline.setMap(null);
      setPolyline(null);
    }
    // 현재 위치 기준으로 다시 로드
    if (currentPosition) {
      fetchNearbyRestaurants(currentPosition.lat, currentPosition.lng);
    } else {
      fetchNearbyRestaurants(37.5665, 126.978);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;
    const kakao = (window as any).kakao;

    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978),
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
          
          // URL에 테마 ID가 없을 때만 현재 위치로 이동
          if (!themeIdParam) {
            const moveLatLng = new kakao.maps.LatLng(latitude, longitude);
            newMap.setCenter(moveLatLng);
            
            new kakao.maps.Marker({
              map: newMap,
              position: moveLatLng,
              image: new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new kakao.maps.Size(24, 35)
              ),
            });

            fetchNearbyRestaurants(latitude, longitude);
          }
        },
        () => {
          if (!themeIdParam) {
            fetchNearbyRestaurants(37.5665, 126.978);
          }
        }
      );
    } else if (!themeIdParam) {
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

  // 마커 업데이트 (테마 모드일 때 순서 번호 표시)
  useEffect(() => {
    if (!map || restaurants.length === 0) return;
    const kakao = (window as any).kakao;

    // 기존 마커 & 폴리라인 제거
    markers.forEach((m) => {
      if (m.marker) m.marker.setMap(null);
      if (m.overlay) m.overlay.setMap(null);
    });
    if (polyline) {
      polyline.setMap(null);
    }

    const newMarkers: any[] = [];
    const pathCoords: any[] = [];

    restaurants.forEach((restaurant, index) => {
      if (!restaurant.latitude || !restaurant.longitude) return;

      const position = new kakao.maps.LatLng(
        restaurant.latitude,
        restaurant.longitude
      );
      pathCoords.push(position);

      let marker;
      
      // 테마 모드일 때 순서 번호 마커 사용
      if (selectedTheme) {
        const content = `
          <div style="
            width: 30px; 
            height: 30px; 
            background: #f97316; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${index + 1}</div>
        `;
        const customOverlay = new kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
        });
        customOverlay.setMap(map);
        
        // CustomOverlay는 클릭 이벤트가 없어서 일반 마커도 같이 생성 (투명)
        marker = new kakao.maps.Marker({
          map,
          position,
          title: restaurant.name,
          opacity: 0,
        });
        
        newMarkers.push({ marker, overlay: customOverlay });
      } else {
        marker = new kakao.maps.Marker({
          map,
          position,
          title: restaurant.name,
        });
        newMarkers.push({ marker });
      }

      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedRestaurant(restaurant);
        map.panTo(position);
      });
    });

    // 테마 모드일 때 폴리라인 그리기
    if (selectedTheme && pathCoords.length > 1) {
      const newPolyline = new kakao.maps.Polyline({
        map,
        path: pathCoords,
        strokeWeight: 4,
        strokeColor: '#f97316',
        strokeOpacity: 0.7,
        strokeStyle: 'solid',
      });
      setPolyline(newPolyline);
    }

    setMarkers(newMarkers);

    // cleanup
    return () => {
      newMarkers.forEach((m) => {
        m.marker.setMap(null);
        if (m.overlay) m.overlay.setMap(null);
      });
    };
  }, [map, restaurants, selectedTheme]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSelectedTheme(null);
    try {
      const response = await restaurantApi.getList({
        keyword: searchQuery,
        size: 50,
      });
      setRestaurants(response.content);

      if (response.content.length > 0 && map) {
        const first = response.content[0];
        if (first.latitude && first.longitude) {
          const kakao = (window as any).kakao;
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

      setSelectedTheme(null);
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

      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowThemeSidebar(!showThemeSidebar)}
        className="absolute top-20 left-4 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 flex items-center gap-2"
      >
        <Layers className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-medium pr-1">테마</span>
      </button>

      {/* Selected Theme Badge */}
      {selectedTheme && (
        <div className="absolute top-20 left-32 z-10 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Route className="h-4 w-4" />
          <span className="text-sm font-medium">{selectedTheme.title}</span>
          <button onClick={clearTheme} className="ml-1 hover:bg-orange-600 rounded-full p-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Theme Sidebar */}
      <div className={`absolute top-0 left-0 h-full w-80 bg-white shadow-xl z-20 transition-transform duration-300 ${showThemeSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">테마 선택</h2>
          <button onClick={() => setShowThemeSidebar(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Theme Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setThemeTab('my')}
            className={`flex-1 py-3 text-center font-medium ${themeTab === 'my' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            내 테마
          </button>
          <button
            onClick={() => setThemeTab('public')}
            className={`flex-1 py-3 text-center font-medium ${themeTab === 'public' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            공개 테마
          </button>
        </div>

        {/* Theme List */}
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {themeTab === 'my' ? (
            !isAuthenticated ? (
              <div className="p-4 text-center text-gray-500">
                <p className="mb-3">로그인하면 내 테마를 볼 수 있어요</p>
                <Link href="/login">
                  <Button size="sm">로그인</Button>
                </Link>
              </div>
            ) : myThemes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="mb-3">아직 테마가 없어요</p>
                <Link href="/themes/new">
                  <Button size="sm">테마 만들기</Button>
                </Link>
              </div>
            ) : (
              myThemes.map((theme) => (
                <ThemeListItem 
                  key={theme.id} 
                  theme={theme} 
                  onClick={() => loadTheme(theme.id)}
                  isSelected={selectedTheme?.id === theme.id}
                />
              ))
            )
          ) : (
            publicThemes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                공개 테마가 없습니다
              </div>
            ) : (
              publicThemes.map((theme) => (
                <ThemeListItem 
                  key={theme.id} 
                  theme={theme} 
                  onClick={() => loadTheme(theme.id)}
                  isSelected={selectedTheme?.id === theme.id}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showThemeSidebar && (
        <div 
          className="absolute inset-0 bg-black/20 z-10"
          onClick={() => setShowThemeSidebar(false)}
        />
      )}

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
                  {selectedTheme && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      #{restaurants.findIndex(r => r.id === selectedRestaurant.id) + 1}
                    </span>
                  )}
                  <span className="text-xs text-orange-500 font-medium ml-1">
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

      {/* Theme Restaurant List (Bottom) */}
      {selectedTheme && restaurants.length > 0 && !selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg p-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedTheme.title} ({restaurants.length}개 식당)
              </span>
              <Link href={`/themes/${selectedTheme.id}`} className="text-sm text-orange-500">
                상세보기
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {restaurants.map((restaurant, index) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    if (map && restaurant.latitude && restaurant.longitude) {
                      const kakao = (window as any).kakao;
                      map.panTo(new kakao.maps.LatLng(restaurant.latitude, restaurant.longitude));
                    }
                  }}
                  className="flex-shrink-0 flex items-center gap-2 bg-gray-50 hover:bg-orange-50 rounded-lg p-2 transition-colors"
                >
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">{restaurant.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Theme List Item Component
function ThemeListItem({ 
  theme, 
  onClick, 
  isSelected 
}: { 
  theme: Theme; 
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-gray-50 border-b transition-colors ${isSelected ? 'bg-orange-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          {theme.thumbnail ? (
            <img src={theme.thumbnail} alt={theme.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{theme.title}</h3>
          <p className="text-sm text-gray-500">
            {theme.restaurantCount}개 식당 · {theme.isPublic ? '공개' : '비공개'}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </button>
  );
}
