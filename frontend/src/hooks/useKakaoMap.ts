import { useEffect, useRef, useState, useCallback } from 'react';
import { loadKakaoMapScript } from '@/utils/kakaoMapLoader';

interface KakaoMapOptions {
  center: { lat: number; lng: number };
  level: number;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAYS = [1000, 2000, 3000]; // 1초, 2초, 3초

export const useKakaoMap = (containerId: string, options: KakaoMapOptions) => {
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isInitialized = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initMap = useCallback(async () => {
    try {
      setError(null);

      // 카카오맵 스크립트 로드
      await loadKakaoMapScript();

      // 지도 생성
      const container = document.getElementById(containerId);
      if (container && !mapRef.current) {
        const mapOption = {
          center: new window.kakao.maps.LatLng(options.center.lat, options.center.lng),
          level: options.level,
          draggable: true, // 드래그 가능
          scrollwheel: true, // 마우스 휠 줌 가능
          disableDoubleClick: false, // 더블클릭 줌 가능
          disableDoubleClickZoom: false,
        };

        mapRef.current = new window.kakao.maps.Map(container, mapOption);

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        mapRef.current.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        mapRef.current.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        isInitialized.current = true;
        setIsLoaded(true);
        setRetryCount(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카카오맵 로드 중 오류가 발생했습니다.';
      console.error('카카오맵 초기화 오류:', err);

      // 재시도 로직
      if (retryCount < MAX_RETRY_COUNT) {
        const delay = RETRY_DELAYS[retryCount];
        console.log(`카카오맵 재시도 (${retryCount + 1}/${MAX_RETRY_COUNT}) - ${delay}ms 후 재시도`);

        setError(`연결 중... (${retryCount + 1}/${MAX_RETRY_COUNT})`);

        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      } else {
        setError(errorMessage);
      }
    }
  }, [containerId, options.center.lat, options.center.lng, options.level, retryCount]);

  // 수동 재시도 함수
  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    isInitialized.current = false;
    mapRef.current = null;
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    // 이미 초기화되었으면 다시 생성하지 않음 (지도 고정)
    if (isInitialized.current) return;

    initMap();

    // 클린업
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [initMap]);

  return { map: mapRef.current, isLoaded, error, retry, retryCount };
};
