'use client'

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { calculateTotalDonationForHotspot } from '@/utils/donation';
import Image from 'next/image';

interface DetectionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 소나 이미지 파일명 리스트
const SONAR_IMAGES = [
  'KakaoTalk_20251115_100837439_01.jpg',
  'KakaoTalk_20251115_100837439_02.jpg',
  'KakaoTalk_20251115_100837439_03.jpg',
  'KakaoTalk_20251115_100837439_04.jpg',
  'KakaoTalk_20251115_100837439_05.jpg',
  'KakaoTalk_20251115_100837439_06.jpg',
  'KakaoTalk_20251115_100837439_07.jpg',
  'KakaoTalk_20251115_100837439_08.jpg',
  'KakaoTalk_20251115_100837439_09.jpg',
  'KakaoTalk_20251115_100837439_10.jpg',
  'KakaoTalk_20251115_100837439_11.jpg',
  'KakaoTalk_20251115_100837439_12.jpg',
  'KakaoTalk_20251115_100837439_13.jpg',
  'KakaoTalk_20251115_100837439_14.jpg',
  'KakaoTalk_20251115_100837439_15.jpg',
  'KakaoTalk_20251115_100837439_16.jpg',
  'KakaoTalk_20251115_100837439_17.jpg',
];

const DetectionSuccessModal = ({ isOpen, onClose }: DetectionSuccessModalProps) => {
  const selectedHotspot = useStore((state) => state.selectedHotspot);
  const donations = useStore((state) => state.donations);
  const [address, setAddress] = useState<string>('');

  // 랜덤 소나 이미지 선택 (모달이 열릴 때마다 새로 선택)
  const randomSonarImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * SONAR_IMAGES.length);
    return `/image/${SONAR_IMAGES[randomIndex]}`;
  }, [isOpen]);

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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
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
              <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center mb-3">
                <span className="text-4xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold">탐지 성공!</h2>
              <p className="text-sm opacity-90 mt-1">SONAR로 폐어구를 포착했습니다</p>
            </div>
          </div>

          {/* 내용 */}
          <div className="px-6 py-6 space-y-4">
            {/* 지역 정보 */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🗑️</span>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {address && address !== 'FAILED'
                      ? address.split(' ').slice(0, 2).join(' ')
                      : '해양 구역'}
                  </h3>
                  <span className="inline-block px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold mt-1">
                    정돈
                  </span>
                </div>
              </div>
            </div>

            {/* SONAR 탐지 이미지 섹션 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span>📷</span>
                  <span>SONAR 탐지 이미지</span>
                </h4>
                <span className="text-xs text-emerald-600 font-semibold">신뢰도: 88%</span>
              </div>

              {/* SONAR 탐지 이미지 */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-teal-900 rounded-xl overflow-hidden">
                {/* 소나 이미지 */}
                <Image
                  src={randomSonarImage}
                  alt="SONAR 탐지 이미지"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패시 placeholder 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />

                {/* 이미지 로드 실패시 표시될 fallback */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white opacity-50">
                    <div className="text-6xl mb-2">🌊</div>
                    <p className="text-sm">SONAR 이미지</p>
                  </div>
                </div>

                {/* 스캔라인 효과 */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 shadow-lg shadow-cyan-400/50 z-10"
                  animate={{
                    y: [0, 200, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* 레포트 후처리 라벨 */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded flex items-center gap-1 z-10">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>레포트 후처리</span>
                </div>
              </div>
            </div>

            {/* 정확한 위치 정보 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span>📍</span>
                <span>정확한 위치 정보</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">위도 (Latitude)</span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedHotspot.lat.toFixed(6)}°
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">경도 (Longitude)</span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedHotspot.lng.toFixed(6)}°
                  </span>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg active:scale-95 transition-all"
            >
              확인
            </button>
          </div>
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

export default DetectionSuccessModal;
