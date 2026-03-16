---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
status: 'complete'
completedAt: '2026-03-12'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-11-153032.md'
workflowType: 'architecture'
project_name: 'SIRA'
user_name: 'suwon'
date: '2026-03-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**기능 요구사항 (35개 FR):**

| 카테고리 | FR 수 | 아키텍처 영향 |
|----------|-------|-------------|
| 프로젝트 관리 (FR1-6) | 6 | 태스크 CRUD + 계층 구조 + 할당 시스템 |
| 데이터 모델/인덱스 (FR7-10) | 4 | Git-native 데이터 레이어, 인덱스 캐시 엔진 |
| CLI (FR11-14) | 4 | CLI 프레임워크, core 엔진 공유 |
| 웹 대시보드 (FR15-20) | 6 | Next.js, 실시간 UI, 멀티 뷰(칸반/테이블/멤버/프로젝트) |
| 양방향 싱크 (FR21-25) | 5 | Git↔Dashboard 동기화 엔진, 필드 레벨 머지 |
| AI 연동 (FR26-29) | 4 | 로컬 Claude Code 연동 프로토콜, .sira/ 스키마/컨벤션 설계 |
| 팀/권한 (FR30-33) | 4 | RBAC 시스템, 사람+AI 동등 팀원 모델 |
| 보안 (FR34-35) | 2 | API 키 관리, 프라이버시 제어 |

**비기능 요구사항 (NFR):**

| 영역 | 핵심 제약 | 아키텍처 결정 유도 |
|------|----------|-----------------|
| Performance | 대시보드 3초, 쿼리 1초 | 인덱스 캐시, SSR/SSG |
| Security | HTTPS, 토큰 24h, RBAC | 인증 미들웨어, 키 관리 시스템 |
| Scalability | MVP 500태스크, Growth 5,000태스크 | 증분 인덱싱, 아카이브 전략 |
| Integration | GitHub webhook, simple-git | Provider 패턴, 어댑터 구조 |
| Reliability | 충돌 시 양쪽 보존, 인덱스 자동 복구 | 방어적 머지, fallback 리빌드 |

**UX 아키텍처 요구사항:**

- shadcn/ui + Tailwind CSS 기반 디자인 시스템
- 커스텀 컴포넌트: 픽셀 오피스(Canvas/PixiJS), 간트 차트, AI 제안 뱃지
- Cmd+K 커맨드 팔레트, 인라인 편집, 드래그앤드롭
- 마크다운 렌더링/편집 전환
- 다크 테마 기본, 데스크톱 우선

### Scale & Complexity

- **복잡도:** High
- **기술 도메인:** Full-Stack (CLI + Web Dashboard)
- **AI 모델:** 로컬 Claude Code 기반 (중앙 API 서버 불필요)
- **예상 아키텍처 컴포넌트:** 7~8개 주요 모듈

### Technical Constraints & Dependencies

1. **TypeScript 전용** — CLI, 웹, core 모두 TypeScript
2. **DB 없음** — Git이 유일한 데이터 저장소. .md 파일 = 레코드, index.json = 캐시
3. **로컬 Claude Code 연동** — SIRA가 직접 Claude API를 호출하지 않음. 각 팀원의 로컬 Claude Code가 `.sira/` 구조를 이해하고 조작. SIRA는 프로토콜/스키마/컨벤션을 제공
4. **Node.js 18+** — npm 패키지 배포, 크로스 플랫폼
5. **Next.js** — 웹 대시보드 프레임워크 (API Routes가 서버 역할)
6. **1인 개발** — 아키텍처 단순성이 핵심. 오버엔지니어링 금지

### AI 연동 아키텍처 (핵심 결정)

**로컬 Claude Code 기반 동작 모델:**

- SIRA 자체에 AI 파이프라인을 내장하지 않음
- 각 팀원(사람/AI 에이전트)이 로컬 Claude Code로 태스크 분해, 상태 추론, 자연어 쿼리 실행
- SIRA가 제공하는 것: `.sira/` 디렉토리 구조, frontmatter 스키마, 조작 프로토콜
- Claude Code가 이 프로토콜을 따라 .md 파일을 생성/수정 → Git commit/push → 대시보드 자동 반영

**이 결정의 장점:**
- 중앙 API 비용/Rate Limit/큐잉 이슈 제거
- 각자 본인의 API 키 사용
- SIRA core가 AI 의존성 없이 단순해짐
- 실시간 반영은 Git webhook으로 동작하므로 AI 위치와 무관

