# bichcheongmo

비청모 웹사이트 소스입니다. 정적 HTML, CSS, JavaScript로 구성되어 있으며 활동, 입장문, 회계 자료는 JSON 데이터와 Notion 동기화 스크립트로 관리합니다.

## 구성

- `index.html` 및 루트의 `*.html`: 주요 페이지
- `assets/css`: 스타일시트
- `assets/js`: 공통 UI, 데이터 렌더링, 라우팅 스크립트
- `assets/img`: 로고와 페이지 이미지
- `data`: 활동, 입장문, 회계 JSON 데이터
- `scripts`: Notion 동기화 및 GitHub Pages 배포 준비 스크립트

## 사용 방법

의존성을 설치합니다.

```bash
npm install
```

Notion 데이터를 갱신합니다.

```bash
npm run sync:activities
npm run sync:statements
npm run sync:payments
```

GitHub Pages 배포용 파일을 `_site` 디렉터리에 준비합니다.

```bash
npm run prepare-pages
```

## 배포

도메인은 `www.bichcheongmo.org`를 사용합니다. GitHub Pages 배포 전에는 `npm run prepare-pages`로 필요한 정적 파일만 `_site`에 복사합니다.

## 라이선스

이 프로젝트는 `GPL-3.0-or-later` 라이선스를 따릅니다. 자세한 내용은 `LICENSE`와 `THIRD_PARTY_NOTICES.md`를 확인하세요.
