# FPCL 홈페이지 (flow.unist.ac.kr)

이 폴더 전체가 홈페이지예요. 폴더를 GitHub 저장소에 그대로 올리면 사이트가 열려요 (GitHub Pages). 빌드 도구나 프로그램 설치는 필요 없어요.

평소 업데이트는 `data` 폴더의 파일 몇 줄만 고치면 돼요. 논문, 학회 발표, 구성원, 사진이 모두 거기 있어요.

---

## 1. 처음 받았을 때 할 일 (순서대로)

1. **기존 사이트 그림 옮기기.** 아래 3번을 보세요. 기존 사이트(flow.unist.ac.kr)가 살아 있을 때 해야 해요.
2. **GitHub에 올리기.** 아래 6번.
3. **학교 전산팀에 도메인 연결 요청.** 아래 7번. 이 단계가 끝나면 flow.unist.ac.kr이 새 사이트로 바뀌고, 기존 사이트는 더 이상 이 주소로 열리지 않아요. 그래서 그림 옮기기를 꼭 먼저 해야 해요.
4. **확인이 필요한 내용 정리.** 아래 8번.

---

## 2. 폴더 구성

| 위치 | 내용 | 얼마나 자주 고치나 |
|---|---|---|
| `data/publications.js` | 저널 논문 (International, Domestic) | 논문이 나올 때마다 |
| `data/proceedings.js` | 학회 발표 (International, Domestic) | 학회 다녀올 때마다 |
| `data/members.js` | 학생, 연구원, 졸업생 | 학기마다 |
| `data/photos.js` | Photo 게시물 (메인 페이지에 최신 3개가 자동으로 나와요) | 행사 때마다 |
| `data/lectures.js` | 강의 목록 | 학기마다 |
| `data/home.js`, `data/highlights.js` | 메인 페이지 소개글과 Notice, Research Highlights 슬라이드 | 가끔 |
| `data/research/*.js` | 연구 소개 페이지 5개 (주제별 제목, 문단, 그림) | 가끔 |
| `research/overview.html` | 연구 분야 개요 (이 페이지만 HTML로 직접 고쳐요) | 가끔 |
| `data/professor.js` | 교수님 소개 (학력, 경력, 수상) | 가끔 |
| `data/equipment.js`, `data/links.js` | 장비, 링크 | 드물게 |
| `assets/site.js` | 상단 메뉴, 하단 연락처, 목록 그리는 코드 | 메뉴를 바꿀 때만 |
| `assets/style.css` | 디자인 (색, 글꼴, 간격) | 거의 안 고침 |
| `images/` | 모든 그림 | 그림 추가할 때 |
| `tools/` | 기존 사이트 그림 목록과 내려받기 스크립트 | 처음 한 번 |
| `CNAME`, `.nojekyll` | GitHub Pages 설정 파일 (지우면 안 돼요) | 안 고침 |

---

## 3. 기존 사이트 그림 옮기기 (처음 한 번)

새 사이트의 글과 목록은 모두 옮겨져 있고, 그림만 비어 있어요. 그림이 아직 없는 자리에는 회색 상자에 "그림 추가 필요"와 파일 이름이 보여요. 그 이름 그대로 파일을 넣으면 상자가 그림으로 바뀌어요.

- 필요한 그림 176개의 목록은 `tools/image_list.csv`에 있어요 (엑셀로 열려요). `file`이 새 사이트에서의 위치, `source_url`이 기존 사이트 주소예요.
- 한 번에 받으려면, 이 폴더(index.html이 있는 곳)에서 아래 명령을 실행하세요. 이미 받은 그림은 건너뛰니까 여러 번 실행해도 돼요.

```
python tools/fetch_images.py
```

- Photo 게시판 사진(원본이 5712 px 정도로 커요)은 Pillow가 있으면 가로 1600 px로 자동으로 줄여요. 먼저 `pip install pillow`를 해 두세요.
- 연구 페이지의 GIF 애니메이션 중에는 15 MB 가까운 것도 있어요. 페이지가 느리면 MP4로 바꾸거나 크기를 줄이는 걸 고려하세요.
- 메인 페이지 그림 7개(`images/main/`)는 이미 들어 있어요.

---

## 4. 자주 하는 업데이트

