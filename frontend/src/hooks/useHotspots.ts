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
      hotspots.push({
        id: `fishing-${index}`,
        lat: item.lat,
        lng: item.lng,
        intensity: item.intensity,
        activityCount: item.activity_count,
        type: 'fishing',
      });
    });

    // 쓰레기 핫스팟
    data.debris_hotspots?.forEach((item, index) => {
      hotspots.push({
        id: `debris-${index}`,
        lat: item.lat,
        lng: item.lng,
        intensity: item.intensity,
        activityCount: item.debris_count,
        type: 'debris',
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
