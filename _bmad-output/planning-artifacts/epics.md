---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-03-12'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# SIRA - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SIRA, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**프로젝트 관리**
- FR1: 팀장은 자연어로 백로그를 입력하여 에픽/스토리/태스크를 자동 생성할 수 있다
- FR2: 팀장은 생성된 태스크를 팀원(사람/AI)에게 할당할 수 있다
- FR3: 팀장은 태스크 할당 및 변경 사항을 승인할 수 있다
- FR4: 팀원은 자신에게 할당된 태스크의 상태를 변경할 수 있다
- FR5: AI 에이전트는 할당된 태스크의 상태를 자율적으로 업데이트할 수 있다
- FR6: 사용자는 태스크를 에픽/스토리/태스크 계층 구조로 조회할 수 있다

**데이터 모델 & 인덱스**
- FR7: 시스템은 모든 태스크를 YAML frontmatter가 포함된 .md 파일로 Git 레포에 저장한다
- FR8: 시스템은 `.sira/index.json`을 자동 생성하고 .md 파일 변경 시 갱신한다
- FR9: 사용자는 frontmatter 필드 기반으로 태스크를 필터/정렬/그룹핑할 수 있다
- FR10: 시스템은 frontmatter 스키마를 정의하고 검증할 수 있다

**CLI 인터페이스**
- FR11: 사용자는 `sira init`으로 프로젝트를 초기화할 수 있다
- FR12: 사용자는 `sira decompose "자연어"`로 태스크를 자동 분해할 수 있다
- FR13: 사용자는 `sira query "필터조건"`으로 태스크를 조회할 수 있다
- FR14: 사용자는 `sira ask "자연어 질문"`으로 AI에게 프로젝트 상태를 질의할 수 있다

**웹 대시보드**
- FR15: 팀장은 팀 대시보드에서 전체 통계와 사람/AI 팀원 현황을 한 화면에서 볼 수 있다
- FR16: 사용자는 칸반 보드에서 드래그앤드롭으로 태스크 상태를 변경할 수 있다
- FR17: 사용자는 태스크 테이블에서 필터/정렬/그룹핑으로 태스크를 탐색할 수 있다
- FR18: 사용자는 태스크 상세 화면에서 .md 내용을 렌더링하고 편집할 수 있다
- FR19: 사용자는 멤버 프로필에서 할당된 태스크와 활동 기록을 조회할 수 있다
- FR20: 사용자는 멀티 프로젝트의 진행률을 프로젝트 뷰에서 비교할 수 있다
- FR36: 사용자는 간트 뷰에서 태스크의 일정과 진행률을 프로젝트별 타임라인으로 조회할 수 있다

**양방향 싱크**
- FR21: 시스템은 Git 레포의 .md 파일 변경을 감지하여 대시보드에 반영한다
- FR22: 시스템은 대시보드에서의 수정을 자동으로 Git commit + push한다
- FR23: 시스템은 동시 수정 시 필드 레벨 머지를 시도한다
- FR24: 시스템은 같은 필드 충돌 시 사용자에게 선택을 요청하고 데이터를 보존한다
- FR25: 시스템은 충돌 이력을 Git 히스토리에 기록한다

**AI 인텔리전스**
- FR26: AI는 레포 컨텍스트를 분석하여 태스크 분해 시 관련 코드 파일을 자동 참조한다
- FR27: AI는 Git 활동(파일 수정, PR, 커밋)에서 태스크 상태를 자동 추론한다
- FR28: 시스템은 AI 추론 결과를 제안 모드로 표시하고 사용자 확인 후 적용한다
- FR29: 사용자는 자연어로 프로젝트 상태에 대해 AI에게 질의할 수 있다

**팀 & 권한 관리**
- FR30: 팀장은 `.sira/config.yaml`에서 팀원을 등록할 수 있다 (사람 + AI 에이전트)
- FR31: 시스템은 팀장/팀원/AI 에이전트 3개 역할에 따라 권한을 제어한다
- FR32: 대시보드에서 사람과 AI 에이전트가 동등한 수준의 팀원으로 표시된다
- FR33: 팀장은 AI 에이전트의 작업 시간, 생성 파일 수 등 성과를 조회할 수 있다

**보안 & 프라이버시**
- FR34: 시스템은 API 키를 안전하게 저장하고 관리한다
- FR35: 개인 대시보드의 상세 정보는 본인만 열람할 수 있고 팀 뷰는 요약만 표시한다

### NonFunctional Requirements

**Performance**
- NFR1: 대시보드 초기 로딩 3초 이내
- NFR2: 태스크 테이블 필터/정렬 — 500개 태스크 기준 1초 이내
- NFR3: AI 태스크 분해 — 자연어 입력 후 10초 이내 결과
- NFR4: 양방향 싱크 — webhook 기반 Git 변경 감지 → 대시보드 반영 3초 이내, polling fallback 시 10초 이내
- NFR5: CLI 로컬 명령 (`sira query`, `sira init` 등) 1초 이내 응답
- NFR6: CLI AI 명령 (`sira ask`) — 첫 토큰 2초 이내, 전체 응답 10초 이내
- NFR7: 인덱스 증분 갱신 — .md 파일 변경 후 2초 이내
- NFR8: 인덱스 풀 리빌드 — 태스크 500개 기준 10초 이내

**Security**
- NFR9: API 키(Claude)는 환경변수 또는 시스템 keychain으로 저장, `.gitignore`에 포함하여 절대 Git에 커밋하지 않음
- NFR10: 대시보드 HTTPS 필수, CORS 정책 설정 (허용 오리진 명시)
- NFR11: 대시보드 인증 — 팀 멤버만 접근 가능 (토큰 기반, 만료 정책 24시간)
- NFR12: AI API 전송 시 코드 컨텍스트 최소화 (필요한 파일 경로/구조만)
- NFR13: RBAC 권한 위반 시 요청 거부 및 로깅

**Scalability**
- NFR14: MVP — 단일 팀(2-10명), 단일 레포, 태스크 500개까지 안정 동작
- NFR15: Growth — 태스크 5,000개, 멀티 프로젝트, 외부 팀 5개(총 2,500+ 태스크) 지원
- NFR16: 인덱스 엔진 — 증분 업데이트로 태스크 수 증가 시에도 성능 유지

