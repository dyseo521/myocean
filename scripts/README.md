# 데이터 초기화 도구

## 웹 기반 초기화 도구 (권장)

Next.js 앱에서 다음 URL로 접근하세요:

```
http://localhost:3000/reset
```

이 방법을 사용하면 **같은 도메인에서 localStorage에 접근**할 수 있어 데이터를 제대로 확인하고 삭제할 수 있습니다.

## HTML 파일 사용 (참고용)

`reset-donations.html` 파일도 제공되지만, 이 파일을 파일 시스템에서 직접 열면 (file:/// 프로토콜) localhost:3000의 localStorage와 공유되지 않습니다.

HTML 파일을 사용하려면:

1. Next.js 개발 서버를 실행 (`npm run dev`)
2. 브라우저에서 `http://localhost:3000/reset-donations.html` 접근

## localStorage 키

- `myocean_donations`: 모든 기부 데이터
- `myocean_user`: 현재 로그인한 사용자 정보