**대시보드 실시간 반영 흐름:**
1. 로컬 Claude Code → .md 파일 수정 → `git commit + push`
2. GitHub webhook → 대시보드 서버에 알림
3. 대시보드 → 변경된 .md 파일 읽기 → UI 갱신

### Cross-Cutting Concerns

1. **인덱스 엔진** — CLI와 웹 모두에서 사용. .md 파싱 → index.json 생성/갱신 → 쿼리 처리
2. **Git 동기화** — webhook 수신, commit/push 자동화, 충돌 감지/해결
3. **AI 연동 프로토콜** — Claude Code가 SIRA 구조를 올바르게 조작할 수 있게 하는 스키마/컨벤션/프롬프트 설계
4. **RBAC** — 모든 쓰기 작업에 권한 검증 필요
5. **에러 처리/복구** — Git 통신 실패 재시도, 인덱스 불일치 자동 복구, 충돌 안전 처리

## Starter Template Evaluation

### Primary Technology Domain

Full-Stack (CLI + Web Dashboard) 모노레포 — TypeScript 기반

### Technical Preferences

| 항목 | 결정 |
|------|------|
| 언어 | TypeScript (strict) |
| 웹 프레임워크 | Next.js 16.x (App Router) |
| 스타일링 | Tailwind CSS v4 + shadcn/ui v4 (Radix UI) |
| 아이콘 | Lucide Icons |
| 모노레포 | Turborepo |
| 테스트 | Vitest + @testing-library/react |
| 패키지 매니저 | npm |
| 배포 (웹) | Vercel |
| 배포 (CLI) | npm 패키지 |
| Git 조작 | simple-git |
| Node.js | 18+ |

### Starter Options Considered

| 옵션 | 설명 | 판정 |
|------|------|------|
| Turborepo + create-next-app 직접 구성 | 모노레포 생성 후 앱/패키지 수동 추가 | **채택** |
| shadcn/ui v4 --monorepo | shadcn 새 모노레포 지원 | CLI 패키지 별도 구성 필요 |
| 커뮤니티 템플릿 (turborepo-shadcn) | 기존 포크 사용 | 버전 뒤처짐, 불필요 설정 포함 위험 |

### Selected Starter: Turborepo + create-next-app 직접 구성

**선택 이유:**
1. SIRA는 CLI가 일급 시민 — 커스텀 모노레포 구조 필수
2. 1인 개발이므로 불필요한 보일러플레이트 없이 이해하는 코드만 유지
3. shadcn/ui는 `npx shadcn@latest init --monorepo`로 추가 가능
4. Turborepo는 Vercel 배포와 네이티브 통합

**초기화 명령:**

```bash
# 1. Turborepo 모노레포 생성
npx create-turbo@latest sira --use-npm

# 2. Next.js 웹 대시보드
cd sira/apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --turbopack --use-npm

# 3. shadcn/ui 초기화
cd web
npx shadcn@latest init

# 4. packages/core 생성 (CLI + 웹 공유 코어)
# 5. apps/cli 생성 (CLI 패키지)
```

**최종 모노레포 구조:**

```
sira/
├── apps/
│   ├── web/              # Next.js 대시보드 (Tailwind + shadcn/ui)
│   └── cli/              # CLI 패키지 (sira init, sira query 등)
├── packages/
│   ├── core/             # 공유 코어 (파서, 인덱서, 싱크 엔진)
│   ├── ui/               # shadcn 기반 공유 UI 컴포넌트
│   └── tsconfig/         # 공유 TypeScript 설정
├── turbo.json
└── package.json
```

**스타터가 확립하는 아키텍처 결정:**

- **Language & Runtime:** TypeScript (strict), Node.js 18+
- **Styling:** Tailwind CSS v4 + shadcn/ui v4 (Radix UI)
- **Build:** Turborepo (캐싱, 병렬 빌드), Turbopack (dev)
- **Testing:** Vitest + @testing-library/react
- **Linting:** ESLint
- **배포:** Vercel (웹), npm (CLI)

**Note:** 프로젝트 초기화는 첫 번째 구현 스토리로 진행

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (구현 차단):**
- Data: .md 파싱(gray-matter) + 스키마 검증(zod) + 인덱스 캐시 전략
- Auth: GitHub OAuth + NextAuth.js
- API: Server Actions + SSE 실시간 업데이트
- Webhook: Next.js API Route에서 GitHub webhook 수신

**Important Decisions (아키텍처 형성):**
- State: Zustand
- DnD: @dnd-kit
- Logging: pino
- RBAC: config.yaml 기반 미들웨어

