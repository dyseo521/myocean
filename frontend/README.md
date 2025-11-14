# 마이오션 (MyOcean)

시민 참여형 유실어구 수거 펀딩 플랫폼

## 🌊 프로젝트 소개

마이오션은 유실어구 수거 비용을 시민 기부로 해결하는 크라우드 펀딩 플랫폼입니다.
기부자는 기부한 해역에 자신의 이름을 남기고, 정화 진행 상황을 확인할 수 있습니다.

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 카카오맵 API 키를 입력하세요.

```bash
cp .env.example .env
```

```
VITE_KAKAO_MAP_APP_KEY=your_kakao_map_app_key_here
```

### 3. 데이터 생성

Python 스크립트로 핫스팟 데이터를 생성합니다.

```bash
cd ..
python scripts/process_marine_data.py
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 앱을 확인할 수 있습니다.

## 📦 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 🎯 주요 기능

- ✅ 해양 쓰레기 핫스팟 시각화 (카카오맵)
- ✅ 기부하기 (10만원, 100만원, 1000만원)
- ✅ 기부자 이름 지도에 표시
- ✅ 나의 바다 (기부 내역 및 정화 진행률)
- ✅ 기부 랭킹 시스템
- ✅ 실시간 기부 알림
- ✅ 모바일 최적화

## 🛠 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **TailwindCSS** (스타일링)
- **Zustand** (상태 관리)
- **React Query** (데이터 페칭)
- **Framer Motion** (애니메이션)
- **Kakao Map API** (지도)

## 📄 라이선스

MIT License
