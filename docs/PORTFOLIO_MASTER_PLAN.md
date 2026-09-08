# 게임 기획자 포트폴리오 사이트 — 마스터 구축 플랜

> **문서 유형**: AI 에이전트 실행용 상세 명세서 (Machine-readable Specification)
> **버전**: 1.0
> **작성일**: 2026-09-08
> **대상 저장소**: `2Khaz/PORTFOLIO`
> **레퍼런스**: `https://neip2202-oss.github.io/portfolio_googleai/?company=sample`
> **동반 문서**: `docs/포트폴리오_구축_기획서.docx` (사람이 읽는 시각화 요약본)

---

## 0. 이 문서의 사용법 (AI 에이전트 지침)

### 0.1 문서의 성격

이 문서는 **사람이 읽고 감을 잡는 용도가 아니라, AI 코딩 에이전트가 읽고 그대로 구현할 수 있도록** 작성되었습니다. 따라서 다음 규칙을 따릅니다.

- 모든 데이터 구조는 **TypeScript 타입 또는 JSON 스키마**로 명시합니다.
- 모든 기능은 **`F-XX` 식별자 + 수용 기준(Acceptance Criteria)**을 가집니다.
- 모든 작업은 **`T-XX` 식별자 + 산출물 + 완료 정의(DoD)**를 가집니다.
- 추측이 필요한 부분은 `TODO(사용자확인):` 으로 명시적으로 표시합니다.

### 0.2 에이전트가 지켜야 할 규칙

| 규칙 | 내용 |
| --- | --- |
| R-1 | §4의 콘텐츠 스키마는 **단일 진실 공급원(SSOT)** 이다. 임의로 필드를 추가/삭제하지 않는다. |
| R-2 | §7의 기능 스펙에 없는 기능은 구현하지 않는다. 필요하다고 판단되면 문서에 제안만 추가한다. |
| R-3 | 시크릿(API 키, 비밀번호)은 **어떤 경우에도 클라이언트 번들에 포함하지 않는다.** |
| R-4 | 각 Phase 종료 시 §9의 품질 게이트를 통과해야 다음 Phase로 진행한다. |
| R-5 | 콘텐츠 편집은 Git 커밋으로 이루어진다. 런타임 DB 쓰기 경로를 만들지 않는다. (§3.2 확정 사항) |
| R-6 | 레퍼런스 사이트의 **코드를 복사하지 않는다.** 구조와 아이디어만 계승하고 구현은 새로 작성한다. |

### 0.3 확정된 사용자 결정 사항

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 직군 | **게임 기획자** (레퍼런스와 동일 도메인) | 사용자 확인 |
| 기술 스택 | **미정** — §3.1 비교표 검토 후 결정 | 사용자 확인 |
| CMS 방식 | **Git 기반 (MDX/JSON 파일 + 커밋)** | 사용자 확인 |

---

## 1. 레퍼런스 사이트 분석

### 1.1 분석 방법 및 신뢰도

| 항목 | 내용 |
| --- | --- |
| 분석 대상 | `neip2202-oss/portfolio_googleai` 저장소 `main` 브랜치 (GitHub Pages 배포 원본) |
| 분석 방법 | 소스 코드 정적 분석 (렌더링된 DOM 분석 아님) |
| 확인된 커밋 | `main` HEAD (`037ee04`) |
| 신뢰도 | **높음** — 배포 워크플로(`.github/workflows/deploy.yml`)가 `main` 푸시 시 `npm run build` → `dist` 업로드로 확인됨 |
| 미확인 영역 | Supabase `site_content` 테이블의 **실제 저장 데이터** (원격 DB 내용). 코드상 기본값만 확인 가능 |

> **참고**: 저장소에는 `main`과 `feature/design-update` 두 브랜치가 존재하며 내용이 완전히 다릅니다.
> - `main` = **현재 배포 중인 버전** (본 문서의 분석 대상). 흰 배경의 모던 이력서형 SPA.
> - `feature/design-update` = 픽셀아트 게임형 프로토타입 (`SOLIP'S WORLD`, 마을 맵 허브 + 캐릭터 이동). 배포되지 않음.
>
> 즉 원작자는 "게임형 인터랙션" 버전을 만들었다가 **정보 전달력이 높은 문서형 SPA로 회귀**한 이력이 있습니다. 이는 우리 설계에 중요한 힌트입니다 (§2.2 원칙 P-1).

### 1.2 정보 구조 (IA)

```
Root (SPA, 단일 페이지 — 실제 라우터 없음)
│
├── [Tab] about            ← 기본 진입점, 랜딩
│   ├── #hero              Hero + 4개 지표(stat) 카드
│   ├── #process           "How I Work" — 6단계 업무 프로세스 카드
│   ├── #archive           "Gamer's Archive" — 플레이 기록 요약 (PC/Mobile/Console 필터)
│   └── #portfolio         "Featured" — 대표 프로젝트 (isFeatured=true만)
│
├── [Tab] resume
│   ├── [SubTab] cv            이력서 (인적사항/기술스택/타임라인/대외활동/자격증)
│   └── [SubTab] cover-letter  자기소개서 (문항별 아코디언 + 우측 앵커 내비)
│
├── [Tab] portfolio
│   ├── [Filter] main      메인 프로젝트 (projectsData)
│   ├── [Filter] plan      기획서 (planData)
│   └── [Filter] other     AI & 툴링 (otherWorksData)
│
├── [Tab] project-detail   프로젝트 상세 뷰어 (썸네일/영상/슬라이드/문서 + 마크다운 본문)
│
└── [Tab] play-history     플레이 기록 전체 (레이더 차트 + 파이 차트 + 필터 목록)
```

### 1.3 URL 파라미터 계약

레퍼런스는 라우터 없이 **쿼리 파라미터로 초기 상태만 복원**합니다.

| 파라미터 | 허용값 | 동작 | 코드 위치 |
| --- | --- | --- | --- |
| `tab` | `about` \| `resume` \| `portfolio` \| `play-history` \| `project-detail` | 초기 탭 결정 | `App.tsx:236-245` |
| `filter` | `main` \| `plan` \| `other` | 포트폴리오 초기 필터 | `App.tsx:248-257` |
| `company` | 임의 문자열 (소문자 변환) | **기업별 콘텐츠 오버레이 선택** | `App.tsx:310-317` |

> `?company=sample` 은 "sample"이라는 기업 전용 콘텐츠 레이어를 활성화합니다. 이것이 레퍼런스의 **가장 독창적인 기능**입니다.

**한계**: 파라미터는 초기 상태만 복원하고 이후 탭 이동 시 URL이 갱신되지 않습니다(`company` 전환 제외). 따라서 **딥링크·뒤로가기·공유가 사실상 동작하지 않습니다.**

### 1.4 기업별 커스터마이징 메커니즘 (핵심 기능)

레퍼런스에서 가장 배울 만한 설계입니다. 채용 공고마다 다른 버전의 포트폴리오를 보여줄 수 있습니다.

```
스토리지 키 규칙 (useContent.ts:53)
  companyId === 'default'  →  key                       예: "projectsData"
  companyId !== 'default'  →  `${key}_${companyId}`      예: "projectsData_nexon"

병합 규칙 (useContent.ts:100-117)
  1. 기본 레이어 로드:     site_content[key]
  2. 기업 레이어 로드:     site_content[`${key}_${companyId}`]
  3. deepMerge(기본, 기업) → 기업 레이어가 있는 필드만 덮어씀
```

- **deepMerge 동작**: 객체는 키 단위 재귀 병합, **배열은 통째로 교체** (`useContent.ts:14-16`).
- **운영 흐름**: 관리자가 플로팅 패널에서 `새 기업 추가` → `nexon` 입력 → URL이 `?company=nexon`으로 전환 → 해당 상태에서 편집하면 `_nexon` 접미사 키로만 저장 → 전용 링크 복사해서 지원 시 제출.
- **`[기본 데이터 불러오기]` 버튼** (`handleSyncToDefault`, `App.tsx:343-377`): 기업 레이어를 기본 레이어 값으로 되돌리는 리셋 기능. 탭 단위로 동작.

### 1.5 데이터 모델 (레퍼런스 실측)

모든 콘텐츠는 Supabase의 단일 테이블 `site_content`에 **key-value(JSONB)** 형태로 저장됩니다.

```sql
-- 추정 스키마
site_content (
  key         text primary key,   -- 예: 'projectsData', 'aboutData_nexon'
  value       jsonb,
  updated_at  timestamptz
)
```

**확인된 콘텐츠 키 전체 목록** (`App.tsx` grep 결과):

| 키 | 타입 | 기업별 오버레이 | 용도 |
| --- | --- | --- | --- |
| `companyList` | `string[]` | ✗ (전역) | 생성된 기업 ID 목록 |
| `siteVisibility` | `boolean` | ✓ | 사이트 공개/비공개 토글 |
| `profileData` | `object` | ✓ | 이름/생년월일/주소/연락처/이메일 |
| `aboutData` | `object` | ✓ | Hero 타이틀 2줄 + 설명 + 지표 4쌍 |
| `workProcessData` | `array` | ✓ | 6단계 업무 프로세스 |
| `projectsData` | `array` | ✓ | 메인 프로젝트 |
| `otherWorksData` | `array` | ✓ | AI & 툴링 / 역기획서 |
| `planData` | `array` | ✓ | 기획서 |
| `playHistoryData` | `array` | ✓ | 게임 플레이 기록 |
| `timelineLeftData` | `array` | ✓ | 경력/학력 타임라인 |
| `activitiesLeftData` | `array` | ✓ | 대외활동 (좌) |
| `activitiesRightData` | `array` | ✓ | 대외활동 (우) |
| `coverLetterData` | `array` | ✓ | 자기소개서 문항 |
| `workTools` / `collabTools` / `engineTools` / `designTools` / `aiTools` | `array` | ✗ | 툴 스택 5분류 |
| `certifications` | `array` | ✗ | 자격증 |
| `sectionIcons` | `object` | ✗ | 섹션 헤더 커스텀 아이콘 |

**주요 엔티티 형태** (기본값에서 역산):

