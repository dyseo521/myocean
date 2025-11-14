import { useEffect, useRef, useState } from 'react';

interface KakaoMapOptions {
  center: { lat: number; lng: number };
  level: number;
}

export const useKakaoMap = (containerId: string, options: KakaoMapOptions) => {
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 카카오맵 SDK 로드 확인
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = document.getElementById(containerId);
          if (container) {
            const mapOption = {
              center: new window.kakao.maps.LatLng(options.center.lat, options.center.lng),
              level: options.level,
            };

            mapRef.current = new window.kakao.maps.Map(container, mapOption);
            setIsLoaded(true);
          }
        });
      } else {
        setTimeout(checkKakaoMap, 100);
      }
    };

    checkKakaoMap();
  }, [containerId, options.center.lat, options.center.lng, options.level]);

  return { map: mapRef.current, isLoaded };
};