**Deferred Decisions (Post-MVP):**
- 픽셀 오피스 PixiJS 전환 여부
- 간트 차트 라이브러리 선택
- Sentry 에러 추적 도입
- 멀티테넌트 인증 구조

### Data Architecture

| 결정 | 선택 | 근거 |
|------|------|------|
| Frontmatter 파싱 | gray-matter | 가장 널리 사용, 안정적 |
| 스키마 검증 | zod | TypeScript 네이티브 타입 추론 |
| 인덱스 전략 | CLI: 온디맨드 / Web: chokidar 파일 워처 | 각 환경에 최적 |
| 마크다운 렌더링 | react-markdown + remark/rehype | 표준적, 플러그인 풍부 |
| 데이터 저장소 | Git (.md 파일) | PRD 확정 — DB 없음 |
| 캐시 | .sira/index.json | frontmatter 캐싱 → 고속 쿼리 |

### Authentication & Security

| 결정 | 선택 | 근거 |
|------|------|------|
| 인증 | GitHub OAuth + NextAuth.js | 레포 접근 권한 = SIRA 접근 권한 |
| RBAC | .sira/config.yaml + 미들웨어 | 3역할 고정, 단순 유지 |
| API 보안 | NextAuth.js 세션 검증 | Next.js 네이티브 통합 |
| CORS | 대시보드 오리진만 허용 | Vercel 기본 설정 |
| HTTPS | Vercel 기본 제공 | 별도 설정 불필요 |

### API & Communication Patterns

| 결정 | 선택 | 근거 |
|------|------|------|
| 서버 통신 | Server Actions + API Routes | App Router 네이티브, 추가 레이어 불필요 |
| 실시간 업데이트 | SSE (Server-Sent Events) | 단방향 실시간, WebSocket보다 가벼움 |
| 실시간 fallback | Polling (10초) | SSE 불가 환경 대비 |
| 에러 처리 | 커스텀 에러 클래스 (SiraError 등) | 일관된 에러 응답 포맷 |
| Git 재시도 | 최대 3회, 지수 백오프 | 네트워크 일시 장애 대응 |

### Frontend Architecture

| 결정 | 선택 | 근거 |
|------|------|------|
| 상태 관리 | Zustand | Context보다 사용성, Redux보다 가벼움 |
| 드래그앤드롭 | @dnd-kit | 활발한 유지보수, 접근성 내장 |
| 커맨드 팔레트 | shadcn Command (cmdk) | 디자인 시스템에 포함 |
| 간트 차트 | Canvas 커스텀 (MVP) | 경량, 필요 시 라이브러리 전환 |
| 픽셀 오피스 | Canvas 커스텀 (MVP) | 단순 시작, 복잡해지면 PixiJS 전환 |
| 마크다운 에디터 | react-markdown + 커스텀 에디터 | 뷰/편집 모드 전환 |

### Infrastructure & Deployment

| 결정 | 선택 | 근거 |
|------|------|------|
| CI/CD (테스트/린트) | GitHub Actions | Turborepo 캐싱 지원 |
| 웹 배포 | Vercel | Turborepo 네이티브 통합, PR 프리뷰 |
| CLI 배포 | npm publish | npm install -g sira |
| 환경 설정 | .env.local + Vercel 환경변수 | 민감 정보 분리 |
| 로깅 | pino | 경량 structured logging |
| 에러 추적 | Vercel Analytics (MVP) | 무료 내장, Growth에서 Sentry |
| Webhook | Next.js API Route | 별도 서버 불필요 |

### Decision Impact Analysis

**Implementation Sequence:**
1. 모노레포 초기화 (Turborepo + Next.js + CLI)
2. packages/core 구축 (gray-matter + zod 파서/인덱서)
3. CLI 기본 명령 (sira init, sira query)
4. 웹 대시보드 기본 UI (NextAuth + shadcn)
5. 양방향 싱크 (webhook + SSE)
6. 칸반/테이블 뷰 (Zustand + @dnd-kit)
7. 픽셀 오피스 / 간트 (Canvas)

**Cross-Component Dependencies:**
- packages/core ← CLI, Web 양쪽에서 의존
- gray-matter + zod ← 인덱서, 파서, 싱크 모두에서 사용
- NextAuth.js ← RBAC 미들웨어, API Routes에서 세션 검증
- SSE ← webhook API Route에서 이벤트 발행

## Implementation Patterns & Consistency Rules

### Naming Patterns

