// 핫스팟 데이터 타입
export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  activityCount: number;
  type: 'fishing' | 'debris';
  regionName?: string;
  targetAmount?: number; // 목표 금액 (원)
}

// 기부 정보 타입
export interface Donation {
  id: string;
  name: string;
  amount: number;
  location: {
    lat: number;
    lng: number;
  };
  area: number; // km²
  bounds?: {
    // 기부 영역의 사각형 경계
    southWest: { lat: number; lng: number };
    northEast: { lat: number; lng: number };
  };
  polygon?: Array<{ lat: number; lng: number }>; // 마름모/다각형 영역
  date: string;
  hotspotId?: string;
  cleanupProgress: number; // 0-100%
  regionName?: string;
}

// 기부 금액 옵션
export type DonationAmount = 100000 | 1000000 | 10000000;

// 지도 데이터
export interface MarineHotspotsData {
  metadata: {
    generated_at: string;
    fishing_records: number;
    debris_records: number;
    grid_size_degrees: number;
    grid_size_km: number;
  };
  fishing_hotspots: Array<{
    lat: number;
    lng: number;
    intensity: number;
    activity_count: number;
  }>;
  debris_hotspots: Array<{
    lat: number;
    lng: number;
    intensity: number;
    debris_count: number;
  }>;
  regional_statistics?: any[];
  top_debris_items?: any;
  coverage?: {
    lat_min: number;
    lat_max: number;
    lng_min: number;
    lng_max: number;
  };
}

// 사용자 정보
export interface User {
  name: string;
  loginDate: string;
}

// 랭킹 정보
export interface RankingItem {
  rank: number;
  name: string;
  amount: number;
  donationCount: number;
}

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}
