'use client'

import { useEffect } from 'react';
import KakaoMap from '../components/Map/KakaoMap';
import Sidebar from '../components/Sidebar/Sidebar';
import HotspotDetailModal from '../components/Modal/HotspotDetailModal';
import DonateModal from '../components/Modal/DonateModal';
import MyOceanModal from '../components/Modal/MyOceanModal';
import RankingModal from '../components/Modal/RankingModal';
import RealtimeDonation from '../components/Notification/RealtimeDonation';
import { useStore } from '../store/useStore';

export default function Home() {
  const loadDonations = useStore((state) => state.loadDonations);
  const setIsMobileMenuOpen = useStore((state) => state.setIsMobileMenuOpen);

  useEffect(() => {
    // 앱 시작 시 로컬스토리지에서 기부 데이터 로드
    loadDonations();
  }, [loadDonations]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 헤더 */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white shadow-md">
        <div className="px-4 py-2 md:py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gradient-ocean">
            마이오션
          </h1>
          <p className="text-sm text-slate-600 hidden sm:block">
            시민이 함께 만드는 깨끗한 바다
          </p>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-ocean-primary transition-colors active:scale-95"
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
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="relative w-full h-full pt-[52px] md:pt-[60px]">
        {/* 지도 */}
        <div className="absolute inset-0">
          <KakaoMap />
        </div>

        {/* 사이드바 */}
        <Sidebar />
      </div>

      {/* 모달들 */}
      <HotspotDetailModal />
      <DonateModal />
      <MyOceanModal />
      <RankingModal />

      {/* 실시간 알림 */}
      <RealtimeDonation />
    </div>
  );
}
