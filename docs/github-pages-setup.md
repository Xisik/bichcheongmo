# GitHub Pages 설정 가이드

## 현재 상태

✅ **정적 사이트 구조 완료**
- `index.html`이 루트에 있음
- `activities.html`, `about.html`, `contact.html` 등 모든 페이지 준비됨
- `data/activities.json` 파일 생성됨

✅ **워크플로우 정리 완료**
- Pages Actions 워크플로우 없음 (충돌 없음)
- Notion 동기화 워크플로우만 존재

## GitHub Pages 설정 방법

### 1. 저장소 설정으로 이동

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭

### 2. Source 설정

**Source** 섹션에서 다음을 선택:

```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

### 3. 저장

**Save** 버튼 클릭

### 4. 배포 대기

⏱️ **30초 ~ 1분** 정도 기다리면 배포가 완료됩니다.

배포가 완료되면 다음과 같은 메시지가 표시됩니다:

```
✅ Your site is live at https://xisik.github.io/demo-repository/
```

## 접속 URL

설정이 완료되면 다음 URL로 접속할 수 있습니다:

- **메인 페이지**: `https://xisik.github.io/demo-repository/`
- **활동 페이지**: `https://xisik.github.io/demo-repository/activities.html`
- **단체 소개**: `https://xisik.github.io/demo-repository/about.html`
- **문의하기**: `https://xisik.github.io/demo-repository/contact.html`
- **데이터 파일**: `https://xisik.github.io/demo-repository/data/activities.json`

## 문제 해결

### "Upgrade or make this repository public to enable Pages" 메시지가 보이는 경우

**해결 방법:**
1. 저장소가 **Public**인지 확인
2. Settings → General → Danger Zone에서 저장소를 Public으로 변경
3. 또는 GitHub Pro/Team 계정으로 업그레이드

### 배포가 취소되는 경우

**원인:**
- Pages Actions 워크플로우와 브랜치 배포가 동시에 설정됨

**해결 방법:**
1. `.github/workflows/` 폴더에 `pages-build-deployment.yml` 같은 파일이 있는지 확인
2. 있다면 삭제
3. Settings → Pages에서 "Deploy from a branch"만 사용

### 404 에러가 발생하는 경우

**확인 사항:**
1. CNAME 파일이 루트에 있는지 확인 (있다면 삭제)
2. Pages 설정에서 올바른 브랜치와 폴더가 선택되었는지 확인
3. 배포가 완료되었는지 확인 (Settings → Pages에서 확인)

## 다음 단계

Pages 설정이 완료되면:

1. ✅ 사이트가 정상적으로 접속되는지 확인
2. ✅ `activities.html`에서 노션 데이터가 표시되는지 확인
3. ✅ Notion 동기화가 정상적으로 작동하는지 확인 (5분마다 자동 업데이트)

## 참고

- GitHub Pages는 **정적 사이트**만 지원합니다
- 서버 사이드 렌더링(SSR)은 불가능합니다
- 모든 데이터는 클라이언트 사이드에서 `fetch`로 가져와야 합니다
- 현재 구조는 이 요구사항을 완벽하게 만족합니다 ✅

