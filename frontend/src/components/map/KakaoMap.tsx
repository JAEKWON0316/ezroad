'use client';

import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/common/Loading';

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: MapOptions) => KakaoMap;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow;
        services: {
          Geocoder: new () => Geocoder;
          Status: { OK: string };
        };
        event: {
          addListener: (target: unknown, event: string, callback: (...args: any[]) => void) => void;
        };
      };
    };
  }
}

interface MapOptions {
  center: LatLng;
  level: number;
}

interface LatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoMap {
  setCenter: (latlng: LatLng) => void;
  getCenter: () => LatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
}

interface MarkerOptions {
  map: KakaoMap;
  position: LatLng;
  image?: unknown;
}

interface Marker {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (position: LatLng) => void;
}

interface InfoWindowOptions {
  content: string;
}

interface InfoWindow {
  open: (map: KakaoMap, marker: Marker) => void;
  close: () => void;
}

interface Geocoder {
  addressSearch: (address: string, callback: (result: GeocoderResult[], status: string) => void) => void;
  coord2Address: (lng: number, lat: number, callback: (result: Coord2AddressResult[], status: string) => void) => void;
}

interface GeocoderResult {
  x: string;
  y: string;
}

interface Coord2AddressResult {
  address: {
    address_name: string;
  };
}

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  info?: string;
}

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  showCurrentLocation?: boolean;
}

export default function KakaoMap({
  center = { lat: 37.5665, lng: 126.978 },
  level = 3,
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
  showCurrentLocation = false,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    
    if (!apiKey) {
      setError('카카오맵 API 키가 설정되지 않았습니다');
      setIsLoading(false);
      return;
    }

    // 이미 로드된 경우
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    script.onerror = () => {
      setError('카카오맵을 불러오는데 실패했습니다');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // cleanup
    };
  }, []);

  // 맵 초기화
  const initMap = () => {
    if (!mapRef.current || !window.kakao?.maps) return;

    try {
      const options: MapOptions = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level,
      };

      const newMap = new window.kakao.maps.Map(mapRef.current, options);
      setMap(newMap);
      setIsLoading(false);

      // 맵 클릭 이벤트
      if (onMapClick) {
        window.kakao.maps.event.addListener(newMap, 'click', (mouseEvent: { latLng: LatLng }) => {
          const lat = mouseEvent.latLng.getLat();
          const lng = mouseEvent.latLng.getLng();
          onMapClick(lat, lng);
        });
      }
    } catch (err) {
      setError('맵 초기화에 실패했습니다');
      setIsLoading(false);
    }
  };

  // 현재 위치로 이동
  useEffect(() => {
    if (!map || !showCurrentLocation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
          map.setCenter(moveLatLng);
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
        }
      );
    }
  }, [map, showCurrentLocation]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !window.kakao?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    markers.forEach((markerData) => {
      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
      const marker = new window.kakao.maps.Marker({
        map,
        position,
      });

      if (onMarkerClick) {
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(markerData);
        });
      }

      // InfoWindow
      if (markerData.info) {
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${markerData.info}</div>`,
        });

        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          infoWindow.open(map, marker);
        });

        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infoWindow.close();
        });
      }

      markersRef.current.push(marker);
    });
  }, [map, markers, onMarkerClick]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loading />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
