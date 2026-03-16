# Story 1.1: Turborepo 모노레포 초기화

Status: ready-for-dev

## Story

As a 개발자,
I want Turborepo 기반 모노레포가 올바르게 구성되어 있기를,
So that CLI, 웹 대시보드, 코어 엔진이 코드를 공유하며 독립적으로 빌드/배포될 수 있다.

## Acceptance Criteria

1. **Given** 빈 프로젝트 디렉토리가 존재할 때 **When** 모노레포 초기 설정을 실행하면 **Then** `apps/web`, `apps/cli`, `packages/core`, `packages/ui`, `packages/tsconfig` 구조가 생성된다
2. **Given** 모노레포가 생성되었을 때 **When** `turbo.json`을 확인하면 **Then** build, lint, test 파이프라인이 정의되어 있다
3. **Given** `apps/web` 디렉토리가 존재할 때 **When** 웹 앱 설정을 확인하면 **Then** Next.js 16 + Tailwind CSS v4 + shadcn/ui가 구성되어 있다
4. **Given** `packages/tsconfig` 디렉토리가 존재할 때 **When** TS 설정을 확인하면 **Then** base, nextjs, node 설정이 포함된다
5. **Given** 모든 패키지가 구성되었을 때 **When** `npm run build`를 실행하면 **Then** 전체 모노레포 빌드가 성공한다
6. **Given** `packages/core`가 존재할 때 **When** 패키지 설정을 확인하면 **Then** apps/web과 apps/cli 양쪽에서 import 가능한 구조이다

## Tasks / Subtasks