**파일/디렉토리:**

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | PascalCase | `TaskCard.tsx`, `PixelOffice.tsx` |
| 유틸/헬퍼/서비스 | camelCase | `parseMarkdown.ts`, `indexBuilder.ts` |
| 디렉토리 | kebab-case | `task-table/`, `pixel-office/` |
| 테스트 파일 | co-locate (원본 옆) | `TaskCard.test.tsx` |
| 타입 정의 | camelCase + .types.ts | `task.types.ts` |

**코드:**

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `getTaskById`, `taskList` |
| 타입/인터페이스 | PascalCase | `Task`, `TeamMember`, `SiraConfig` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_STATUS` |
| Zod 스키마 | camelCase + Schema | `taskSchema`, `configSchema` |
| Zustand 스토어 | use + PascalCase + Store | `useTaskStore`, `useTeamStore` |

**Frontmatter 필드 (SIRA 고유):**

| 규칙 | 예시 |
|------|------|
| snake_case | `status`, `assignee`, `priority`, `related_files`, `created_at` |

**API Route:**

| 규칙 | 예시 |
|------|------|
| kebab-case, 복수형 | `/api/tasks`, `/api/team-members`, `/api/webhook/github` |

### Structure Patterns

**웹 대시보드 (apps/web):**

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/
│   ├── tasks/
│   └── api/
├── components/
│   ├── task-table/         # feature 단위 폴더
│   │   ├── TaskTable.tsx
│   │   ├── TaskRow.tsx
│   │   ├── TaskTable.test.tsx
│   │   └── index.ts        # barrel export
│   ├── pixel-office/
│   ├── kanban/
│   └── ui/                 # shadcn 컴포넌트
├── hooks/                  # 공유 커스텀 훅
├── stores/                 # Zustand 스토어
├── lib/                    # 유틸리티
└── types/                  # 공유 타입
```

**공유 코어 (packages/core):**

```
packages/core/src/
├── parser/                 # gray-matter + zod 파싱
├── indexer/                # index.json 생성/갱신
├── sync/                   # Git 동기화 엔진
├── query/                  # 인덱스 기반 쿼리
├── schema/                 # frontmatter 스키마 정의
├── errors/                 # 커스텀 에러 클래스
└── types/                  # 공유 타입
```

**SIRA 프로젝트 태스크 구조 (사용자 레포):**

```
tasks/
├── epics/                  # 에픽 .md 파일
├── web/                    # FE 일감 (area: web)
├── server/                 # BE 일감 (area: server)
└── shared/                 # 공통 일감 (area: shared)
```

### Format Patterns

**API 응답:**

```typescript
// 성공
{ data: T }

// 에러
{ error: { code: string, message: string } }

// 목록
{ data: T[], total: number }
```

**날짜:**

| 컨텍스트 | 포맷 |
|----------|------|
| API/JSON | ISO 8601 (`2026-03-12T09:00:00Z`) |
| Frontmatter | `YYYY-MM-DD` (`2026-03-12`) |
| UI 표시 | 한국어 상대 시간 (`3시간 전`, `어제`) |

**JSON 필드:** camelCase (TypeScript 객체와 일치)

### Communication Patterns

**SSE 이벤트:**

| 포맷 | 예시 |
|------|------|
| `리소스:동작` | `task:created`, `task:updated`, `index:rebuilt`, `sync:conflict` |

**Zustand 스토어:**

```typescript
// 불변 업데이트, 액션은 스토어 내부 정의
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
}))
```

### Process Patterns

**에러 처리:**

```typescript
class SiraError extends Error { code: string }
class SyncConflictError extends SiraError { /* 양쪽 변경사항 포함 */ }
class IndexCorruptError extends SiraError { /* 자동 복구 트리거 */ }
class SchemaValidationError extends SiraError { /* zod 에러 포함 */ }

// API Route 일관된 처리
try { ... } catch (e) {
  if (e instanceof SiraError) return { error: { code: e.code, message: e.message } }
  return { error: { code: 'UNKNOWN', message: '알 수 없는 오류' } }
}
```

**로딩 상태:**
- 서버 컴포넌트: Next.js `loading.tsx` + Suspense
- 클라이언트 인터랙션: Zustand `isLoading` 플래그
- AI 생성 중: 스트리밍 프로그레스 바 + 현재 단계 텍스트

### Enforcement Guidelines