```ts
// projectsData[]
{
  id: number;
  genre: string;              // "캐주얼 액션 레이싱"
  title: string;
  role: string[];             // ["PD", "PM", "차량(성장) 기획", ...]
  desc: string;
  outcome?: string;           // "난이도 밸런싱 최적화로 초기 이탈률 15% 방어"
  isFeatured: boolean;        // About 탭 노출 여부
  imgColor: string;           // Tailwind 클래스 "bg-blue-200"
  links: string[];            // ["Google Play", "Steam"]  ← 라벨만, URL 없음
  markdown: string;           // 상세 본문 (커스텀 마크다운)
  media: {
    thumbnail: string;        // URL 또는 data:URI
    video: string;            // YouTube URL
    slides: string[];         // 5칸 고정 배열
  };
}

// playHistoryData[]
{ id: number; platform: 'PC'|'Mobile'|'Console'; title: string; genre: string; hours: string; image?: string; iconUrl?: string; }

// timelineLeftData[]
{ id: number; type: 'career'|'education'; year: string; title: string; subtitle: string; desc: string; }

// coverLetterData[]
{ id: number; title: string; content: string; }
```

### 1.6 데이터 동기화 알고리즘 (`useContent` 훅)

레퍼런스에서 **가장 잘 만들어진 부분**입니다. SWR(Stale-While-Revalidate) 패턴을 직접 구현했습니다.

```
[읽기 경로]
1. localStorage `cache_${storageKey}` 즉시 렌더  → 백지 화면 방지
2. 서버에 updated_at 만 조회 (경량 요청)
3. 로컬 updated_at >= 서버 updated_at 이면 → 다운로드 생략 (조기 반환)
4. 아니면 기본 레이어 + 기업 레이어 풀 다운로드 → deepMerge → setState
5. localStorage 캐시 갱신 (QuotaExceededError try/catch 처리)
6. 실패 시 → 캐시 폴백 + 'app-network-status' 이벤트로 OFFLINE 배지 표시

[쓰기 경로]
1. safeSerialize()로 React 엘리먼트/함수 제거
2. 서버 upsert 먼저 (Prefer: resolution=merge-duplicates)
3. 서버 성공 시에만 localStorage 갱신 → 데이터 무결성 확보
4. UI는 낙관적 업데이트(Optimistic UI)
```

**계승할 아이디어**: `updated_at` 선조회로 대역폭을 아끼는 패턴, 서버 성공 후에만 캐시 갱신하는 순서.
**버릴 것**: `window.dispatchEvent`로 컴포넌트 간 통신하는 방식 (§1.9 W-6).

### 1.7 편집 시스템

| 기능 | 구현 방식 | 코드 위치 |
| --- | --- | --- |
| 인라인 편집 | `EditableText` 컴포넌트가 `isAdmin`에 따라 `<span>` ↔ `<input>/<textarea>` 전환 | `App.tsx:72-93` |
| 순서 변경 | `@dnd-kit` — 프로젝트/자기소개서/플레이기록/기획서 각각 별도 핸들러 | `App.tsx:521-581` |
| 이미지 업로드 | FileReader → `<canvas>` 리사이즈(최대 1200px) → **WebP 60% 압축** → Supabase Storage 업로드 → 실패 시 base64 폴백 | `App.tsx:140-212` |
| 외부 임베드 | YouTube / Google Drive / Slides / Sheets URL을 embed URL로 정규화 | `App.tsx:8-38` |
| PDF 출력 | `isPreviewingPdf`로 관리자 UI 숨김 → 500ms 후 `window.print()` → 복원 | `App.tsx:394-402` |
| 게임 아이콘 자동수집 | 네이버 게임 라운지 API를 `api.allorigins.win` CORS 프록시로 우회 호출, 이름 정확 매칭만 채택 | `utils/gameIcon.ts` |
| 공개/비공개 | `siteVisibility=false` 시 잠금 화면 + 메일 CTA 노출 | `App.tsx:2727-2752` |

### 1.8 커스텀 마크다운 문법

레퍼런스는 `react-markdown`을 의존성에 넣어두고도 **정규식 기반 자체 렌더러**를 씁니다 (`MarkdownRenderer`, `App.tsx:95-138`).

| 문법 | 결과 |
| --- | --- |
| `:::grid` ... `:::` (내부에 `[제목] 내용` 줄 반복) | 반응형 카드 그리드 (1/2/4열) |
| `### 제목` | h3 + 하단 보더 |
| `> 인용` (연속 줄 병합) | 좌측 강조 바 인용 블록 |
| `**굵게**` | 진한 회색 강조 |
| `(bc)텍스트(/bc)` | 에메랄드 컬러 강조 (브랜드 컬러) |
| `==하이라이트==` | 형광펜 밑줄 배경 |
| `- 항목` | 불릿 리스트 |
| `![alt](url)` / `[text](url)` | 이미지 / 링크 |

> **치명적 문제**: 이 렌더러는 `dangerouslySetInnerHTML`을 사용하면서 **입력 이스케이프를 하지 않습니다.** (`EditableText`의 읽기 전용 경로는 이스케이프하지만, `MarkdownRenderer`는 하지 않음.) DB에 쓰기 권한이 개방된 상태(§1.10 W-1)와 결합하면 **저장형 XSS(Stored XSS)** 가 성립합니다.

### 1.9 기술 스택 인벤토리

| 계층 | 레퍼런스 선택 |
| --- | --- |
| 빌드 | Vite 6 |
| UI | React 19 (단일 `App.tsx` **2,967줄**) |
| 스타일 | Tailwind CSS 4 + 커스텀 CSS 변수 토큰 (`tokens.css`) |
| 아이콘 | lucide-react |
| 차트 | Recharts (RadarChart, PieChart) |
| DnD | @dnd-kit (core / sortable / utilities) |
| 애니메이션 | motion (Framer Motion 후속) |
| 폰트 | SUIT(제목) + Pretendard(본문) + Montserrat(액센트) — 모두 CDN `@import` |
| 백엔드 | Supabase REST (PostgREST) + Supabase Storage |
| 배포 | GitHub Actions → GitHub Pages |

### 1.10 강점 — 계승할 것

| ID | 강점 | 우리 사이트에서의 계승 방식 |
| --- | --- | --- |
| S-1 | **기업별 콘텐츠 오버레이** (`?company=`) | Git 기반으로 재설계 (§5). 채용 담당자별 맞춤 링크는 강력한 차별점 |
| S-2 | **SWR + updated_at 선조회** 캐시 전략 | 정적 사이트에서는 CDN 캐시로 자연 해결. 아이디어만 참고 |
| S-3 | **프로젝트 상세의 멀티미디어 뷰어** (썸네일/영상/슬라이드/PDF 탭) | 그대로 계승. 기획자 포트폴리오의 핵심 UX |
| S-4 | **`:::grid` 같은 저작 친화 커스텀 문법** | MDX 컴포넌트로 승격 (`<Grid>`, `<Highlight>`) — 안전하면서 더 강력 |
| S-5 | **공개/비공개 토글 + 잠금 화면** | 링크 만료(TTL) 기능으로 확장 |
| S-6 | **PDF 출력용 print 스타일 분리** (`print:hidden`) | 계승 + 전용 인쇄 레이아웃 추가 |
| S-7 | **정량 성과 중심 서술** (`outcome` 필드: "이탈률 15% 방어") | 스키마에서 **필수 필드로 승격** — 기획자 포폴의 설득력 핵심 |
| S-8 | **업무 프로세스 6단계 시각화** | "일하는 방식"을 보여주는 건 기획 직군에서 매우 효과적. 계승 |

### 1.11 약점 — 반드시 개선할 것

| ID | 심각도 | 문제 | 근거 | 개선 방향 |
| --- | --- | --- | --- | --- |
| **W-1** | 🔴 치명 | **인증이 클라이언트에만 존재** — 관리자 비밀번호가 JS 번들에 평문 하드코딩(`App.tsx:434`). 누구나 번들을 열면 확인 가능 | `if (adminPwd === '<하드코딩 값>')` | Git 기반 CMS로 **인증 개념 자체를 제거**. 편집 권한 = 저장소 write 권한 |
| **W-2** | 🔴 치명 | **DB 쓰기가 anon 키로 개방** — `anon` 키가 번들에 노출된 상태에서 `site_content` upsert를 수행. RLS가 없다면 **제3자가 포트폴리오 내용을 임의 변조 가능** | `utils/supabase.ts:5-21`, `useContent.ts:165-169` | 런타임 DB 쓰기 경로 제거 |
| **W-3** | 🟠 높음 | **저장형 XSS 가능** | `MarkdownRenderer`가 이스케이프 없이 `dangerouslySetInnerHTML` (§1.8) | MDX 빌드타임 컴파일 → 런타임 HTML 주입 없음 |
| **W-4** | 🟠 높음 | **SEO 부재** — CSR 전용, 메타 태그는 `index.html`의 정적 `<title>` 하나 뿐, OG 이미지·구조화 데이터·sitemap·robots 모두 없음 | `index.html` 16줄 | SSG + 페이지별 메타 + JSON-LD + OG 이미지 자동 생성 |
| **W-5** | 🟠 높음 | **URL이 상태를 반영하지 않음** — 탭 이동 시 URL 미갱신 → 딥링크/뒤로가기/공유 불가 | `handleNavClick`이 히스토리 미조작 | 파일 기반 라우팅으로 모든 화면에 고유 URL 부여 |
| **W-6** | 🟡 중간 | **유지보수 불가능한 단일 파일** — `App.tsx` 2,967줄, 20개 이상의 `useState`, `window.dispatchEvent`로 컴포넌트 통신 | `wc -l src/App.tsx` | 기능별 컴포넌트 분리 + 스키마 검증 레이어 |
| **W-7** | 🟡 중간 | **저장소 위생 불량** — `fix.js`, `fixSync2.js`, `injectUI3.js` 등 **일회성 패치 스크립트 14개**가 루트에 커밋됨. `test.json`(0바이트)도 존재 | 저장소 루트 | `.gitignore` + 스크립트는 `scripts/`로, 일회성은 커밋 금지 |
| **W-8** | 🟡 중간 | **base64 이미지 폴백이 DB에 인라인 저장** — Storage 업로드 실패 시 data:URI가 JSONB에 그대로 들어가 로우가 비대해지고 localStorage 5MB 쿼터를 압박 | `App.tsx:190-193`, `useContent.ts:127` | 이미지는 저장소 파일 + 빌드타임 최적화 |
| **W-9** | 🟡 중간 | **외부 CORS 프록시 의존** — 게임 아이콘 수집이 `api.allorigins.win`(제3자 무료 서비스)에 의존. 서비스 중단 시 기능 정지, 프라이버시 우려 | `utils/gameIcon.ts` | 빌드타임 스크립트로 아이콘 1회 수집 → 저장소에 커밋 |
| **W-10** | 🟡 중간 | **접근성 미고려** — 시맨틱 랜드마크 부족, `<button>` 남용, 포커스 관리 없음, 모달에 focus trap 없음, 차트에 대체 텍스트 없음 | 전반 | WCAG 2.1 AA 목표 (§9) |
| **W-11** | 🟢 낮음 | **폰트 3종을 CDN `@import`로 로드** — 렌더 블로킹 + FOUT + 외부 의존 | `global.css:5-7` | self-host + `font-display: swap` + subset |
| **W-12** | 🟢 낮음 | **모바일 내비 없음** — `hidden md:flex`로 데스크톱 전용 메뉴. 모바일에서 탭 이동 불가 | `App.tsx:2681` | 모바일 우선 내비 필수 |
| **W-13** | 🟢 낮음 | **고정 5칸 슬라이드 배열** — `slides: ['','','','','']` 하드코딩 | `App.tsx:478` | 가변 길이 배열 |

