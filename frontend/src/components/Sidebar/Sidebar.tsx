import { useStore } from '@/store/useStore';
import LoginButton from './LoginButton';
import DonateButton from './DonateButton';
import MyOceanButton from './MyOceanButton';

const Sidebar = () => {
  const user = useStore((state) => state.user);
  const setShowRankingModal = useStore((state) => state.setShowRankingModal);

  return (
    <>
      {/* 모바일: 하단 고정 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-3 gap-2 p-3">
          <LoginButton />
          <DonateButton />
          <MyOceanButton />
        </div>
      </div>

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