- [ ] Task 1: Turborepo 모노레포 스캐폴딩 (AC: #1, #2)
  - [ ] 1.1 `npx create-turbo@latest sira --use-npm`으로 모노레포 생성
  - [ ] 1.2 불필요한 기본 앱/패키지 정리 (create-turbo 기본 생성물 제거)
  - [ ] 1.3 `turbo.json`에 build, lint, test 파이프라인 정의
  - [ ] 1.4 루트 `package.json` 워크스페이스 설정 확인
- [ ] Task 2: packages/tsconfig 공유 TS 설정 (AC: #4)
  - [ ] 2.1 `base.json` — strict 모드, ES2022 타겟
  - [ ] 2.2 `nextjs.json` — Next.js App Router용 (jsx: preserve, plugins)
  - [ ] 2.3 `node.json` — CLI/core용 (module: NodeNext)
- [ ] Task 3: packages/core 초기화 (AC: #6)
  - [ ] 3.1 `package.json` 생성 — name: `@sira/core`, main/types exports
  - [ ] 3.2 `tsconfig.json` — packages/tsconfig/node.json 확장
  - [ ] 3.3 `src/index.ts` — 빈 barrel export
  - [ ] 3.4 빌드 설정 (tsup 또는 tsc)
- [ ] Task 4: packages/ui 초기화 (AC: #6)
  - [ ] 4.1 `package.json` 생성 — name: `@sira/ui`
  - [ ] 4.2 빈 barrel export `src/index.ts`
- [ ] Task 5: apps/web — Next.js 16 + Tailwind v4 + shadcn/ui (AC: #3)
  - [ ] 5.1 `npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --turbopack --use-npm`
  - [ ] 5.2 `tsconfig.json` — packages/tsconfig/nextjs.json 확장
  - [ ] 5.3 Tailwind CSS v4 CSS-native 설정 확인 (`@theme` 디렉티브 기반, JS config 불필요)
  - [ ] 5.4 `npx shadcn@latest init` — 다크 테마 기본, New York 스타일
  - [ ] 5.5 `@sira/core`, `@sira/ui` 의존성 추가
- [ ] Task 6: apps/cli 초기화 (AC: #1)
  - [ ] 6.1 `package.json` — name: `sira`, bin: `{ "sira": "./dist/index.js" }`
  - [ ] 6.2 `tsconfig.json` — packages/tsconfig/node.json 확장
  - [ ] 6.3 `src/index.ts` — 최소 CLI 진입점 (#!/usr/bin/env node)
  - [ ] 6.4 `@sira/core` 의존성 추가
  - [ ] 6.5 빌드 설정 (tsup — CJS/ESM 번들)
- [ ] Task 7: 빌드 검증 (AC: #5)
  - [ ] 7.1 `npm run build` 전체 모노레포 빌드 성공 확인
  - [ ] 7.2 `npm run lint` 전체 모노레포 린트 통과 확인
  - [ ] 7.3 packages/core를 apps/web과 apps/cli에서 import 가능 확인
- [ ] Task 8: 개발 환경 설정
  - [ ] 8.1 루트 `.gitignore` 설정 (node_modules, dist, .next, .env.local, .turbo)
  - [ ] 8.2 `.env.example` 생성 (필요한 환경변수 목록)
  - [ ] 8.3 Vitest 설정 (packages/core용 기본 테스트 러너)

## Dev Notes

### 핵심 아키텍처 결정 [Source: architecture.md]

- **모노레포 도구:** Turborepo (캐싱, 병렬 빌드)
- **패키지 매니저:** npm (워크스페이스)
- **의존 방향:** `apps/web → packages/core ← apps/cli` (web과 cli는 서로 직접 의존 금지)
- **core는 외부 의존성 최소화:** gray-matter, zod, simple-git, chokidar (이 스토리에서는 설치하지 않음 — Story 1.2, 1.3에서 추가)

### 기술 스택 버전 (2026-03 기준)

| 기술 | 버전 | 비고 |
|------|------|------|
| Turborepo | 2.8.x | `npx create-turbo@latest` |
| Next.js | 16.x | App Router, Turbopack dev |
| Tailwind CSS | v4.x | CSS-native 설정, `@theme` 디렉티브, JS config 파일 불필요 |
| shadcn/ui | v4 | `npx shadcn@latest init --monorepo` 지원 |
| TypeScript | 6.x | strict 모드 |
| Vitest | 4.x | 테스트 러너 |
| Node.js | 18+ | 최소 요구 |

### Tailwind CSS v4 핵심 변경 사항

- **JS config 파일 제거:** `tailwind.config.ts` 대신 CSS에서 `@theme` 디렉티브로 설정
- **Rust 기반 엔진:** 5-100x 빠른 빌드
- `create-next-app --tailwind`이 v4로 자동 설정 가능 — 수동 마이그레이션 불필요 확인 필요
- 만약 v3 형태로 설치되면 v4로 수동 업그레이드 할 것

### shadcn/ui 모노레포 설정

- `npx shadcn@latest init` 실행 시 `components.json` 생성
- 모노레포에서는 `--monorepo` 플래그 또는 수동으로 import alias 설정
- `components.json`의 `aliases` 설정이 모노레포 경로와 일치해야 함
- 다크 테마 기본: `tailwind.css`에서 `.dark` 클래스 기반

### 프로젝트 구조 (최종 목표)

```
sira/
├── package.json                # 루트 워크스페이스
├── turbo.json                  # Turborepo 파이프라인
├── tsconfig.json               # 루트 TS 참조
├── .gitignore
├── .env.example
├── apps/
│   ├── web/                    # Next.js 16 대시보드
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── components.json     # shadcn/ui
│   │   └── src/
│   │       ├── app/            # App Router
│   │       ├── components/
│   │       │   └── ui/         # shadcn 컴포넌트
│   │       ├── lib/
│   │       │   └── utils.ts    # cn() 유틸
│   │       └── globals.css     # Tailwind v4 base
│   └── cli/                    # SIRA CLI
│       ├── package.json        # bin: { sira: ... }
│       ├── tsconfig.json
│       └── src/
│           └── index.ts        # CLI 진입점
├── packages/
│   ├── core/                   # 공유 코어 엔진
│   │   ├── package.json        # @sira/core
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts        # barrel export
│   ├── ui/                     # 공유 UI 컴포넌트
│   │   ├── package.json        # @sira/ui
│   │   └── src/
│   │       └── index.ts
│   └── tsconfig/               # 공유 TS 설정
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
└── docs/
```

### 네이밍 규칙 [Source: architecture.md#Implementation Patterns]

- 디렉토리: `kebab-case`
- React 컴포넌트 파일: `PascalCase.tsx`
- 유틸/서비스: `camelCase.ts`
- 타입 정의: `camelCase.types.ts`
- 테스트: co-locate (원본 옆 `*.test.ts`)

### 주의사항

1. **create-turbo 기본 생성물 정리:** create-turbo가 만드는 기본 앱/패키지를 우리 구조에 맞게 교체해야 함. 기존 앱 삭제 후 create-next-app으로 web 생성
2. **packages/core 빌드:** core는 TypeScript만 사용 (tsup 또는 tsc). 빌드 산출물은 `dist/`에 생성. `package.json`에 `main`, `types`, `exports` 필드 정확히 설정
3. **워크스페이스 의존성:** apps에서 packages를 참조할 때 `"@sira/core": "*"` 형태로 워크스페이스 참조
4. **이 스토리 범위:** 모노레포 구조 + 빌드 성공만 확인. gray-matter, zod 등 core 라이브러리는 Story 1.2에서 추가
5. **sira-demo, sira-mcp:** 프로젝트 루트에 이미 존재하는 데모/MCP 디렉토리. 이 스토리에서는 건드리지 않음. 새 모노레포는 별도 `sira/` 디렉토리 또는 프로젝트 루트에 직접 구성 — 사용자 확인 필요

### References

- [Source: architecture.md#Starter Template Evaluation] — 초기화 명령, 모노레포 구조
- [Source: architecture.md#Project Structure & Boundaries] — 전체 디렉토리 구조
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — 네이밍, 구조 패턴
- [Source: architecture.md#Core Architectural Decisions] — 기술 스택 결정
- [Source: epics.md#Story 1.1] — AC 원문
- [Source: prd.md#AR1, AR2] — Turborepo + 모노레포 구조 요구사항

## Dev Agent Record

### Agent Model Used

(구현 시 기록)

### Debug Log References

### Completion Notes List

### File List
