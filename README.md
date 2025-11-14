# 마이오션 (MyOcean) 🌊

시민 참여형 유실어구 수거 펀딩 플랫폼

## 프로젝트 개요

유실어구(버려진 어구) 수거 비용을 시민 기부로 해결하는 크라우드 펀딩 웹 플랫폼입니다.
기부자는 기부한 해역에 자신의 이름을 지도에 남기고, 정화 진행 상황을 실시간으로 확인할 수 있습니다.

### 핵심 가치

- **시민 참여**: 누구나 쉽게 기부하고 바다를 지킬 수 있습니다
- **투명성**: 기부 금액과 정화 진행률을 실시간으로 공개합니다
- **보람**: 지도에 이름을 남겨 기부의 의미를 시각화합니다

## 시작하기

### 1. 데이터 준비

```bash
# Python 패키지 설치 (pandas, numpy 필요)
pip install pandas numpy

# 핫스팟 데이터 생성
python scripts/process_marine_data.py
```

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

자세한 내용은 [frontend/README.md](frontend/README.md)를 참고하세요.

## 프로젝트 구조

```
myocean/
├── data/                           # 원본 CSV 데이터
│   ├── (완료)고정자망 조업활동 데이터/
│   └── (완료)어업기인 해안쓰레기/
├── scripts/
│   └── process_marine_data.py     # 데이터 처리 스크립트
├── frontend/                       # React 웹앱
│   ├── src/
│   │   ├── components/            # React 컴포넌트
│   │   ├── hooks/                 # Custom hooks
│   │   ├── store/                 # Zustand store
│   │   ├── types/                 # TypeScript 타입
│   │   └── utils/                 # 유틸리티 함수
│   └── public/
│       └── data/
│           └── marine_hotspots.json  # 생성된 핫스팟 데이터
└── ref-code/                       # 참고 코드
```

## 주요 기능

### 필수 기능
- ✅ 해양 쓰레기 핫스팟 지도 시각화 (카카오맵)
- ✅ 핫스팟 상세 정보 및 정화 진행률 표시
- ✅ 기부하기 (10만원, 100만원, 1000만원)
- ✅ 기부자 이름 지도에 표시
- ✅ 나의 바다 (기부 내역 및 진행 상황 확인)

### 추가 기능
- ✅ 기부 랭킹 시스템
- ✅ 실시간 기부 알림 (애니메이션)
- ✅ 모바일 반응형 디자인

## 기술 스택

### 프론트엔드
- React 18 + TypeScript
- Vite (빌드 도구)
- TailwindCSS (스타일링)
- Zustand (상태 관리)
- React Query (데이터 페칭)
- Framer Motion (애니메이션)
- Kakao Map API (지도)

### 데이터 처리
- Python 3.x
- pandas
- numpy

## 데모 시연 시나리오

1. **오프닝**: 부산 해역 핫스팟 확인
2. **로그인**: 간단한 이름 입력
3. **기부**: 원하는 해역 선택 → 금액 선택 → 기부 완료
4. **확인**: 지도에서 내 이름 확인
5. **랭킹**: 기부 랭킹 확인
6. **나의 바다**: 기부 내역 및 정화 진행률 확인

## 라이선스

MIT License

## 문의

해커톤 프로젝트입니다. 피드백은 이슈로 남겨주세요.