**관리 화면 사용:** `https://flow.unist.ac.kr/adm/`에서 GitHub 로그인 후 메인 소개글·공지, Research Highlights, Research, People(교수·구성원), Publication, Proceeding, Photo, Lectures, Equipment, Link를 폼으로 편집할 수 있습니다. `/admin`으로 들어가도 같은 화면이 열립니다. 최초 연결 방법은 [adm/SETUP.md](adm/SETUP.md)를 보세요. 연결 후에는 아래처럼 `.js` 파일을 직접 고칠 필요 없이 관리 화면에서 게시하면 됩니다. 공개 사이트 반영까지는 GitHub Pages 배포 시간이 필요합니다. Research Overview 페이지만 HTML 파일을 직접 고칩니다.

**사이트 화면에서 바로 고치기:** `/admin`에서 한 번 로그인하면, 같은 브라우저로 홈페이지를 열었을 때 아래쪽에 "✎ 편집" 버튼이 생겨요(방문자에게는 보이지 않아요). 누르면 글자를 클릭해 바로 고치고, 사진을 클릭해 바꾸고, 항목에 마우스를 올리면 나오는 작은 막대로 위·아래 이동, 복제, 추가, 세부 정보(링크·날짜·사진 설명 등), 삭제를 할 수 있어요. 다 고친 뒤 "저장"을 누르면 GitHub에 올라가고 1~2분 뒤 사이트에 반영돼요. 저장 전에 다른 곳에서 같은 파일을 먼저 고쳤으면 덮어쓸지 물어봐요. 코드는 `assets/edit.js`예요.

모든 data 파일은 같은 모양이에요. **블록 `{ ... },` 하나를 복사해서 붙여 넣고 글자만 바꾸면 돼요.** 파일 맨 위 주석에 각 칸의 뜻이 적혀 있어요.

### 논문 추가 (`data/publications.js`)

목록 맨 위(`FPCL.journalsInternational = [` 바로 아래)에 붙여 넣어요. 번호 [n]은 자동으로 매겨져요.

```js
  {
    group: "2026",
    authors: "J.Jeon, J.H.Lee* & C.-J.Kim*",
    title: "Paper title here",
    journal: "Journal of Fluid Mechanics",
    details: "Vol. 1000, A1, 2026",
    link: "https://doi.org/10.xxxx/xxxxx"
  },
```

- `group`은 논문이 들어갈 제목(연도)이에요. 새 연도를 쓰면 그 제목이 자동으로 생겨요.
- `J.H.Lee`는 자동으로 굵게 표시돼요.
- `link`가 없으면 그 줄을 지우세요.
- 국내 논문은 같은 파일의 `FPCL.journalsDomestic` 목록이에요.

### 학회 발표 추가 (`data/proceedings.js`)

논문과 똑같아요. `journal` 칸에 학회 이름, `details` 칸에 장소와 날짜를 써요.

### 구성원 추가, 졸업 (`data/members.js`)

- 신입생은 `FPCL.students` 목록에 블록을 추가하고, 증명사진을 `images/people/이름.jpg`로 넣어요 (세로 사진, 비율 약 3대4).
- 졸업생은 `FPCL.students`에서 그 블록을 지우고, `FPCL.alumni` 목록 맨 위에 아래 모양으로 추가해요.

```js
  {
    name: "Gil Dong Hong",
    degree: "M.S. Degree",
    period: "Mar. 2024 - Feb. 2026",
    now: "LG Electronics"
  },
```

### 사진 게시 (`data/photos.js`)

1. 사진을 `images/photo/2026-11-20/` 같은 날짜 폴더에 넣어요 (`1.jpg`, `2.jpg`, ...). 가로 1600 px 정도로 줄여서 넣는 게 좋아요.
2. `FPCL.photos` 목록 맨 위에 블록을 추가해요.

```js
  {
    date: "2026-11-20",
    title: "2026 KSV Fall Conference",
    text: "Daejeon, Korea, November 18-20",
    images: [
      "images/photo/2026-11-20/1.jpg",
      "images/photo/2026-11-20/2.jpg"
    ]
  },
```

메인 페이지의 Photo 칸에는 맨 위 3개가 자동으로 나와요.

### 강의 추가 (`data/lectures.js`)

관리 화면의 Lectures에서 학기를 추가하거나, 파일에서 `{ ... },` 블록 하나를 복사해 맨 위에 붙여 넣어요.

### 메뉴, 하단 연락처 변경 (`assets/site.js`)

파일 맨 위의 `MENU`와 `FOOTER`만 고치면 모든 페이지에 한 번에 반영돼요. 새 페이지를 만들 때는 비슷한 페이지 하나를 복사해서 가운데 내용만 바꾸고, `MENU`에 한 줄 추가해요.

