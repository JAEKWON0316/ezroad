import { GeocodingResult } from '@/types/chat';

// REST API 키 사용 (서버사이드 전용 - 지오코딩용)
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// 지역명 → 좌표 변환 (Kakao Local API)
export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  if (!KAKAO_REST_API_KEY) {
    console.error('KAKAO_REST_API_KEY is not set');
    return null;
  }

  try {
    // 검색어 정제 (역, 구, 동 등 포함해서 검색)
    const searchQuery = query.includes('역') || query.includes('구') || query.includes('동')
      ? query
      : `${query}역`; // "강남" → "강남역"으로 검색

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Kakao API error:', response.status, await response.text());
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

    // 첫 번째 검색 실패 시, 원본 쿼리로 재시도
    if (searchQuery !== query) {
      const retryResponse = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        if (retryData.documents && retryData.documents.length > 0) {
          const place = retryData.documents[0];
          return {
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            address: place.address_name || place.road_address_name || query,
          };
        }
      }
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