**모든 AI 에이전트 필수 준수:**
1. frontmatter 필드는 반드시 `snake_case`
2. 컴포넌트 파일은 PascalCase, 디렉토리는 kebab-case
3. API 응답은 `{ data }` / `{ error: { code, message } }` 포맷
4. 테스트는 원본 파일 옆에 co-locate
5. 에러는 SiraError 상속 클래스만 사용
6. Zustand 스토어는 `use___Store` 네이밍
7. SSE 이벤트는 `리소스:동작` 포맷

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sira/                                   # Turborepo 모노레포 루트
├── package.json                        # 루트 워크스페이스 설정
├── turbo.json                          # Turborepo 파이프라인 설정
├── tsconfig.json                       # 루트 TS 설정
├── .gitignore
├── .env.example                        # 환경변수 템플릿
├── README.md
├── .github/
│   └── workflows/
│       ├── ci.yml                      # lint + test (PR 시)
│       └── publish-cli.yml             # CLI npm publish (태그 시)
│
├── apps/
│   ├── web/                            # Next.js 16 대시보드
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.local                  # GitHub OAuth, 시크릿 등
│   │   ├── components.json             # shadcn/ui 설정
│   │   └── src/
│   │       ├── app/                    # App Router
│   │       │   ├── layout.tsx          # 루트 레이아웃 (다크 테마)
│   │       │   ├── page.tsx            # 랜딩/리다이렉트
│   │       │   ├── globals.css         # Tailwind 베이스
│   │       │   ├── loading.tsx         # 글로벌 로딩
│   │       │   ├── auth/
│   │       │   │   ├── login/page.tsx
│   │       │   │   └── callback/page.tsx
│   │       │   ├── dashboard/          # 메인 대시보드
│   │       │   │   ├── page.tsx        # 통계바 + 픽셀오피스 + 프로젝트/멤버
│   │       │   │   └── loading.tsx
│   │       │   ├── tasks/
│   │       │   │   ├── page.tsx        # 태스크 테이블 뷰
│   │       │   │   ├── [id]/page.tsx   # 태스크 상세 (.md 렌더링)
│   │       │   │   └── kanban/page.tsx # 칸반 보드 뷰
│   │       │   ├── gantt/
│   │       │   │   └── page.tsx        # 간트 차트 뷰
│   │       │   ├── members/
│   │       │   │   ├── page.tsx        # 멤버 목록
│   │       │   │   └── [id]/page.tsx   # 멤버 프로필
│   │       │   ├── projects/
│   │       │   │   └── page.tsx        # 프로젝트 뷰
│   │       │   └── api/                # API Routes
│   │       │       ├── auth/[...nextauth]/route.ts  # NextAuth
│   │       │       ├── tasks/route.ts               # 태스크 CRUD
│   │       │       ├── tasks/[id]/route.ts
│   │       │       ├── tasks/decompose/route.ts     # AI 분해 트리거
│   │       │       ├── tasks/assign/route.ts        # 일감 분배
│   │       │       ├── sse/route.ts                 # SSE 스트림
│   │       │       └── webhook/github/route.ts      # GitHub webhook 수신
│   │       │
│   │       ├── components/
│   │       │   ├── ui/                 # shadcn/ui 컴포넌트
│   │       │   ├── stats-bar/          # 글로벌 통계 바
│   │       │   │   ├── StatsBar.tsx
│   │       │   │   ├── StatCard.tsx
│   │       │   │   ├── StatsBar.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── pixel-office/       # 픽셀 오피스 (Canvas)
│   │       │   │   ├── PixelOffice.tsx
│   │       │   │   ├── PixelCharacter.tsx
│   │       │   │   ├── PixelDesk.tsx
│   │       │   │   ├── PixelOffice.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── task-table/         # 태스크 테이블
│   │       │   │   ├── TaskTable.tsx
│   │       │   │   ├── TaskRow.tsx
│   │       │   │   ├── TaskFilters.tsx
│   │       │   │   ├── ProjectGroup.tsx
│   │       │   │   ├── TaskTable.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── kanban/             # 칸반 보드 (@dnd-kit)
│   │       │   │   ├── KanbanBoard.tsx
│   │       │   │   ├── KanbanColumn.tsx
│   │       │   │   ├── KanbanCard.tsx
│   │       │   │   ├── KanbanBoard.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── gantt/              # 간트 차트 (Canvas)
│   │       │   │   ├── GanttChart.tsx
│   │       │   │   ├── GanttBar.tsx
│   │       │   │   ├── GanttChart.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── task-detail/        # 태스크 상세
│   │       │   │   ├── TaskDetail.tsx
│   │       │   │   ├── MarkdownViewer.tsx
│   │       │   │   ├── MarkdownEditor.tsx
│   │       │   │   ├── TaskMeta.tsx
│   │       │   │   ├── TaskDetail.test.tsx
│   │       │   │   └── index.ts
│   │       │   ├── member-card/        # 멤버 카드
│   │       │   │   ├── MemberCard.tsx
│   │       │   │   ├── AvatarBadge.tsx
│   │       │   │   └── index.ts
│   │       │   ├── command-palette/    # 커맨드 팔레트
│   │       │   │   ├── CommandPalette.tsx
│   │       │   │   ├── CommandPalette.test.tsx
│   │       │   │   └── index.ts
│   │       │   └── layout/             # 공통 레이아웃
│   │       │       ├── Sidebar.tsx
│   │       │       ├── Header.tsx
│   │       │       └── index.ts
│   │       │
│   │       ├── hooks/
│   │       │   ├── useSSE.ts           # SSE 실시간 구독
│   │       │   ├── useKeyboard.ts      # 키보드 단축키
│   │       │   └── useAuth.ts          # 인증 상태
│   │       │
│   │       ├── stores/
│   │       │   ├── useTaskStore.ts     # 태스크 상태
│   │       │   ├── useTeamStore.ts     # 팀 멤버 상태
│   │       │   ├── useUIStore.ts       # UI 상태 (사이드바, 모달 등)
│   │       │   └── useProjectStore.ts  # 프로젝트 상태
│   │       │
│   │       ├── lib/
│   │       │   ├── auth.ts             # NextAuth 설정
│   │       │   ├── sse.ts              # SSE 클라이언트
│   │       │   ├── api.ts              # API 호출 유틸
│   │       │   └── utils.ts            # cn() 등 유틸
│   │       │
│   │       ├── types/
│   │       │   └── index.ts            # 웹 전용 타입
│   │       │
│   │       └── middleware.ts           # NextAuth 미들웨어 (RBAC)
│   │
│   └── cli/                            # SIRA CLI
│       ├── package.json                # bin: { sira: ... }
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                # CLI 진입점
│           ├── commands/
│           │   ├── init.ts             # sira init
│           │   ├── query.ts            # sira query "필터"
│           │   ├── decompose.ts        # sira decompose (Claude Code 연동)
│           │   ├── ask.ts              # sira ask "질문"
│           │   └── status.ts           # sira status
│           ├── lib/
│           │   ├── config.ts           # .sira/config.yaml 읽기/쓰기
│           │   ├── display.ts          # 터미널 출력 포맷
│           │   └── git.ts              # Git 상태 확인
│           └── commands.test.ts
│
├── packages/
│   ├── core/                           # 공유 코어 엔진
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                # 퍼블릭 API barrel export
│   │       ├── parser/
│   │       │   ├── frontmatter.ts      # gray-matter 래퍼
│   │       │   ├── markdown.ts         # .md 파일 읽기/쓰기
│   │       │   └── parser.test.ts
│   │       ├── schema/
│   │       │   ├── task.schema.ts      # zod 태스크 스키마
│   │       │   ├── config.schema.ts    # zod config 스키마
│   │       │   ├── epic.schema.ts      # zod 에픽 스키마
│   │       │   ├── validate.ts         # 스키마 검증 유틸
│   │       │   └── schema.test.ts
│   │       ├── indexer/
│   │       │   ├── builder.ts          # index.json 빌드
│   │       │   ├── incremental.ts      # 증분 업데이트
│   │       │   ├── watcher.ts          # chokidar 파일 워처 (웹용)
│   │       │   └── indexer.test.ts
│   │       ├── query/
│   │       │   ├── engine.ts           # 쿼리 엔진 (필터/정렬/그룹)
│   │       │   ├── filter.ts           # 필터 파서
│   │       │   └── query.test.ts
│   │       ├── sync/
│   │       │   ├── git.ts              # simple-git 래퍼
│   │       │   ├── webhook.ts          # webhook 페이로드 파서
│   │       │   ├── merge.ts            # 필드 레벨 머지
│   │       │   ├── conflict.ts         # 충돌 감지/해결
│   │       │   └── sync.test.ts
│   │       ├── errors/
│   │       │   ├── SiraError.ts
│   │       │   ├── SyncConflictError.ts
│   │       │   ├── IndexCorruptError.ts
│   │       │   └── SchemaValidationError.ts
│   │       └── types/
│   │           ├── task.types.ts       # Task, Epic, Story 타입
│   │           ├── config.types.ts     # SiraConfig, TeamMember
│   │           ├── index.types.ts      # IndexEntry, IndexFile
│   │           └── sync.types.ts       # SyncEvent, ConflictInfo
│   │
│   ├── ui/                             # 공유 UI (향후 확장용)
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts
│   │
│   └── tsconfig/                       # 공유 TS 설정
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
└── docs/                               # 프로젝트 문서
```

### Architectural Boundaries

**API Boundaries:**

| 경계 | 내부 | 외부 |
|------|------|------|
| `/api/auth/*` | NextAuth 세션 | GitHub OAuth |
| `/api/tasks/*` | packages/core 호출 | 없음 |
| `/api/webhook/github` | 인덱스 갱신 + SSE 발행 | GitHub webhook 수신 |
| `/api/sse` | SSE 스트림 관리 | 브라우저 EventSource |

**Component → Core 의존 방향:**

```
apps/web  ──→  packages/core  ←──  apps/cli
```

- web과 cli는 서로 직접 의존하지 않음
- 둘 다 packages/core만 의존
- core는 외부 의존성 최소화 (gray-matter, zod, simple-git, chokidar)

**Data Boundaries:**

```
.sira/config.yaml    ← 팀 설정 (RBAC, 멤버 목록) — Git 커밋
.sira/index.json     ← 캐시 (자동 생성) — .gitignore
.sira/schema.yaml    ← frontmatter 스키마 정의 — Git 커밋
tasks/**/*.md        ← Source of Truth — Git 커밋
```

### Requirements → Structure Mapping

| FR 카테고리 | 주요 위치 |
|------------|----------|
| 프로젝트 관리 (FR1-6) | `apps/web/src/app/tasks/`, `packages/core/src/parser/` |
| 데이터/인덱스 (FR7-10) | `packages/core/src/indexer/`, `packages/core/src/schema/` |
| CLI (FR11-14) | `apps/cli/src/commands/` |
| 웹 대시보드 (FR15-20) | `apps/web/src/app/dashboard/`, `apps/web/src/components/` |
| 양방향 싱크 (FR21-25) | `packages/core/src/sync/`, `apps/web/src/app/api/webhook/` |
| AI 연동 (FR26-29) | `.sira/schema.yaml` (프로토콜), `apps/cli/src/commands/decompose.ts` |
| 팀/권한 (FR30-33) | `packages/core/src/schema/config.schema.ts`, `apps/web/src/middleware.ts` |
| 보안 (FR34-35) | `apps/web/src/lib/auth.ts`, `.env.local` |

### Data Flow

```
1. PO 자연어 입력 (대시보드)
   → /api/tasks/decompose → core/parser → .md 파일 생성 → git push
   → webhook → /api/webhook/github → core/indexer → SSE → 브라우저

