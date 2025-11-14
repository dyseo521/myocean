import { useEffect } from 'react';

/**
 * 데모 데이터 자동 로드 훅
 * 개발 중 편의를 위해 사용
 */
export const useDemoData = (autoLoad: boolean = false) => {
  useEffect(() => {
    if (!autoLoad) return;

    const loadDemoData = async () => {
      try {
        const response = await fetch('/demo-data.json');
        const data = await response.json();

        if (data.donations) {
          localStorage.setItem('myocean_donations', JSON.stringify(data.donations));
          console.log('✅ 데모 데이터 로드 완료:', data.donations.length, '건');
        }
      } catch (error) {
        console.warn('데모 데이터 로드 실패:', error);
      }
    };

    loadDemoData();
  }, [autoLoad]);
};

export default useDemoData;
