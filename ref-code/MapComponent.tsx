'use client';

import { Map, MapMarker, Circle } from 'react-kakao-maps-sdk';
import { useState, useEffect } from 'react';

// 한국 해역 중심 좌표
const koreaCenter = {
  lat: 35.5,
  lng: 128.0,
};

interface Hotspot {
  lat: number;
  lng: number;
  intensity: number;
  activity_count: number;
}

interface MarineData {
  fishing_hotspots: Hotspot[];
  debris_hotspots: Hotspot[];
  metadata: {
    fishing_records: number;
    debris_records: number;
  };
}

export default function MapComponent() {
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [showFishing, setShowFishing] = useState(true);
  const [showDebris, setShowDebris] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '';

  // Load marine data
  useEffect(() => {
    fetch('/data/marine_hotspots.json')
      .then((res) => res.json())
      .then((data) => setMarineData(data))
      .catch((err) => console.error('Failed to load marine data:', err));
  }, []);

  // API 키가 설정되지 않은 경우
  if (!apiKey || apiKey === 'YOUR_KAKAO_MAP_API_KEY_HERE') {
    return (
      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-700 font-medium mb-2">한국 해역</p>
          <p className="text-sm text-gray-600">
            Kakao Maps API 키를 설정하세요
          </p>
          <p className="text-xs text-gray-500 mt-2">
            .env.local 파일에서 NEXT_PUBLIC_KAKAO_MAP_API_KEY 설정
          </p>
        </div>
      </div>
    );
  }

  // Get circle color and radius based on intensity
  const getCircleStyle = (intensity: number, type: 'fishing' | 'debris') => {
    const baseColor = type === 'fishing' ? '#3B82F6' : '#EF4444'; // blue for fishing, red for debris
    const opacity = Math.max(0.3, intensity / 100);
    const radius = Math.max(2000, (intensity / 100) * 8000); // 2-8km radius

    return {
      fillColor: baseColor,
      fillOpacity: opacity * 0.3,
      strokeColor: baseColor,
      strokeOpacity: opacity * 0.8,
      strokeWeight: 2,
      radius: radius,
    };
  };

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="text-xs font-semibold text-gray-700 mb-2">레이어</div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFishing}
            onChange={(e) => setShowFishing(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm">🎣 조업 활동</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDebris}
            onChange={(e) => setShowDebris(e.target.checked)}
            className="rounded text-red-600"
          />
          <span className="text-sm">🗑️ 해양 쓰레기</span>
        </label>
        {marineData && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-600">
            <div>조업: {marineData.metadata.fishing_records.toLocaleString()}건</div>
            <div>쓰레기: {marineData.metadata.debris_records.toLocaleString()}건</div>
          </div>
        )}
      </div>

      <Map
        center={koreaCenter}
        style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }}
        level={10}
      >
        {/* Fishing Activity Hotspots */}
        {showFishing &&
          marineData?.fishing_hotspots.map((hotspot, idx) => {
            const style = getCircleStyle(hotspot.intensity, 'fishing');
            return (
              <Circle
                key={`fishing-${idx}`}
                center={{ lat: hotspot.lat, lng: hotspot.lng }}
                radius={style.radius}
                strokeWeight={style.strokeWeight}
                strokeColor={style.strokeColor}
                strokeOpacity={style.strokeOpacity}
                fillColor={style.fillColor}
                fillOpacity={style.fillOpacity}
                onClick={() => setSelectedHotspot(hotspot)}
              />
            );
          })}

        {/* Marine Debris Hotspots */}
        {showDebris &&
          marineData?.debris_hotspots.map((hotspot, idx) => {
            const style = getCircleStyle(hotspot.intensity, 'debris');
            return (
              <Circle
                key={`debris-${idx}`}
                center={{ lat: hotspot.lat, lng: hotspot.lng }}
                radius={style.radius}
                strokeWeight={style.strokeWeight}
                strokeColor={style.strokeColor}
                strokeOpacity={style.strokeOpacity}
                fillColor={style.fillColor}
                fillOpacity={style.fillOpacity}
                onClick={() => setSelectedHotspot(hotspot)}
              />
            );
          })}

        {/* Selected Hotspot Info */}
        {selectedHotspot && (
          <MapMarker
            position={{ lat: selectedHotspot.lat, lng: selectedHotspot.lng }}
            onClick={() => setSelectedHotspot(null)}
          >
            <div style={{ padding: '8px', fontSize: '12px', minWidth: '120px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                위도: {selectedHotspot.lat.toFixed(3)}
              </div>
              <div style={{ marginBottom: '4px' }}>
                경도: {selectedHotspot.lng.toFixed(3)}
              </div>
              <div style={{ color: '#666' }}>
                강도: {selectedHotspot.intensity.toFixed(1)}
              </div>
              <div style={{ color: '#666' }}>
                활동: {selectedHotspot.activity_count}건
              </div>
            </div>
          </MapMarker>
        )}
      </Map>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 opacity-50"></div>
          <span className="text-gray-700">조업 활동 집중 지역</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-50"></div>
          <span className="text-gray-700">해양 쓰레기 집중 지역</span>
        </div>
      </div>
    </div>
  );
}
