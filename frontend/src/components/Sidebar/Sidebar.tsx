'use client'

import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotspots } from '@/hooks/useHotspots';
import { isFundingComplete } from '@/utils/donation';
import LoginButton from './LoginButton';
import DonateButton from './DonateButton';
import MyOceanButton from './MyOceanButton';

const Sidebar = () => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const setShowRankingModal = useStore((state) => state.setShowRankingModal);
  const isMobileMenuOpen = useStore((state) => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useStore((state) => state.setIsMobileMenuOpen);

  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const donations = useStore((state) => state.donations);
  const setSelectedHotspot = useStore((state) => state.setSelectedHotspot);
  const setShowCollectionModal = useStore((state) => state.setShowCollectionModal);

  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const toggleFishingLayer = useStore((state) => state.toggleFishingLayer);
  const toggleDebrisLayer = useStore((state) => state.toggleDebrisLayer);

  const { hotspots } = useHotspots();

  // 수거 가능한 핫스팟 찾기 (펀딩 완료된 핫스팟)
  const collectionAvailableHotspots = hotspots.filter(hotspot =>
    isFundingComplete(hotspot, donations)
  );

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleStartCollection = () => {
    if (collectionAvailableHotspots.length > 0) {
      // 첫 번째 수거 가능한 핫스팟 선택
      setSelectedHotspot(collectionAvailableHotspots[0]);
      setShowCollectionModal(true);
      closeMobileMenu();
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      closeMobileMenu();
    }
  };

  return (
    <>
      {/* 사이드 드로어 (항상 모바일 스타일) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* 드로어 메뉴 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* 헤더 */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-gradient-ocean">메뉴</h2>
                  <button
                    onClick={closeMobileMenu}
                    className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center"
                    aria-label="메뉴 닫기"
                  >
                    ×
                  </button>
                </div>

                {/* 사용자 정보 */}
                {user ? (
                  <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold mb-1 opacity-90">환영합니다!</h3>
                        <p className="text-xl font-bold">{user.name}님</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-slate-50 text-center py-6">
                    <p className="text-sm text-slate-600 mb-3">로그인하여 바다를 지켜주세요</p>
                    <LoginButton />
                  </div>
                )}

                {/* 주요 액션 버튼들 */}
                <div className="space-y-3">
                  {mode === 'funding' ? (
                    <>
                      <DonateButton />
                      {user && <MyOceanButton />}
                      <button
                        onClick={() => {
                          setShowRankingModal(true);
                          closeMobileMenu();
                        }}
                        className="w-full btn btn-outline py-3 text-base"
                      >
                        🏆 기부 랭킹
                      </button>
                      <button
                        onClick={() => {
                          setMode('collection');
                          closeMobileMenu();
                        }}
                        className="w-full btn bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
                      >
                        🚢 수거모드
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 수거 시작 버튼 */}
                      <button
                        onClick={handleStartCollection}
                        disabled={collectionAvailableHotspots.length === 0}
                        className={`w-full py-3 text-base font-bold rounded-lg transition-all ${
                          collectionAvailableHotspots.length > 0
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl active:scale-95'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {collectionAvailableHotspots.length > 0
                          ? `🚢 수거 시작 (${collectionAvailableHotspots.length}개 가능)`
                          : '🚢 수거 가능한 지역 없음'
                        }
                      </button>

                      {/* 수거 가능 지역 안내 */}
                      {collectionAvailableHotspots.length === 0 && (
                        <div className="card bg-yellow-50 border-2 border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            💡 펀딩이 완료된 지역이 없습니다.<br/>
                            펀딩모드로 돌아가서 기부에 참여해주세요!
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setMode('funding');
                          closeMobileMenu();
                        }}
                        className="w-full btn bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
                      >
                        💝 펀딩모드
                      </button>
                    </>
                  )}
                </div>

                {/* 지도 레이어 설정 */}
                <div className="card bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">🗺️ 지도 레이어</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={showFishingLayer}
                        onChange={toggleFishingLayer}
                        className="w-5 h-5 text-ocean-primary rounded focus:ring-ocean-primary focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-700">조업활동</div>
                        <div className="text-xs text-slate-500">고정자망 조업 데이터</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={showDebrisLayer}
                        onChange={toggleDebrisLayer}
                        className="w-5 h-5 text-ocean-danger rounded focus:ring-ocean-danger focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-700">해양쓰레기</div>
                        <div className="text-xs text-slate-500">어업기인 쓰레기 데이터</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 범례 */}
                <div className="card bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">📍 범례</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 opacity-50 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">조업활동 밀집 지역</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 opacity-50 flex-shrink-0"></div>
                      <span className="text-sm text-slate-700">해양쓰레기 밀집 지역</span>
                    </div>
                  </div>
                </div>

                {/* 프로젝트 정보 */}
                <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white">
                  <h3 className="font-bold mb-2 text-lg">💙 마이오션이란?</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    시민 참여형 유실어구 수거 펀딩 플랫폼입니다.
                    기부한 해역에 이름을 남기고,
                    깨끗한 바다를 함께 만들어요!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