---

## 2. 목표 정의

### 2.1 사이트의 목적과 성공 지표

| 항목 | 정의 |
| --- | --- |
| **1차 목표** | 게임 회사 채용 담당자가 **3분 안에** "이 사람을 면접에 부를지" 판단할 수 있게 한다 |
| **2차 목표** | 지원 회사별로 **강조점이 다른 버전**을 링크 하나로 제공한다 |
| **3차 목표** | 포트폴리오 자체가 **기획 역량의 증거**가 되게 한다 (정보 구조 설계 능력 시연) |

**측정 가능한 성공 지표 (KPI)**

| KPI | 목표값 | 측정 방법 |
| --- | --- | --- |
| Lighthouse Performance | ≥ 95 (모바일) | CI에서 자동 측정 |
| Lighthouse Accessibility | ≥ 95 | CI |
| Lighthouse SEO | 100 | CI |
| LCP | < 1.8s (모바일 4G) | CI / Real User Monitoring |
| 초기 JS 번들 | < 120KB (gzip) | 빌드 리포트 |
| 대표 프로젝트 도달까지 클릭 수 | ≤ 1 | 설계 검증 |
| 이력서 PDF 다운로드 | 1클릭 | 수동 테스트 |

### 2.2 설계 원칙

| ID | 원칙 | 의미 |
| --- | --- | --- |
| **P-1** | **정보 전달 > 연출** | 레퍼런스 원작자가 픽셀아트 게임형에서 문서형으로 회귀한 이유. 인터랙션은 정보를 돕는 선에서만 |
| **P-2** | **모든 주장에 증거** | 모든 프로젝트는 `outcome`(정량 성과)과 `evidence`(문서/영상/링크)를 필수로 가진다 |
| **P-3** | **URL = 상태** | 모든 화면·필터·프로젝트는 고유 URL을 가진다. 공유 가능해야 한다 |
| **P-4** | **콘텐츠와 코드의 분리** | 글을 고치는 데 코드를 몰라도 되게 한다 (MDX + JSON) |
| **P-5** | **빌드타임에 할 수 있는 일은 런타임에 하지 않는다** | 성능·보안·안정성이 동시에 해결된다 |
| **P-6** | **모바일 우선** | 채용 담당자는 상당수가 모바일로 먼저 연다 |
| **P-7** | **점진적 향상** | JS가 실패해도 콘텐츠는 읽힌다 |

### 2.3 레퍼런스 대비 차별화 포인트

| # | 차별화 | 설명 |
| --- | --- | --- |
| D-1 | **타깃 링크 v2** | `?company=` 를 계승하되 Git 기반으로. + 열람 로그 없이도 만료(TTL) 표시, 담당자 이름 인사말, 우선순위 재정렬 |
| D-2 | **기획 문서 뷰어** | 기획자 포폴의 본체는 "문서". PDF/슬라이드를 URL 앵커까지 지원하는 전용 뷰어 |
| D-3 | **시스템 다이어그램 인라인** | Mermaid로 게임 시스템 구조도를 MDX 안에서 바로 렌더 (기획 역량 시연) |
| D-4 | **수치 밸런싱 데모** | 인터랙티브 밸런스 시뮬레이터 위젯 (슬라이더로 파라미터 조작 → 곡선 변화) — 레퍼런스의 "Excel 시뮬레이터"를 웹에서 실제 시연 |
| D-5 | **1클릭 PDF 이력서** | 전용 인쇄 레이아웃 + 사전 생성된 PDF 동시 제공 |
| D-6 | **공개 안전성** | 개인정보(전화번호/상세주소)는 타깃 링크에서만 노출, 공개 버전은 마스킹 |

---

## 3. 아키텍처

### 3.1 기술 스택 후보 비교 (사용자 결정 대기)

| 평가 항목 | **A. Next.js 15 + Vercel** | **B. Astro 5 + Cloudflare Pages** | **C. React+Vite + GitHub Pages** |
| --- | --- | --- | --- |
| 렌더링 | SSG/ISR/SSR 전부 | SSG + Islands | CSR 전용 |
| SEO | ★★★★★ (Metadata API, 자동 sitemap) | ★★★★★ | ★★☆☆☆ (수동 프리렌더 필요) |
| 초기 JS (예상) | ~90KB | **~15KB** | ~150KB |
| MDX 지원 | ★★★★☆ (`@next/mdx`) | ★★★★★ (1급 시민) | ★★★☆☆ (플러그인) |
| OG 이미지 자동생성 | ★★★★★ (`ImageResponse` 내장) | ★★★☆☆ (satori 수동) | ✗ |
| PDF 서버 생성 | ★★★★★ (Route Handler + Playwright) | ★★★☆☆ | ✗ |
| 타깃 링크 서버 검증 | ★★★★★ (Middleware) | ★★★★☆ (Functions) | ✗ (클라이언트만) |
| 비용 | 무료 (Hobby) | 무료 (넉넉) | 완전 무료 |
| 커스텀 도메인 | ✓ | ✓ | ✓ |
| 학습 난이도 | 중 | 중 | **낮음** |
| 레퍼런스 대비 이전 비용 | 중 (React 재사용 가능) | 높음 (컴포넌트 재작성) | **없음** |
| 인터랙티브 위젯(D-4) | ★★★★★ | ★★★★☆ (Island) | ★★★★★ |
| 벤더 락인 | 중 | 낮음 | 없음 |

**권고: A안 (Next.js 15 + Vercel)**

근거:
1. §1.11의 치명적 약점 W-4(SEO), W-5(URL), W-1(인증)을 **한 번에** 해결한다.
2. D-1(타깃 링크)의 서버 사이드 검증, D-5(PDF 서버 생성)는 A안에서만 깔끔하다.
3. React 지식이 그대로 이어지고, D-4(인터랙티브 위젯)에 제약이 없다.
4. 성능 최우선이라면 B안이 우세하지만, 이 사이트는 **기능 밀도**가 더 중요하다.

> **결정 필요**: `TODO(사용자확인): A/B/C 중 선택`. 이후 §3.3~§8은 A안 기준으로 서술하되, 스키마(§4)와 콘텐츠 설계(§5)는 **스택 독립적**이라 어느 안을 골라도 그대로 유효합니다.

### 3.2 Git 기반 CMS 설계 (확정)

```
편집 흐름
  로컬에서 파일 수정 (MDX/JSON)
    → git commit
      → git push
        → CI: 스키마 검증(Zod) + 링크 체크 + 빌드
          → 프리뷰 배포 (PR) 또는 프로덕션 배포 (main)
```

| 항목 | 결정 |
| --- | --- |
| 구조화 데이터 | `content/*.json` — Zod 스키마로 빌드타임 검증 |
| 장문 콘텐츠 | `content/projects/*.mdx` — frontmatter + 본문 |
| 이미지/문서 | `public/media/**` — 빌드타임 최적화(next/image) |
| 편집 UI | **없음.** 대신 ① VS Code, ② 선택적으로 Decap CMS(Git 백엔드, GitHub OAuth) 도입 가능 |
| 인증 | **불필요.** 저장소 write 권한이 곧 편집 권한 |
| 롤백 | `git revert` |
| 백업 | Git 히스토리 자체가 백업 |

**이 결정이 해결하는 것**: W-1, W-2, W-3, W-8이 **구조적으로 소멸**합니다. 런타임 쓰기 경로가 없으면 변조·XSS·쿼터 문제가 발생할 지점이 없습니다.

**이 결정의 비용**: 오탈자 하나 고치는 데도 커밋이 필요합니다. 이를 완화하기 위해 §7 F-14에 "GitHub 웹 편집기 딥링크" 기능을 넣습니다 (각 섹션에 `이 내용 수정` 링크 → GitHub 웹 에디터로 바로 이동).

### 3.3 디렉터리 구조

