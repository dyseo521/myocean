import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { saveDonation } from '@/utils/localStorage';
import { calculateDonationArea, formatAmount } from '@/utils/donation';
import type { DonationAmount, Donation } from '@/types';

const DONATION_AMOUNTS: DonationAmount[] = [100000, 1000000, 10000000];

const DonateModal = () => {
  const [selectedAmount, setSelectedAmount] = useState<DonationAmount>(100000);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const showDonateModal = useStore((state) => state.showDonateModal);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);
  const user = useStore((state) => state.user);
  const addDonation = useStore((state) => state.addDonation);
  const addNotification = useStore((state) => state.addNotification);

  const handleClose = () => {
    setShowDonateModal(false);
    setSelectedLocation(null);
    setIsSelectingLocation(false);
  };

  const handleSelectLocation = () => {
    setIsSelectingLocation(true);
    alert('지도에서 기부할 위치를 클릭해주세요. (데모에서는 부산 해역으로 자동 설정됩니다)');

    // 데모: 부산 해역 랜덤 위치
    const randomLat = 35.0 + Math.random() * 0.3;
    const randomLng = 128.9 + Math.random() * 0.3;
    setSelectedLocation({ lat: randomLat, lng: randomLng });
    setIsSelectingLocation(false);
  };

  const handleDonate = () => {
    if (!user || !selectedLocation) return;

    const donation: Donation = {
      id: uuidv4(),
      name: user.name,
      amount: selectedAmount,
      location: selectedLocation,
      area: calculateDonationArea(selectedAmount),
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-container"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">💝 기부하기</h2>
                <p className="text-sm text-slate-600 mt-1">바다를 지키는 첫 걸음</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 금액 선택 */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">기부 금액을 선택하세요</h3>
              <div className="grid grid-cols-3 gap-3">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAmount === amount
                        ? 'border-ocean-primary bg-ocean-primary text-white shadow-lg scale-105'
                        : 'border-slate-200 hover:border-ocean-primary'
                    }`}
                  >
                    <div className="text-lg font-bold">{formatAmount(amount)}</div>
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
                      className="btn btn-outline text-xs px-3 py-1"
                    >
                      변경
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSelectLocation}
                  className="w-full btn btn-outline py-4"
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
              className="w-full btn btn-primary py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
