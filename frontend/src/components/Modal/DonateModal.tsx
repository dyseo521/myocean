'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { saveDonation } from '@/utils/localStorage';
import { calculateDonationArea, calculateDonationBounds, calculateDiamondPolygon, formatAmount } from '@/utils/donation';
import type { DonationAmount, Donation } from '@/types';

const DONATION_AMOUNTS: DonationAmount[] = [100000, 1000000, 10000000];

type DonationStep = 'amount' | 'info' | 'confirm' | 'complete';

const DonateModal = () => {
  const [step, setStep] = useState<DonationStep>('amount');
  const [selectedAmount, setSelectedAmount] = useState<DonationAmount>(100000);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

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

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (showDonateModal && selectedLocation) {
      setStep('amount');
      setDonorName(user?.name || '');
      setDonorPhone('');
      setDonorEmail('');
    }
  }, [showDonateModal, selectedLocation, user]);

  const handleClose = () => {
    setShowDonateModal(false);
    setSelectedLocation(null);
    setIsSelectingLocation(false);
    setStep('amount');
  };

  const handleSelectLocation = () => {
    // 모달을 닫고 지도 클릭 모드 활성화
    setIsSelectingLocation(true);
    setShowDonateModal(false);
  };

  const handleAmountNext = () => {
    if (!selectedLocation) {
      handleSelectLocation();
      return;
    }
    setStep('info');
  };

  const handleInfoNext = () => {
    if (!donorName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmYes = () => {
    const area = calculateDonationArea(selectedAmount);
    const bounds = calculateDonationBounds(selectedLocation!, area);
    const polygon = calculateDiamondPolygon(selectedLocation!, area);

    const donation: Donation = {
      id: uuidv4(),
      name: donorName,
      amount: selectedAmount,
      location: selectedLocation!,
      area,
      bounds,
      polygon,
      date: new Date().toISOString(),
      cleanupProgress: 0,
      regionName: `${selectedLocation!.lat.toFixed(2)}°N ${selectedLocation!.lng.toFixed(2)}°E`,
    };

    // 저장
    saveDonation(donation);
    addDonation(donation);

    // 알림
    addNotification({
      name: donorName,
      amount: selectedAmount,
      region: donation.regionName || '부산 해역',
    });

    setStep('complete');
  };

  const handleConfirmNo = () => {
    setStep('amount');
  };

  const handleComplete = () => {
    handleClose();
  };

  if (!showDonateModal) return null;

  return (
    <AnimatePresence>
      <div
        className="absolute inset-0 bg-black bg-opacity-50 z-50"
        onClick={(e) => {
          if (step !== 'complete') {
            e.stopPropagation();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-end justify-center p-0"
        >
          <div className="bg-white rounded-t-3xl shadow-2xl p-6 w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Step 1: 금액 선택 */}
            {step === 'amount' && (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">💝 기부 금액 선택</h2>
                    <p className="text-sm text-slate-600 mt-1">보호할 바다 영역을 선택하세요</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                {/* 금액 옵션 */}
                <div className="space-y-3 mb-6">
                  {DONATION_AMOUNTS.map((amount, idx) => {
                    const colors = [
                      { bg: 'from-sky-400 to-blue-500', icon: '🌊' },
                      { bg: 'from-cyan-400 to-teal-500', icon: '💙' },
                      { bg: 'from-blue-500 to-indigo-600', icon: '💎' },
                    ];
                    const color = colors[idx];
                    const isSelected = selectedAmount === amount;
                    const isPopular = idx === 1; // 100만원

                    return (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`relative w-full p-4 rounded-2xl border-2 transition-all active:scale-98 ${
                          isSelected
                            ? 'border-ocean-primary bg-ocean-primary bg-opacity-10 shadow-lg scale-102'
                            : 'border-slate-200 hover:border-ocean-primary'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            🔥 인기
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                            {color.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-lg font-bold text-slate-800">{formatAmount(amount)}</div>
                            <div className="text-sm text-slate-600">보호 영역: {calculateDonationArea(amount)}km²</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {idx === 0 && '작은 사이즈로 본 보람의 입니다'}
                              {idx === 1 && '더 넓은 범위를 지킬 수 있어요'}
                              {idx === 2 && '바다 수호자가 되어주세요!'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 위치 선택 */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">📍 기부 위치</h3>
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
                          className="btn btn-outline text-xs px-3 py-2"
                        >
                          변경
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSelectLocation}
                      className="w-full btn btn-outline py-4 text-base"
                    >
                      📍 지도에서 위치 선택
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAmountNext}
                  disabled={!selectedLocation}
                  className="w-full btn btn-primary py-4 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음 단계 →
                </button>

                <p className="text-xs text-center text-slate-500 mt-3">
                  💡 펀딩금액에 따른 해당 영역의 1년간 보호됩니다
                </p>
              </div>
            )}

            {/* Step 2: 기부자 정보 입력 */}
            {step === 'info' && (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">✍️ 기부자 정보</h2>
                    <p className="text-sm text-slate-600 mt-1">기부 인증서에 사용됩니다</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-ocean-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      연락처 <span className="text-slate-400 text-xs">(선택)</span>
                    </label>
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-ocean-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      이메일 <span className="text-slate-400 text-xs">(선택)</span>
                    </label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-ocean-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('amount')}
                    className="flex-1 btn btn-outline py-3"
                  >
                    ← 이전
                  </button>
                  <button
                    onClick={handleInfoNext}
                    className="flex-1 btn btn-primary py-3"
                  >
                    다음 →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 구역 확인 */}
            {step === 'confirm' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🌊</div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">이 구역을 보호하겠어요?</h2>
                  <p className="text-slate-600">선택하신 내용을 확인해주세요</p>
                </div>

                <div className="card bg-slate-50 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">기부자</span>
                    <span className="font-bold">{donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">기부 금액</span>
                    <span className="font-bold text-ocean-primary">{formatAmount(selectedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">보호 영역</span>
                    <span className="font-bold">{calculateDonationArea(selectedAmount)}km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">위치</span>
                    <span className="font-medium text-sm">
                      {selectedLocation?.lat.toFixed(4)}°N, {selectedLocation?.lng.toFixed(4)}°E
                    </span>
                  </div>
                  {donorPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">연락처</span>
                      <span className="font-medium text-sm">{donorPhone}</span>
                    </div>
                  )}
                  {donorEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">이메일</span>
                      <span className="font-medium text-sm">{donorEmail}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmNo}
                    className="flex-1 btn btn-outline py-4 text-base"
                  >
                    아니요
                  </button>
                  <button
                    onClick={handleConfirmYes}
                    className="flex-1 btn btn-primary py-4 text-base"
                  >
                    네, 보호합니다!
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: 기부 완료 인증서 */}
            {step === 'complete' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">감사합니다!</h2>
                  <p className="text-lg text-slate-600">기부가 완료되었습니다</p>
                </div>

                <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white p-6 mb-6">
                  <div className="text-center mb-4">
                    <div className="text-sm opacity-90 mb-1">해양 보호 인증서</div>
                    <div className="text-2xl font-black">마이오션</div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-black mb-2">{donorName}</div>
                      <div className="text-sm opacity-90">님께서</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-90">기부 금액</span>
                      <span className="font-bold">{formatAmount(selectedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">보호 영역</span>
                      <span className="font-bold">{calculateDonationArea(selectedAmount)}km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">기부 일자</span>
                      <span className="font-bold">{new Date().toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white border-opacity-20 text-center text-xs opacity-90">
                    {donorName}님의 이름이 지도에 영원히 새겨집니다
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    💙 <strong>{donorName}</strong>님의 소중한 기부로 <strong>{calculateDonationArea(selectedAmount)}km²</strong>의 해양 생태계가 보호됩니다.
                    지도에서 당신의 이름을 확인하실 수 있습니다!
                  </p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full btn btn-primary py-4 text-lg shadow-lg"
                >
                  지도에서 내 영역 확인하기
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonateModal;
