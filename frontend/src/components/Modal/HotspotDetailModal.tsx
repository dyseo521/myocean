'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getDonationsByRegion } from '@/utils/localStorage';
import { formatNumber } from '@/utils/donation';

const HotspotDetailModal = () => {
  const selectedHotspot = useStore((state) => state.selectedHotspot);
  const setSelectedHotspot = useStore((state) => state.setSelectedHotspot);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);
  const user = useStore((state) => state.user);
  const [address, setAddress] = useState<string>('');

  // 역지오코딩: 좌표 -> 주소
  useEffect(() => {
    if (!selectedHotspot || !window.kakao) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.coord2Address(selectedHotspot.lng, selectedHotspot.lat, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].address;
        const fullAddr = addr.address_name || '';
        setAddress(fullAddr);
      } else {
        setAddress('주소를 찾을 수 없습니다');
      }
    });
  }, [selectedHotspot]);

  if (!selectedHotspot) return null;

  const regionName = `${selectedHotspot.lat.toFixed(2)}°N ${selectedHotspot.lng.toFixed(2)}°E`;
  const donations = getDonationsByRegion(regionName);
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const targetAmount = 10000000; // 목표: 1000만원
  const progressPercent = Math.min(100, (totalDonated / targetAmount) * 100);

  // 밀집도 및 기부 참여율 기반 영역 보너스 계산
  const intensity = selectedHotspot.intensity;
  const donationParticipation = donations.length;
  const bonusMultiplier = intensity > 0.7 && donationParticipation < 3
    ? 1.5 // 고밀집도 + 저참여 = 50% 보너스
    : intensity > 0.5
    ? 1.3 // 중밀집도 = 30% 보너스
    : 1.0; // 기본
  const isHighPriority = intensity > 0.7 && donationParticipation < 3;

  const handleDonate = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setSelectedHotspot(null);
    setShowDonateModal(true);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedHotspot(null)}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-end justify-center p-0"
        >
          <div className="bg-white rounded-t-3xl shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">
                {selectedHotspot.type === 'fishing' ? '⚓ 조업활동 지역' : '🗑️ 해양쓰레기 지역'}
              </h2>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center -mr-2 -mt-2"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 위치 정보 */}
            <div className="card mb-4 bg-slate-50">
              <div className="space-y-3">
                {/* 주소 */}
                <div>
                  <span className="text-slate-600 text-xs block mb-1">위치</span>
                  <p className="font-bold text-slate-800 text-base">{address || '주소 로딩 중...'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E
                  </p>
                </div>

                {/* 밀집도 및 활동 */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-600 text-xs block mb-1">밀집도</span>
                    <span className="font-bold text-ocean-primary text-base">
                      {(selectedHotspot.intensity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 text-xs block mb-1">활동 건수</span>
                    <span className="font-bold text-slate-800 text-base">
                      {formatNumber(selectedHotspot.activityCount)}건
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 영역 보너스 정보 */}
            {bonusMultiplier > 1.0 && (
              <div className={`card mb-4 ${isHighPriority ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {isHighPriority ? '⭐' : '💎'}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${isHighPriority ? 'text-amber-800' : 'text-blue-800'}`}>
                      {isHighPriority ? '🔥 우선 정화 추천 구역' : '영역 보너스 적용'}
                    </h3>
                    <p className="text-sm text-slate-700 mb-2">
                      {isHighPriority
                        ? '밀집도가 높지만 기부 참여가 적은 지역입니다!'
                        : '밀집도가 높은 지역입니다.'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isHighPriority ? 'bg-amber-400 text-amber-900' : 'bg-blue-400 text-blue-900'}`}>
                        동일 금액 {((bonusMultiplier - 1) * 100).toFixed(0)}% 더 넓은 영역
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 정화 진행률 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">정화 진행률</span>
                <span className="font-bold text-ocean-primary">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-ocean-primary to-ocean-secondary rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{(totalDonated / 10000).toLocaleString()}만원</span>
                <span>목표: 1,000만원</span>
              </div>
            </div>

            {/* 기부자 목록 */}
            {donations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 mb-2">기부자 현황</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {donations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded">
                      <span className="font-medium text-ocean-primary">{donation.name}</span>
                      <span className="text-slate-600">{(donation.amount / 10000).toLocaleString()}만원</span>
                    </div>
                  ))}
                </div>
                {donations.length > 10 && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    외 {donations.length - 10}명
                  </p>
                )}
              </div>
            )}

            {/* 기부 버튼 */}
            <button
              onClick={handleDonate}
              className="w-full btn btn-primary py-4 text-base md:text-lg shadow-lg active:scale-95 transition-transform"
            >
              💝 이 지역에 기부하기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HotspotDetailModal;
