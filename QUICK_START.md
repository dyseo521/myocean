# 🚀 마이오션 빠른 시작 가이드

## 단계별 실행 방법

### 1️⃣ 필요한 것 확인
- ✅ Node.js 18+ 설치되어 있나요?
- ✅ Python 3.8+ 설치되어 있나요?
- ✅ 카카오맵 API 키가 있나요? (없으면 https://developers.kakao.com/ 에서 발급)

### 2️⃣ 패키지 설치

**터미널에서 다음 명령어 실행:**

```bash
# 프로젝트 루트에서
cd frontend
npm install
```

### 3️⃣ 카카오맵 API 키 설정

```bash
# frontend/.env 파일 생성
echo "VITE_KAKAO_MAP_APP_KEY=여기에_실제_API_키_입력" > .env
```

또는 직접 `frontend/.env` 파일을 만들어 아래 내용 입력:
```
VITE_KAKAO_MAP_APP_KEY=your_kakao_map_api_key
```

### 4️⃣ 실행!

```bash
npm run dev
```

브라우저가 자동으로 열리면 성공! 🎉

## 📊 데모 데이터 추가 (선택)

앱이 실행된 상태에서 브라우저 콘솔(F12)에서:

```javascript
fetch('/demo-data.json').then(r=>r.json()).then(d=>{
  localStorage.setItem('myocean_donations', JSON.stringify(d.donations));
  location.reload();
});
```

## ⚠️ 문제 해결

### 지도가 안 보여요
→ `.env` 파일에 카카오맵 API 키가 제대로 입력되었는지 확인

### "핫스팟을 불러오는 중" 계속 보여요
→ `frontend/public/data/marine_hotspots.json` 파일이 있는지 확인
→ 없다면: `python scripts/process_marine_data.py` 실행

### npm install 오류
→ Node.js 버전 확인: `node -v` (18 이상이어야 함)
→ 캐시 삭제: `npm cache clean --force && npm install`

## 🎬 데모 시연 순서

1. **로그인**: 상단 우측(또는 하단)에서 이름 입력
2. **핫스팟 클릭**: 지도의 파란색/빨간색 원 클릭
3. **기부하기**: 금액 선택 → 위치 선택 → 기부 완료
4. **확인**: 지도에서 내 이름 찾기
5. **나의 바다**: 기부 내역 및 정화 진행률 확인
6. **랭킹**: 기부 랭킹 확인

---

더 자세한 내용은 [SETUP.md](SETUP.md) 참고
