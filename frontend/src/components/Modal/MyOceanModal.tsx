'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getUserDonations } from '@/utils/localStorage';
import { formatAmount, getProgressColor, simulateCleanupProgress } from '@/utils/donation';
import { format } from 'date-fns';

const MyOceanModal = () => {
  const showMyOceanModal = useStore((state) => state.showMyOceanModal);
  const setShowMyOceanModal = useStore((state) => state.setShowMyOceanModal);
  const user = useStore((state) => state.user);
  const [addressCache, setAddressCache] = useState<Record<string, string>>({});

  if (!showMyOceanModal || !user) return null;

  const myDonations = getUserDonations(user.name);
  const totalAmount = myDonations.reduce((sum, d) => sum + d.amount, 0);
  const completedCount = myDonations.filter(d => simulateCleanupProgress(d.date) >= 100).length;

  // 기부 위치들의 주소를 역지오코딩
  useEffect(() => {
    if (!showMyOceanModal || myDonations.length === 0) return;

    const fetchAddresses = async () => {
      // Kakao Maps API가 로드될 때까지 대기
      if (!window.kakao?.maps?.services) {
        setTimeout(fetchAddresses, 100);
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      const newCache: Record<string, string> = { ...addressCache };

      myDonations.forEach((donation) => {
        const cacheKey = `${donation.location.lat},${donation.location.lng}`;

        // 이미 캐시에 있으면 스킵
        if (newCache[cacheKey]) return;

        // 역지오코딩 수행
        geocoder.coord2Address(donation.location.lng, donation.location.lat, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
            const addr = result[0].address;
            const fullAddr = addr.address_name || donation.regionName || '주소 정보 없음';
            setAddressCache(prev => ({ ...prev, [cacheKey]: fullAddr }));
          } else {
            setAddressCache(prev => ({ ...prev, [cacheKey]: donation.regionName || '주소 정보 없음' }));
          }
        });
      });
    };

    fetchAddresses();
  }, [showMyOceanModal, myDonations.length]);

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMyOceanModal(false)}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-end justify-center p-0"
        >
          <div className="bg-white rounded-t-3xl shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gradient-ocean">🌊 나의 바다</h2>
                <p className="text-sm text-slate-600 mt-1">{user.name}님의 기부 현황</p>
              </div>
              <button
                onClick={() => setShowMyOceanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center -mr-2 -mt-2"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
              <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white p-3 md:p-4">
                <div className="text-xs opacity-90">총 기부 금액</div>
                <div className="text-base md:text-xl font-bold mt-1">{(totalAmount / 10000).toLocaleString()}만원</div>
              </div>
              <div className="card bg-gradient-to-br from-ocean-secondary to-ocean-success text-white p-3 md:p-4">
                <div className="text-xs opacity-90">기부 영역</div>
                <div className="text-base md:text-xl font-bold mt-1">{myDonations.length}곳</div>
              </div>
              <div className="card bg-gradient-to-br from-ocean-success to-emerald-600 text-white p-3 md:p-4">
                <div className="text-xs opacity-90">정화 완료</div>
                <div className="text-base md:text-xl font-bold mt-1">{completedCount}곳</div>
              </div>
            </div>

            {/* 기부 내역 */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">기부 내역</h3>
              {myDonations.length === 0 ? (
                <div className="card bg-slate-50 text-center py-12">
                  <p className="text-slate-500">아직 기부 내역이 없습니다.</p>
                  <p className="text-sm text-slate-400 mt-2">지금 바로 기부하여 바다를 지켜주세요!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDonations.map((donation) => {
                    const progress = simulateCleanupProgress(donation.date);
                    const cacheKey = `${donation.location.lat},${donation.location.lng}`;
                    const address = addressCache[cacheKey] || '주소 로딩 중...';
                    const showCoords = address === '주소 로딩 중...' || address === '주소 정보 없음';

                    return (
                      <div key={donation.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 mr-3">
                            <div className="font-bold text-slate-800">{address}</div>
                            {!showCoords && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                {donation.location.lat.toFixed(4)}°N, {donation.location.lng.toFixed(4)}°E
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">
                              {format(new Date(donation.date), 'yyyy년 M월 d일')}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-ocean-primary">{formatAmount(donation.amount)}</div>
                            <div className="text-xs text-slate-500">{donation.area}km²</div>
                          </div>
                        </div>

                        {/* 정화 진행률 */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">정화 진행률</span>
                            <span className={`font-bold ${getProgressColor(progress)}`}>
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className={`h-full transition-all duration-500 ${
                                progress >= 100
                                  ? 'bg-ocean-success'
                                  : progress >= 50
                                  ? 'bg-ocean-warning'
                                  : 'bg-ocean-danger'
                              }`}
                            />
                          </div>
                          {progress >= 100 && (
                            <div className="text-xs text-ocean-success font-medium mt-1">
                              ✅ 정화 완료!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MyOceanModal;