```
PORTFOLIO/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 루트 레이아웃 (폰트, 메타, 스킵링크)
│   ├── page.tsx                      # / — 랜딩 (Hero+Process+Featured+Archive)
│   ├── about/page.tsx                # /about — 상세 소개
│   ├── resume/
│   │   ├── page.tsx                  # /resume — 이력서
│   │   └── cover-letter/page.tsx     # /resume/cover-letter — 자기소개서
│   ├── projects/
│   │   ├── page.tsx                  # /projects — 목록 (?category= 필터)
│   │   └── [slug]/page.tsx           # /projects/super-bumpers — 상세
│   ├── docs/[slug]/page.tsx          # /docs/... — 기획서 뷰어
│   ├── play-history/page.tsx         # /play-history — 플레이 기록 + 차트
│   ├── t/[token]/                    # 타깃 링크 진입점 (§5)
│   │   └── page.tsx
│   ├── api/
│   │   └── resume-pdf/route.ts       # PDF 생성 (Playwright)
│   ├── opengraph-image.tsx           # OG 이미지 자동 생성
│   ├── sitemap.ts
│   └── robots.ts
│
├── content/                          # ★ 콘텐츠 SSOT (사람이 편집하는 곳)
│   ├── profile.json
│   ├── about.json
│   ├── process.json
│   ├── skills.json
│   ├── timeline.json
│   ├── activities.json
│   ├── certifications.json
│   ├── play-history.json
│   ├── cover-letter.json
│   ├── projects/
│   │   ├── super-bumpers.mdx
│   │   ├── rtd-random-tile-defense.mdx
│   │   └── project-zero.mdx
│   ├── docs/                         # 기획서
│   │   └── genshin-combat-reverse-design.mdx
│   ├── works/                        # AI & 툴링
│   │   └── excel-balance-simulator.mdx
│   └── targets/                      # ★ 기업별 오버레이 (§5)
│       ├── _schema.md                # 작성 가이드
│       ├── nexon.json
│       └── sample.json
│
├── src/
│   ├── components/
│   │   ├── layout/                   # Header, Footer, Nav, MobileNav, SkipLink
│   │   ├── sections/                 # Hero, ProcessGrid, FeaturedProjects, ArchivePreview
│   │   ├── project/                  # ProjectCard, MediaViewer, DocViewer, RoleBadges
│   │   ├── charts/                    # GenreRadar, PlatformPie (동적 import)
│   │   ├── mdx/                      # Grid, Highlight, Callout, Mermaid, BalanceSim
│   │   └── ui/                       # Button, Tabs, Badge, Modal, Tooltip
│   ├── lib/
│   │   ├── content.ts                # 콘텐츠 로더 (fs + gray-matter)
│   │   ├── schema.ts                 # ★ Zod 스키마 (SSOT)
│   │   ├── targets.ts                # 타깃 오버레이 병합 로직
│   │   ├── merge.ts                  # deepMerge (레퍼런스 로직 개선판)
│   │   └── seo.ts                    # 메타데이터 빌더
│   └── styles/
│       ├── tokens.css                # 디자인 토큰
│       └── print.css                 # 인쇄 전용 레이아웃
│
├── scripts/
│   ├── validate-content.ts           # CI: Zod 검증
│   ├── check-links.ts                # CI: 외부 링크 200 확인
│   ├── fetch-game-icons.ts           # 게임 아이콘 1회 수집 (W-9 대체)
│   └── build-resume-pdf.ts           # 정적 PDF 사전 생성
│
├── public/
│   ├── media/{projects,docs,profile}/
│   ├── resume.pdf                    # 사전 생성본
│   └── fonts/                        # self-host (W-11)
│
├── docs/                             # ★ 본 문서들
│   ├── PORTFOLIO_MASTER_PLAN.md
│   └── 포트폴리오_구축_기획서.docx
│
├── .github/workflows/
│   ├── ci.yml                        # 검증 + 빌드 + Lighthouse
│   └── deploy.yml
└── tests/
    ├── content.test.ts               # 스키마 검증 테스트
    └── e2e/                          # Playwright
```

### 3.4 라우팅 맵 (W-5 해결)

| URL | 화면 | 렌더링 | 비고 |
| --- | --- | --- | --- |
| `/` | 랜딩 | SSG | Hero + Process + Featured + Archive |
| `/about` | 상세 소개 | SSG | |
| `/resume` | 이력서 | SSG | |
| `/resume/cover-letter` | 자기소개서 | SSG | 문항별 `#q-1` 앵커 |
| `/projects` | 프로젝트 목록 | SSG | `?category=main\|docs\|works` |
| `/projects/[slug]` | 프로젝트 상세 | SSG (generateStaticParams) | `#media`, `#outcome` 앵커 |
| `/docs/[slug]` | 기획서 뷰어 | SSG | |
| `/play-history` | 플레이 기록 | SSG | 차트는 클라이언트 하이드레이션 |
| `/t/[token]` | 타깃 진입 | SSG | 쿠키 설정 후 `/`로 리다이렉트 |
| `/api/resume-pdf` | PDF 생성 | Route Handler | |

### 3.5 렌더링 전략

| 요소 | 전략 | 이유 |
| --- | --- | --- |
| 모든 콘텐츠 페이지 | **SSG** | 콘텐츠가 빌드타임에 전부 존재 |
| Recharts 차트 | `next/dynamic` + `ssr:false` | Recharts는 무겁고 SSR 이득 없음 |
| Mermaid 다이어그램 | 빌드타임 SVG 사전 렌더 | 런타임 파서 로드 방지 |
| MDX | 빌드타임 컴파일 | W-3(XSS) 원천 차단 |
| 이미지 | `next/image` + AVIF/WebP | LCP 최적화 |
| 폰트 | `next/font/local` self-host | W-11 해결 |

---

## 4. 콘텐츠 스키마 (SSOT)

> **R-1**: 이 절이 단일 진실 공급원입니다. `src/lib/schema.ts`에 그대로 구현하고, CI에서 모든 콘텐츠 파일을 이 스키마로 검증합니다.

### 4.1 공통 타입

```ts
import { z } from 'zod';

/** ISO 날짜 또는 'YYYY.MM' 형식 */
const YearMonth = z.string().regex(/^\d{4}\.\d{2}$/, 'YYYY.MM 형식이어야 합니다');
/** 'YYYY.MM - YYYY.MM' 또는 'YYYY.MM - 현재' */
const Period = z.string().regex(/^\d{4}\.\d{2} - (\d{4}\.\d{2}|현재)$/);
const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case 여야 합니다');
const Url = z.string().url();
/** public/ 기준 경로 또는 절대 URL */
const MediaRef = z.union([z.string().startsWith('/media/'), Url]);
```

### 4.2 `content/profile.json`

```ts
export const ProfileSchema = z.object({
  nameKo: z.string().min(1),
  nameEn: z.string().min(1),
  title: z.string().min(1),              // "Game System Designer"
  tagline: z.string().max(80),           // 한 줄 소개
  birthdate: z.string().optional(),
  location: z.string(),                  // "인천광역시" — 상세 주소 금지 (D-6)
  email: z.string().email(),
  phone: z.string().optional(),          // ★ 공개 버전에서는 마스킹 (§5.4)
  links: z.array(z.object({
    label: z.string(),                   // "GitHub" | "Notion" | "LinkedIn"
    url: Url,
    icon: z.string(),                    // lucide 아이콘 이름
  })),
  avatar: MediaRef.optional(),
});
```

### 4.3 `content/about.json`

```ts
export const AboutSchema = z.object({
  headline: z.object({
    line1: z.string(),                   // "의도를 구조로 만들고,"
    line2: z.string(),                   // "구조를 결과로 완성하는 기획자"
  }),
  description: z.string(),
  /** 레퍼런스의 stat1~stat4 를 배열로 일반화 (W-13 계열 개선) */
  stats: z.array(z.object({
    value: z.string(),                   // "6"
    unit: z.string(),                    // "개"
    label: z.string(),                   // "프로젝트 달성"
    accent: z.enum(['neutral','primary','info','highlight']).default('neutral'),
  })).min(2).max(6),
  narrative: z.array(z.object({          // 긴 자기소개 (About 페이지)
    heading: z.string(),
    body: z.string(),                    // 마크다운 허용
  })).default([]),
});
```

### 4.4 `content/process.json`

```ts
export const ProcessSchema = z.array(z.object({
  step: z.string().regex(/^\d{2}$/),     // "01"
  icon: z.string(),                      // lucide 아이콘 이름
  title: z.string(),
  description: z.string(),
  accent: z.enum(['blue','emerald','gray','orange','purple','red']),
})).min(3).max(8);
```

### 4.5 `content/projects/*.mdx` — frontmatter

프로젝트가 **가장 중요한 엔티티**입니다. 레퍼런스 대비 `outcome`을 구조화하고 `evidence`를 추가했습니다.

```ts
export const ProjectSchema = z.object({
  slug: Slug,                            // 파일명과 일치해야 함 (CI 검증)
  title: z.string(),
  subtitle: z.string().optional(),
  genre: z.string(),                     // "캐주얼 액션 레이싱"
  period: Period,
  teamSize: z.number().int().positive().optional(),
  platform: z.array(z.enum(['PC','Mobile','Console','Web'])),
  category: z.enum(['main','docs','works']),   // 레퍼런스의 main/plan/other

  /** 담당 역할 — 태그가 아니라 구조화 */
  roles: z.array(z.object({
    name: z.string(),                    // "차량 성장 기획"
    primary: z.boolean().default(false), // 대표 역할 강조용
  })).min(1),

  summary: z.string().max(200),          // 카드에 노출

  /** ★ P-2: 정량 성과 필수 */
  outcomes: z.array(z.object({
    metric: z.string(),                  // "초기 이탈률"
    value: z.string(),                   // "-15%"
    context: z.string(),                 // "난이도 밸런싱 최적화 후 D1 리텐션 기준"
  })).min(1, '최소 1개의 정량 성과가 필요합니다'),

  /** ★ P-2: 증거 자료 */
  evidence: z.array(z.object({
    type: z.enum(['doc','video','build','store','repo','slide']),
    label: z.string(),
    url: Url,
  })).default([]),

  media: z.object({
    thumbnail: MediaRef,
    cover: MediaRef.optional(),
    video: Url.optional(),               // YouTube/Vimeo
    gallery: z.array(z.object({          // 가변 길이 (W-13 해결)
      src: MediaRef,
      caption: z.string().optional(),
    })).default([]),
    documents: z.array(z.object({        // PDF/슬라이드
      title: z.string(),
      src: MediaRef,
      kind: z.enum(['pdf','gslides','gsheets','gdrive']),
    })).default([]),
  }),

  featured: z.boolean().default(false),  // 랜딩 노출
  order: z.number().int().default(999),  // 정렬 (DnD 대체)
  tags: z.array(z.string()).default([]),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),

  /** 비공개 프로젝트 처리 */
  visibility: z.enum(['public','targets-only','draft']).default('public'),
});
```

