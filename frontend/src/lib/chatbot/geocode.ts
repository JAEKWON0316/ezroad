import { GeocodingResult } from '@/types/chat';

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

// 지역명 → 좌표 변환 (Kakao Local API)
export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Kakao API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const place = data.documents[0];
      return {
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        address: place.address_name || place.road_address_name || query,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// 두 좌표 사이 거리 계산 (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 1000) / 1000; // km, 소수점 3자리
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 도보 이동 시간 추정 (분)
export function estimateWalkingTime(distanceKm: number): number {
  // 평균 도보 속도 4km/h 기준
  return Math.round((distanceKm / 4) * 60);
}

export default geocodeLocation;
