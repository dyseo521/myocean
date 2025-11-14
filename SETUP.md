# 마이오션 설치 및 실행 가이드

## 📋 사전 요구사항

- **Node.js** 18.x 이상
- **Python** 3.8 이상
- **npm** 또는 **yarn**
- **카카오맵 API 키** (https://developers.kakao.com/)

## 🚀 설치 및 실행

### 1단계: Python 패키지 설치

프로젝트 루트 디렉토리에서 실행:

```bash
pip install pandas numpy
```

또는 가상환경 사용:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install pandas numpy
```

### 2단계: 데이터 처리

CSV 데이터를 핫스팟 JSON으로 변환:

```bash
python scripts/process_marine_data.py
```

성공 시 `frontend/public/data/marine_hotspots.json` 파일이 생성됩니다.

### 3단계: 프론트엔드 패키지 설치

```bash
cd frontend
npm install
```

### 4단계: 환경 변수 설정

`.env.example`을 `.env`로 복사:

```bash
cp .env.example .env
```

`.env` 파일을 열고 카카오맵 API 키 입력:

```
VITE_KAKAO_MAP_APP_KEY=your_actual_api_key_here
```

#### 카카오맵 API 키 발급 방법

1. https://developers.kakao.com/ 접속
2. 로그인 후 "내 애플리케이션" 클릭
3. "애플리케이션 추가하기" 클릭
4. 앱 이름 입력 후 저장
5. "Web" 플랫폼 추가
6. "사이트 도메인"에 `http://localhost:3000` 추가
7. "JavaScript 키" 복사하여 `.env` 파일에 붙여넣기

### 5단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 자동으로 `http://localhost:3000` 열립니다.

## 🎭 데모 데이터 로드 (선택사항)

시연용 샘플 기부 데이터를 로드하려면:

```bash
# 데모 데이터 생성
python scripts/generate_demo_data.py
```

그 후 브라우저에서:

1. F12로 개발자 도구 열기
2. Console 탭에서 다음 명령어 실행:

```javascript
fetch('/demo-data.json').then(r=>r.json()).then(d=>{
  localStorage.setItem('myocean_donations', JSON.stringify(d.donations));
  location.reload();
});
```

## 🏗️ 빌드 및 배포

### 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/dist` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

### 배포

Vercel 배포 (권장):

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
cd frontend
vercel
```

환경 변수 `VITE_KAKAO_MAP_APP_KEY`를 Vercel 대시보드에서 설정해야 합니다.

## 🔧 문제 해결

### Python 스크립트 실행 시 pandas 오류

```bash
pip install --upgrade pandas numpy
```

### 카카오맵이 안 보이는 경우

1. `.env` 파일에 API 키가 올바르게 입력되었는지 확인
2. 카카오 개발자 콘솔에서 플랫폼 도메인이 설정되었는지 확인
3. 브라우저 콘솔(F12)에서 에러 메시지 확인

### npm install 오류

Node.js 버전 확인:

```bash
node --version  # 18.x 이상이어야 함
```

캐시 삭제 후 재시도:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 모바일 테스트

같은 네트워크의 모바일 기기에서 테스트하려면:

```bash
npm run dev -- --host
```

표시되는 로컬 IP 주소(예: `http://192.168.x.x:3000`)로 모바일에서 접속합니다.

## 🎯 주요 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `python scripts/process_marine_data.py` | 데이터 처리 |
| `python scripts/generate_demo_data.py` | 데모 데이터 생성 |
| `npm install` | 패키지 설치 |
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |

## 💡 팁

- 개발 중에는 핫 리로드가 자동으로 적용됩니다
- 로컬스토리지 데이터를 초기화하려면 브라우저 개발자 도구에서 Application > Local Storage > 해당 도메인 > 우클릭 > Clear 선택
- TypeScript 오류가 발생하면 VSCode에서 "TypeScript: Restart TS Server" 명령 실행

---

문제가 발생하면 GitHub Issues에 남겨주세요!