**MDX 본문 권장 구조** (§7 F-06의 템플릿):

```mdx
---
slug: super-bumpers
title: Super Bumpers
# ... (위 스키마)
---

## 문제 정의
<Callout type="problem">
플레이어가 3판 이내에 이탈하는 원인을 데이터에서 찾은 결과...
</Callout>

## 설계 가설
<Grid>
  <Card title="속도 = 공격">단일 규칙으로 학습 비용 최소화</Card>
  <Card title="성장 = 유지">차량 성장으로 재방문 동기 부여</Card>
</Grid>

## 시스템 구조
<Mermaid chart={`
flowchart LR
  A[속도] --> B[충돌 데미지]
  B --> C[격파 보상]
  C --> D[차량 성장]
  D --> A
`} />

## 밸런싱 근거
<BalanceSim preset="super-bumpers-damage" />

## 결과
<OutcomeTable />   {/* frontmatter의 outcomes를 자동 렌더 */}

## 회고
무엇을 다시 한다면 어떻게 할 것인가.
```

### 4.6 나머지 스키마

```ts
/** content/skills.json */
export const SkillsSchema = z.array(z.object({
  category: z.enum(['work','collab','engine','design','ai']),
  categoryLabel: z.string(),
  items: z.array(z.object({
    name: z.string(),
    level: z.enum(['familiar','proficient','expert']),
    note: z.string(),                    // "데이터 모델링 및 수치 밸런싱"
    icon: z.string().optional(),
  })),
}));

/** content/timeline.json */
export const TimelineSchema = z.array(z.object({
  type: z.enum(['career','education']),
  period: Period,
  organization: z.string(),
  role: z.string(),
  description: z.string(),
  highlights: z.array(z.string()).default([]),
  order: z.number().int().default(999),
}));

/** content/activities.json */
export const ActivitySchema = z.array(z.object({
  period: Period,
  title: z.string(),
  badge: z.string().optional(),          // "우수 수료"
  description: z.string(),
  category: z.enum(['bootcamp','supporters','contest','club','other']),
}));

/** content/certifications.json */
export const CertificationSchema = z.array(z.object({
  title: z.string(),
  issuer: z.string(),
  date: YearMonth,
}));

/** content/play-history.json */
export const PlayHistorySchema = z.array(z.object({
  title: z.string(),
  platform: z.enum(['PC','Mobile','Console']),
  genres: z.array(z.string()).min(1),    // ★ 배열로 (레퍼런스는 문자열 부분매칭)
  hours: z.number().int().nonnegative(), // ★ 숫자로 (레퍼런스는 "300+" 문자열)
  icon: MediaRef.optional(),             // 빌드타임 수집 (W-9)
  /** 이 게임에서 무엇을 배웠는가 — 단순 나열을 인사이트로 승격 */
  insight: z.string().optional(),
  featured: z.boolean().default(false),
}));

/** content/cover-letter.json */
export const CoverLetterSchema = z.array(z.object({
  id: Slug,                              // 앵커용 "#motivation"
  question: z.string(),
  answer: z.string(),                    // 마크다운
  order: z.number().int(),
  /** 기업별로 다른 답변을 쓸 수 있는 문항인지 */
  targetable: z.boolean().default(true),
}));
```

### 4.7 레퍼런스 키 → 신규 스키마 매핑표

마이그레이션 시 참조용입니다.

| 레퍼런스 키 | 신규 위치 | 변경 사항 |
| --- | --- | --- |
| `profileData` | `content/profile.json` | `address` → `location`(시/구까지만), `links[]` 추가 |
| `aboutData` | `content/about.json` | `stat1~4` → `stats[]` 배열화, `narrative[]` 추가 |
| `workProcessData` | `content/process.json` | Tailwind 클래스 문자열 → `accent` enum |
| `projectsData` | `content/projects/*.mdx` (category=main) | `outcome` 문자열 → `outcomes[]` 구조화, `links[]` → `evidence[]`(URL 필수), `markdown` → MDX 본문, `media.slides[5]` → `gallery[]` 가변 |
| `planData` | `content/docs/*.mdx` (category=docs) | 동일 |
| `otherWorksData` | `content/works/*.mdx` (category=works) | 동일 |
| `playHistoryData` | `content/play-history.json` | `hours` 문자열→숫자, `genre` 문자열→`genres[]`, `insight` 추가 |
| `timelineLeftData` | `content/timeline.json` | 좌/우 분리 제거, `type`으로 구분 |
| `activitiesLeftData` + `activitiesRightData` | `content/activities.json` | **병합** — 좌/우 분리는 레이아웃 관심사이지 데이터 관심사가 아님 |
| `coverLetterData` | `content/cover-letter.json` | `id`를 slug로, `targetable` 추가 |
| `workTools`/`collabTools`/`engineTools`/`designTools`/`aiTools` | `content/skills.json` | **5개 키 → 1개 파일**, `category`로 구분, `level` 추가 |
| `certifications` | `content/certifications.json` | `issuer` 추가 |
| `sectionIcons` | **삭제** | 디자인 시스템에서 고정 |
| `companyList` | `content/targets/*.json` 파일 존재 자체 | 별도 목록 불필요 |
| `siteVisibility` | `content/targets/*.json` 의 `expiresAt` | 전역 토글 → 링크별 만료 |

---

## 5. 타깃 링크 기능 재설계 (D-1)

레퍼런스 `?company=` 의 Git 기반 재구현입니다.

### 5.1 스키마

```ts
/** content/targets/{slug}.json */
export const TargetSchema = z.object({
  slug: Slug,                            // URL 토큰으로 사용
  companyName: z.string(),               // "넥슨"
  position: z.string(),                  // "시스템 기획자 (신입)"
  /** 인사말 — 랜딩 최상단에 배너로 노출 */
  greeting: z.string().optional(),
  /** 만료일. 지나면 안내 화면 표시 */
  expiresAt: z.string().datetime().optional(),

  /** ── 오버레이: 지정한 필드만 기본 콘텐츠를 덮어씀 ── */
  overrides: z.object({
    about: AboutSchema.deepPartial().optional(),
    /** 프로젝트 순서 재정렬 — slug 배열. 없는 slug는 CI에서 에러 */
    projectOrder: z.array(Slug).optional(),
    /** 이 타깃에서만 숨길 프로젝트 */
    hideProjects: z.array(Slug).default([]),
    /** targets-only 프로젝트 중 이 타깃에 공개할 것 */
    revealProjects: z.array(Slug).default([]),
    /** 자기소개서 문항별 교체 답변 */
    coverLetter: z.record(Slug, z.string()).optional(),
    /** 강조할 역량 태그 */
    emphasizeTags: z.array(z.string()).default([]),
  }).default({}),

  /** 개인정보 노출 수준 (D-6) */
  privacy: z.enum(['full','masked']).default('full'),
});
```

### 5.2 병합 규칙 (레퍼런스 deepMerge 개선)

| 규칙 | 레퍼런스 | 우리 |
| --- | --- | --- |
| 객체 | 키 단위 재귀 병합 | 동일 |
| 배열 | **통째로 교체** | **명시적 연산으로 분리** — `projectOrder`(재정렬), `hideProjects`(제거), `revealProjects`(추가). 실수로 전체가 날아가지 않음 |
| 없는 필드 | 기본값 사용 | 동일 |
| 검증 | 없음 | **CI에서 Zod + 참조 무결성 검증** (존재하지 않는 slug 참조 시 빌드 실패) |

### 5.3 URL 설계

| 형태 | 동작 |
| --- | --- |
| `/t/nexon` | 타깃 진입점. 쿠키 `pf_target=nexon` 설정 후 `/`로 리다이렉트 |
| `/?target=nexon` | 쿠키 없이 1회성 열람 (레퍼런스 호환 방식) |
| 이후 모든 페이지 | 쿠키/쿼리를 읽어 오버레이 적용, 헤더에 `넥슨 지원용 버전` 배지 표시 |

**중요**: 타깃 콘텐츠는 **빌드타임에 전부 생성**됩니다 (`generateStaticParams`). 서버 비밀이 아니므로, "URL을 모르면 못 본다"는 수준의 보호입니다. 진짜 비밀 정보는 넣지 마십시오. → §9 보안 체크리스트 SEC-5.

### 5.4 개인정보 보호 (D-6)

| 필드 | `privacy: 'full'` | `privacy: 'masked'` (기본 공개 버전) |
| --- | --- | --- |
| `phone` | 전체 노출 | **미노출** (이메일만) |
| `birthdate` | 노출 | 연도만 |
| `location` | 시/구 | 시 |

기본 공개 사이트(`/`)는 항상 `masked`, 타깃 링크(`/t/*`)만 `full`로 설정합니다. `robots.txt`에서 `/t/` 를 `Disallow` 합니다.

---

## 6. 디자인 시스템

### 6.1 방향성

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 톤 | **밝은 배경 + 절제된 액센트 1색** | 레퍼런스와 동일 계열이 검증됨. 채용 담당자는 가독성을 원함 |
| 다크 모드 | **지원** (`prefers-color-scheme` + 수동 토글) | 레퍼런스 미지원. 개선점 |
| 밀도 | 여백 넉넉하게, 카드 기반 | |
| 모션 | 스크롤 리빌 + 호버만. `prefers-reduced-motion` 존중 | P-1 |

### 6.2 토큰 (`src/styles/tokens.css`)