2. 개발자 작업 (로컬)
   → Claude Code가 .md 수정 → git push
   → webhook → /api/webhook/github → core/indexer → SSE → 브라우저

3. 대시보드 조작 (드래그앤드롭 등)
   → Server Action → core/parser → .md 수정 → git push
   → (자체 반영은 Zustand 로컬 업데이트)
```

### SIRA 프로젝트 태스크 구조 (사용자 레포)

```
tasks/
├── epics/              # 에픽 .md 파일
│   └── EP-001-소셜로그인.md
├── web/                # FE 일감 (area: web)
│   ├── TASK-001-로그인화면개발.md
│   └── TASK-002-OAuth-UI통합.md
├── server/             # BE 일감 (area: server)
│   ├── TASK-003-DB설계.md
│   └── TASK-004-인증API개발.md
└── shared/             # 공통 일감 (area: shared)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- TypeScript + Next.js 16 + Turborepo + Tailwind v4 + shadcn/ui v4 — 모두 호환
- gray-matter + zod — TypeScript 표준 조합
- simple-git + chokidar — Node.js 네이티브, core 패키지에서 문제없음
- NextAuth.js + GitHub OAuth + App Router — 네이티브 통합
- Zustand + @dnd-kit + SSE — 클라이언트 사이드 충돌 없음
- Vitest + @testing-library/react — Next.js 16 공식 권장

