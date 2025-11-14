import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '@/utils/kakaoMapLoader';

interface KakaoMapOptions {
  center: { lat: number; lng: number };
  level: number;
}

export const useKakaoMap = (containerId: string, options: KakaoMapOptions) => {
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // 카카오맵 스크립트 로드
        await loadKakaoMapScript();

        // 지도 생성
        const container = document.getElementById(containerId);
        if (container) {
          const mapOption = {
            center: new window.kakao.maps.LatLng(options.center.lat, options.center.lng),
            level: options.level,
          };

          mapRef.current = new window.kakao.maps.Map(container, mapOption);
          setIsLoaded(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '카카오맵 로드 중 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('카카오맵 초기화 오류:', err);
      }
    };

    initMap();
  }, [containerId, options.center.lat, options.center.lng, options.level]);

  return { map: mapRef.current, isLoaded, error };
};