```css
:root {
  /* Color — Light */
  --bg:              #ffffff;
  --bg-subtle:       #fafafa;
  --bg-muted:        #f4f4f5;
  --surface:         #ffffff;
  --border:          #e4e4e7;
  --border-strong:   #d4d4d8;

  --text:            #18181b;
  --text-secondary:  #52525b;
  --text-muted:      #a1a1aa;
  --text-inverse:    #ffffff;

  --accent:          #059669;   /* 브랜드 1색 */
  --accent-hover:    #047857;
  --accent-subtle:   #ecfdf5;
  --info:            #2563eb;   /* 차트/게임 관련 */
  --warn:            #d97706;
  --danger:          #dc2626;

  /* Typography */
  --font-heading: 'SUIT Variable', system-ui, sans-serif;
  --font-body:    'Pretendard Variable', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --text-hero: clamp(2.25rem, 5vw, 3.75rem);
  --text-h1:   clamp(1.875rem, 4vw, 2.75rem);
  --text-h2:   clamp(1.5rem, 3vw, 2rem);
  --text-h3:   clamp(1.125rem, 2vw, 1.375rem);
  --text-body: 1rem;
  --text-sm:   0.875rem;
  --text-xs:   0.75rem;

  --leading-tight: 1.25;
  --leading-body:  1.7;

  /* Space — 4px 그리드 */
  --space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
  --space-4: 1rem;     --space-6: 1.5rem;   --space-8: 2rem;
  --space-12: 3rem;    --space-16: 4rem;    --space-24: 6rem;
  --space-section: clamp(4rem, 9vw, 7rem);

  /* Layout */
  --width-content: 1120px;
  --width-prose:   720px;
  --pad-x: clamp(1.25rem, 4vw, 2.5rem);

  /* Radius / Shadow / Motion */
  --radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 22px;  --radius-full: 9999px;
  --shadow-sm:  0 1px 2px rgb(0 0 0 / .04);
  --shadow-md:  0 4px 16px rgb(0 0 0 / .06);
  --shadow-lg:  0 12px 40px rgb(0 0 0 / .08);
  --ease: cubic-bezier(.32,.72,0,1);
  --dur-fast: 150ms;  --dur-base: 260ms;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg: #0a0a0b;  --bg-subtle: #141416;  --bg-muted: #1c1c20;
    --surface: #141416;  --border: #27272a;  --border-strong: #3f3f46;
    --text: #fafafa;  --text-secondary: #a1a1aa;  --text-muted: #71717a;
    --accent: #10b981;  --accent-subtle: #052e23;
  }
}
:root[data-theme='dark'] { /* 위와 동일 */ }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

### 6.3 컴포넌트 인벤토리

| 그룹 | 컴포넌트 | 비고 |
| --- | --- | --- |
| layout | `SiteHeader` `MobileNav` `SiteFooter` `SkipLink` `TargetBanner` | `TargetBanner` = 타깃 링크 배지 |
| sections | `Hero` `StatRow` `ProcessGrid` `FeaturedProjects` `ArchivePreview` `ContactCta` | |
| project | `ProjectCard` `ProjectHeader` `RoleBadges` `OutcomeTable` `MediaViewer` `DocViewer` `EvidenceLinks` | `MediaViewer`가 §1.7의 S-3 계승 |
| charts | `GenreRadar` `PlatformDonut` `HoursBar` | 동적 import, 대체 텍스트 필수 |
| mdx | `Grid` `Card` `Callout` `Highlight` `Mermaid` `BalanceSim` `Figure` | §4.5 참조 |
| ui | `Button` `Tabs` `Badge` `Modal` `Tooltip` `Accordion` `AnchorNav` `ThemeToggle` | `Modal`은 focus trap 필수 (W-10) |

---

## 7. 기능 스펙

각 기능은 **수용 기준(AC)** 을 만족해야 완료로 간주합니다.

### F-01 — 랜딩 페이지 (`/`)
- 구성: Hero(headline + stats + CTA 2개) → Process(6카드) → Featured Projects(featured=true) → Archive Preview(플레이 기록 상위 3) → Contact CTA
- **AC-1** 모바일 375px에서 가로 스크롤이 발생하지 않는다
- **AC-2** 첫 화면(above the fold)에 이름·직군·핵심 지표가 모두 보인다
- **AC-3** 대표 프로젝트 상세까지 **클릭 1회**로 도달한다
- **AC-4** JS 비활성화 상태에서도 전체 텍스트가 읽힌다

### F-02 — 전역 내비게이션
- 데스크톱: 상단 고정 헤더. 모바일: 하단 탭바 또는 햄버거 드로어 (**W-12 해결**)
- **AC-1** 모바일에서 모든 최상위 화면에 도달 가능
- **AC-2** 현재 위치가 시각적으로 표시된다 (`aria-current="page"`)
- **AC-3** 키보드 Tab만으로 전체 내비 순회 가능

### F-03 — 프로젝트 목록 (`/projects`)
- `?category=main|docs|works` 필터. 필터 변경 시 **URL이 갱신**된다 (**W-5 해결**)
- **AC-1** 필터 상태가 URL에 반영되고, 새로고침·공유·뒤로가기가 모두 동작한다
- **AC-2** 각 카드에 정량 성과 1개 이상이 노출된다 (P-2)

### F-04 — 프로젝트 상세 (`/projects/[slug]`)
- 헤더(제목/장르/기간/역할/플랫폼) → 성과 테이블 → 미디어 뷰어 → MDX 본문 → 증거 링크 → 이전/다음
- **AC-1** `outcomes`가 표 형태로 상단에 고정 노출된다
- **AC-2** MDX 본문의 h2/h3에서 목차가 자동 생성된다
- **AC-3** 각 섹션에 앵커 링크가 있다

### F-05 — 미디어 뷰어 (S-3 계승)
- 탭: `썸네일` / `영상` / `갤러리` / `문서`
- 지원: 로컬 이미지, YouTube 임베드, PDF(iframe), Google Slides/Sheets/Drive 임베드
- 전체화면 토글 (Fullscreen API)
- **AC-1** 탭 전환이 URL 해시에 반영된다 (`#media=video`)
- **AC-2** 영상은 사용자가 클릭할 때까지 iframe을 로드하지 않는다 (facade 패턴)
- **AC-3** 전체화면 진입/이탈 시 포커스가 올바르게 관리된다

### F-06 — MDX 저작 시스템 (S-4 계승, W-3 해결)
- 커스텀 컴포넌트: `<Grid>` `<Card>` `<Callout>` `<Highlight>` `<Mermaid>` `<Figure>` `<BalanceSim>` `<OutcomeTable>`
- **AC-1** 모든 MDX는 **빌드타임에 컴파일**된다. 런타임 `dangerouslySetInnerHTML` 사용 금지
- **AC-2** 알 수 없는 컴포넌트 사용 시 **빌드가 실패**한다
- **AC-3** `content/_TEMPLATE.mdx` 가 제공되어 새 프로젝트 작성이 복사-수정으로 끝난다

### F-07 — 이력서 (`/resume`)
- 인적사항 / 기술 스택(5분류) / 타임라인(경력·학력) / 대외활동 / 자격증
- **AC-1** `print.css`로 A4 2페이지 이내에 깔끔히 출력된다
- **AC-2** `/resume.pdf` 사전 생성본이 1클릭 다운로드된다 (D-5)
- **AC-3** 인쇄 시 내비·버튼·배경 그라디언트가 제거된다

### F-08 — 자기소개서 (`/resume/cover-letter`)
- 문항별 섹션 + 우측 앵커 내비(스크롤 스파이) — 레퍼런스 계승
- **AC-1** 각 문항이 고유 앵커(`#motivation`)를 가진다
- **AC-2** 타깃 링크에서 문항 답변이 교체될 수 있다 (§5.1 `overrides.coverLetter`)

### F-09 — 플레이 기록 (`/play-history`)
- 장르 레이더 차트 + 플랫폼 도넛 차트 + 필터 가능한 목록
- **AC-1** 차트에 `<figcaption>` 또는 시각장애인용 데이터 테이블 대체본이 제공된다 (W-10)
- **AC-2** 차트 라이브러리가 이 페이지에서만 로드된다 (동적 import)
- **AC-3** 각 게임에 `insight`(무엇을 배웠나)를 노출할 수 있다 — 단순 나열을 인사이트로 승격

### F-10 — 타깃 링크 (D-1, S-1 계승)
- §5 전체
- **AC-1** `/t/[slug]` 진입 시 오버레이가 적용되고 헤더에 `{회사명} 지원용` 배지가 표시된다
- **AC-2** `expiresAt` 경과 시 안내 화면 + 연락처를 표시한다
- **AC-3** 존재하지 않는 slug를 참조하는 타깃 파일이 있으면 **빌드가 실패**한다
- **AC-4** `/t/*` 는 `robots.txt`에서 색인 제외된다

### F-11 — SEO (W-4 해결)
- 페이지별 `<title>`/`<meta description>`/OG/Twitter Card
- 동적 OG 이미지 (`app/opengraph-image.tsx`) — 프로젝트별 제목·장르가 렌더된 카드
- JSON-LD: `Person`(루트), `CreativeWork`(프로젝트별)
- `sitemap.xml`, `robots.txt` 자동 생성
- **AC-1** Lighthouse SEO 100점
- **AC-2** 모든 페이지의 OG 이미지가 카카오톡/슬랙에서 정상 미리보기된다

### F-12 — 접근성 (W-10 해결)
- **AC-1** 모든 이미지에 의미 있는 `alt` (장식 이미지는 `alt=""`)
- **AC-2** 색 대비 4.5:1 이상 (본문), 3:1 이상 (큰 텍스트/UI)
- **AC-3** 모달에 focus trap + `Esc` 닫기 + 열기 전 포커스 복원
- **AC-4** 스킵 링크 제공
- **AC-5** 키보드만으로 모든 기능 사용 가능
- **AC-6** `prefers-reduced-motion` 존중

### F-13 — 성능 (W-11 해결)
- 폰트 self-host + `next/font` + 한글 서브셋
- 이미지 AVIF/WebP + `sizes` 지정 + LCP 이미지 `priority`
- 차트/Mermaid/뷰어는 동적 import
- **AC-1** 모바일 Lighthouse Performance ≥ 95
- **AC-2** 초기 JS < 120KB (gzip)
- **AC-3** CLS < 0.05

### F-14 — 편집 편의 (§3.2 비용 완화)
- 각 섹션 hover 시 `이 내용 수정` 링크 → GitHub 웹 에디터 딥링크 (`github.com/2Khaz/PORTFOLIO/edit/main/content/...`)
- **AC-1** 개발 환경(`NODE_ENV=development`) 또는 `?edit=1` 에서만 노출
- **AC-2** 프로덕션 번들에 포함되지 않는다

