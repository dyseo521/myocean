'use client'

import { useEffect, useState } from 'react';

export default function ResetPage() {
  const [stats, setStats] = useState({
    donationCount: 0,
    userName: '없음',
    dataSize: '0.00',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const DONATIONS_KEY = 'myocean_donations';
  const USER_KEY = 'myocean_user';

  const loadStats = () => {
    try {
      const donationsStr = localStorage.getItem(DONATIONS_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      const donations = donationsStr ? JSON.parse(donationsStr) : [];
      const user = userStr ? JSON.parse(userStr) : null;

      const totalSize = (donationsStr?.length || 0) + (userStr?.length || 0);
      const sizeKB = (totalSize / 1024).toFixed(2);

      setStats({
        donationCount: donations.length,
        userName: user ? user.name : '없음',
        dataSize: sizeKB,
      });

      console.log('📊 로드된 데이터:', { donations, user });
    } catch (error) {
      console.error('❌ 통계 로드 오류:', error);
      setStats({
        donationCount: 0,
        userName: '오류',
        dataSize: '오류',
      });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleReset = () => {
    if (!confirm('정말로 모든 기부자 데이터를 삭제하시겠습니까?')) {
      return;
    }

    try {
      localStorage.removeItem(DONATIONS_KEY);
      localStorage.removeItem(USER_KEY);

      setShowSuccess(true);
      loadStats();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      console.log('✅ 기부자 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('❌ 데이터 초기화 오류:', error);
      alert('데이터 초기화 중 오류가 발생했습니다: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-black text-slate-800 mb-2">🌊 기부자 데이터 초기화</h1>
        <p className="text-sm text-slate-600 mb-6">마이오션 데모 데이터 관리</p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-sm text-blue-800 leading-relaxed">
            이 도구는 로컬스토리지에 저장된 기부자 데이터를 초기화합니다. 데모 시연이나 테스트 후 데이터를 정리할 때 사용하세요.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">총 기부 건수:</span>
              <span className="text-lg font-bold text-blue-600">{stats.donationCount}건</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">등록된 사용자:</span>
              <span className="text-lg font-bold text-blue-600">{stats.userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">데이터 크기:</span>
              <span className="text-lg font-bold text-blue-600">{stats.dataSize} KB</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ 이 작업은 되돌릴 수 없습니다. 모든 기부 기록과 사용자 정보가 삭제됩니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all active:scale-95"
          >
            🔄 새로고침
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            🗑️ 데이터 초기화
          </button>
        </div>

        {showSuccess && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-fade-in">
            <p className="text-sm text-green-800 font-medium">
              ✅ 모든 데이터가 성공적으로 삭제되었습니다!
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
          >
            ← 마이오션으로 돌아가기
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            💡 팁: 콘솔(F12)을 열어 localStorage 키를 직접 확인할 수 있습니다.
          </p>
          <div className="mt-2 bg-slate-100 rounded p-2 text-xs font-mono text-slate-600">
            <div>• myocean_donations</div>
            <div>• myocean_user</div>
          </div>
        </div>
      </div>
    </div>
  );
}
