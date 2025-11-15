'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Donation } from '@/types';
import { calculateDiamondPolygon, calculateDonationArea } from '@/utils/donation';

export default function DonateDemo() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('');
  const [currentCount, setCurrentCount] = useState<number>(0);

  // 현재 저장된 데이터 개수 확인
  useEffect(() => {
    const existingDonations = localStorage.getItem('myocean_donations');
    if (existingDonations) {
      try {
        const data = JSON.parse(existingDonations);
        setCurrentCount(Array.isArray(data) ? data.length : 0);
      } catch (e) {
        setCurrentCount(0);
      }
    }
  }, [status]);

  // 더미 기부자 이름들
  const dummyDonors = [
    '김해양', '이바다', '박수산', '최정화', '정환경',
    '강마린', '윤깨끗', '장푸른', '임청정', '한사랑',
    '신희망', '오미래', '송지구', '권자연', '홍보호',
    '남궁환경', '독고바다', '제갈수호', '선우청정', '황보해양'
  ];

  // 더미 기부 금액 옵션
  const amounts = [100000, 1000000, 10000000] as const;

  // 부산 해역 좌표 범위
  const busanArea = {
    latMin: 35.0,
    latMax: 35.3,
    lngMin: 128.9,
    lngMax: 129.3,
  };

  const generateRandomDonations = (count: number) => {
    const donations: Donation[] = [];
    const existingDonations = localStorage.getItem('myocean_donations');
    let existingData: Donation[] = [];

    if (existingDonations) {
      try {
        existingData = JSON.parse(existingDonations);
      } catch (e) {
        console.error('Failed to parse existing donations');
      }
    }

    for (let i = 0; i < count; i++) {
      // 랜덤 기부자
      const donorName = dummyDonors[Math.floor(Math.random() * dummyDonors.length)];

      // 랜덤 금액
      const amount = amounts[Math.floor(Math.random() * amounts.length)];

      // 랜덤 위치 (부산 해역)
      const lat = busanArea.latMin + Math.random() * (busanArea.latMax - busanArea.latMin);
      const lng = busanArea.lngMin + Math.random() * (busanArea.lngMax - busanArea.lngMin);

      // 지역명 생성
      const regionName = `${lat.toFixed(2)}°N ${lng.toFixed(2)}°E`;

      // 기부 영역 계산
      const area = calculateDonationArea(amount);
      const polygon = calculateDiamondPolygon({ lat, lng }, area);

      // 랜덤 날짜 (최근 30일 이내)
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const donation: Donation = {
        id: `demo-${Date.now()}-${i}`,
        name: donorName,
        amount,
        location: { lat, lng },
        area,
        polygon,
        date: date.toISOString(),
        cleanupProgress: Math.floor(Math.random() * 30), // 0-30%
        regionName,
      };

      donations.push(donation);
    }

    // 기존 데이터와 합치기
    const allDonations = [...existingData, ...donations];

    // localStorage에 저장
    localStorage.setItem('myocean_donations', JSON.stringify(allDonations));

    return donations.length;
  };

  const handleGenerate = (count: number) => {
    try {
      const generated = generateRandomDonations(count);
      setStatus(`✅ ${generated}개의 더미 기부 데이터가 생성되었습니다!`);

      // 2초 후 메인 페이지로 이동 (전체 리로드)
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setStatus(`❌ 오류 발생: ${error}`);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('myocean_donations');
    setCurrentCount(0);
    setStatus('🗑️ 모든 기부 데이터가 삭제되었습니다.');

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleInspect = () => {
    const existingDonations = localStorage.getItem('myocean_donations');
    if (!existingDonations) {
      setStatus('❌ 저장된 데이터가 없습니다.');
      return;
    }

    try {
      const data = JSON.parse(existingDonations);
      const withPolygon = data.filter((d: Donation) => d.polygon && d.polygon.length > 0).length;
      setStatus(`✅ 총 ${data.length}개 (polygon 있음: ${withPolygon}개)`);
      console.log('첫 번째 데이터 샘플:', data[0]);
    } catch (e) {
      setStatus(`❌ 데이터 파싱 오류: ${e}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-ocean mb-2">🌊 마이오션</h1>
          <p className="text-slate-600">더미 기부 데이터 생성</p>
        </div>

        <div className="space-y-4">
          {/* 현재 데이터 개수 */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 text-center">
            <p className="text-sm opacity-90 mb-1">현재 저장된 기부 데이터</p>
            <p className="text-4xl font-bold">{currentCount}개</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h2 className="font-bold text-slate-800 mb-2">📊 데모 데이터 생성</h2>
            <p className="text-sm text-slate-600 mb-4">
              랜덤한 기부자, 금액, 위치로 더미 데이터를 생성합니다.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleGenerate(10)}
                className="py-2 px-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 active:scale-95 transition-all text-sm"
              >
                10개
              </button>
              <button
                onClick={() => handleGenerate(50)}
                className="py-2 px-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm"
              >
                50개
              </button>
              <button
                onClick={() => handleGenerate(100)}
                className="py-2 px-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 active:scale-95 transition-all text-sm"
              >
                100개
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h2 className="font-bold text-slate-800 mb-2">🔍 데이터 검사</h2>
            <p className="text-sm text-slate-600 mb-4">
              저장된 데이터를 확인합니다 (콘솔에 샘플 출력).
            </p>
            <button
              onClick={handleInspect}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 active:scale-95 transition-all"
            >
              데이터 검사
            </button>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h2 className="font-bold text-slate-800 mb-2">🗑️ 데이터 초기화</h2>
            <p className="text-sm text-slate-600 mb-4">
              모든 기부 데이터를 삭제합니다.
            </p>
            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
            >
              전체 삭제
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 active:scale-95 transition-all"
          >
            ← 돌아가기
          </button>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-xl text-center font-semibold ${
            status.includes('✅') ? 'bg-green-100 text-green-800' :
            status.includes('🗑️') ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>💡 Tip: 생성된 데이터는 브라우저 localStorage에 저장됩니다</p>
        </div>
      </div>
    </div>
  );
}