### F-15 — 콘텐츠 검증 (신규, W-6 대응)
- `scripts/validate-content.ts` 가 모든 `content/**`를 Zod로 검증
- 참조 무결성: `projectOrder`의 slug 존재, `media` 경로 실재, `evidence.url` 형식
- **AC-1** 스키마 위반 시 CI 실패 + **어느 파일 어느 필드인지** 명시하는 에러 메시지
- **AC-2** `npm run validate` 로 로컬에서 즉시 실행 가능

### F-16 — 밸런스 시뮬레이터 위젯 (D-4, 선택)
- MDX에서 `<BalanceSim preset="..." />` 로 삽입. 슬라이더로 파라미터 조정 → 곡선 실시간 반영
- 프리셋은 `content/sims/*.json` 에 수식과 파라미터 범위 정의
- **AC-1** 위젯이 없는 페이지에는 코드가 로드되지 않는다
- **AC-2** 키보드로 슬라이더 조작 가능
- **우선순위**: Phase 5 (있으면 강력한 차별점, 없어도 사이트는 완성)

---

## 8. 구현 로드맵

> 각 태스크는 `T-XX` 식별자, 산출물, 완료 정의(DoD)를 가집니다. 예상 소요는 1인 기준입니다.

### Phase 0 — 결정 및 준비 (0.5일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-01 | §3.1 스택 후보 중 선택 | 결정 기록 | 이 문서 §3.1에 결정 표기 |
| T-02 | 저장소 초기화 (`.gitignore`, `.editorconfig`, `LICENSE`, `README`) | 저장소 골격 | `main` 브랜치에 커밋 |
| T-03 | 실제 콘텐츠 원본 수집 (프로젝트 자료, 문서, 이미지, 경력 사실) | `_raw/` 임시 폴더 | 프로젝트 3개 이상의 자료 확보 |

### Phase 1 — 기반 구축 (2일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-04 | 프로젝트 스캐폴딩 + TypeScript strict + ESLint/Prettier | 빌드 통과 | `npm run build` 성공 |
| T-05 | §6.2 디자인 토큰 + 폰트 self-host | `tokens.css`, `public/fonts/` | 다크모드 토글 동작 |
| T-06 | §4 Zod 스키마 전체 구현 | `src/lib/schema.ts` | 타입 추론 동작 확인 |
| T-07 | 콘텐츠 로더 (`fs` + `gray-matter` + Zod parse) | `src/lib/content.ts` | 잘못된 콘텐츠에서 명확한 에러 |
| T-08 | `scripts/validate-content.ts` + `npm run validate` | 검증 스크립트 | 일부러 깨뜨렸을 때 실패 |
| T-09 | 레이아웃 셸 (헤더/모바일 내비/푸터/스킵링크) | `app/layout.tsx` 외 | F-02 AC 전부 통과 |

### Phase 2 — 콘텐츠 이관 (2일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-10 | `profile/about/process/skills/timeline/activities/certifications` 작성 | `content/*.json` | `npm run validate` 통과 |
| T-11 | 프로젝트 MDX 3~5건 작성 (§4.5 템플릿) | `content/projects/*.mdx` | 각각 `outcomes` 1개 이상 |
| T-12 | 기획서·툴링 콘텐츠 작성 | `content/docs/`, `content/works/` | 동일 |
| T-13 | 미디어 자산 정리 + 최적화 | `public/media/**` | 원본 대비 60% 이상 용량 감소 |
| T-14 | 플레이 기록 + 아이콘 수집 스크립트 (W-9 대체) | `content/play-history.json`, `scripts/fetch-game-icons.ts` | 런타임 외부 프록시 호출 0건 |
| T-15 | 자기소개서 작성 | `content/cover-letter.json` | 문항별 앵커 slug 부여 |

### Phase 3 — 화면 구현 (3일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-16 | F-01 랜딩 | `app/page.tsx` + sections | AC-1~4 통과 |
| T-17 | F-03 프로젝트 목록 + URL 동기화 필터 | `app/projects/page.tsx` | AC-1~2 통과 |
| T-18 | F-04 프로젝트 상세 + 목차 | `app/projects/[slug]/page.tsx` | AC-1~3 통과 |
| T-19 | F-05 미디어 뷰어 | `components/project/MediaViewer` | AC-1~3 통과 |
| T-20 | F-06 MDX 컴포넌트 세트 | `components/mdx/*` | AC-1~3 통과 |
| T-21 | F-07 이력서 + `print.css` | `app/resume/page.tsx` | A4 2페이지 출력 확인 |
| T-22 | F-08 자기소개서 + 앵커 내비 | `app/resume/cover-letter/page.tsx` | AC-1~2 통과 |
| T-23 | F-09 플레이 기록 + 차트 | `app/play-history/page.tsx` | AC-1~3 통과 |

### Phase 4 — 차별화 기능 (2일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-24 | F-10 타깃 링크 전체 (§5) | `app/t/[token]/`, `lib/targets.ts` | AC-1~4 통과 |
| T-25 | 타깃 참조 무결성 검증을 T-08에 추가 | 검증 스크립트 확장 | 존재하지 않는 slug에서 빌드 실패 |
| T-26 | F-11 SEO 전체 (메타/OG생성/JSON-LD/sitemap/robots) | `app/opengraph-image.tsx` 외 | Lighthouse SEO 100 |
| T-27 | D-5 PDF: `scripts/build-resume-pdf.ts` + 다운로드 버튼 | `public/resume.pdf` | 1클릭 다운로드 동작 |
| T-28 | D-3 Mermaid 빌드타임 렌더 | `components/mdx/Mermaid` | 런타임 mermaid 번들 0KB |

### Phase 5 — 품질 및 배포 (1.5일)

| ID | 태스크 | 산출물 | DoD |
| --- | --- | --- | --- |
| T-29 | F-12 접근성 감사 및 수정 | axe 리포트 | violations 0 (critical/serious) |
| T-30 | F-13 성능 최적화 | 번들 리포트 | AC-1~3 통과 |
| T-31 | CI 파이프라인 (validate → lint → build → Lighthouse CI → e2e) | `.github/workflows/ci.yml` | PR에서 자동 실행 |
| T-32 | E2E 테스트 (주요 경로 5개) | `tests/e2e/*` | 전부 통과 |
| T-33 | 프로덕션 배포 + 커스텀 도메인 | 라이브 URL | 실기기(iOS/Android) 확인 |
| T-34 | F-14 편집 딥링크 | 개발 전용 오버레이 | 프로덕션 번들 미포함 확인 |
| T-35 | F-16 밸런스 시뮬레이터 (선택) | `components/mdx/BalanceSim` | AC-1~2 통과 |

**총 예상: 약 11일 (선택 기능 제외 시 10일)**

### 8.1 의존 관계

```
T-01 ─┬─→ T-04 ─→ T-05 ─┐
      └─→ T-02          ├─→ T-09 ─→ T-16 ─┬─→ T-17 ─→ T-18 ─→ T-19
T-03 ────→ T-06 ─→ T-07 ─┴─→ T-08         │            └─→ T-20
                   └─→ T-10..T-15 ────────┘
T-16..T-23 ──→ T-24 ─→ T-25 ─→ T-26 ─→ T-29 ─→ T-30 ─→ T-31 ─→ T-33
```

---

## 9. 품질 게이트

각 Phase 종료 시 아래를 통과해야 합니다 (R-4).

### 9.1 성능

| ID | 기준 | 측정 |
| --- | --- | --- |
| PERF-1 | Lighthouse Performance ≥ 95 (모바일) | Lighthouse CI |
| PERF-2 | LCP < 1.8s | Lighthouse CI |
| PERF-3 | CLS < 0.05 | Lighthouse CI |
| PERF-4 | 초기 JS < 120KB gzip | `@next/bundle-analyzer` |
| PERF-5 | 이미지 총 전송량 < 1.5MB (랜딩) | Network 패널 |

### 9.2 SEO

| ID | 기준 |
| --- | --- |
| SEO-1 | 모든 페이지에 고유 `<title>`, `<meta description>` |
| SEO-2 | OG/Twitter 카드 정상 (실제 메신저 미리보기 확인) |
| SEO-3 | `sitemap.xml` 에 모든 공개 페이지 포함, `/t/*` 제외 |
| SEO-4 | JSON-LD `Person` + `CreativeWork` 유효성 검사 통과 |
| SEO-5 | 이미지 `alt` 100% |

### 9.3 접근성

| ID | 기준 |
| --- | --- |
| A11Y-1 | axe-core violations 0 (critical/serious) |
| A11Y-2 | 키보드만으로 전 기능 사용 가능 |
| A11Y-3 | 색 대비 WCAG AA |
| A11Y-4 | 랜드마크 요소 사용 (`header`/`nav`/`main`/`footer`) |
| A11Y-5 | 차트에 텍스트 대체본 제공 |
| A11Y-6 | 모달 focus trap + Esc |

### 9.4 보안 (레퍼런스 약점 대응)

| ID | 기준 | 대응하는 레퍼런스 약점 |
| --- | --- | --- |
| SEC-1 | 클라이언트 번들에 시크릿·비밀번호 0건 (`grep` 자동 검사) | W-1 |
| SEC-2 | 런타임 DB 쓰기 경로 0건 | W-2 |
| SEC-3 | `dangerouslySetInnerHTML` 사용 0건 (MDX 컴파일로 대체) | W-3 |
| SEC-4 | 외부 임베드는 `sandbox` 속성 + 허용 도메인 화이트리스트 | — |
| SEC-5 | `content/**` 에 실제 개인정보(주민번호/상세주소/타인 정보) 0건 | D-6 |
| SEC-6 | CSP 헤더 설정 (`script-src 'self'`, 임베드 도메인 명시) | — |
| SEC-7 | 의존성 취약점 0건 (`npm audit --audit-level=high`) | — |

### 9.5 콘텐츠

| ID | 기준 |
| --- | --- |
| CNT-1 | `npm run validate` 통과 |
| CNT-2 | 모든 프로젝트가 `outcomes` 1개 이상 보유 (P-2) |
| CNT-3 | 외부 링크 전부 200 응답 (`scripts/check-links.ts`) |
| CNT-4 | 맞춤법·오탈자 검수 완료 |
| CNT-5 | 모든 미디어 경로가 실재 |