**Integration**
- NFR17: GitHub webhook 표준 webhook payload 수신/처리
- NFR18: Git 조작 — `simple-git` 또는 동등한 라이브러리로 commit/push/pull 자동화
- NFR19: Claude API — Anthropic SDK (TypeScript) 사용, 모델 버전 설정 가능
- NFR20: Growth 단계에서 GitLab/Bitbucket provider 추가 가능한 어댑터 구조

**Reliability**
- NFR21: 양방향 싱크 — 모든 충돌 상황에서 양쪽 변경사항이 최소 하나의 브랜치/커밋에 보존
- NFR22: 인덱스 불일치 시 자동 복구 (full rebuild fallback)
- NFR23: Git 통신 실패 시 재시도 (최대 3회, 지수 백오프) + 로컬 큐잉 (최대 100건)
- NFR24: `.sira/` 디렉토리 무결성 검증 — config.yaml 손상 시 백업에서 복구, 스키마 검증

### Additional Requirements

**Architecture 문서에서 추출:**
- AR1: **스타터 템플릿** — Turborepo + create-next-app 직접 구성 (모노레포 초기화 필수)
- AR2: 모노레포 구조 — apps/web, apps/cli, packages/core, packages/ui, packages/tsconfig
- AR3: 로컬 Claude Code 연동 모델 — SIRA 자체에 AI 파이프라인 미내장. 각 팀원의 로컬 Claude Code가 `.sira/` 프로토콜을 따라 조작
- AR4: gray-matter + zod 기반 frontmatter 파싱/검증
- AR5: NextAuth.js + GitHub OAuth 인증
- AR6: Server Actions + SSE (Server-Sent Events) 실시간 업데이트
- AR7: Zustand 상태 관리
- AR8: @dnd-kit 드래그앤드롭
- AR9: pino structured logging
- AR10: GitHub Actions CI/CD (lint + test)
- AR11: Vercel 웹 배포, npm CLI 배포
- AR12: chokidar 파일 워처 (웹용 인덱스 감시)
- AR13: simple-git Git 조작 라이브러리
- AR14: 커스텀 에러 클래스 계층 — SiraError, SyncConflictError, IndexCorruptError, SchemaValidationError
- AR15: SSE 이벤트 포맷 `리소스:동작` (task:created, task:updated 등)
- AR16: API 응답 포맷 `{ data }` / `{ error: { code, message } }`
- AR17: `.sira/schema.yaml` frontmatter 스키마 정의 파일
- AR18: 태스크 디렉토리 구조 — tasks/epics/, tasks/web/, tasks/server/, tasks/shared/

