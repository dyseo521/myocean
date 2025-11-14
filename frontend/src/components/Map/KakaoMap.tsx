'use client'

import { useEffect, useRef } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useHotspots } from '@/hooks/useHotspots';
import { useStore } from '@/store/useStore';
import { getHotspotColor, getHotspotRadius } from '@/utils/donation';

const KakaoMap = () => {
  const { map, isLoaded, error, retry } = useKakaoMap('map-container', {
    center: { lat: 35.15, lng: 129.15 }, // 부산 해안선 중심 (해운대/광안리 포함)
    level: 10, // 부산 해역이 잘 보이는 줌 레벨
  });

  const { hotspots, isLoading } = useHotspots();
  const circlesRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const setSelectedHotspot = useStore((state) => state.setSelectedHotspot);
  const donations = useStore((state) => state.donations);

  // 위치 선택 모드
  const isSelectingLocation = useStore((state) => state.isSelectingLocation);
  const setIsSelectingLocation = useStore((state) => state.setIsSelectingLocation);
  const setSelectedDonationLocation = useStore((state) => state.setSelectedDonationLocation);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);

  const rectanglesRef = useRef<any[]>([]);

  // 지도 클릭 이벤트 (위치 선택 모드)
  useEffect(() => {
    if (!isLoaded || !map || !window.kakao) return;

    const handleMapClick = (mouseEvent: any) => {
      if (!isSelectingLocation) return;

      const latlng = mouseEvent.latLng;
      const location = {
        lat: latlng.getLat(),
        lng: latlng.getLng(),
      };

      // 위치 저장하고 모드 종료
      setSelectedDonationLocation(location);
      setIsSelectingLocation(false);
      setShowDonateModal(true); // 모달 다시 열기
    };

    window.kakao.maps.event.addListener(map, 'click', handleMapClick);

    return () => {
      window.kakao.maps.event.removeListener(map, 'click', handleMapClick);
    };
  }, [isLoaded, map, isSelectingLocation, setSelectedDonationLocation, setIsSelectingLocation, setShowDonateModal]);

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

  // 기부 영역 및 오버레이 렌더링
  useEffect(() => {
    if (!isLoaded || !map || !window.kakao) return;

    // 기존 사각형 제거
    rectanglesRef.current.forEach((rect) => rect.setMap(null));
    rectanglesRef.current = [];

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    // 기부 영역 및 이름 렌더링
    donations.forEach((donation) => {
      // 기부 영역이 있으면 Rectangle 표시
      if (donation.bounds) {
        const rectangle = new window.kakao.maps.Rectangle({
          bounds: new window.kakao.maps.LatLngBounds(
            new window.kakao.maps.LatLng(donation.bounds.southWest.lat, donation.bounds.southWest.lng),
            new window.kakao.maps.LatLng(donation.bounds.northEast.lat, donation.bounds.northEast.lng)
          ),
          strokeWeight: 2,
          strokeColor: '#0EA5E9',
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          fillColor: '#0EA5E9',
          fillOpacity: 0.2,
        });

        rectangle.setMap(map);
        rectanglesRef.current.push(rectangle);
      }

      // 기부자 이름 오버레이
      const content = document.createElement('div');
      content.className = 'bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold border-2 border-ocean-primary whitespace-nowrap';
      content.innerHTML = `<span class="text-ocean-primary">${donation.name}</span>`;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(donation.location.lat, donation.location.lng),
        content: content,
        yAnchor: 1,
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      rectanglesRef.current.forEach((rect) => rect.setMap(null));
      rectanglesRef.current = [];
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

      {/* 위치 선택 모드 안내 */}
      {isSelectingLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="bg-ocean-primary text-white px-6 py-4 rounded-2xl shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-2xl mb-2">📍</div>
              <div className="text-base font-bold">기부할 위치를 선택하세요</div>
              <div className="text-sm opacity-90 mt-1">지도를 클릭해주세요</div>
            </div>
          </div>
        </div>
      )}

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
