import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import LoginButton from './LoginButton';
import DonateButton from './DonateButton';
import MyOceanButton from './MyOceanButton';

const Sidebar = () => {
  const user = useStore((state) => state.user);
  const setShowRankingModal = useStore((state) => state.setShowRankingModal);
  const isMobileMenuOpen = useStore((state) => state.isMobileMenuOpen);
  const setIsMobileMenuOpen = useStore((state) => state.setIsMobileMenuOpen);

  const showFishingLayer = useStore((state) => state.showFishingLayer);
  const showDebrisLayer = useStore((state) => state.showDebrisLayer);
  const toggleFishingLayer = useStore((state) => state.toggleFishingLayer);
  const toggleDebrisLayer = useStore((state) => state.toggleDebrisLayer);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* 모바일: 사이드 드로어 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* 드로어 메뉴 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
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
                    <h3 className="text-sm font-semibold mb-1 opacity-90">환영합니다!</h3>
                    <p className="text-xl font-bold">{user.name}님</p>
                  </div>
                ) : (
                  <div className="card bg-slate-50 text-center py-6">
                    <p className="text-sm text-slate-600 mb-3">로그인하여 바다를 지켜주세요</p>
                    <LoginButton />
                  </div>
                )}

                {/* 주요 액션 버튼들 */}
                <div className="space-y-3">
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

      {/* 데스크톱: 우측 사이드바 */}
      <div className="hidden md:block fixed top-[60px] right-0 h-[calc(100vh-60px)] w-80 bg-white shadow-xl z-30 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-4">
          {/* 사용자 정보 */}
          {user ? (
            <div className="card">
              <h3 className="text-sm font-bold text-slate-700 mb-2">환영합니다!</h3>
              <p className="text-lg font-bold text-ocean-primary">{user.name}님</p>
            </div>
          ) : (
            <div className="card bg-slate-50 text-center py-6">
              <p className="text-sm text-slate-600 mb-3">로그인하여 바다를 지켜주세요</p>
              <LoginButton />
            </div>
          )}

          {/* 기부하기 버튼 */}
          <DonateButton />

          {/* 나의 바다 버튼 */}
          {user && <MyOceanButton />}

          {/* 랭킹 버튼 */}
          <button
            onClick={() => setShowRankingModal(true)}
            className="w-full btn btn-outline"
          >
            🏆 기부 랭킹
          </button>

          {/* 프로젝트 정보 */}
          <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white">
            <h3 className="font-bold mb-2">마이오션이란?</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              시민 참여형 유실어구 수거 펀딩 플랫폼입니다.
              기부한 해역에 이름을 남기고,
              깨끗한 바다를 함께 만들어요!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
