'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { calculateTotalDonationForHotspot, formatAmount } from '@/utils/donation';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCollection: () => void;
}

const CollectionModal = ({ isOpen, onClose, onStartCollection }: CollectionModalProps) => {
  const selectedHotspot = useStore((state) => state.selectedHotspot);
  const donations = useStore((state) => state.donations);
  const [address, setAddress] = useState<string>('');

  // 주소 가져오기
  useEffect(() => {
    if (!selectedHotspot) return;

    const tryGeocode = () => {
      if (!window.kakao?.maps?.services) {
        setTimeout(tryGeocode, 100);
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(selectedHotspot.lng, selectedHotspot.lat, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
          const fullAddr = result[0].address.address_name || '';
          setAddress(fullAddr || 'FAILED');
        } else {
          setAddress('FAILED');
        }
      });
    };

    setAddress('');
    tryGeocode();
  }, [selectedHotspot]);

  if (!isOpen || !selectedHotspot) return null;

  const totalDonation = calculateTotalDonationForHotspot(selectedHotspot, donations);
  const targetAmount = selectedHotspot.targetAmount || 0;
  const progress = Math.min(100, Math.floor((totalDonation / targetAmount) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* 모달 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white bg-opacity-30 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold">수거 가능!</h2>
              <p className="text-sm opacity-90 mt-1">충분한 펀딩이 모였어요</p>
            </div>
          </div>

          {/* 내용 */}
          <div className="px-6 py-6 space-y-6">
            {/* 지역 정보 */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="text-4xl">🗑️</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">
                  {address && address !== 'FAILED'
                    ? address.split(' ').slice(0, 2).join(' ')
                    : '해양 구역'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  위치: {selectedHotspot.lat.toFixed(3)}, {selectedHotspot.lng.toFixed(3)}
                </p>
              </div>
            </div>

            {/* 펀딩 현황 */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-600">현재 기부액</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatAmount(totalDonation)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-600">목표 금액</span>
                <span className="text-lg font-semibold text-slate-700">
                  {formatAmount(targetAmount)}
                </span>
              </div>

              {/* 진행바 */}
              <div className="relative pt-2">
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                  />
                </div>
              </div>

              {/* 목표 달성 메시지 */}
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                <span>💥</span>
                <span>목표 달성!</span>
              </div>
            </div>

            {/* 수거 안내 */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-slate-800 mb-1">수거하러 가실건가요?</p>
              <p className="text-sm text-slate-600">SONAR로 폐어구 위치를 추적합니다</p>
            </div>

            {/* 버튼 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all"
              >
                ✕ 아니오
              </button>
              <button
                onClick={() => {
                  onStartCollection();
                  onClose();
                }}
                className="py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg active:scale-95 transition-all"
              >
                ✓ 예
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CollectionModal;
