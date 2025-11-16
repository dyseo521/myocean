'use client'

import { useQuery } from '@tanstack/react-query';
import { MarineHotspotsData, Hotspot } from '@/types';

const fetchHotspots = async (): Promise<MarineHotspotsData> => {
  const response = await fetch('/data/marine_hotspots.json');
  if (!response.ok) {
    throw new Error('Failed to fetch hotspots data');
  }
  return response.json();
};

export const useHotspots = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hotspots'],
    queryFn: fetchHotspots,
    staleTime: 1000 * 60 * 60, // 1시간
  });

  // 데이터를 Hotspot 배열로 변환
  const hotspots: Hotspot[] = [];

  if (data) {
    // 조업활동 핫스팟
    data.fishing_hotspots?.forEach((item, index) => {
      // 목표금액: intensity에 기반하여 4000만~6000만원 사이로 설정
      // intensity가 높을수록 더 높은 목표금액
      const baseAmount = 40000000; // 4000만원
      const variableAmount = Math.floor(item.intensity * 20000000); // 0~2000만원
      const randomOffset = Math.floor((Math.random() * 0.2 - 0.1) * baseAmount); // ±10% 랜덤
      const targetAmount = baseAmount + variableAmount + randomOffset;

      hotspots.push({
        id: `fishing-${index}`,
        lat: item.lat,
        lng: item.lng,
        intensity: item.intensity,
        activityCount: item.activity_count,
        type: 'fishing',
        targetAmount: Math.round(targetAmount / 1000000) * 1000000, // 100만원 단위로 반올림
      });
    });

    // 쓰레기 핫스팟
    data.debris_hotspots?.forEach((item, index) => {
      // 목표금액: intensity에 기반하여 4000만~6000만원 사이로 설정
      const baseAmount = 40000000;
      const variableAmount = Math.floor(item.intensity * 20000000);
      const randomOffset = Math.floor((Math.random() * 0.2 - 0.1) * baseAmount);
      const targetAmount = baseAmount + variableAmount + randomOffset;

      hotspots.push({
        id: `debris-${index}`,
        lat: item.lat,
        lng: item.lng,
        intensity: item.intensity,
        activityCount: item.debris_count,
        type: 'debris',
        targetAmount: Math.round(targetAmount / 1000000) * 1000000,
      });
    });
  }

  return {
    hotspots,
    metadata: data?.metadata,
    isLoading,
    error,
  };
};
