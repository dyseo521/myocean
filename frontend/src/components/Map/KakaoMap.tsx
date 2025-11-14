'use client'

import { useEffect, useRef } from 'react';
import { useKakaoMap } from '@/hooks/useKakaoMap';
import { useHotspots } from '@/hooks/useHotspots';
import { useStore } from '@/store/useStore';
import { getHotspotColor, getHotspotRadius, isFundingComplete } from '@/utils/donation';

const KakaoMap = () => {
  const { map, isLoaded, error, retry } = useKakaoMap('map-container', {
    center: { lat: 35.15, lng: 129.15 }, // 부산 해안선 중심 (해운대/광안리 포함)
    level: 10, // 부산 해역이 잘 보이는 줌 레벨
  });

  const { hotspots, isLoading } = useHotspots();
  const circlesRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  const mode = useStore((state) => state.mode);
  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const setSelectedHotspot = useStore((state) => state.setSelectedHotspot);
  const donations = useStore((state) => state.donations);

  // 위치 선택 모드
  const isSelectingLocation = useStore((state) => state.isSelectingLocation);
  const setIsSelectingLocation = useStore((state) => state.setIsSelectingLocation);
  const setSelectedDonationLocation = useStore((state) => state.setSelectedDonationLocation);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);
  const setShowCollectionModal = useStore((state) => state.setShowCollectionModal);

  const polygonsRef = useRef<any[]>([]);

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

    // 기부 건수를 지역별로 계산 (dependency 문제 해결)
    const donationCountByRegion = new Map<string, number>();
    donations.forEach(d => {
      if (d.regionName) {
        donationCountByRegion.set(d.regionName, (donationCountByRegion.get(d.regionName) || 0) + 1);
      }
    });

    // 핫스팟 렌더링
    hotspots.forEach((hotspot) => {
      // 레이어 필터링
      if (hotspot.type === 'fishing' && !showFishingLayer) return;
      if (hotspot.type === 'debris' && !showDebrisLayer) return;

      // 이 핫스팟에 대한 기부 참여 확인
      const regionName = `${hotspot.lat.toFixed(2)}°N ${hotspot.lng.toFixed(2)}°E`;
      const donationParticipation = donationCountByRegion.get(regionName) || 0;

      // 수거모드에서 펀딩 완료 여부 확인
      const isFunded = isFundingComplete(hotspot, donations);
      const isCollectionMode = mode === 'collection';

      // 우선 정화 추천 구역 확인 (고밀집도 + 저참여) - 펀딩 모드에서만 적용
      const isHighPriority = !isCollectionMode && hotspot.intensity > 0.7 && donationParticipation < 3;

      // 수거모드에서의 스타일 조정
      let strokeColor, fillColor, strokeOpacity, fillOpacity, strokeWeight;

      if (isCollectionMode) {
        if (isFunded) {
          // 펀딩 완료: 초록색 강조
          strokeColor = '#10B981'; // emerald-500
          fillColor = '#10B981';
          strokeOpacity = 1;
          fillOpacity = 0.5;
          strokeWeight = 3;
        } else {
          // 펀딩 미완료: 회색톤, 낮은 투명도
          strokeColor = '#94A3B8'; // slate-400
          fillColor = '#94A3B8';
          strokeOpacity = 0.3;
          fillOpacity = 0.1;
          strokeWeight = 1;
        }
      } else {
        // 펀딩 모드: 기존 로직
        strokeColor = isHighPriority ? '#FFA500' : getHotspotColor(hotspot.intensity, hotspot.type);
        fillColor = getHotspotColor(hotspot.intensity, hotspot.type);
        strokeOpacity = isHighPriority ? 1 : 0.8;
        fillOpacity = isHighPriority ? 0.5 : 0.3;
        strokeWeight = isHighPriority ? 5 : 2;
      }

      const circle = new window.kakao.maps.Circle({
        center: new window.kakao.maps.LatLng(hotspot.lat, hotspot.lng),
        radius: getHotspotRadius(hotspot.intensity),
        strokeWeight,
        strokeColor,
        strokeOpacity,
        strokeStyle: 'solid',
        fillColor,
        fillOpacity,
      });

      circle.setMap(map);
      circlesRef.current.push(circle);

      // 클릭 이벤트
      window.kakao.maps.event.addListener(circle, 'click', () => {
        // 위치 선택 모드인 경우: 핫스팟 좌표를 기부 위치로 설정하고 기부 플로우 진행
        if (isSelectingLocation) {
          const location = { lat: hotspot.lat, lng: hotspot.lng };
          setSelectedDonationLocation(location);
          setIsSelectingLocation(false);
          setShowDonateModal(true);
        } else if (isCollectionMode) {
          // 수거모드
          setSelectedHotspot(hotspot);
          if (isFunded) {
            // 펀딩 완료: 수거 가능 모달 열기
            setShowCollectionModal(true);
          } else {
            // 펀딩 미완료: 핫스팟 상세 모달 열기 (펀딩 독려)
            // 상세 모달이 자동으로 열림
          }
        } else {
          // 일반 펀딩 모드: 핫스팟 상세 모달 열기
          setSelectedHotspot(hotspot);
        }
      });
    });

    return () => {
      circlesRef.current.forEach((circle) => circle.setMap(null));
      circlesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, hotspots, isLoading, mode, showFishingLayer, showDebrisLayer, setSelectedHotspot, isSelectingLocation, setSelectedDonationLocation, setIsSelectingLocation, setShowDonateModal, setShowCollectionModal, donations.length]);

  // 기부 영역 및 오버레이 렌더링
  useEffect(() => {
    if (!isLoaded || !map || !window.kakao) return;

    // 기존 폴리곤 제거
    polygonsRef.current.forEach((polygon) => polygon.setMap(null));
    polygonsRef.current = [];

    // 기존 오버레이 제거
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    // 기부 영역 및 이름 렌더링
    donations.forEach((donation) => {
      // 기부 영역이 있으면 Polygon(마름모) 표시
      if (donation.polygon && donation.polygon.length > 0) {
        const path = donation.polygon.map(
          (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
        );

        const polygon = new window.kakao.maps.Polygon({
          path,
          strokeWeight: 4,
          strokeColor: '#0EA5E9',
          strokeOpacity: 1,
          strokeStyle: 'solid',
          fillColor: '#0EA5E9',
          fillOpacity: 0.4,
        });

        polygon.setMap(map);
        polygonsRef.current.push(polygon);
      }

      // 기부자 이름 오버레이
      const content = document.createElement('div');
      content.className = 'text-lg font-black whitespace-nowrap';
      content.style.cssText = `
        color: #FFFFFF;
        text-shadow:
          -2px -2px 0 #000,
          2px -2px 0 #000,
          -2px 2px 0 #000,
          2px 2px 0 #000,
          0 0 8px rgba(0,0,0,0.8);
        letter-spacing: 0.5px;
      `;
      content.textContent = donation.name;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(donation.location.lat, donation.location.lng),
        content: content,
        yAnchor: 1,
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    return () => {
      polygonsRef.current.forEach((polygon) => polygon.setMap(null));
      polygonsRef.current = [];
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
