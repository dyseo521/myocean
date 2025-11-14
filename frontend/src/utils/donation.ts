import { DonationAmount } from '@/types';

// 기부 금액에 따른 영역 크기 계산 (km²)
export const calculateDonationArea = (amount: DonationAmount): number => {
  const areaMap: Record<DonationAmount, number> = {
    100000: 1,      // 10만원 = 1km²
    1000000: 5,     // 100만원 = 5km²
    10000000: 20,   // 1000만원 = 20km²
  };
  return areaMap[amount];
};

// km²를 지도상의 반경(미터)로 변환
export const areaToRadius = (areaKm2: number): number => {
  // A = πr², r = √(A/π)
  const radiusKm = Math.sqrt(areaKm2 / Math.PI);
  return radiusKm * 1000; // 미터로 변환
};

// 금액 포맷팅 (예: 1000000 → "100만원")
export const formatAmount = (amount: number): string => {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(0)}천만원`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}백만원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
};

// 숫자를 천 단위 구분자로 포맷팅
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

// 정화 진행률에 따른 색상 반환
export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'text-ocean-success';
  if (progress >= 50) return 'text-ocean-warning';
  return 'text-ocean-danger';
};

// 핫스팟 강도에 따른 색상 반환
export const getHotspotColor = (intensity: number, type: 'fishing' | 'debris'): string => {
  if (type === 'fishing') {
    // 조업활동: 파란색 계열
    if (intensity > 0.7) return '#3B82F6';  // 진한 파란색
    if (intensity > 0.4) return '#60A5FA';  // 중간 파란색
    return '#93C5FD';  // 연한 파란색
  } else {
    // 쓰레기: 빨간색 계열
    if (intensity > 0.7) return '#EF4444';  // 진한 빨간색
    if (intensity > 0.4) return '#F87171';  // 중간 빨간색
    return '#FCA5A5';  // 연한 빨간색
  }
};

// 핫스팟 강도에 따른 원 크기 (반경, 미터)
export const getHotspotRadius = (intensity: number): number => {
  const minRadius = 2000;  // 2km
  const maxRadius = 8000;  // 8km
  return minRadius + (maxRadius - minRadius) * intensity;
};

// 모의 정화 진행률 시뮬레이션 (시간 경과에 따라 증가)
export const simulateCleanupProgress = (donationDate: string): number => {
  const now = new Date();
  const donated = new Date(donationDate);
  const daysPassed = Math.floor((now.getTime() - donated.getTime()) / (1000 * 60 * 60 * 24));

  // 100일에 100% 완료된다고 가정
  const progress = Math.min(100, (daysPassed / 100) * 100);
  return Math.floor(progress);
};

// 기부 금액과 중심 위치로부터 사각형 bounds 계산
export const calculateDonationBounds = (
  center: { lat: number; lng: number },
  areaKm2: number
): { southWest: { lat: number; lng: number }; northEast: { lat: number; lng: number } } => {
  // 정사각형으로 가정: side = √area
  const sideKm = Math.sqrt(areaKm2);

  // 위도 1도 ≈ 111km
  const latDegreeInKm = 111;
  // 경도 1도 ≈ 111km * cos(위도) (부산 지역 기준 약 35도)
  const lngDegreeInKm = 111 * Math.cos((center.lat * Math.PI) / 180);

  // km를 도(degree)로 변환
  const halfSideLat = (sideKm / 2) / latDegreeInKm;
  const halfSideLng = (sideKm / 2) / lngDegreeInKm;

  return {
    southWest: {
      lat: center.lat - halfSideLat,
      lng: center.lng - halfSideLng,
    },
    northEast: {
      lat: center.lat + halfSideLat,
      lng: center.lng + halfSideLng,
    },
  };
};
