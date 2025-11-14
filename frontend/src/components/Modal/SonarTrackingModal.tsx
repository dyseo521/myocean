'use client'

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { calculateTotalDonationForHotspot } from '@/utils/donation';

interface SonarTrackingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const SonarTrackingModal = ({ isOpen, onComplete }: SonarTrackingModalProps) => {
  const selectedHotspot = useStore((state) => state.selectedHotspot);
  const donations = useStore((state) => state.donations);
  const [progress, setProgress] = useState(0);
  const [address, setAddress] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

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

  // 진행률 시뮬레이션
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          // 1초 후 자동으로 다음 화면으로
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 100;
        }
        return prev + 2; // 5초에 100% 도달
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen || !selectedHotspot) return null;

  const totalDonation = calculateTotalDonationForHotspot(selectedHotspot, donations);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
        />

        {/* 모달 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-blue-400"
        >
          {/* SONAR 아이콘 (동심원 애니메이션) */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* 동심원 */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-4 border-blue-300"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: [0.5, 1.5],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: "easeOut",
                  }}
                />
              ))}
              {/* 중앙 레이더 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📡</span>
                </div>
              </div>
            </div>
          </div>

          {/* 제목 */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            SONAR 추적 중...
          </h2>

          {/* 지역명 */}
          <p className="text-blue-200 text-center font-semibold mb-6">
            {address && address !== 'FAILED'
              ? `${address.split(' ').slice(0, 2).join(' ')} 구역`
              : '해양 구역'}
          </p>

          {/* 안내 메시지 */}
          <p className="text-white text-center mb-8 opacity-90">
            폐어구 위치를 탐지하고 있습니다
          </p>

          {/* 진행바 */}
          <div className="relative mb-6">
            <div className="h-6 bg-blue-900 bg-opacity-50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>

          {/* 완료 메시지 */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500 bg-opacity-30 border-2 border-green-400 rounded-xl p-3 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-green-300 font-bold">
                  <span className="text-xl">🟢</span>
                  <span>위치 확정!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 기부 현황 (우측 하단) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-xl p-4"
        >
          <h4 className="text-sm font-bold text-slate-700 mb-2">기부 현황</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-600">
              {totalDonation >= 5000000 ? '5천만원+' : ''} 완료
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="text-slate-600">진행 중</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SonarTrackingModal;
