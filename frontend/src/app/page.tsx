'use client'

import { useEffect } from 'react';
import KakaoMap from '../components/Map/KakaoMap';
import Sidebar from '../components/Sidebar/Sidebar';
import HotspotDetailModal from '../components/Modal/HotspotDetailModal';
import DonateModal from '../components/Modal/DonateModal';
import MyOceanModal from '../components/Modal/MyOceanModal';
import RankingModal from '../components/Modal/RankingModal';
import CollectionModal from '../components/Modal/CollectionModal';
import SonarTrackingModal from '../components/Modal/SonarTrackingModal';
import DetectionSuccessModal from '../components/Modal/DetectionSuccessModal';
import RealtimeDonation from '../components/Notification/RealtimeDonation';
import { useStore } from '../store/useStore';

export default function Home() {
  const loadDonations = useStore((state) => state.loadDonations);
  const setIsMobileMenuOpen = useStore((state) => state.setIsMobileMenuOpen);
  const realtimeNotifications = useStore((state) => state.realtimeNotifications);

  // 수거 모달 상태
  const showCollectionModal = useStore((state) => state.showCollectionModal);
  const showSonarTrackingModal = useStore((state) => state.showSonarTrackingModal);
  const showDetectionSuccessModal = useStore((state) => state.showDetectionSuccessModal);
  const setShowCollectionModal = useStore((state) => state.setShowCollectionModal);
  const setShowSonarTrackingModal = useStore((state) => state.setShowSonarTrackingModal);
  const setShowDetectionSuccessModal = useStore((state) => state.setShowDetectionSuccessModal);

  useEffect(() => {
    // 앱 시작 시 로컬스토리지에서 기부 데이터 로드
    loadDonations();
  }, [loadDonations]);

  // 수거 플로우 핸들러
  const handleStartCollection = () => {
    setShowSonarTrackingModal(true);
  };

  const handleSonarComplete = () => {
    setShowSonarTrackingModal(false);
    setShowDetectionSuccessModal(true);
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* 모바일 프레임 (중앙 고정 너비) */}
      <div className="relative w-full max-w-[480px] h-full bg-white shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <header className="absolute top-0 left-0 right-0 z-30 bg-white shadow-md">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-2xl">🌊</span>
              <h1 className="text-xl font-bold text-gradient-ocean">
                마이오션
              </h1>
            </div>

            {/* 햄버거 버튼 (항상 표시) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="relative p-2 text-slate-600 hover:text-ocean-primary transition-colors active:scale-95"
              aria-label="메뉴 열기"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* 알림 배지 */}
              {realtimeNotifications.length > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-white text-xs font-bold">
                    {realtimeNotifications.length}
                  </span>
                </span>
              )}
            </button>
          </div>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <div className="relative w-full h-full pt-[52px]">
          {/* 지도 */}
          <div className="absolute inset-0">
            <KakaoMap />
          </div>

          {/* 사이드바 (모바일 드로어만) */}
          <Sidebar />
        </div>

        {/* 모달들 */}
        <HotspotDetailModal />
        <DonateModal />
        <MyOceanModal />
        <RankingModal />

        {/* 수거 모달들 */}
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          onStartCollection={handleStartCollection}
        />
        <SonarTrackingModal
          isOpen={showSonarTrackingModal}
          onComplete={handleSonarComplete}
        />
        <DetectionSuccessModal
          isOpen={showDetectionSuccessModal}
          onClose={() => setShowDetectionSuccessModal(false)}
        />

        {/* 실시간 알림 */}
        <RealtimeDonation />
      </div>
    </div>
  );
}
