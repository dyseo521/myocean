import { useEffect, useRef } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useHotspots } from '@/hooks/useHotspots';
import { useStore } from '@/store/useStore';
import { getHotspotColor, getHotspotRadius } from '@/utils/donation';
import DonationOverlay from './DonationOverlay';

const KakaoMap = () => {
  const { map, isLoaded, error, retry, retryCount } = useKakaoMap('map-container', {
    center: { lat: 35.2, lng: 129.1 }, // 부산 해역 중심 (남해/동해 경계)
    level: 10, // 부산 해역이 잘 보이는 줌 레벨
  });

  const { hotspots, isLoading } = useHotspots();
  const circlesRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const setSelectedHotspot = useStore((state) => state.setSelectedHotspot);
  const donations = useStore((state) => state.donations);

  // 핫스팟 원형 마커 렌더링
  useEffect(() => {
    if (!isLoaded || !map || isLoading || !window.kakao) return;

    // 기존 원형 제거
    circlesRef.current.forEach((circle) => circle.setMap(null));
    circlesRef.current = [];

    // 핫스팟 렌더링
    hotspots.forEach((hotspot) => {
      // 레이어 필터링
      if (hotspot.type === 'fishing' && !showFishingLayer) return;
      if (hotspot.type === 'debris' && !showDebrisLayer) return;

      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(hotspot.lat, hotspot.lng),
        radius: getHotspotRadius(hotspot.intensity),
        strokeWeight: 2,
        strokeColor: getHotspotColor(hotspot.intensity, hotspot.type),
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        fillColor: getHotspotColor(hotspot.intensity, hotspot.type),
        fillOpacity: 0.3,
      });

      circle.setMap(map);
      circlesRef.current.push(circle);

      // 클릭 이벤트
      window.kakao.maps.event.addListener(circle, 'click', () => {
        setSelectedHotspot(hotspot);
      });
    });

    return () => {
      circlesRef.current.forEach((circle) => circle.setMap(null));
      circlesRef.current = [];
    };
  }, [isLoaded, map, hotspots, isLoading, showFishingLayer, showDebrisLayer, setSelectedHotspot]);

  // 기부자 오버레이 렌더링
  useEffect(() => {
    if (!isLoaded || !map || !window.kakao) return;

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    // 기부 정보 렌더링
    donations.forEach((donation) => {
      const content = document.createElement('div');
      content.className = 'bg-white px-2 py-1 rounded shadow-md text-xs font-medium border-2 border-ocean-primary';
      content.innerHTML = `<span class="text-ocean-primary">${donation.name}</span>`;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(donation.location.lat, donation.location.lng),
        content: content,
        yAnchor: 1.5,
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null));
      overlaysRef.current = [];
    };
  }, [isLoaded, map, donations]);

  // 에러 처리
  if (error) {
    const isRetrying = error.includes('연결 중');

    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center max-w-md px-4">
          <div className={`text-5xl mb-4 ${isRetrying ? 'text-ocean-primary' : 'text-red-500'}`}>
            {isRetrying ? '🔄' : '⚠️'}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {isRetrying ? '지도 로딩 중...' : '지도 로드 오류'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">{error}</p>

          {isRetrying ? (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-primary"></div>
            </div>
          ) : (
            <>
              <button
                onClick={retry}
                className="btn btn-primary mb-4 px-6 py-3 active:scale-95 transition-transform"
              >
                🔄 다시 시도
              </button>

              <div className="bg-slate-50 rounded-lg p-4 text-left">
                <p className="text-xs text-slate-700 mb-2 font-medium">해결 방법:</p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>.env 파일에 VITE_KAKAO_MAP_APP_KEY가 설정되어 있는지 확인</li>
                  <li>카카오 개발자 콘솔에서 플랫폼 도메인이 등록되어 있는지 확인</li>
                  <li>인터넷 연결을 확인해보세요</li>
                  <li>위 버튼을 눌러 다시 시도해보세요</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-primary mx-auto mb-4"></div>
          <p className="text-slate-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="map-container" className="w-full h-full" />

      {/* 범례 (데스크톱만) */}
      <div className="hidden md:block absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-20">
        <h3 className="text-sm font-bold mb-2 text-slate-700">범례</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 opacity-50"></div>
            <span className="text-xs text-slate-600">조업활동</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-50"></div>
            <span className="text-xs text-slate-600">해양쓰레기</span>
          </div>
        </div>
      </div>

      {/* 레이어 토글 (데스크톱만) */}
      <LayerToggle />
    </>
  );
};

// 레이어 토글 컴포넌트 (데스크톱만)
const LayerToggle = () => {
  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const toggleFishingLayer = useStore((state) => state.toggleFishingLayer);
  const toggleDebrisLayer = useStore((state) => state.toggleDebrisLayer);

  return (
    <div className="hidden md:block absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-20">
      <h3 className="text-sm font-bold mb-2 text-slate-700">레이어</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFishingLayer}
            onChange={toggleFishingLayer}
            className="w-4 h-4 text-ocean-primary rounded focus:ring-ocean-primary"
          />
          <span className="text-xs text-slate-600">조업활동</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDebrisLayer}
            onChange={toggleDebrisLayer}
            className="w-4 h-4 text-ocean-danger rounded focus:ring-ocean-danger"
          />
          <span className="text-xs text-slate-600">해양쓰레기</span>
        </label>
      </div>
    </div>
  );
};

export default KakaoMap;
