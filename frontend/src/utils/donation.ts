import { DonationAmount, Donation, Hotspot } from '@/types';

// 기부 금액에 따른 영역 크기 계산 (km²)
export const calculateDonationArea = (amount: DonationAmount): number => {
  const areaMap: Record<DonationAmount, number> = {
    100000: 2,      // 10만원 = 2km²
    1000000: 10,    // 100만원 = 10km²
    10000000: 30,   // 1000만원 = 30km²
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

// 기부 금액과 중심 위치로부터 마름모 모양의 폴리곤 좌표 계산
export const calculateDiamondPolygon = (
  center: { lat: number; lng: number },
  areaKm2: number
): Array<{ lat: number; lng: number }> => {
  // 마름모의 대각선 길이 계산 (면적 = (d1 * d2) / 2, d1 = d2 가정)
  const diagonalKm = Math.sqrt(areaKm2 * 2);

  // 위도 1도 ≈ 111km
  const latDegreeInKm = 111;
  // 경도 1도 ≈ 111km * cos(위도)
  const lngDegreeInKm = 111 * Math.cos((center.lat * Math.PI) / 180);

  // km를 도(degree)로 변환
  const halfDiagonalLat = (diagonalKm / 2) / latDegreeInKm;
  const halfDiagonalLng = (diagonalKm / 2) / lngDegreeInKm;

  // 마름모 4개 꼭지점 (상, 우, 하, 좌)
  return [
    { lat: center.lat + halfDiagonalLat, lng: center.lng },          // 북
    { lat: center.lat, lng: center.lng + halfDiagonalLng },          // 동
    { lat: center.lat - halfDiagonalLat, lng: center.lng },          // 남
    { lat: center.lat, lng: center.lng - halfDiagonalLng },          // 서
  ];
};

// 두 좌표 간 거리 계산 (km) - Haversine 공식
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 지구 반경 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 영역 겹침 체크 - 새로운 기부 위치가 기존 기부들과 겹치는지 확인
export const checkAreaOverlap = (
  newLocation: { lat: number; lng: number },
  newArea: number,
  existingDonations: Donation[]
): boolean => {
  // 다이아몬드의 대각선 길이 = √(2 * area) km
  const newDiagonal = Math.sqrt(2 * newArea);
  const newRadius = newDiagonal / 2; // 반대각선 (중심에서 꼭지점까지)

  for (const donation of existingDonations) {
    const existingDiagonal = Math.sqrt(2 * donation.area);
    const existingRadius = existingDiagonal / 2;

    // 두 중심점 간의 거리
    const distance = calculateDistance(
      newLocation.lat,
      newLocation.lng,
      donation.location.lat,
      donation.location.lng
    );

    // 거리가 두 반경의 합보다 작으면 겹침
    // 80% 이하일 때만 겹침으로 판단 (20% 정도는 겹쳐도 OK)
    if (distance < (newRadius + existingRadius) * 0.8) {
      return true; // 겹침
    }
  }

  return false; // 겹치지 않음
};

// 특정 핫스팟에 대한 총 기부금 계산 (거리 기반)
export const calculateTotalDonationForHotspot = (
  hotspot: Hotspot,
  donations: Donation[]
): number => {
  // 핫스팟 반경 (기본 10km)
  const HOTSPOT_RADIUS_KM = 10;

  return donations
    .filter(d => {
      // 핫스팟 중심에서 반경 내의 모든 기부를 합산
      const distance = calculateDistance(
        hotspot.lat,
        hotspot.lng,
        d.location.lat,
        d.location.lng
      );
      return distance <= HOTSPOT_RADIUS_KM;
    })
    .reduce((sum, d) => sum + d.amount, 0);
};

// 핫스팟의 펀딩 완료 여부 확인 (목표금액의 70% 이상이면 수거 가능)
export const isFundingComplete = (
  hotspot: Hotspot,
  donations: Donation[]
): boolean => {
  if (!hotspot.targetAmount) return false;

  const totalDonation = calculateTotalDonationForHotspot(hotspot, donations);
  const FUNDING_THRESHOLD = 0.7; // 70% 이상이면 수거 가능
  return totalDonation >= hotspot.targetAmount * FUNDING_THRESHOLD;
};

// 핫스팟의 펀딩 진행률 계산 (0-100%)
export const calculateFundingProgress = (
  hotspot: Hotspot,
  donations: Donation[]
): number => {
  if (!hotspot.targetAmount) return 0;

  const totalDonation = calculateTotalDonationForHotspot(hotspot, donations);
  return Math.min(100, Math.floor((totalDonation / hotspot.targetAmount) * 100));
};