**Pattern Consistency:**
- 네이밍: frontmatter(snake_case), 코드(camelCase), 컴포넌트(PascalCase), 디렉토리(kebab-case) — 충돌 없음
- API 응답 `{ data }` / `{ error }` — 전체 적용 가능
- SSE 이벤트 `리소스:동작` — 단일 포맷 통일

**Structure Alignment:**
- 모노레포 구조가 core 공유 패턴 지원 (apps/web, apps/cli → packages/core)
- Feature 기반 컴포넌트 구성이 멀티 뷰와 정합
- co-located 테스트가 feature 폴더 구조와 일치

### Requirements Coverage Validation ✅

**기능 요구사항 (35개 FR):** 전체 커버

| FR | 아키텍처 지원 | 상태 |
|----|-------------|------|
| FR1-6 (프로젝트 관리) | core/parser + web/tasks + cli/commands | ✅ |
| FR7-10 (데이터/인덱스) | core/indexer + core/schema + zod | ✅ |
| FR11-14 (CLI) | apps/cli/commands (init, query, decompose, ask) | ✅ |
| FR15-20 (웹 대시보드) | web/dashboard, tasks, kanban, members, projects | ✅ |
| FR21-25 (양방향 싱크) | core/sync + webhook API Route + SSE | ✅ |
| FR26-29 (AI 연동) | 로컬 Claude Code + .sira/ 프로토콜 | ✅ |
| FR30-33 (팀/권한) | config.yaml + RBAC 미들웨어 + NextAuth | ✅ |
| FR34-35 (보안) | .env.local + NextAuth 세션 + CORS | ✅ |