---

## 10. 배포 및 운영

### 10.1 CI/CD

```yaml
# .github/workflows/ci.yml (구조 요약)
on: [push, pull_request]
jobs:
  verify:
    steps:
      - npm ci
      - npm run validate      # T-08 콘텐츠 스키마 + 참조 무결성
      - npm run lint
      - npm run typecheck
      - npm run build
      - npm run test:e2e
      - lighthouse-ci autorun # PERF-1~3
      - npm audit --audit-level=high
```

- PR마다 **프리뷰 배포** → 실제 화면으로 리뷰 후 머지
- `main` 머지 시 프로덕션 자동 배포

### 10.2 브랜치 전략

| 브랜치 | 용도 |
| --- | --- |
| `main` | 프로덕션 |
| `content/*` | 콘텐츠만 수정하는 브랜치 (예: `content/add-project-x`) |
| `feat/*` | 기능 개발 |

레퍼런스의 W-7(일회성 스크립트 커밋)을 반복하지 않기 위해, `.gitignore`에 `*.tmp.js`, `_raw/`, `scratch/` 를 등록합니다.

### 10.3 운영 루틴

| 주기 | 작업 |
| --- | --- |
| 신규 프로젝트 완료 시 | `content/projects/` 에 MDX 추가 → PR → 머지 |
| 지원 회사 발생 시 | `content/targets/{company}.json` 추가 → 머지 → `/t/{company}` 링크 전달 |
| 월 1회 | 의존성 업데이트, 링크 체크, Lighthouse 재측정 |
| 분기 1회 | 성과 지표(outcomes) 갱신, 오래된 프로젝트 정리 |

---

## 11. AI 에이전트 실행 프롬프트 팩

각 Phase를 에이전트에게 위임할 때 그대로 사용할 수 있는 지시문입니다.

### 11.1 Phase 1 (기반 구축)

```
docs/PORTFOLIO_MASTER_PLAN.md 를 읽고 Phase 1 (T-04 ~ T-09)을 수행하라.

필수 준수 사항:
- §0.2의 R-1 ~ R-6을 모두 지킬 것
- §4의 Zod 스키마를 src/lib/schema.ts 에 정확히 그대로 구현할 것.
  필드를 임의로 추가하거나 이름을 바꾸지 말 것
- §6.2의 디자인 토큰을 src/styles/tokens.css 에 그대로 옮길 것
- 콘텐츠 파일은 아직 만들지 말 것 (Phase 2 범위)
- 각 태스크의 DoD를 만족했는지 스스로 확인하고, 확인 방법을 함께 보고할 것

완료 후 보고 형식:
| 태스크 | 상태 | 산출물 경로 | DoD 검증 방법 |
```

### 11.2 Phase 3 (화면 구현)

```
docs/PORTFOLIO_MASTER_PLAN.md 의 Phase 3 (T-16 ~ T-23)을 수행하라.

각 화면은 §7의 대응하는 F-XX 기능 스펙의 **수용 기준(AC)을 전부 만족**해야 한다.
AC를 만족시키지 못한 항목이 있으면 임의로 넘어가지 말고 그 사실을 명시하라.

특히 다음을 반드시 지켜라:
- F-03 AC-1: 필터 상태가 URL에 반영되어야 한다 (레퍼런스의 W-5 약점을 반복하지 말 것)
- F-05 AC-2: 영상 iframe은 클릭 전까지 로드하지 말 것 (facade 패턴)
- F-06 AC-1: dangerouslySetInnerHTML 을 절대 쓰지 말 것 (레퍼런스의 W-3 약점)
- F-02 AC-1: 모바일 내비를 반드시 구현할 것 (레퍼런스의 W-12 약점)
```

### 11.3 품질 게이트 검증

```
docs/PORTFOLIO_MASTER_PLAN.md §9의 품질 게이트를 전부 검증하라.

각 항목에 대해:
1. 실제로 측정/검사를 수행할 것 (추정 금지)
2. 통과/실패와 실제 수치를 보고할 것
3. 실패 항목은 원인과 수정안을 제시할 것

특히 SEC-1 ~ SEC-3은 코드베이스 전체를 grep 하여 확인하라:
- SEC-1: 하드코딩된 비밀번호/API 키/토큰
- SEC-2: 런타임 DB 쓰기 호출
- SEC-3: dangerouslySetInnerHTML
```

---

## 12. 리스크 레지스터

| ID | 리스크 | 확률 | 영향 | 완화 방안 |
| --- | --- | --- | --- | --- |
| R-01 | 콘텐츠 작성이 개발보다 오래 걸림 (실제로 가장 흔한 실패 원인) | 높음 | 높음 | Phase 2를 Phase 3보다 **먼저** 배치. 프로젝트 3건만으로 먼저 배포 후 점진 추가 |
| R-02 | 정량 성과(`outcomes`) 데이터가 실제로 없음 | 중간 | 높음 | 없으면 만들지 말고, **과정 지표**(작성한 문서 페이지 수, 테스트 빌드 횟수, 팀 규모)로 대체. 허위 수치는 면접에서 반드시 무너짐 |
| R-03 | Git 커밋 기반 편집이 번거로워 업데이트를 안 하게 됨 | 중간 | 중간 | F-14 편집 딥링크 + GitHub 모바일 앱 웹 에디터 활용. 그래도 부담되면 Decap CMS 도입 |
| R-04 | 기업별 타깃 링크가 유출되어 다른 회사에 노출 | 낮음 | 중간 | §5.4 개인정보 마스킹 + `expiresAt` + 비방·비교 문구 금지. 애초에 "부끄러운 내용을 숨기는 용도"로 쓰지 말 것 |
| R-05 | 스택 선택을 미루다 착수가 지연 | 중간 | 중간 | T-01을 Phase 0의 **첫 태스크**로 고정. 결정을 못 하면 §3.1 권고안(A)으로 자동 진행 |
| R-06 | 미디어(영상/PDF) 용량으로 저장소 비대화 | 중간 | 낮음 | 100MB 초과 시 Git LFS 또는 외부 CDN(Cloudinary 무료 티어). PDF는 Drive 임베드 활용 |
| R-07 | 레퍼런스와 지나치게 유사해 표절 인상 | 낮음 | 높음 | R-6(코드 복사 금지) 준수. 디자인 토큰·레이아웃·문구를 독자적으로 구성. 정보 구조 계승은 문제없으나 시각적 모방은 회피 |

---

## 13. 부록

### 13.1 용어집

| 용어 | 의미 |
| --- | --- |
| SSOT | Single Source of Truth. 데이터의 유일한 원본 |
| SSG | Static Site Generation. 빌드 시점에 HTML 생성 |
| SWR | Stale-While-Revalidate. 캐시를 먼저 보여주고 백그라운드에서 갱신 |
| 오버레이 | 기본 콘텐츠 위에 부분적으로 덮어쓰는 레이어 (§5) |
| 타깃 링크 | 특정 회사·담당자용으로 커스터마이즈된 포트폴리오 URL |
| DoD | Definition of Done. 완료 정의 |
| AC | Acceptance Criteria. 수용 기준 |
| RLS | Row Level Security. PostgreSQL의 행 단위 접근 제어 |

### 13.2 레퍼런스 소스 위치 참조표

분석 근거의 원 위치입니다. 재확인이 필요할 때 사용합니다.

| 분석 내용 | 파일:라인 |
| --- | --- |
| 탭 라우팅 파라미터 | `src/App.tsx:236-257` |
| company 파라미터 초기화 | `src/App.tsx:310-317` |
| 기업 전환 로직 | `src/App.tsx:324-334` |
| 기본 데이터 동기화 | `src/App.tsx:343-377` |
| PDF 출력 | `src/App.tsx:394-402` |
| 관리자 인증 (하드코딩) | `src/App.tsx:433-442` |
| 콘텐츠 기본값 전체 | `src/App.tsx:447-734` |
| DnD 핸들러 | `src/App.tsx:521-581` |
| 커스텀 마크다운 렌더러 | `src/App.tsx:95-138` |
| 이미지 업로드 파이프라인 | `src/App.tsx:140-212` |
| 외부 임베드 URL 정규화 | `src/App.tsx:8-38` |
| 전역 내비게이션 | `src/App.tsx:2673-2725` |
| 비공개 잠금 화면 | `src/App.tsx:2727-2752` |
| 기업 관리 플로팅 패널 | `src/App.tsx:2879-2964` |
| SWR 캐시 + 병합 | `src/hooks/useContent.ts:41-193` |
| deepMerge | `src/hooks/useContent.ts:9-39` |
| Supabase 클라이언트 | `src/utils/supabase.ts` |
| 게임 아이콘 수집 | `src/utils/gameIcon.ts` |
| 디자인 토큰 | `src/styles/tokens.css` |
| 배포 워크플로 | `.github/workflows/deploy.yml` |

### 13.3 체크리스트 요약본 (인쇄용)

```
[ ] Phase 0  스택 결정 / 저장소 초기화 / 콘텐츠 원본 수집
[ ] Phase 1  스캐폴딩 / 토큰 / 스키마 / 로더 / 검증 / 레이아웃
[ ] Phase 2  JSON 콘텐츠 / 프로젝트 MDX / 미디어 / 플레이기록 / 자기소개서
[ ] Phase 3  랜딩 / 목록 / 상세 / 뷰어 / MDX / 이력서 / 자소서 / 플레이기록
[ ] Phase 4  타깃링크 / 참조검증 / SEO / PDF / Mermaid
[ ] Phase 5  접근성 / 성능 / CI / E2E / 배포 / 편집딥링크 / (시뮬레이터)

품질 게이트
[ ] PERF 1-5   [ ] SEO 1-5   [ ] A11Y 1-6   [ ] SEC 1-7   [ ] CNT 1-5
```

---

## 14. 변경 이력

| 버전 | 날짜 | 내용 |
| --- | --- | --- |
| 1.0 | 2026-09-08 | 최초 작성. 레퍼런스 소스 정적 분석 기반 |
