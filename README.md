# SIRA

**AI-Native Project Management for Developer Teams**

SIRA는 AI+Human 하이브리드 팀을 위한 작업 인텔리전스 플랫폼입니다. 모든 태스크 데이터를 Git 레포의 마크다운 파일로 관리하며, CLI와 웹 대시보드를 통해 사람과 AI 에이전트가 동등한 팀원으로 협업합니다.

## 핵심 특징

- **Git-Native 데이터** — DB 없이 `.md` + YAML frontmatter로 태스크 관리, Git이 유일한 저장소
- **AI 동등 팀원** — 사람과 AI 에이전트를 동일한 수준의 팀원으로 대시보드에 표시
- **자동 상태 추론** — Git 활동(커밋, PR)에서 태스크 상태를 자동 추론하여 제안
- **양방향 싱크** — CLI ↔ 웹 대시보드 실시간 동기화 (GitHub Webhook + SSE)
- **픽셀 오피스** — 팀원을 RPG 스타일 픽셀 캐릭터로 시각화

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | Turborepo 2.8 + npm workspaces |
| 웹 대시보드 | Next.js 16 · Tailwind CSS v4 · shadcn/ui v4 · Zustand |
| CLI | Commander.js · tsup |
| 코어 엔진 | Zod v4 · gray-matter · simple-git |
| 인증 | NextAuth v5 + GitHub OAuth |
| 실시간 | SSE (Server-Sent Events) |
| 드래그앤드롭 | @dnd-kit |
| 테스트 | Vitest 3.2 (91 tests) |
| CI/CD | GitHub Actions |

## 프로젝트 구조

```
sira/
├── apps/
│   ├── web/              # Next.js 16 대시보드 (15 routes)
│   └── cli/              # SIRA CLI (6 commands)
├── packages/
│   ├── core/             # 공유 코어 엔진
│   ├── ui/               # 공유 UI 컴포넌트
│   └── tsconfig/         # 공유 TypeScript 설정
├── turbo.json
└── package.json
```

## 시작하기

### 설치

```bash
# 의존성 설치
npm install

# 전체 빌드
npm run build

# 개발 서버 실행
npm run dev
```

### CLI 사용

```bash
# 프로젝트 초기화
node apps/cli/dist/index.js init

# 태스크 조회
node apps/cli/dist/index.js query "status:todo assignee:지영"

# 태스크 상태 변경
node apps/cli/dist/index.js status TASK-001 in_progress

# 태스크 할당
node apps/cli/dist/index.js assign TASK-001 지영

# AI 태스크 분해 (Claude Code 연동)
node apps/cli/dist/index.js decompose "소셜 로그인 추가"

# AI 질의 (Claude Code 연동)
node apps/cli/dist/index.js ask "이번 주 완료된 태스크는?"
```

### 웹 대시보드

```bash
npm run dev
# http://localhost:3000 에서 접속
```

**대시보드 뷰:**
- `/dashboard` — 글로벌 통계 + 픽셀 오피스 + 팀 현황
- `/tasks` — 태스크 테이블 (필터/정렬)
- `/tasks/kanban` — 칸반 보드 (드래그앤드롭)
- `/gantt` — 간트 차트 타임라인
- `/members` — 멤버 목록 + 프로필
- `/projects` — 프로젝트별 진행률

### 환경 변수

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth 클라이언트 ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 시크릿 |
| `NEXTAUTH_URL` | 대시보드 URL (기본: http://localhost:3000) |
| `NEXTAUTH_SECRET` | NextAuth 세션 암호화 키 |
| `GITHUB_WEBHOOK_SECRET` | GitHub Webhook 서명 검증 시크릿 |

## 태스크 파일 형식

```markdown
---
id: TASK-001
title: 로그인 화면 개발
status: in_progress
assignee: 지영
priority: high
area: web
epic_id: EP-001
related_files:
  - src/app/login/page.tsx
tags:
  - auth
created_at: "2026-03-12"
updated_at: "2026-03-16"
---

## 설명

로그인 화면을 개발합니다.
```

## 테스트

```bash
npm run test
```

| 모듈 | 테스트 수 | 내용 |
|------|----------|------|
| schema | 8 | task/epic/config Zod 스키마 검증 |
| parser | 6 | gray-matter 파싱 + 검증 |
| indexer | 14 | 풀빌드, 증분 업데이트, 복구 |
| config | 12 | 읽기/쓰기/팀원 추가/제거 |
| rbac | 14 | admin/member/agent 권한 검증 |
| query | 16 | 필터/정렬/그룹핑/ID 검색 |
| merge | 7 | 필드 레벨 머지 + 충돌 감지 |
| webhook | 6 | 서명 검증 + 태스크 파일 추출 |
| inference | 7 | Git 활동 → 상태 자동 추론 |

## 라이선스

MIT