**비기능 요구사항:** 전체 커버

| NFR | 아키텍처 대응 | 상태 |
|-----|-------------|------|
| 대시보드 3초 | SSR + 인덱스 캐시 + Turborepo 빌드 | ✅ |
| 쿼리 1초 | index.json 캐시 기반 | ✅ |
| 충돌 시 양쪽 보존 | core/sync/merge + conflict | ✅ |
| HTTPS | Vercel 기본 제공 | ✅ |
| 500태스크 안정 | 증분 인덱싱 + 풀 리빌드 fallback | ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:** 모든 기술 스택 명시 (라이브러리명 + 용도), 버전 확인됨
**Structure Completeness:** 모든 파일/디렉토리 구체적으로 정의, barrel export 포함
**Pattern Completeness:** 7가지 필수 준수 규칙, 에러 클래스 계층, Zustand 패턴 코드 예시

### Gap Analysis Results

**Critical Gaps:** 없음

**Important Gaps (구현 단계에서 확정):**
1. `.sira/schema.yaml` 상세 필드 정의 — 에픽/스토리 작성 단계에서 확정
2. AI 연동 프로토콜 상세 (AGENTS.md 등) — 구현 단계에서 구체화
3. 대시보드 Git 커밋 사용자 (서비스 계정 vs PO 계정) — 구현 시 결정

**Nice-to-Have (Growth):**
- E2E 테스트 전략 (Playwright)
- 로컬 개발 환경 셋업 스크립트

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] 프로젝트 컨텍스트 분석 완료
- [x] 스케일/복잡도 평가 (High)
- [x] 기술 제약 식별 (DB 없음, 로컬 Claude Code)
- [x] 크로스커팅 관심사 매핑 (5개)

**✅ Architectural Decisions**
- [x] 5개 카테고리 결정 완료 (Data, Auth, API, Frontend, Infra)
- [x] 기술 스택 전체 명시
- [x] 통합 패턴 정의
- [x] 성능 고려사항 반영

**✅ Implementation Patterns**
- [x] 네이밍 컨벤션 확립
- [x] 구조 패턴 정의
- [x] 통신 패턴 명시
- [x] 프로세스 패턴 문서화

**✅ Project Structure**
- [x] 전체 디렉토리 구조 정의
- [x] 컴포넌트 경계 확립
- [x] 통합 포인트 매핑
- [x] FR → 구조 매핑 완료

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Git-native 데이터 모델로 인프라 복잡도 최소화
- 로컬 Claude Code 연동으로 중앙 API 의존성 제거
- Turborepo 모노레포로 core 코드 공유 깔끔
- 1인 개발에 적합한 단순하고 실용적인 스택

**Areas for Future Enhancement:**
- `.sira/schema.yaml` 상세 필드 정의 (에픽/스토리 단계)
- AI 연동 프로토콜 구체화 (AGENTS.md 등)
- E2E 테스트 전략 (Growth 단계)
- 멀티테넌트 전환 아키텍처 (SaaS 단계)

### Implementation Handoff

**AI Agent Guidelines:**
- 이 문서의 모든 아키텍처 결정을 정확히 따를 것
- 구현 패턴을 모든 컴포넌트에 일관되게 적용
- 프로젝트 구조와 경계를 준수
- 아키텍처 관련 질문은 이 문서를 참조

**First Implementation Priority:**
1. Turborepo 모노레포 초기화
2. packages/core 구축 (파서 + 인덱서)
3. CLI 기본 명령 구현
