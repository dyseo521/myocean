/**
 * 카카오맵 SDK를 동적으로 로드하는 유틸리티
 * .env 파일의 VITE_KAKAO_MAP_APP_KEY를 사용합니다
 */

let isLoading = false;
let isLoaded = false;

export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되었고 API가 사용 가능하면 즉시 반환
    if (isLoaded && window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      resolve();
      return;
    }

    // 로딩 중이면 대기
    if (isLoading) {
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          clearInterval(checkInterval);
          isLoaded = true;
          resolve();
        }
      }, 100);
      return;
    }

    // API 키 확인
    const appKey = (import.meta as any).env.VITE_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      reject(new Error('카카오맵 API 키가 설정되지 않았습니다. .env 파일에 VITE_KAKAO_MAP_APP_KEY를 설정해주세요.'));
      return;
    }

    isLoading = true;

    // 스크립트 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer,drawing&autoload=false`;

    script.onload = () => {
      // kakao.maps.load()로 명시적으로 로드
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          // LatLng이 실제로 사용 가능한지 확인
          const checkReady = setInterval(() => {
            if (window.kakao.maps.LatLng) {
              clearInterval(checkReady);
              isLoading = false;
              isLoaded = true;
              resolve();
            }
          }, 50);

          // 5초 타임아웃
          setTimeout(() => {
            clearInterval(checkReady);
            if (!isLoaded) {
              isLoading = false;
              reject(new Error('카카오맵 API 초기화 타임아웃'));
            }
          }, 5000);
        });
      } else {
        isLoading = false;
        reject(new Error('카카오맵 객체를 찾을 수 없습니다.'));
      }
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('카카오맵 스크립트 로드에 실패했습니다.'));
    };

    document.head.appendChild(script);
  });
};
