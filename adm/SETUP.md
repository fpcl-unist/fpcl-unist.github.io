# FPCL 관리자 화면 연결

현재 접속 주소는 `https://fpcl-unist.github.io/adm/`입니다. 나중에 학교 도메인을 연결하면 `https://flow.unist.ac.kr/adm/`으로 바뀝니다. 편집 화면과 데이터 변환 코드는 준비되어 있으나 **GitHub 저장소와 인증 서비스는 미연결** 상태입니다. `connection.json`이 비어 있으면 초기 연결 대기 안내가 표시됩니다.

## 1. 홈페이지 저장소 생성

현재 홈페이지 저장소 하나를 그대로 사용합니다. `adm/` 폴더도 그 안에 올립니다. 관리자 편집 대상은 `data/publications.js`, `data/proceedings.js`, `data/photos.js`, `data/members.js`, `data/highlights.js`입니다. 마지막 파일은 기존 메인 HTML에서 분리한 슬라이드 데이터로, 함께 업로드해야 합니다. 현재 `.github.io` 주소를 쓰는 동안에는 `CNAME` 파일을 업로드하지 않습니다.

관리자에게 해당 저장소의 Write 권한을 부여합니다. 로그인은 GitHub 계정으로 하며, 별도 홈페이지 비밀번호를 만드는 방식은 아닙니다. 여러 관리자가 같은 목록을 동시에 수정하지 않도록 합니다. 서버에서 충돌이 발생하면 새로 불러온 후 다시 편집합니다.

## 2. 로그인 인증 서비스 연결

GitHub Pages 자체는 서버 코드를 실행하지 않으므로 OAuth 인증을 처리할 별도 서비스가 필요합니다. 상시 CMS 서버나 DB 대신 Cloudflare Worker 형태의 인증 서비스를 사용할 수 있습니다.

호환되는 공개 구현: [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth). 해당 프로젝트의 배포 안내와 최신 설정을 따릅니다. Decap CMS와 호환되는 OAuth 응답 형식을 지원합니다.

1. 인증 프로젝트를 Cloudflare Workers에 배포하고 Worker URL을 확인합니다.
2. GitHub Settings → Developer settings → OAuth Apps에서 앱을 만듭니다.
   - Homepage URL: `https://fpcl-unist.github.io`
   - Authorization callback URL: `https://실제-인증주소/callback`
3. Worker 환경에 `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`을 설정합니다. Secret은 암호화된 비밀 변수로 저장합니다.
4. Worker의 `ALLOWED_DOMAINS`를 `fpcl-unist.github.io`로 제한합니다. 나중에 학교 도메인으로 변경할 때는 `flow.unist.ac.kr`로 변경합니다. 전환 기간 두 호스트를 함께 허용하려면 `fpcl-unist.github.io,flow.unist.ac.kr`처럼 쉼표로 구분합니다. `https://`나 `/adm/`은 넣지 않습니다.
5. 아래 연결 파일을 실제 값으로 채웁니다.

`adm/connection.json`:

```json
{
  "repo": "실제계정/실제저장소",
  "branch": "main",
  "base_url": "https://실제-인증주소"
}
```

`base_url`은 경로 없이 인증 서비스의 HTTPS origin을 넣습니다. `/auth`와 `/callback`은 인증 서비스가 처리합니다. Client Secret이나 접근 토큰은 이 파일이나 GitHub 저장소에 넣지 않습니다.

## 3. 실제 접속 및 저장 확인

1. GitHub Pages 배포 후 `/adm/`에 접속합니다. 학교 도메인 연결은 먼저 할 필요가 없습니다.
2. GitHub 로그인 후 People, Research Highlights, Publication, Proceeding, Photo 중 하나를 선택합니다.
3. 국내/국제 목록에서 항목을 펼쳐 수정하거나 추가·삭제·순서를 변경합니다.
4. Photo, People, Research Highlights에서 사진/GIF를 첨부할 수 있습니다. 새 파일은 `images/uploads/`에 저장됩니다. 기존 사진 경로는 그대로 사용합니다. 자동 리사이즈 기능은 없으므로 큰 사진은 업로드 전에 줄입니다. GIF는 원본을 업로드하면 애니메이션이 유지됩니다.
5. 게시/저장하면 GitHub에 커밋됩니다. GitHub Pages 배포가 완료되면 실제 홈페이지에서 확인합니다. 즉시 GitHub에 저장되지만 공개 화면은 배포 완료까지 시간이 걸립니다.

새 항목은 맨 위에 추가됩니다. 연도·날짜순 자동 정렬은 아니므로 순서를 직접 조절합니다. 메인 Photo에는 맨 위 3개 게시물의 날짜·제목이 표시됩니다. 목록에서 사진을 제거하는 것과 저장소의 원본 파일을 삭제하는 것은 별개입니다. 다른 게시물이 참조하는 사진을 미디어 라이브러리에서 삭제하지 않도록 합니다.

이 편집기는 파일 단위로 저장합니다. 여러 게시물 변경을 한 번에 저장하며, 개별 게시물 전용 URL이나 별도 DB는 만들지 않습니다.

People의 Student는 과정 선택값에 따라 Ph.D. → Combined M.S./Ph.D. → M.S. 구역에 표시됩니다. 과정 안의 순서는 목록에서 조절합니다. LG전자 일반장학생 표시도 유지할 수 있습니다. 졸업 처리 시 학생 목록에서 삭제하고 Alumni 목록에 새 항목을 추가한 뒤 한 번에 게시합니다. Professor 소개는 이번 관리 범위에 포함되지 않습니다.

Research Highlights에서는 제목, 이미지/GIF, 이미지 설명, 저자, 저널, 논문 정보를 편집합니다. 자동 전환 간격은 밀리초 단위이며 5000 = 5초, 10000 = 10초입니다. 2~60초 범위로 설정합니다. 이제 HTML의 `data-interval` 대신 `data/highlights.js`의 `highlightSettings.interval`을 사용합니다.

## 이번 관리자 확장 적용 파일

- `adm/` 폴더 전체 (비밀키는 포함하지 않음)
- `index.html`
- `data/highlights.js` (새 파일)
- `assets/site.js`
- `assets/highlights.js`

이전 작업의 `people/students.html`, `data/members.js`, `assets/style.css`, 메인 GIF 등을 아직 업로드하지 않았다면 함께 적용합니다. 최신 GitHub 사본과 비교한 뒤 업로드하여 온라인에서 수정한 내용을 덮어쓰지 않도록 합니다.

## 로컬 확인

홈페이지 폴더에서 `python3 -m http.server 8000`을 실행하고 `http://localhost:8000/adm/`을 엽니다. 미연결 상태에서는 연결 대기 안내를 볼 수 있습니다. 연결 후 관리 화면은 GitHub의 데이터를 읽고 저장하므로 로컬 폴더에 자동 반영되지는 않습니다. GitHub에서 변경한 내용을 나중에 내려받아 로컬 사본을 갱신합니다.

데이터 변환 검증: `node tools/test_admin.cjs`.

참고: [Decap GitHub backend / OAuth](https://decapcms.org/docs/backends-overview/), [사용자 정의 데이터 형식](https://decapcms.org/docs/editor-tooling/).