**UX Design 문서에서 추출:**
- UX1: 다크 테마 기본, 데스크톱 우선 레이아웃
- UX2: Cmd+K 커맨드 팔레트 (shadcn Command / cmdk)
- UX3: 인라인 편집 — 테이블 셀 클릭 시 즉시 편집
- UX4: 마크다운 뷰/편집 모드 매끄러운 전환
- UX5: 상태 색상 체계 — 노란색=진행중(#EAB308), 보라색=리뷰(#A855F7), 초록=완료(#22C55E), 빨간=취소/긴급(#EF4444), 회색=백로그(#6B7280)
- UX6: 글로벌 통계 바 (숫자 카드로 전체 현황 즉각 전달)
- UX7: 아바타 + 이니셜 (색상 코딩된 원형 아바타)
- UX8: 픽셀 오피스 (Canvas 기반) — 팀원을 RPG 스타일 캐릭터로 시각화
- UX9: AI 제안 뱃지 — 한 클릭 승인/거부 인터랙션
- UX10: 스트리밍 태스크 생성 UI — 태스크가 실시간으로 트리에 추가
- UX11: 빈 상태(empty state) 가이드 — 첫 사용 안내
- UX12: 접을 수 있는 사이드바 네비게이션
- UX13: 키보드 단축키 지원 (개발자 사용자 필수)

### FR Coverage Map

- FR1: Epic 6 — 자연어 백로그 입력 → 에픽/스토리/태스크 자동 생성
- FR2: Epic 6 — 태스크 할당 (사람/AI)
- FR3: Epic 6 — 태스크 할당/변경 승인
- FR4: Epic 3 — 팀원 본인 태스크 상태 변경 (CLI)
- FR5: Epic 6 — AI 에이전트 자율 상태 업데이트
- FR6: Epic 3 — 에픽/스토리/태스크 계층 조회
- FR7: Epic 1 — .md + YAML frontmatter 데이터 모델
- FR8: Epic 1 — index.json 자동 생성/갱신
- FR9: Epic 3 — frontmatter 기반 필터/정렬/그룹핑
- FR10: Epic 1 — frontmatter 스키마 정의/검증
- FR11: Epic 1 — sira init 프로젝트 초기화
- FR12: Epic 6 — sira decompose (AI 협업 분해)
- FR13: Epic 3 — sira query 태스크 조회
- FR14: Epic 7 — sira ask 자연어 질의
- FR15: Epic 4 — 팀 대시보드 전체 통계/현황
- FR16: Epic 4 — 칸반 드래그앤드롭
- FR17: Epic 4 — 태스크 테이블 필터/정렬/그룹핑
- FR18: Epic 4 — 태스크 상세 .md 렌더링/편집
- FR19: Epic 4 — 멤버 프로필/활동 기록
- FR20: Epic 4 — 멀티 프로젝트 뷰
- FR36: Epic 4 — 간트 뷰 프로젝트별 타임라인
- FR21: Epic 5 — Git → 대시보드 변경 감지/반영
- FR22: Epic 5 — 대시보드 → Git commit/push
- FR23: Epic 5 — 필드 레벨 머지
- FR24: Epic 5 — 충돌 시 사용자 선택/데이터 보존
- FR25: Epic 5 — 충돌 이력 Git 히스토리 기록
- FR26: Epic 6 — AI 레포 컨텍스트 분석/코드 참조
- FR27: Epic 7 — AI Git 활동 기반 상태 자동 추론
- FR28: Epic 7 — AI 추론 제안 모드 + 사용자 확인
- FR29: Epic 7 — 자연어 프로젝트 상태 질의
- FR30: Epic 2 — config.yaml 팀원 등록
- FR31: Epic 2 — RBAC 3역할 권한 제어
- FR32: Epic 2 — 사람+AI 동등 팀원 표시
- FR33: Epic 7 — AI 에이전트 성과 조회
- FR34: Epic 2 — API 키 안전 관리
- FR35: Epic 7 — 개인 대시보드 프라이버시

## Epic List

### Epic 1: 프로젝트 초기화 & 코어 엔진
사용자가 `sira init`으로 프로젝트를 셋업하고, .md 파일 기반 태스크 데이터 모델이 동작하는 기반을 구축한다. 모노레포 초기화 + 코어 파서/인덱서가 포함.
**FRs:** FR7, FR8, FR10, FR11
**추가:** AR1, AR2, AR4, AR17, AR18

### Epic 2: 팀 설정 & 권한 관리
팀장이 config.yaml에서 팀원(사람+AI)을 등록하고, RBAC 기반 역할 권한이 적용된다. 사람과 AI가 동등한 팀원으로 관리된다.
**FRs:** FR30, FR31, FR32, FR34
**추가:** AR5 (NextAuth + GitHub OAuth)

### Epic 3: CLI 태스크 조회 & 관리
개발자가 CLI에서 태스크를 조회/필터/정렬하고, 자신의 태스크 상태를 변경할 수 있다. 터미널을 떠나지 않는 개발자 경험.
**FRs:** FR4, FR6, FR9, FR13
**추가:** UX13 (키보드 단축키)

### Epic 4: 웹 대시보드 — 팀 현황 & 태스크 뷰
팀장이 대시보드에서 팀 전체 현황을 한눈에 파악하고, 태스크를 테이블/칸반/간트로 탐색하며 상태를 변경할 수 있다.
**FRs:** FR15, FR16, FR17, FR18, FR19, FR20, FR36
**추가:** AR6(SSE), AR7(Zustand), AR8(@dnd-kit), UX1-UX7, UX11, UX12

### Epic 5: 양방향 싱크 (Git ↔ Dashboard)
Git 레포의 .md 변경이 대시보드에 실시간 반영되고, 대시보드 수정이 자동으로 Git commit/push된다. 충돌 시 필드 레벨 머지로 데이터를 보존한다.
**FRs:** FR21, FR22, FR23, FR24, FR25
**추가:** AR12(chokidar), AR13(simple-git), AR14(에러 클래스), AR15(SSE 이벤트), AR16(API 포맷)

### Epic 6: AI 자연어 태스크 분해 & 할당
팀장이 자연어로 백로그를 입력하면 AI가 에픽/스토리/태스크를 자동 생성하고, 팀원에게 할당/승인한다.
**FRs:** FR1, FR2, FR3, FR5, FR12, FR26
**추가:** AR3 (로컬 Claude Code 연동), UX9(AI 제안 뱃지), UX10(스트리밍 생성)

### Epic 7: AI 인텔리전스 — 상태 추론 & 자연어 질의
AI가 Git 활동에서 태스크 상태를 자동 추론하여 제안하고, 사용자가 자연어로 프로젝트 상태를 질의할 수 있다.
**FRs:** FR14, FR27, FR28, FR29, FR33, FR35

### Epic 8: 픽셀 오피스 & 게이미피케이션
팀원을 RPG 스타일 픽셀 캐릭터로 시각화하는 픽셀 오피스 뷰. 팀의 활동 상태가 시각적으로 즉시 전달되는 SIRA 고유 차별점.
**추가:** UX8 (Canvas 기반 픽셀 오피스)

## Epic 1: 프로젝트 초기화 & 코어 엔진

사용자가 `sira init`으로 프로젝트를 셋업하고, .md 파일 기반 태스크 데이터 모델이 동작하는 기반을 구축한다. 모노레포 초기화 + 코어 파서/인덱서가 포함.

### Story 1.1: Turborepo 모노레포 초기화

As a 개발자,
I want Turborepo 기반 모노레포가 올바르게 구성되어 있기를,
So that CLI, 웹 대시보드, 코어 엔진이 코드를 공유하며 독립적으로 빌드/배포될 수 있다.

**Acceptance Criteria:**

**Given** 빈 프로젝트 디렉토리가 존재할 때
**When** 모노레포 초기 설정을 실행하면
**Then** `apps/web`, `apps/cli`, `packages/core`, `packages/ui`, `packages/tsconfig` 구조가 생성된다
**And** `turbo.json`에 build, lint, test 파이프라인이 정의된다
**And** `apps/web`에 Next.js 16 + Tailwind CSS v4 + shadcn/ui v4가 구성된다
**And** `packages/tsconfig`에 base, nextjs, node 설정이 포함된다
**And** `npm run build`로 전체 모노레포 빌드가 성공한다

### Story 1.2: Frontmatter 스키마 정의 & 파서 구현

As a 개발자,
I want 태스크 .md 파일의 YAML frontmatter 스키마가 정의되고 파싱/검증되기를,
So that 모든 태스크 데이터가 일관된 구조를 가지며 타입 안전하게 처리된다.

**Acceptance Criteria:**

**Given** `packages/core/src/schema/` 디렉토리가 존재할 때
**When** zod 기반 태스크 스키마를 정의하면
**Then** `task.schema.ts`에 id, title, status, assignee, priority, related_files, created_at 등 필드가 정의된다
**And** `epic.schema.ts`에 에픽 스키마가 정의된다
**And** `config.schema.ts`에 `.sira/config.yaml` 스키마가 정의된다
**And** `packages/core/src/parser/frontmatter.ts`에서 gray-matter로 .md 파일을 파싱하고 zod로 검증한다
**And** 유효하지 않은 frontmatter 입력 시 `SchemaValidationError`가 발생한다
**And** `.sira/schema.yaml`에 frontmatter 필드 정의가 문서화된다
**And** 단위 테스트가 유효/무효 케이스를 모두 커버한다

### Story 1.3: 인덱스 엔진 구현 (index.json 생성/갱신)

As a 개발자,
I want tasks/ 디렉토리의 .md 파일들이 자동으로 인덱싱되기를,
So that 태스크 데이터를 빠르게 쿼리할 수 있다.

**Acceptance Criteria:**

**Given** `tasks/` 디렉토리에 .md 파일들이 존재할 때
**When** 인덱스 빌더를 실행하면
**Then** `.sira/index.json`에 모든 태스크의 frontmatter 캐시가 생성된다
**And** 증분 업데이트가 지원되어 변경된 파일만 재인덱싱된다
**And** 500개 태스크 기준 풀 리빌드가 10초 이내에 완료된다 (NFR8)
**And** 증분 갱신이 .md 파일 변경 후 2초 이내에 완료된다 (NFR7)
**And** 인덱스 불일치 감지 시 자동 풀 리빌드 fallback이 동작한다 (NFR22)
**And** 단위 테스트가 빌드, 증분 업데이트, 복구 시나리오를 커버한다

### Story 1.4: `sira init` CLI 명령 구현

As a 팀장,
I want `sira init`으로 프로젝트를 초기화하기를,
So that `.sira/` 디렉토리와 기본 설정이 자동 생성되어 즉시 SIRA를 사용할 수 있다.

**Acceptance Criteria:**

**Given** Git 레포가 존재하는 디렉토리에서
**When** `sira init`을 실행하면
**Then** `.sira/config.yaml`이 기본 템플릿으로 생성된다
**And** `.sira/schema.yaml`이 기본 frontmatter 스키마로 생성된다
**And** `tasks/epics/`, `tasks/web/`, `tasks/server/`, `tasks/shared/` 디렉토리가 생성된다
**And** `.sira/index.json`이 빈 인덱스로 초기화된다
**And** `.gitignore`에 `.sira/index.json`이 추가된다
**And** CLI 응답이 1초 이내에 완료된다 (NFR5)
**And** 이미 초기화된 프로젝트에서 실행 시 덮어쓰기 여부를 확인한다

## Epic 2: 팀 설정 & 권한 관리

팀장이 config.yaml에서 팀원(사람+AI)을 등록하고, RBAC 기반 역할 권한이 적용된다. 사람과 AI가 동등한 팀원으로 관리된다.

### Story 2.1: 팀 멤버 등록 & config.yaml 관리

As a 팀장,
I want `.sira/config.yaml`에서 팀원(사람+AI 에이전트)을 등록하기를,
So that 프로젝트에 참여하는 모든 팀원이 체계적으로 관리된다.

**Acceptance Criteria:**

**Given** `sira init`으로 초기화된 프로젝트가 존재할 때
**When** `.sira/config.yaml`에 팀 멤버를 추가하면
**Then** 각 멤버에 name, role(admin/member/agent), type(human/ai), github_username 필드가 정의된다
**And** AI 에이전트와 사람이 동일한 멤버 구조로 등록된다 (FR32)
**And** config.yaml이 zod 스키마로 검증되어 잘못된 형식 시 에러가 발생한다
**And** CLI에서 `sira init` 시 대화형으로 첫 팀원(관리자) 등록을 안내한다

### Story 2.2: RBAC 권한 제어 시스템

As a 팀장,
I want 역할 기반 권한 제어가 적용되기를,
So that 팀장/팀원/AI 에이전트가 각자 허용된 범위 내에서만 작업할 수 있다.

**Acceptance Criteria:**

**Given** config.yaml에 역할이 정의된 팀원이 존재할 때
**When** 태스크 관련 작업을 수행하면
**Then** admin 역할은 생성/할당/상태변경/승인/설정관리 모두 가능하다
**And** member 역할은 본인 태스크의 상태 변경만 가능하다
**And** agent 역할은 할당된 태스크의 상태 변경만 가능하다
**And** 권한 위반 시 요청이 거부되고 에러 로그가 기록된다 (NFR13)
**And** packages/core에 RBAC 검증 유틸리티가 구현되어 CLI/웹 양쪽에서 재사용 가능하다

### Story 2.3: GitHub OAuth 인증 (웹 대시보드)

As a 팀원,
I want GitHub 계정으로 대시보드에 로그인하기를,
So that 별도 계정 생성 없이 레포 접근 권한으로 대시보드를 사용할 수 있다.

**Acceptance Criteria:**

**Given** 웹 대시보드에 접속할 때
**When** GitHub OAuth 로그인을 시도하면
**Then** NextAuth.js를 통해 GitHub OAuth 인증이 처리된다
**And** 로그인한 사용자의 GitHub username이 config.yaml의 팀원 목록과 매칭된다
**And** 매칭되지 않는 사용자는 접근이 거부된다
**And** 세션 토큰은 24시간 만료 정책을 따른다 (NFR11)
**And** HTTPS가 적용되고 CORS는 대시보드 오리진만 허용한다 (NFR10)

### Story 2.4: API 키 안전 관리

As a 팀장,
I want API 키가 안전하게 저장/관리되기를,
So that 민감한 인증 정보가 Git에 노출되지 않는다.

**Acceptance Criteria:**

**Given** 프로젝트에서 Claude API 키가 필요할 때
**When** API 키를 설정하면
**Then** 환경변수(`.env.local`) 또는 시스템 keychain에 저장된다
**And** `.gitignore`에 `.env.local`, `.env` 패턴이 포함되어 Git 커밋이 방지된다 (NFR9)
**And** `sira init` 시 `.env.example` 파일이 생성되어 필요한 환경변수 목록을 안내한다
**And** API 키 미설정 시 관련 기능 사용 시 명확한 에러 메시지가 표시된다

## Epic 3: CLI 태스크 조회 & 관리

개발자가 CLI에서 태스크를 조회/필터/정렬하고, 자신의 태스크 상태를 변경할 수 있다. 터미널을 떠나지 않는 개발자 경험.

### Story 3.1: `sira query` 태스크 조회 & 필터링

As a 개발자,
I want CLI에서 `sira query "필터조건"`으로 태스크를 조회하기를,
So that 터미널을 떠나지 않고 원하는 태스크를 빠르게 찾을 수 있다.

**Acceptance Criteria:**

**Given** `.sira/index.json`에 태스크 인덱스가 존재할 때
**When** `sira query "assignee:지영 status:todo"`를 실행하면
**Then** 조건에 맞는 태스크 목록이 테이블 형태로 출력된다
**And** frontmatter 필드 기반 필터링이 지원된다 (status, assignee, priority, area 등)
**And** 정렬이 지원된다 (`--sort priority`, `--sort created_at`)
**And** 그룹핑이 지원된다 (`--group status`, `--group epic`)
**And** 에픽/스토리/태스크 계층 구조로 조회할 수 있다 (`--tree`) (FR6)
**And** 500개 태스크 기준 1초 이내 응답한다 (NFR2, NFR5)
**And** 결과가 없을 때 명확한 안내 메시지가 표시된다

### Story 3.2: CLI 태스크 상태 변경

As a 개발자(팀원),
I want CLI에서 내 태스크의 상태를 변경하기를,
So that 대시보드에 접속하지 않고 터미널에서 작업 상태를 업데이트할 수 있다.

**Acceptance Criteria:**

**Given** 본인에게 할당된 태스크가 존재할 때
**When** `sira status TASK-001 in_progress`를 실행하면
**Then** 해당 태스크 .md 파일의 frontmatter status가 변경된다
**And** `.sira/index.json`이 자동으로 갱신된다
**And** RBAC 검증으로 본인 태스크만 변경 가능하다 (FR4)
**And** 유효하지 않은 상태값 입력 시 허용 상태 목록이 표시된다
**And** 변경 성공 시 변경 전/후 상태가 확인 메시지로 출력된다
**And** CLI 응답이 1초 이내에 완료된다 (NFR5)

### Story 3.3: CLI 태스크 상세 조회

As a 개발자,
I want CLI에서 특정 태스크의 상세 정보를 조회하기를,
So that 태스크의 전체 내용과 수락 기준을 터미널에서 확인할 수 있다.

**Acceptance Criteria:**

**Given** tasks/ 디렉토리에 태스크 .md 파일이 존재할 때
**When** `sira query TASK-001`을 실행하면 (ID 직접 지정)
**Then** 태스크의 frontmatter 메타데이터가 포맷팅되어 표시된다
**And** 마크다운 본문이 터미널에서 가독성 있게 렌더링된다
**And** 관련 파일(related_files) 목록이 표시된다
**And** 에픽/스토리 상위 계층 정보가 표시된다
**And** CLI 응답이 1초 이내에 완료된다 (NFR5)

**Given** 존재하지 않는 태스크 ID를 조회할 때
**When** `sira query TASK-999`을 실행하면
**Then** "태스크를 찾을 수 없습니다: TASK-999" 에러 메시지가 표시된다
**And** 유사한 ID가 있으면 "혹시 TASK-099를 찾으셨나요?" 제안이 표시된다

## Epic 4: 웹 대시보드 — 팀 현황 & 태스크 뷰

팀장이 대시보드에서 팀 전체 현황을 한눈에 파악하고, 태스크를 테이블/칸반으로 탐색하며 상태를 변경할 수 있다.

### Story 4.1: 대시보드 레이아웃 & 디자인 시스템 기반

As a 사용자,
I want 다크 테마 기반의 일관된 대시보드 레이아웃이 구성되기를,
So that 모든 뷰에서 통일된 경험으로 대시보드를 사용할 수 있다.

**Acceptance Criteria:**

**Given** 웹 대시보드에 로그인한 상태일 때
**When** 대시보드에 접속하면
**Then** 다크 테마가 기본 적용된다 (UX1)
**And** 접을 수 있는 사이드바 네비게이션이 좌측에 표시된다 (UX12)
**And** 사이드바에 Dashboard, Tasks, Kanban, Gantt, Members, Projects 메뉴가 포함된다
**And** 상태 색상 체계가 Tailwind custom colors로 적용된다 — 노란(진행중), 보라(리뷰), 초록(완료), 빨간(긴급), 회색(백로그) (UX5)
**And** 아바타 + 이니셜 기반 멤버 식별이 전역에서 사용 가능하다 (UX7)
**And** 대시보드 초기 로딩이 3초 이내에 완료된다 (NFR1)

### Story 4.2: 팀 대시보드 — 글로벌 통계 & 팀 현황

As a 팀장,
I want 대시보드 메인 화면에서 팀 전체 통계와 현황을 한눈에 파악하기를,
So that 별도 탐색 없이 팀의 전반적인 상태를 즉시 이해할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드 메인 페이지에 접속할 때
**When** 페이지가 로드되면
**Then** 글로벌 통계 바에 총 태스크 수, 진행중, 완료, 리뷰 대기 등이 숫자 카드로 표시된다 (UX6, FR15)
**And** 사람+AI 팀원 현황이 아바타/이니셜과 함께 표시된다
**And** 각 팀원의 현재 할당 태스크 수와 상태 요약이 표시된다
**And** 프로젝트별 진행률 요약이 표시된다
**And** 빈 프로젝트(태스크 0개)일 때 "첫 백로그를 만들어 보세요" 가이드가 표시된다 (UX11)
**And** Zustand 스토어로 상태가 관리된다 (AR7)

### Story 4.3: 태스크 테이블 뷰 — 필터/정렬/그룹핑

As a 사용자,
I want 태스크를 테이블 형태로 탐색하며 필터/정렬/그룹핑하기를,
So that 대량의 태스크 중 원하는 항목을 빠르게 찾고 관리할 수 있다.

**Acceptance Criteria:**

**Given** tasks/ 디렉토리에 태스크가 존재할 때
**When** 태스크 테이블 뷰에 접속하면
**Then** 모든 태스크가 프로젝트별로 그룹핑된 테이블로 표시된다 (FR17)
**And** 상태/우선순위/담당자/에픽 기반 필터링이 지원된다
**And** 컬럼 헤더 클릭으로 정렬이 가능하다
**And** 상태/우선순위가 색상 코딩된 뱃지로 표시된다 (UX5)
**And** 테이블 셀 클릭 시 인라인 편집이 가능하다 (UX3)
**And** 500개 태스크 기준 필터/정렬이 1초 이내에 동작한다 (NFR2)

### Story 4.4: 칸반 보드 뷰 — 드래그앤드롭 상태 변경

As a 사용자,
I want 칸반 보드에서 드래그앤드롭으로 태스크 상태를 변경하기를,
So that 직관적인 조작으로 태스크 진행 상태를 관리할 수 있다.

**Acceptance Criteria:**

**Given** 칸반 보드 뷰에 접속할 때
**When** 태스크 카드를 다른 상태 컬럼으로 드래그하면
**Then** 태스크의 status가 해당 컬럼의 상태로 변경된다 (FR16)
**And** @dnd-kit 기반으로 부드러운 드래그앤드롭이 동작한다 (AR8)
**And** 각 컬럼(Backlog, Todo, In Progress, Review, Done)에 태스크 카드가 표시된다
**And** 카드에 제목, 담당자 아바타, 우선순위 뱃지가 표시된다
**And** RBAC 권한에 따라 이동 가능/불가능 상태가 시각적으로 구분된다
**And** 변경 시 .md 파일 frontmatter가 업데이트되고 인덱스가 갱신된다

### Story 4.5: 태스크 상세 뷰 — 마크다운 렌더링/편집

As a 사용자,
I want 태스크 상세 화면에서 .md 내용을 보고 편집하기를,
So that 태스크의 전체 내용을 대시보드에서 확인하고 수정할 수 있다.

**Acceptance Criteria:**

**Given** 태스크 목록에서 특정 태스크를 클릭할 때
**When** 태스크 상세 화면이 열리면
**Then** frontmatter 메타데이터가 뱃지/태그 형태로 상단에 표시된다 (FR18)
**And** 마크다운 본문이 react-markdown으로 렌더링된다
**And** 편집 버튼 클릭 시 마크다운 에디터로 전환된다 (UX4)
**And** 편집 후 저장 시 .md 파일이 업데이트되고 인덱스가 갱신된다
**And** 태스크 히스토리(변경 이력)가 테이블로 표시된다
**And** 관련 파일(related_files) 목록이 링크로 표시된다

### Story 4.6: 멤버 프로필 뷰

As a 팀장,
I want 멤버별 프로필에서 할당된 태스크와 활동 기록을 조회하기를,
So that 각 팀원의 업무 부하와 진행 상황을 파악할 수 있다.

**Acceptance Criteria:**

**Given** 멤버 목록 또는 대시보드에서 멤버를 클릭할 때
**When** 멤버 프로필 페이지가 열리면
**Then** 멤버 정보(이름, 역할, 타입 human/ai)가 표시된다 (FR19)
**And** 할당된 태스크 목록이 상태별로 그룹핑되어 표시된다
**And** 최근 활동 기록(상태 변경, 태스크 완료 등)이 타임라인으로 표시된다
**And** 사람과 AI 에이전트가 동일한 프로필 구조로 표시된다 (FR32)

### Story 4.7: 프로젝트 뷰 — 멀티 프로젝트 진행률

As a 팀장,
I want 여러 프로젝트의 진행률을 한 화면에서 비교하기를,
So that 프로젝트 간 우선순위와 리소스 배분을 판단할 수 있다.

**Acceptance Criteria:**

**Given** 프로젝트 뷰 페이지에 접속할 때
**When** 페이지가 로드되면
**Then** 각 프로젝트(에픽 단위)의 진행률이 프로그레스 바로 표시된다 (FR20)
**And** 프로젝트별 총 태스크 수, 완료 수, 진행중 수가 카드로 표시된다
**And** 프로젝트 카드 클릭 시 해당 에픽의 태스크 목록으로 이동한다
**And** 상태별 색상 코딩이 프로그레스 바에 반영된다 (UX5)

### Story 4.8: 간트 뷰 — 프로젝트별 타임라인

As a 팀장,
I want 간트 뷰에서 태스크의 일정과 진행률을 타임라인으로 조회하기를,
So that 프로젝트 일정과 태스크 간 의존성을 시각적으로 파악할 수 있다.

**Acceptance Criteria:**

**Given** tasks/ 디렉토리에 태스크가 존재할 때
**When** 간트 뷰에 접속하면
**Then** 태스크가 프로젝트(에픽)별로 그룹핑된 타임라인으로 표시된다 (FR36)
**And** 각 태스크 바에 상태별 색상 코딩이 적용된다 — 노란(진행중), 보라(리뷰), 초록(완료), 빨간(긴급) (UX5)
**And** 태스크 바의 길이가 예상 기간(start_date ~ due_date)을 반영한다
**And** 태스크 바 클릭 시 태스크 상세 화면으로 이동한다
**And** Canvas 기반으로 렌더링되어 대량 태스크에서도 부드럽게 동작한다
**And** 날짜가 없는 태스크는 "미지정" 영역에 별도 표시된다

### Story 4.9: Cmd+K 커맨드 팔레트

As a 사용자,
I want Cmd+K로 모든 액션에 키보드로 접근하기를,
So that 마우스 없이도 빠르게 태스크 검색, 뷰 전환, 명령 실행이 가능하다.

**Acceptance Criteria:**

**Given** 대시보드가 열려 있을 때
**When** Cmd+K (Mac) 또는 Ctrl+K (Windows/Linux)를 누르면
**Then** shadcn Command 기반 커맨드 팔레트가 열린다 (UX2)
**And** 태스크 검색 (제목, ID, 담당자)이 지원된다
**And** 뷰 전환 (Dashboard, Tasks, Kanban, Gantt, Members, Projects)이 지원된다
**And** 빠른 액션 (태스크 생성, 상태 변경, 멤버 이동)이 지원된다
**And** 입력에 따라 실시간 필터링되어 결과가 표시된다
**And** Enter로 선택, Esc로 닫기가 동작한다
**And** 최근 사용 항목이 상단에 표시된다

## Epic 5: 양방향 싱크 (Git ↔ Dashboard)

Git 레포의 .md 변경이 대시보드에 실시간 반영되고, 대시보드 수정이 자동으로 Git commit/push된다. 충돌 시 필드 레벨 머지로 데이터를 보존한다.

### Story 5.1: GitHub Webhook 수신 & Git → 대시보드 반영

As a 팀장,
I want Git 레포에 push된 .md 파일 변경이 대시보드에 자동 반영되기를,
So that 개발자나 AI가 로컬에서 태스크를 수정하면 대시보드에서 즉시 확인할 수 있다.

**Acceptance Criteria:**

**Given** GitHub webhook이 설정된 프로젝트에서
**When** 팀원이 tasks/ 디렉토리의 .md 파일을 수정하고 push하면
**Then** `/api/webhook/github` API Route에서 webhook payload를 수신한다 (NFR17)
**And** 변경된 .md 파일이 파싱되고 인덱스가 갱신된다
**And** SSE를 통해 `task:updated` 이벤트가 브라우저에 전송된다 (AR15)
**And** 대시보드 UI가 3초 이내에 갱신된다 (NFR4)
**And** SSE 불가 환경에서 polling fallback이 10초 간격으로 동작한다
**And** webhook 서명 검증으로 위조 요청이 거부된다

### Story 5.2: 대시보드 → Git 자동 Commit/Push

As a 팀장,
I want 대시보드에서 수정한 내용이 자동으로 Git에 반영되기를,
So that 대시보드 조작이 곧 레포 변경이 되어 CLI 사용자도 즉시 확인할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드에서 태스크를 수정할 때 (칸반 드래그, 인라인 편집 등)
**When** 변경 사항을 저장하면
**Then** 해당 .md 파일이 수정되고 simple-git을 통해 자동 commit + push된다 (FR22, AR13)
**And** 커밋 메시지에 변경 내용이 요약된다 (예: "Update TASK-001: status todo → in_progress")
**And** Git 통신 실패 시 최대 3회 지수 백오프로 재시도한다 (NFR23)
**And** 재시도 실패 시 로컬 큐에 저장되고 (최대 100건) 사용자에게 알림한다
**And** API 응답은 `{ data }` / `{ error: { code, message } }` 포맷을 따른다 (AR16)

### Story 5.3: 필드 레벨 머지 & 충돌 해결

As a 팀장,
I want 동시 수정 시 필드 레벨 머지가 자동으로 시도되고 충돌 시 선택할 수 있기를,
So that 데이터가 절대 손실되지 않고 안전하게 병합된다.

**Acceptance Criteria:**

**Given** 같은 태스크를 CLI와 대시보드에서 동시에 수정할 때
**When** 서로 다른 필드를 변경하면 (예: CLI에서 status, 대시보드에서 priority)
**Then** 필드 레벨 머지로 양쪽 변경이 자동 병합된다 (FR23)

**Given** 같은 태스크의 같은 필드를 동시에 수정할 때
**When** 충돌이 감지되면
**Then** 사용자에게 양쪽 변경사항을 보여주고 선택을 요청한다 (FR24)
**And** `SyncConflictError`가 발생하며 양쪽 데이터를 포함한다 (AR14)
**And** 선택하지 않은 변경사항도 별도 커밋에 보존된다
**And** 충돌 이력이 Git 히스토리에 기록된다 (FR25)
**And** 대시보드에서 "데이터는 안전합니다" 메시지가 명시적으로 표시된다
**And** 모든 충돌 상황에서 양쪽 변경사항이 최소 하나의 브랜치/커밋에 보존된다 (NFR21)

### Story 5.4: SSE 실시간 업데이트 스트림

As a 사용자,
I want 대시보드가 서버 이벤트를 실시간으로 수신하기를,
So that 다른 팀원의 변경사항이 페이지 새로고침 없이 즉시 반영된다.

**Acceptance Criteria:**

**Given** 대시보드가 열려 있을 때
**When** 서버에서 태스크 변경 이벤트가 발생하면
**Then** `/api/sse` 엔드포인트를 통해 SSE 스트림이 유지된다 (AR6)
**And** `task:created`, `task:updated`, `task:deleted`, `index:rebuilt`, `sync:conflict` 이벤트가 전달된다 (AR15)
**And** 클라이언트의 `useSSE` 훅이 이벤트를 수신하여 Zustand 스토어를 갱신한다
**And** SSE 연결 끊김 시 자동 재연결이 동작한다
**And** SSE 미지원 환경에서 polling fallback이 동작한다

## Epic 6: AI 협업 태스크 분해 & 할당

팀장이 BMAD 스타일 워크플로우로 AI와 협업하여 에픽/스토리/태스크를 단계적으로 생성하고, 팀원에게 할당/승인한다.

### Story 6.1: `.sira/` 프로토콜 & AI 연동 스키마 설계

As a 개발자,
I want `.sira/` 디렉토리에 AI가 이해할 수 있는 프로토콜과 컨벤션이 정의되기를,
So that 로컬 Claude Code가 SIRA 구조를 올바르게 조작할 수 있다.

**Acceptance Criteria:**

**Given** `sira init`으로 초기화된 프로젝트가 존재할 때
**When** `.sira/` 디렉토리를 확인하면
**Then** `AGENTS.md`에 AI 에이전트가 따라야 할 태스크 조작 프로토콜이 문서화되어 있다
**And** 프로토콜에 .md 파일 생성/수정 시 frontmatter 필수 필드, 파일 네이밍 규칙, 디렉토리 배치 규칙이 포함된다
**And** 에픽/스토리/태스크 계층 구조의 파일 관계가 정의된다
**And** AI가 생성할 .md 파일의 예시 템플릿이 포함된다
**And** 프로토콜이 Claude Code의 CLAUDE.md에서 참조 가능한 형태로 작성된다 (AR3)

### Story 6.2: `sira decompose` — 자연어 태스크 자동 분해

As a 팀장,
I want `sira decompose`로 자연어 백로그를 입력하여 태스크를 자동 분해하기를,
So that 한 줄 입력으로 에픽/스토리/태스크 .md 파일이 자동 생성된다.

**Acceptance Criteria:**

**Given** 초기화된 프로젝트에서
**When** `sira decompose "소셜 로그인 추가. Google, Apple 지원"`을 실행하면
**Then** AI가 레포 컨텍스트(기존 코드 구조, 태스크)를 분석한다 (FR26)
**And** AI가 자연어를 분석하여 에픽/스토리/태스크를 자동 생성한다 (FR1)
**And** 생성 과정이 스트리밍으로 실시간 표시된다 (UX10)
**And** 생성 결과를 사용자에게 제시하고 승인/수정을 요청한다
**And** 최종 승인 시 .md 파일들이 tasks/ 디렉토리에 생성된다
**And** 생성된 파일의 frontmatter가 스키마를 준수한다
**And** 관련 코드 파일이 related_files에 자동 참조된다 (FR26)
**And** 전체 분해 과정이 10초 이내에 완료된다 (NFR3)

### Story 6.3: 태스크 할당 시스템

As a 팀장,
I want 생성된 태스크를 팀원(사람/AI)에게 할당하기를,
So that 각 팀원이 자신의 업무를 명확히 파악하고 시작할 수 있다.

**Acceptance Criteria:**

**Given** 생성된 태스크가 tasks/ 디렉토리에 존재할 때
**When** 팀장이 태스크를 할당하면 (CLI: `sira assign TASK-001 지영` / 대시보드: 드롭다운 선택)
**Then** 태스크 .md 파일의 assignee 필드가 업데이트된다 (FR2)
**And** config.yaml에 등록된 팀원(사람+AI)만 할당 대상으로 표시된다
**And** AI 에이전트에게도 사람과 동일하게 할당 가능하다
**And** 할당 변경 시 인덱스가 갱신된다
**And** RBAC 검증으로 admin 역할만 할당 가능하다

### Story 6.4: 태스크 승인 & AI 자율 상태 업데이트

As a 팀장,
I want 태스크 변경사항을 승인하고 AI 에이전트의 자율 업데이트를 관리하기를,
So that 팀의 작업 흐름이 제어되고 AI 작업도 적절히 감독된다.

**Acceptance Criteria:**

**Given** 태스크에 변경이 발생할 때
**When** 팀원이나 AI가 상태를 변경하면
**Then** 팀장이 대시보드에서 변경 이력을 확인하고 승인/반려할 수 있다 (FR3)
**And** AI 에이전트는 할당된 태스크의 상태를 자율적으로 업데이트할 수 있다 (FR5)
**And** AI의 상태 변경은 AI 제안 뱃지로 표시된다 (UX9)
**And** 팀장은 한 클릭으로 AI 변경을 승인/거부할 수 있다
**And** 승인/거부 이력이 태스크 히스토리에 기록된다

## Epic 7: AI 인텔리전스 — 상태 추론 & 자연어 질의

AI가 Git 활동에서 태스크 상태를 자동 추론하여 제안하고, 사용자가 자연어로 프로젝트 상태를 질의할 수 있다.

### Story 7.1: Git 활동 기반 태스크 상태 자동 추론

As a 팀장,
I want AI가 Git 활동에서 태스크 상태를 자동으로 추론하기를,
So that 개발자가 수동으로 상태를 업데이트하지 않아도 팀 현황이 정확하게 유지된다.

**Acceptance Criteria:**

**Given** 태스크에 related_files가 지정되어 있을 때
**When** 해당 파일이 수정/커밋/PR 생성되면
**Then** AI가 Git 활동을 분석하여 태스크 상태를 추론한다 (FR27)
**And** 파일 수정 시작 → "in_progress" 추론
**And** PR 생성 → "review" 추론
**And** PR 머지 → "done" 추론
**And** 추론 결과에 근거가 포함된다 (커밋 해시, 변경 파일, 시간)
**And** 휴리스틱 기반으로 동작하고 주기적으로 AI 검증한다 (API 비용 최적화)

### Story 7.2: AI 추론 제안 모드 & 사용자 승인

As a 팀장,
I want AI 추론 결과가 제안 모드로 표시되고 한 클릭으로 승인/거부할 수 있기를,
So that AI가 자동으로 상태를 변경하지 않고 사람이 최종 결정한다.

**Acceptance Criteria:**

**Given** AI가 태스크 상태를 추론했을 때
**When** 대시보드에서 해당 태스크를 확인하면
**Then** 추론 결과가 AI 제안 뱃지로 태스크 옆에 표시된다 (FR28, UX9)
**And** 뱃지에 추론 근거(커밋 해시, 파일 변경)가 표시된다
**And** 팀장이 한 클릭으로 승인하면 상태가 적용된다
**And** 거부하면 제안이 제거되고 기존 상태가 유지된다
**And** 승인/거부 이력이 태스크 히스토리에 기록된다
**And** CLI에서도 `sira query`로 제안 상태를 확인할 수 있다

### Story 7.3: `sira ask` — 자연어 프로젝트 질의

As a 사용자,
I want 자연어로 프로젝트 상태에 대해 AI에게 질문하기를,
So that 대시보드를 탐색하지 않고도 원하는 정보를 즉시 얻을 수 있다.

**Acceptance Criteria:**

**Given** 초기화된 프로젝트에서
**When** `sira ask "내 남은 태스크 중 제일 급한 거?"`를 실행하면
**Then** AI가 인덱스와 태스크 데이터를 분석하여 자연어로 답변한다 (FR14, FR29)
**And** 첫 토큰이 2초 이내에 출력된다 (NFR6)
**And** 전체 응답이 10초 이내에 완료된다 (NFR6)
**And** 답변에 관련 태스크 ID와 상세 정보가 포함된다
**And** "팀 전체 진행 상황은?", "이번 주 완료된 태스크는?" 등 다양한 질의를 지원한다
**And** 대시보드에서도 자연어 입력바를 통해 동일한 질의가 가능하다

### Story 7.4: AI 에이전트 성과 조회 & 개인 프라이버시

As a 팀장,
I want AI 에이전트의 성과를 조회하고 개인 프라이버시를 보호하기를,
So that AI 팀원의 기여를 파악하면서도 사람 팀원의 프라이버시가 존중된다.

**Acceptance Criteria:**

**Given** AI 에이전트가 태스크를 수행한 기록이 있을 때
**When** 멤버 프로필에서 AI 에이전트를 조회하면
**Then** 작업 시간, 완료 태스크 수, 생성 파일 수 등 성과 지표가 표시된다 (FR33)
**And** AI 에이전트의 상세 활동 기록이 타임라인으로 표시된다

**Given** 사람 팀원의 프로필을 조회할 때
**When** 다른 팀원(본인 아닌)이 접근하면
**Then** 팀 뷰에는 요약 정보만 표시된다 (FR35)
**And** 상세 활동 기록은 본인만 열람할 수 있다
**And** NextAuth 세션 기반으로 본인 여부가 검증된다

## Epic 8: 픽셀 오피스 & 게이미피케이션

팀원을 RPG 스타일 픽셀 캐릭터로 시각화하는 픽셀 오피스 뷰. 팀의 활동 상태가 시각적으로 즉시 전달되는 SIRA 고유 차별점.

### Story 8.1: 픽셀 오피스 뷰 — 팀 활동 시각화

As a 팀장,
I want 팀원들이 RPG 스타일 픽셀 캐릭터로 가상 오피스에 표시되기를,
So that 대시보드를 열자마자 팀의 활동 상태를 시각적으로 즉시 파악할 수 있다.

**Acceptance Criteria:**

**Given** 대시보드 메인 페이지에 접속할 때
**When** 픽셀 오피스 영역이 렌더링되면
**Then** 각 팀원(사람+AI)이 픽셀 아트 캐릭터로 표시된다 (UX8)
**And** HTML Canvas 기반으로 렌더링된다
**And** 캐릭터 상태가 팀원의 현재 작업 상태를 반영한다 (작업중/대기/완료 등)
**And** 캐릭터 위에 이름과 현재 태스크 요약이 표시된다
**And** 캐릭터에 마우스 호버 시 상세 정보 툴팁이 표시된다
**And** SSE 이벤트로 상태 변경 시 캐릭터 상태가 실시간 갱신된다
**And** AI 에이전트도 사람과 동일하게 캐릭터로 표시된다 (구분 가능한 시각적 표시 포함)

