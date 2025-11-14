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
  const isInitialized = useRef(false);

  useEffect(() => {
    // 이미 초기화되었으면 다시 생성하지 않음 (지도 고정)
    if (isInitialized.current) return;

    const initMap = async () => {
      try {
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
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '카카오맵 로드 중 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('카카오맵 초기화 오류:', err);
      }
    };

    initMap();
  }, [containerId]); // options 제거 - 한 번만 초기화

  return { map: mapRef.current, isLoaded, error };
};