### 연구, 장비, 교수님, 링크, 메인 소개글·공지

관리 화면(`/admin`)에서 고치는 것이 가장 쉬워요. 파일로 고칠 때는 `data/research/*.js`(연구 페이지, 주제 하나가 `{ title, blocks }` 한 덩어리), `data/equipment.js`, `data/professor.js`, `data/links.js`, `data/home.js`를 열어요. Research Overview만 `research/overview.html`을 직접 고쳐요.

---

## 5. 고친 뒤 확인하기

- `index.html`을 더블클릭하면 인터넷 없이 브라우저에서 바로 열려요. 고친 페이지를 열어 보고 올리세요.
- data 파일을 고쳤는데 목록이 통째로 안 나오면, 대부분 쉼표나 따옴표가 빠진 거예요. 블록 사이의 `},`와 각 줄 끝의 `,`, 그리고 글자를 감싸는 `"..."`를 확인하세요. 브라우저에서 F12를 누르고 Console 탭을 보면 몇 번째 줄이 문제인지 나와요.

---

## 6. GitHub에 올리기 (GitHub Pages)

1. 연구실 GitHub 계정(또는 Organization)을 만들어요. 예를 들어 `fpcl-unist`.
2. 저장소(repository)를 `fpcl-unist.github.io` 이름으로 만들어요 (계정 이름 + `.github.io`). HMCL 홈페이지(hmcl-unist.github.io)도 이 방식이에요.
3. 이 폴더 안의 모든 파일을 저장소에 올려요. `.nojekyll`, `CNAME` 같은 점으로 시작하는 파일도 같이 올라가야 해요.
4. 저장소 Settings 메뉴의 Pages에서 Source를 "Deploy from a branch", Branch를 `main`, 폴더를 `/ (root)`로 정하고 저장해요.
5. 1~2분 뒤 `https://fpcl-unist.github.io`에서 사이트가 열리는지 확인해요.
6. 같은 Pages 화면의 Custom domain 칸에 `flow.unist.ac.kr`을 넣고 저장해요. 7번(학교 DNS 설정)이 끝난 뒤 "Enforce HTTPS"를 켜요.

이후에는 파일을 고쳐서 저장소에 올리기만 하면 1~2분 안에 사이트에 반영돼요. GitHub 웹사이트에서 파일을 직접 열어 고치고 Commit해도 돼요.

참고. [GitHub Docs, Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

---

## 7. 도메인 연결 (학교 전산팀 요청)

flow.unist.ac.kr은 unist.ac.kr의 하위 도메인이라 DNS 설정은 학교 전산 담당 부서가 해요. 아래 내용으로 요청하면 돼요.

> 기계공학과 Jae Hwa Lee 교수님 연구실(FPCL) 홈페이지를 GitHub Pages로 옮기려고 합니다.
> flow.unist.ac.kr의 DNS를 아래처럼 바꿔 주실 수 있을까요?
> 레코드 종류 CNAME, 이름 flow.unist.ac.kr, 값 fpcl-unist.github.io (실제 계정 이름으로 바꿔서)
> 기존 A 레코드가 있으면 삭제가 필요합니다.

- 바뀐 뒤에는 기존 그누보드 사이트가 이 주소로 열리지 않아요. 3번 그림 옮기기를 반드시 먼저 끝내세요.
- 바뀐 설정이 퍼지는 데 몇 시간에서 하루쯤 걸릴 수 있어요.

---

## 8. 확인이 필요한 내용 (기존 사이트 그대로 옮긴 것)

새로 쓴 글은 없어요. 아래는 기존 사이트에 원래 있던 것인데, 교수님께 여쭤보고 정리하면 좋아요.

- **제목만 있고 설명이 없는 연구 주제 4개.** Temporally Decelerating Turbulent Pipe Flow, Shock-Turbulence Interaction in a Turbulent Channel Flow (`data/research/turbulent-flow.js`), Compressible Flow, Interface-Sharpening Procedure for Incompressible Multi-Phase Flows (`data/research/numerical-methods.js`).
- **오래된 링크.** `data/links.js`의 Web of Knowledge 주소는 오류 페이지 주소로 저장되어 있고, Conference 항목 4개는 2015~2017년 행사예요.
- **메인 페이지에서 새로 정한 것.** 단체 사진은 Photo 게시판의 "2026년 스승의 날" 사진을 잘랐고, 한 줄 소개 "Understanding, predicting and controlling flows"는 About FPCL 글에 있는 구절이에요. Research Highlights 6편은 기존 메인 페이지의 6편이에요.
