'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Navigation, Star, Utensils, X, ChevronRight, Layers, Route, Database } from 'lucide-react';
import { restaurantApi, themeApi, publicRestaurantApi, PublicRestaurantMap, PublicRestaurantDetail } from '@/lib/api';
import { Restaurant, Theme, ThemeDetail } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Link from 'next/link';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';
import MapSkeleton from '@/components/map/MapSkeleton';

export default function MapPage() {
  return (
    <Suspense fallback={<MapSkeleton />}>
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

  // 공공데이터 관련 상태
  const [showPublicData, setShowPublicData] = useState(false);
  const [publicDataMarkers, setPublicDataMarkers] = useState<PublicRestaurantMap[]>([]);
  const [clusterer, setClusterer] = useState<any>(null);
  const [selectedPublicRestaurant, setSelectedPublicRestaurant] = useState<PublicRestaurantDetail | null>(null);
  const [isLoadingPublicData, setIsLoadingPublicData] = useState(false);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=clusterer`;
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

  // React Query for Themes
  const { data: myThemesData } = useQuery({
    queryKey: ['myThemes'],
    queryFn: () => themeApi.getMyAll(),
    enabled: !!isAuthenticated,
  });

  const { data: publicThemesData } = useQuery({
    queryKey: ['themes', { sort: 'createdAt', page: 0, size: 20 }],
    queryFn: () => themeApi.getPublic(undefined, 'createdAt', 0, 20),
  });

  useEffect(() => {
    if (myThemesData) setMyThemes(myThemesData);
  }, [myThemesData]);

  useEffect(() => {
    if (publicThemesData) setPublicThemes(publicThemesData.content);
  }, [publicThemesData]);

  const loadTheme = async (themeId: number) => {
    try {
      setIsLoading(true);
      const theme = await themeApi.getDetail(themeId);
      setSelectedTheme(theme);

      // 테마 식당들로 지도 업데이트
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
          map.setLevel(6);
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

  // 공공데이터 bbox 로드 (줌 레벨에 따른 동적 limit)
  const fetchPublicDataByBbox = useCallback(async (mapInstance: any) => {
    if (!mapInstance || !showPublicData) return;
    
    const kakao = (window as any).kakao;
    if (!kakao?.maps) return;
    
    const bounds = mapInstance.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // 줌 레벨에 따른 limit 조절 (줌 작을수록 = 더 넓은 영역 = limit 줄임)
    const zoomLevel = mapInstance.getLevel();
    let limit = 1000;
    if (zoomLevel >= 10) limit = 200;      // 매우 축소
    else if (zoomLevel >= 8) limit = 400;  // 축소
    else if (zoomLevel >= 6) limit = 600;  // 중간
    else limit = 1000;                      // 확대

    setIsLoadingPublicData(true);
    try {
      const data = await publicRestaurantApi.getByBbox({
        minLat: sw.getLat(),
        maxLat: ne.getLat(),
        minLng: sw.getLng(),
        maxLng: ne.getLng(),
        limit,
      });
      setPublicDataMarkers(data);
    } catch (error) {
      console.error('Failed to fetch public data:', error);
    } finally {
      setIsLoadingPublicData(false);
    }
  }, [showPublicData]);

  // 공공데이터 토글
  const togglePublicData = () => {
    if (showPublicData) {
      // 끄는 경우: 먼저 클리어 후 상태 변경
      if (clusterer) {
        try {
          clusterer.clear();
        } catch (e) {
          console.warn('Clusterer clear error:', e);
        }
      }
      setPublicDataMarkers([]);
      setSelectedPublicRestaurant(null);
    }
    setShowPublicData(prev => !prev);
  };

  // 공공데이터 클러스터 업데이트
  useEffect(() => {
    if (!map || !clusterer) return;
    
    const kakao = (window as any).kakao;
    if (!kakao?.maps) return;

    // showPublicData가 false면 클러스터 클리어
    if (!showPublicData) {
      try {
        clusterer.clear();
      } catch (e) {
        // 이미 클리어된 경우 무시
      }
      return;
    }

    // 기존 클러스터 클리어
    try {
      clusterer.clear();
    } catch (e) {
      console.warn('Clusterer clear error:', e);
    }

    if (publicDataMarkers.length === 0) return;

    // 마커 생성
    const clusterMarkers = publicDataMarkers.map((item) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(item.latitude, item.longitude),
      });

      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', async () => {
        try {
          const detail = await publicRestaurantApi.getDetail(item.id);
          setSelectedPublicRestaurant(detail);
          setSelectedRestaurant(null);
        } catch (error) {
          console.error('Failed to get public restaurant detail:', error);
        }
      });

      return marker;
    });

    // 클러스터에 마커 추가
    clusterer.addMarkers(clusterMarkers);
    
    // 클러스터러 강제 리드로우 (위치 보정)
    setTimeout(() => {
      if (clusterer && typeof clusterer.redraw === 'function') {
        clusterer.redraw();
      }
    }, 100);
  }, [map, clusterer, publicDataMarkers, showPublicData]);

  // 지도 이동 시 공공데이터 로드
  useEffect(() => {
    if (!map || !showPublicData) return;

    const kakao = (window as any).kakao;
    if (!kakao?.maps?.event) return;
    
    // 초기 로드
    fetchPublicDataByBbox(map);

    // idle 이벤트 (지도 이동/줌 완료 시)
    const idleListener = kakao.maps.event.addListener(map, 'idle', () => {
      fetchPublicDataByBbox(map);
    });

    return () => {
      // cleanup 시 kakao 객체 존재 확인
      const kakaoCleanup = (window as any).kakao;
      if (kakaoCleanup?.maps?.event && idleListener) {
        try {
          kakaoCleanup.maps.event.removeListener(idleListener);
        } catch (e) {
          // 이미 제거된 경우 무시
        }
      }
    };
  }, [map, showPublicData, fetchPublicDataByBbox]);

  const initializeMap = () => {
    if (!mapRef.current) return;
    const kakao = (window as any).kakao;

    const options = {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    };

    const newMap = new kakao.maps.Map(mapRef.current, options);
    setMap(newMap);

    // 클러스터러 초기화 (공공데이터용)
    const newClusterer = new kakao.maps.MarkerClusterer({
      map: newMap,
      averageCenter: false,
      minLevel: 5,
      disableClickZoom: false,
      styles: [{
        width: '50px',
        height: '50px',
        background: 'rgba(34, 197, 94, 0.9)',
        borderRadius: '50%',
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '50px',
        fontSize: '14px',
      }, {
        width: '60px',
        height: '60px',
        background: 'rgba(59, 130, 246, 0.9)',
        borderRadius: '50%',
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '60px',
        fontSize: '15px',
      }, {
        width: '70px',
        height: '70px',
        background: 'rgba(239, 68, 68, 0.9)',
        borderRadius: '50%',
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: '70px',
        fontSize: '16px',
      }],
    });
    setClusterer(newClusterer);

    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });

          if (!themeIdParam) {
            const moveLatLng = new kakao.maps.LatLng(latitude, longitude);
            newMap.setCenter(moveLatLng);

            // 현재위치 마커
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

  // 마커 업데이트
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
            width: 32px; 
            height: 32px; 
            background: #F97316; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            font-family: sans-serif;
            transition: transform 0.2s;
          ">${index + 1}</div>
        `;
        const customOverlay = new kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
        });
        customOverlay.setMap(map);

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
        strokeWeight: 5,
        strokeColor: '#F97316',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });
      setPolyline(newPolyline);
    }

    setMarkers(newMarkers);

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
    <div className="h-[calc(100vh-64px)] relative bg-gray-100">
      {/* Search Bar - Glassmorphism */}
      <div className="absolute top-4 left-4 right-4 md:left-8 md:right-auto md:w-96 z-10">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 transition-all duration-300 group-focus-within:bg-white/60"></div>
          <div className="relative flex items-center p-2">
            <Search className="h-5 w-5 text-gray-500 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소, 식당 검색"
              className="w-full pl-3 pr-4 py-2 bg-transparent border-none text-gray-800 placeholder-gray-500 focus:ring-0 text-sm font-medium"
            />
            <Button type="submit" size="sm" className="rounded-xl shadow-none">
              검색
            </Button>
          </div>
        </form>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowThemeSidebar(!showThemeSidebar)}
        className="absolute top-20 left-4 md:left-8 z-10 h-10 px-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white flex items-center gap-2 border border-white/50 transition-all"
      >
        <div className="bg-orange-100 p-1 rounded-full"><Layers className="h-4 w-4 text-orange-600" /></div>
        <span className="text-sm font-medium text-gray-700 pr-1">테마 보기</span>
      </button>

      {/* Public Data Toggle Button */}
      <button
        onClick={togglePublicData}
        className={`absolute top-32 left-4 md:left-8 z-10 h-10 px-3 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 border transition-all ${
          showPublicData 
            ? 'bg-green-500 text-white border-green-400 hover:bg-green-600' 
            : 'bg-white/90 border-white/50 hover:bg-white'
        }`}
      >
        <div className={`p-1 rounded-full ${showPublicData ? 'bg-white/20' : 'bg-green-100'}`}>
          <Database className={`h-4 w-4 ${showPublicData ? 'text-white' : 'text-green-600'}`} />
        </div>
        <span className={`text-sm font-medium pr-1 ${showPublicData ? 'text-white' : 'text-gray-700'}`}>
          공공데이터 {showPublicData ? 'ON' : 'OFF'}
        </span>
        {isLoadingPublicData && (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Public Data Count Badge */}
      {showPublicData && publicDataMarkers.length > 0 && (
        <div className="absolute top-32 left-48 md:left-52 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {publicDataMarkers.length.toLocaleString()}개 식당
        </div>
      )}

      {/* Selected Theme Badge */}
      {selectedTheme && (
        <div className="absolute top-20 left-40 md:left-44 z-10 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-up">
          <Route className="h-4 w-4" />
          <span className="text-sm font-medium">{selectedTheme.title}</span>
          <button onClick={clearTheme} className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Theme Sidebar */}
      <div className={`absolute top-0 left-0 h-full w-full md:w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-20 transition-transform duration-300 transform ${showThemeSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50">
          <h2 className="font-bold text-xl text-gray-800">테마 선택</h2>
          <button onClick={() => setShowThemeSidebar(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Theme Tabs */}
        <div className="flex p-2 gap-2 bg-gray-50/50">
          <button
            onClick={() => setThemeTab('my')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${themeTab === 'my' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            내 테마
          </button>
          <button
            onClick={() => setThemeTab('public')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${themeTab === 'public' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
          >
            공개 테마
          </button>
        </div>

        {/* Theme List */}
        <div className="overflow-y-auto h-[calc(100%-140px)] p-2">
          {themeTab === 'my' ? (
            !isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <Layers className="w-12 h-12 text-gray-300 mb-4" />
                <p className="mb-4 text-center">로그인하고 나만의 맛집 지도를<br />만들어보세요!</p>
                <Link href="/login">
                  <Button size="sm">로그인</Button>
                </Link>
              </div>
            ) : myThemes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <p className="mb-4">아직 소중한 테마가 없으시네요</p>
                <Link href="/themes/new">
                  <Button size="sm" variant="outline">+ 첫 테마 만들기</Button>
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
              <div className="p-8 text-center text-gray-500">
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

      {/* Sidebar Overlay (Mobile) */}
      {showThemeSidebar && (
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden animate-fade-in"
          onClick={() => setShowThemeSidebar(false)}
        />
      )}

      {/* Current Location Button */}
      <button
        onClick={handleCurrentLocation}
        className="absolute bottom-24 right-4 z-10 p-3 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full shadow-lg transition-all transform hover:scale-105"
      >
        <Navigation className="h-6 w-6" />
      </button>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Subtle Loading Indicator for Search/Refetch */}
      {isLoading && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-orange-100">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-600">지도를 불러오는 중...</span>
        </div>
      )}

      {/* Selected Public Restaurant Card (공공데이터) */}
      {selectedPublicRestaurant && !selectedRestaurant && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-10 animate-slide-up">
          <div className="glass-card bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-green-100">
            <button
              onClick={() => setSelectedPublicRestaurant(null)}
              className="absolute top-2 right-2 p-1.5 hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-xl bg-green-50 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                <Database className="h-10 w-10 text-green-400" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <div className="flex flex-wrap gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                    공공데이터
                  </span>
                  {selectedPublicRestaurant.category && (
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {selectedPublicRestaurant.category}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight truncate mb-1">
                  {selectedPublicRestaurant.name}
                  {selectedPublicRestaurant.branchName && (
                    <span className="text-gray-500 font-normal text-sm ml-1">
                      {selectedPublicRestaurant.branchName}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 truncate flex items-center mb-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  {selectedPublicRestaurant.address || `${selectedPublicRestaurant.sido} ${selectedPublicRestaurant.sigungu}`}
                </p>
                {selectedPublicRestaurant.subCategory && (
                  <p className="text-xs text-gray-400 truncate">
                    {selectedPublicRestaurant.subCategory}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Restaurant Card - Modern */}
      {selectedRestaurant && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-10 animate-slide-up">
          <div className="glass-card bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/50">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-2 right-2 p-1.5 hover:bg-gray-100/50 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
            <Link href={`/restaurants/${selectedRestaurant.id}`} className="block group">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden shadow-sm relative">
                  {selectedRestaurant.thumbnail ? (
                    <Image
                      src={selectedRestaurant.thumbnail}
                      alt={selectedRestaurant.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Utensils className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {selectedTheme && (
                      <span className="text-[10px] uppercase font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                        #{restaurants.findIndex(r => r.id === selectedRestaurant.id) + 1}
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {selectedRestaurant.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight truncate mb-1 group-hover:text-orange-600 transition-colors">
                    {selectedRestaurant.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate flex items-center mb-2">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    {selectedRestaurant.address}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500 font-bold text-sm">
                      <Star className="h-4 w-4 fill-current mr-0.5" />
                      {selectedRestaurant.avgRating.toFixed(1)}
                    </div>
                    <span className="text-xs text-gray-400">
                      ({selectedRestaurant.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Theme Restaurant List (Bottom Horizontal Scroll) */}
      {selectedTheme && restaurants.length > 0 && !selectedRestaurant && (
        <div className="absolute bottom-8 left-0 right-0 z-10 animate-fade-in-up">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-indigo-50/50">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  {selectedTheme.title} ({restaurants.length})
                </span>
                <Link href={`/themes/${selectedTheme.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                  상세보기 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 snap-x">
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
                    className="flex-shrink-0 snap-start bg-white border border-gray-100 hover:border-orange-200 rounded-xl p-2 w-40 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md text-left"
                  >
                    <div className="relative w-full h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                      {restaurant.thumbnail && (
                        <Image src={restaurant.thumbnail} alt={restaurant.name} fill className="object-cover" />
                      )}
                      <span className="absolute top-1 left-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        {index + 1}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-gray-900 truncate">{restaurant.name}</div>
                    <div className="text-xs text-gray-500 truncate">{restaurant.category}</div>
                  </button>
                ))}
              </div>
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
      className={`w-full p-3 mb-2 rounded-xl text-left transition-all duration-200 border ${isSelected
        ? 'bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-200'
        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm relative">
          {theme.thumbnail ? (
            <Image src={theme.thumbnail} alt={theme.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
            {theme.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {theme.restaurantCount} spots · {theme.isPublic ? 'Public' : 'Private'}
          </p>
        </div>
        {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
      </div>
    </button>
  );
}
