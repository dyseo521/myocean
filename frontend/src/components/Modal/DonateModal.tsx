'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { saveDonation } from '@/utils/localStorage';
import { calculateDonationArea, calculateDonationBounds, calculateDiamondPolygon, formatAmount } from '@/utils/donation';
import type { DonationAmount, Donation } from '@/types';

const DONATION_AMOUNTS: DonationAmount[] = [100000, 1000000, 10000000];

const DonateModal = () => {
  const [selectedAmount, setSelectedAmount] = useState<DonationAmount>(100000);

  const showDonateModal = useStore((state) => state.showDonateModal);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);
  const user = useStore((state) => state.user);
  const addDonation = useStore((state) => state.addDonation);
  const addNotification = useStore((state) => state.addNotification);

  // 지도 위치 선택 상태 (전역 상태 사용)
  const isSelectingLocation = useStore((state) => state.isSelectingLocation);
  const selectedLocation = useStore((state) => state.selectedDonationLocation);
  const setIsSelectingLocation = useStore((state) => state.setIsSelectingLocation);
  const setSelectedLocation = useStore((state) => state.setSelectedDonationLocation);

  const handleClose = () => {
    setShowDonateModal(false);
    setSelectedLocation(null);
    setIsSelectingLocation(false);
  };

  const handleSelectLocation = () => {
    // 모달을 최소화하고 지도 클릭 모드 활성화
    setIsSelectingLocation(true);
    setShowDonateModal(false);
  };

  const handleDonate = () => {
    if (!user || !selectedLocation) return;

    const area = calculateDonationArea(selectedAmount);
    const bounds = calculateDonationBounds(selectedLocation, area);
    const polygon = calculateDiamondPolygon(selectedLocation, area);

    const donation: Donation = {
      id: uuidv4(),
      name: user.name,
      amount: selectedAmount,
      location: selectedLocation,
      area,
      bounds,
      polygon,
      date: new Date().toISOString(),
      cleanupProgress: 0,
      regionName: `${selectedLocation.lat.toFixed(2)}°N ${selectedLocation.lng.toFixed(2)}°E`,
    };

    // 저장
    saveDonation(donation);
    addDonation(donation);

    // 알림
    addNotification({
      name: user.name,
      amount: selectedAmount,
      region: donation.regionName || '부산 해역',
    });

    alert(`${formatAmount(selectedAmount)} 기부가 완료되었습니다!\n지도에서 ${user.name}님의 이름을 확인해보세요.`);
    handleClose();
  };

  if (!showDonateModal) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        >
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-6 w-full md:max-w-lg md:mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">💝 기부하기</h2>
                <p className="text-sm text-slate-600 mt-1">바다를 지키는 첫 걸음</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center -mr-2 -mt-2"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 금액 선택 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">기부 금액을 선택하세요</h3>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all active:scale-95 min-h-[80px] ${
                      selectedAmount === amount
                        ? 'border-ocean-primary bg-ocean-primary text-white shadow-lg scale-105'
                        : 'border-slate-200 hover:border-ocean-primary'
                    }`}
                  >
                    <div className="text-base md:text-lg font-bold">{formatAmount(amount)}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {calculateDonationArea(amount)}km²
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 위치 선택 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">기부 위치</h3>
              {selectedLocation ? (
                <div className="card bg-ocean-primary bg-opacity-10 border-2 border-ocean-primary">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium text-ocean-primary">위치 선택 완료</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
                      </div>
                    </div>
                    <button
                      onClick={handleSelectLocation}
                      className="btn btn-outline text-xs px-3 py-2 min-h-[36px]"
                    >
                      변경
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSelectLocation}
                  className="w-full btn btn-outline py-4 text-base active:scale-95 transition-transform"
                  disabled={isSelectingLocation}
                >
                  {isSelectingLocation ? '위치 선택 중...' : '📍 지도에서 위치 선택'}
                </button>
              )}
            </div>

            {/* 기부 정보 요약 */}
            {selectedLocation && (
              <div className="card bg-slate-50 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-2">기부 정보</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">기부자:</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">금액:</span>
                    <span className="font-medium text-ocean-primary">{formatAmount(selectedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">영역:</span>
                    <span className="font-medium">{calculateDonationArea(selectedAmount)}km²</span>
                  </div>
                </div>
              </div>
            )}

            {/* 기부 버튼 */}
            <button
              onClick={handleDonate}
              disabled={!selectedLocation}
              className="w-full btn btn-primary py-4 text-base md:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
              ✨ 기부 완료하기
            </button>

            <p className="text-xs text-slate-500 text-center mt-3">
              * 데모 버전으로 실제 결제는 진행되지 않습니다.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonateModal;
