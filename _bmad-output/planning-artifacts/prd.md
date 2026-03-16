---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
lastEdited: '2026-03-12'
editHistory:
  - date: '2026-03-12'
    changes: '간트 뷰를 Phase 2(Growth)에서 MVP Must-Have로 이동 — UX/Architecture와 통일. FR36(간트 뷰) 추가'
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-11-153032.md'
  - '/Users/admin/.omc/specs/deep-interview-ai-native-collab-tool.md'
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
  deepInterview: 1
classification:
  projectType: 'saas_b2b (primary) + developer_tool (secondary)'
  domain: 'Developer Tools / AI-Native Team Intelligence'
  complexity: 'high'
  projectContext: 'greenfield'
  coreInterfaces: 'Web Dashboard (primary), CLI (secondary)'
  oneLiner: 'AI+Human 하이브리드 팀을 위한 자동화된 작업 인텔리전스 플랫폼'
  coreValue:
    developer: '작업 흐름을 떠나지 않는 프로젝트 관리'
    teamLead: '자동화된 실시간 팀 가시성'
  moat: '프로젝트 데이터 축적 → AI 추론 품질 향상 + AI-Native 교차점 선점 속도'
  competitivePosition: 'AI-Native 자동화 × 개발자 워크플로우 통합의 교차점 — 경쟁자 부재'
  threats: 'Linear/Plane이 AI 기능 강화 시 차별화 침식 가능'
  mvpStrategy: 'AI 자동화 + 개발자 통합에서 압도, 대시보드는 경쟁자 수준 이상'
  unresolved: '비즈니스 모델, API 비용 구조'
---

# Product Requirements Document - SIRA

**Author:** suwon
**Date:** 2026-03-11

## Executive Summary

SIRA는 AI+Human 하이브리드 팀을 위한 작업 인텔리전스 플랫폼이다. 개발팀에서 AI 에이전트가 팀원과 동등한 역할을 수행하는 시대에, 사람과 AI의 작업을 통합 관리하고 팀 전체의 상태를 자동으로 파악하는 도구가 존재하지 않는다. SIRA는 이 공백을 채운다.

팀장이 자연어로 백로그를 입력하면 AI가 에픽/스토리/태스크로 자동 분해하여 .md 파일을 생성한다. 모든 태스크 데이터는 YAML frontmatter가 포함된 마크다운 파일로 Git 레포에 저장되며, 웹 대시보드가 이를 실시간으로 시각화한다. 사람과 AI 에이전트 모두 동일한 수준의 팀원으로 대시보드에 표시되어, 팀장은 한 화면에서 전체 팀의 작업 현황을 파악한다.

타겟 사용자는 2-10명 규모의 소규모 개발팀이며, CLI(개발자)와 웹 대시보드(팀장/PM)를 핵심 인터페이스로 제공한다. TypeScript + Claude API 기반이며, DB 없이 Git을 유일한 데이터 저장소로 사용한다.

### What Makes This Special

**AI-Native Team Intelligence.** 기존 PM 도구(JIRA, Linear, Notion)는 "사람이 수동으로 상태를 관리하는" 시대에 설계되었다. SIRA는 세 가지 점에서 근본적으로 다르다:

1. **사람+AI 통합 팀 관리** — AI 에이전트가 대시보드에서 사람과 동등한 팀원으로 표시된다. 누가 사람이고 누가 AI인지는 부차적이며, 중요한 건 "누가 무슨 일을 하고 있는가"이다.

2. **자동화된 인텔리전스** — AI가 코드 활동에서 태스크 상태를 추론한다. 팀장은 보드를 업데이트하는 대신 **의사결정에 집중**한다.

3. **Git-Native 아키텍처** — 모든 데이터가 .md 파일로 Git에 존재한다. 오프라인 동작, 셀프호스팅, 버전 관리가 자연스럽게 따라온다. 개발자는 에디터와 터미널을 떠나지 않고 프로젝트를 관리한다.

**경쟁 포지션:** AI-Native 자동화 × 개발자 워크플로우 통합의 교차점에 경쟁자가 없다. 사용할수록 프로젝트 데이터가 축적되어 AI 추론 품질이 향상되는 것이 장기적 방어벽(moat)이다.

## Project Classification

| 항목 | 내용 |
|------|------|
| **프로젝트 타입** | SaaS B2B (primary) + Developer Tool (secondary) |
| **도메인** | Developer Tools / AI-Native Team Intelligence |
| **복잡도** | High |
| **프로젝트 컨텍스트** | Greenfield |
| **핵심 인터페이스** | Web Dashboard (primary), CLI (secondary) |
| **기술 스택** | TypeScript, Claude API, Markdown + YAML frontmatter |
| **타겟 사용자** | 소규모 개발팀 (2-10명) |

## Success Criteria

### User Success

**팀장:**
- 자연어로 백로그 입력 → AI가 에픽/스토리/태스크 .md 파일을 자동 생성 → 수정 없이 바로 할당 가능
- 대시보드를 열면 사람+AI 팀원 전체의 작업 현황이 실시간으로 보인다
- 스프린트 진행 상태, 팀원별 부하, 리스크 태스크를 한 화면에서 파악한다
- 대시보드가 스탠드업을 대체할 수 있는 수준의 정보 제공

**개발자 (팀원):**
- 레포의 .md 파일을 직접 수정하면 대시보드에 자동 반영 (양방향 싱크)
- CLI에서 태스크 조회/생성이 가능하여 에디터를 떠나지 않아도 됨
- 코드 작업 중 자동으로 태스크 상태가 추론되어 수동 업데이트 불필요

### Business Success

- **3개월:** 자체 팀이 SIRA로 일상 업무를 관리하며, 기존 도구로 돌아가지 않는다
- **6개월:** 오픈소스 공개 시 GitHub Stars 500+, 외부 팀 5개 이상 사용
- **12개월:** 유료 전환 또는 SaaS 출시 기반 마련 (비즈니스 모델은 추후 정의)

### Technical Success

- CLI: `npx sira init`, `sira decompose`, `sira query` 명령이 안정적으로 동작
- 웹 대시보드: .md 파일 변경 시 3초 이내 실시간 반영 (webhook 기준)
- 양방향 싱크: 대시보드 수정 → Git commit 자동 생성, Git push → 대시보드 반영. 충돌 시 안전한 머지 또는 사용자 알림
- 인덱스 캐시: 500개 태스크에서도 쿼리 응답 1초 이내
- AI 태스크 분해: 자연어 입력 → 10초 이내 구조화된 .md 파일 생성

### Measurable Outcomes

| 지표 | MVP 목표 | 성공 기준 |
|------|----------|----------|
| 팀 일일 사용 | 팀 전원 | 5일 연속 사용 시 성공 |
| 태스크 자동 분해 정확도 | 70%+ 수정 없이 사용 가능 | 팀장이 "괜찮네" 수준 |
| 상태 자동 추론 정확도 | 80%+ | 오탐보다 맞는 게 훨씬 많음 |
| 양방향 싱크 안정성 | 충돌 시 양쪽 보존 | 데이터 손실 0건 |
| 대시보드 로딩 | 3초 이내 | 답답함을 느끼지 않음 |

## User Journeys

### Journey 1: 팀장 민수 — "드디어 한눈에 보인다"

**민수, 32세, 스타트업 CTO.** 7명 팀(개발자 4명 + AI 에이전트 3개)을 이끈다. 매일 아침 JIRA를 열지만 절반의 태스크가 업데이트 안 되어 있고, AI 에이전트가 뭘 했는지는 Slack 로그를 뒤져야 알 수 있다.

**Opening Scene:** 월요일 아침, 민수가 SIRA 대시보드에 접속한다. 주말 동안 AI 에이전트 2개가 테스트 코드를 작성했고, 개발자 한 명이 일요일에 PR을 올렸다. 모든 상태가 이미 반영되어 있다.

**Rising Action:** 민수가 대시보드 입력창에 "소셜 로그인 추가. Google, Apple 지원. 기존 이메일 로그인과 통합"이라고 입력한다. 10초 후 AI가 1개 에픽, 3개 스토리, 8개 태스크를 생성한다. 각 태스크에는 관련 코드 파일이 자동 참조되어 있다.

**Climax:** 민수가 태스크를 팀원과 AI에게 할당한다. 오후에 대시보드를 다시 열면 — AI 에이전트는 이미 완료, 지영은 50% 진행 중, 리스크 태스크 하나에 노란 경고가 떠 있다. "예상 완료 기한 초과 가능성".

**Resolution:** 민수는 스탠드업을 5분 만에 끝낸다. 대시보드를 화면 공유하면 모든 정보가 이미 거기 있으니까.

> **기능:** 자연어 태스크 분해, 사람+AI 통합 대시보드, 자동 상태 추론, 실시간 팀 현황

### Journey 2: 개발자 지영 — "보드 업데이트? 그게 뭐였더라"

**지영, 27세, 프론트엔드 개발자.** VS Code와 터미널이 세상의 전부다. JIRA에 들어가서 상태 바꾸는 게 세상에서 제일 귀찮다.

**Opening Scene:** 지영이 터미널에서 `sira query "assignee:지영 status:todo"` 를 실행한다. 오늘 할 일 3개가 바로 뜬다.

**Rising Action:** 지영이 `src/auth/google-oauth.ts`를 수정하기 시작한다. SIRA가 이 파일이 태스크의 `related_files`에 포함된 것을 감지하고, 대시보드에 "지영: Google OAuth 연동 — 작업 중 (추정)"으로 표시한다. 지영은 아무것도 안 했다.

**Climax:** 작업 완료 후 PR을 올린다. SIRA가 자동으로 상태를 "리뷰 중"으로 변경. `sira ask "내 남은 태스크 중 제일 급한 거?"` — AI가 "TASK-012 Apple OAuth UI 통합, 마감 내일"이라고 답한다.

**Resolution:** 퇴근 전, 지영은 한 번도 대시보드에 접속하지 않았다. 하지만 민수의 대시보드에는 지영의 모든 작업이 실시간으로 반영되어 있다.

> **기능:** CLI 쿼리, 자연어 AI 쿼리, Git 활동 기반 자동 상태 추론, 태스크 ID 연동

### Journey 3: 개발자 지영 — Edge Case: "싱크가 꼬였다"

지영이 로컬에서 `tasks/google-oauth.md`의 status를 `done`으로 바꾸고 push한다. 동시에 민수가 대시보드에서 같은 태스크의 priority를 변경. SIRA가 충돌을 감지하고 필드 레벨 머지를 시도한다 — 다른 필드면 자동 머지, 같은 필드면 사용자에게 선택 요청. 데이터는 절대 손실되지 않으며 충돌 이력이 Git 히스토리에 남는다.

> **기능:** 필드 레벨 머지, 충돌 감지/해결 UI, 데이터 손실 방지

### Journey 4: AI 에이전트 Claude-Backend — "자율적으로 일하고 보고한다"

민수가 "Apple OAuth 보일러플레이트 생성" 태스크를 Claude-Backend에게 할당한다. AI가 레포 컨텍스트를 분석하고 코드를 생성하면서 .md status를 `in_progress` → `review`로 자동 변경하고 PR 생성. 민수의 대시보드에 AI의 작업 시간, 생성 파일 수, 품질 점수가 표시된다. 리뷰 승인 후 `done`으로 전환.

> **기능:** AI 에이전트 할당, AI 자율 상태 업데이트, 성과 추적, 코드 리뷰 워크플로우

### Journey 5: 팀장 민수 — 시스템 관리자: "새 프로젝트 셋업"

민수가 `sira init` 실행 → `.sira/` 디렉토리 생성 → `config.yaml`에 팀원 등록 (사람 4명 + AI 3개) → 대시보드 URL 공유 → 첫 백로그 입력 → 팀 전체가 동시에 할 일 확인. 셋업 완료까지 15분. JIRA의 2시간에서 대폭 단축.

> **기능:** CLI 초기화, 팀 멤버 설정(사람+AI), config.yaml, 빠른 온보딩

### Journey Requirements Summary

| 기능 영역 | 관련 저니 | 핵심 요구사항 |
|----------|----------|-------------|
| **자연어 태스크 분해** | J1 | 자연어 → 에픽/스토리/태스크 자동 생성, 레포 컨텍스트 인식 |
| **통합 대시보드** | J1, J4, J5 | 사람+AI 동등 표시, 실시간 상태, 통계 |
| **CLI 인터페이스** | J2, J5 | query, ask, init 명령, 터미널에서 완결되는 경험 |
| **자동 상태 추론** | J1, J2 | Git 활동 감지 → 상태 제안, 고신뢰도 자동 적용 |
| **양방향 싱크** | J2, J3 | Git↔Dashboard, 필드 레벨 머지, 충돌 감지/해결 |
| **AI 에이전트 관리** | J1, J4 | AI 할당, 자율 상태 업데이트, 성과 추적 |
| **프로젝트 초기화** | J5 | CLI init, config.yaml, 팀 멤버 등록, 빠른 온보딩 |
| **할당 시스템** | J1, J4 | 사람/AI 모두에게 할당, 승인 게이트 |

## Domain-Specific Requirements

### 데이터 프라이버시 & 보안

- **코드 컨텍스트 노출**: AI 태스크 분해 시 레포 코드가 Claude API로 전송됨 — 기업 고객은 민감하게 인식
- **팀 활동 데이터**: Git 히스토리에 작업 기록이 남으므로 감시 도구로 인식될 위험 → 개인 대시보드는 본인만 상세 열람, 팀 뷰는 요약만 표시
- **API 키 관리**: Claude API 키 팀 공유 구조 → 키 유출 리스크 관리 필요

### Git 기반 아키텍처 제약

- **동시성 충돌**: 다수 팀원의 동시 .md 수정 시 Git 머지 충돌 빈발 → 필드 레벨 머지로 완화
- **대용량 레포**: 태스크 수천 개 시 index.json 성능 저하, Git 히스토리 비대화 → 증분 인덱싱, 아카이브 전략
- **브랜치 전략**: feature 브랜치에 흩어진 태스크 .md 파일의 대시보드 표시 기준 정의 필요

### AI API 제약

- **비용**: 자동 추론 빈번 호출 시 월 비용 급증 → 캐싱, 배치 처리, 로컬 LLM 옵션
- **레이턴시**: 태스크 분해 10초 허용, 실시간 상태 추론은 매번 API 호출 불가 → 휴리스틱 + 주기적 AI 검증
- **Rate Limit**: 팀 동시 `sira ask` 사용 시 API 한도 초과 가능 → 큐잉, 요청 병합

### 개발자 도구 생태계 통합

- **Git 프로바이더 다양성**: GitHub, GitLab, Bitbucket — webhook 스펙 차이 대응
- **CI/CD 연동**: PR/커밋과 태스크 연결 시 각 CI 도구별 통합 고려
- **크로스 플랫폼**: CLI가 macOS, Linux, Windows에서 안정적으로 동작

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. AI-Human 동등 팀원 모델**
기존 PM 도구는 "사람이 도구를 쓴다"는 전제 위에 설계됨. SIRA는 AI 에이전트가 사람과 동등한 팀원으로서 태스크를 받고, 상태를 업데이트하고, 성과가 추적됨. PM 도구 역사상 없었던 접근.

**2. Git-Native 데이터 아키텍처**
DB를 완전히 제거하고 .md 파일이 곧 데이터. 오프라인 동작, 버전 관리, 셀프호스팅이 아키텍처 자체에서 자연스럽게 보장됨. 기존 SaaS PM 도구의 "중앙 서버" 가정을 뒤집는 패러다임.

**3. 자동 상태 추론 (Zero-Input PM)**
개발자가 아무것도 안 해도 Git 활동에서 태스크 상태를 자동 추론. "보드 업데이트"라는 개념 자체를 제거함.

세 혁신이 독립적이면서, 조합 시 기존 도구가 모방할 수 없는 차별화를 형성.

### Validation Approach

- **AI-Human 모델**: 자체 팀에서 AI 에이전트 3개를 실제 팀원처럼 운영하며 검증
- **Git-Native**: 태스크 500개까지 성능/충돌 시나리오 테스트
- **자동 추론**: 정확도 80% 달성 시 "수동 업데이트 불필요" 체감 확인

## SaaS B2B + Developer Tool 요구사항

### Project-Type Overview

SIRA는 SaaS B2B(팀 대시보드)와 Developer Tool(CLI)의 하이브리드 제품. 두 타입의 요구사항을 모두 충족하되, MVP에서는 최소한의 복잡도로 시작한다.

### 테넌트 모델

- **MVP**: 싱글테넌트 (셀프호스팅) — 한 레포 = 한 팀
- **Growth**: 멀티테넌트 SaaS 전환 시 테넌트 격리, 데이터 분리 추가
- Git 레포 자체가 테넌트 경계 역할을 하므로, 셀프호스팅에서는 자연스러운 격리

### 권한 모델 (RBAC)

| 역할 | 생성 | 할당 | 상태 변경 | 승인 | 설정 관리 |
|------|------|------|----------|------|----------|
| **팀장 (admin)** | O | O | O | O | O |
| **팀원 (member)** | X | X | O (본인 태스크) | X | X |
| **AI 에이전트 (agent)** | X | X | O (할당된 태스크) | X | X |

MVP 3역할로 시작, 필요 시 커스텀 역할 추가

### 외부 통합

- **MVP**: GitHub webhook (양방향 싱크 필수)
- **Growth**: Slack, GitLab/Bitbucket, CI/CD 연동
- 통합 인터페이스를 확장 가능하게 설계 (provider 패턴)

### 패키지 배포 & 설치

- npm 패키지로 배포: `npm install -g sira` + `npx sira` 둘 다 지원
- Node.js 18+ 요구
- 크로스 플랫폼: macOS, Linux, Windows

### 문서화 전략

- **MVP**: README, 명령어 레퍼런스, 퀵스타트 가이드
- **Growth**: 사용 예제, 튜토리얼, API 문서
- 문서도 .md로 레포에 포함 (dogfooding)

### Implementation Considerations

- CLI와 웹 대시보드가 동일한 core 엔진(인덱스, 파서, 싱크)을 공유
- 웹 대시보드는 Next.js — API Routes가 서버 역할
- `.sira/config.yaml`에 팀 설정, RBAC, Git provider 설정 통합
- AI 호출은 core 레이어에서 추상화하여 CLI/웹 양쪽에서 동일하게 사용

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP 접근:** Problem-Solving MVP — "우리 팀이 JIRA 없이 일할 수 있는가?" 검증
**리소스:** 1인 개발 (suwon) + AI 에이전트 지원
**타임라인:** 3개월 내 자체 팀 사용 가능

### MVP Feature Set (Phase 1)

**핵심 저니 지원:** J1(팀장 민수), J2(개발자 지영), J5(프로젝트 셋업)

**Must-Have:**
1. **CLI 엔진** — `sira init`, `sira decompose`, `sira query`, `sira ask`
2. **웹 대시보드** — 팀 현황, 칸반 보드, 태스크 테이블, 간트 뷰, 태스크 상세, 멤버 프로필, 프로젝트 뷰
3. **양방향 싱크** — Git↔Dashboard, 충돌 감지/안전 처리
4. **인덱스 엔진** — `.sira/index.json` 자동 생성/갱신, 고속 쿼리
5. **AI 태스크 분해** — 자연어 → 에픽/스토리/태스크 .md 생성, 레포 컨텍스트 인식
6. **AI 상태 자동 추론** — Git 활동 기반 상태 제안 모드
7. **RBAC** — 팀장/팀원/AI 에이전트 3역할

**수동 대체 가능 (MVP 제외):**
- 리스크/과부하 알림 → 팀장이 대시보드 통계로 직접 판단
- 스프린트 예측 → Growth로 미룸
- AI 에이전트 자율 할당 → 팀장이 수동 할당

### Phase 2 (Growth)

- 스프린트 완료 예측 AI
- 팀원 스킬 매핑 + 최적 할당 추천
- 데일리 노트 자동 생성 (스탠드업 대체)
- VS Code 확장, Slack/Teams 연동
- GitLab/Bitbucket 지원
- 멀티테넌트 SaaS 전환
- 반복 태스크 템플릿

### Phase 3 (Vision)

- AI 에이전트 자동 할당 + 성과 추적
- 크로스 레포 태스크 관리
- 오프라인 모드 (로컬 LLM)
- 프로젝트 데이터 축적 → 예측 정확도 향상
- SaaS 멀티테넌시

### Risk Mitigation Strategy

| 리스크 유형 | 핵심 리스크 | 완화 전략 |
|-----------|-----------|----------|
| **기술** | 양방향 싱크 충돌 | 필드 레벨 머지, 양쪽 보존, 충돌 이력 Git 기록 |
| **기술** | AI 추론 정확도 | 제안 모드로 시작, 피드백 루프로 개선 |
| **기술** | AI API 비용 폭증 | 캐싱, 배치 처리, 로컬 LLM 옵션 |
| **기술** | Git 충돌 빈발 | 필드 레벨 머지 + 최악 시 lock 메커니즘 |
| **시장** | "또 다른 PM 도구" 인식 | AI-Native 차별점 강조, 개발자 경험 우선 |
| **시장** | "감시 도구" 인식 | 개인 뷰 본인만 상세, 팀 뷰 요약만 |
| **리소스** | 1인 개발 한계 | CLI core → 대시보드 순서로 점진 구축, AI 에이전트 활용 |

## Functional Requirements

### 프로젝트 관리

- FR1: 팀장은 자연어로 백로그를 입력하여 에픽/스토리/태스크를 자동 생성할 수 있다
- FR2: 팀장은 생성된 태스크를 팀원(사람/AI)에게 할당할 수 있다
- FR3: 팀장은 태스크 할당 및 변경 사항을 승인할 수 있다
- FR4: 팀원은 자신에게 할당된 태스크의 상태를 변경할 수 있다
- FR5: AI 에이전트는 할당된 태스크의 상태를 자율적으로 업데이트할 수 있다
- FR6: 사용자는 태스크를 에픽/스토리/태스크 계층 구조로 조회할 수 있다

### 데이터 모델 & 인덱스

- FR7: 시스템은 모든 태스크를 YAML frontmatter가 포함된 .md 파일로 Git 레포에 저장한다
- FR8: 시스템은 `.sira/index.json`을 자동 생성하고 .md 파일 변경 시 갱신한다
- FR9: 사용자는 frontmatter 필드 기반으로 태스크를 필터/정렬/그룹핑할 수 있다
- FR10: 시스템은 frontmatter 스키마를 정의하고 검증할 수 있다

### CLI 인터페이스

- FR11: 사용자는 `sira init`으로 프로젝트를 초기화할 수 있다
- FR12: 사용자는 `sira decompose "자연어"`로 태스크를 자동 분해할 수 있다
- FR13: 사용자는 `sira query "필터조건"`으로 태스크를 조회할 수 있다
- FR14: 사용자는 `sira ask "자연어 질문"`으로 AI에게 프로젝트 상태를 질의할 수 있다

### 웹 대시보드

- FR15: 팀장은 팀 대시보드에서 전체 통계와 사람/AI 팀원 현황을 한 화면에서 볼 수 있다
- FR16: 사용자는 칸반 보드에서 드래그앤드롭으로 태스크 상태를 변경할 수 있다
- FR17: 사용자는 태스크 테이블에서 필터/정렬/그룹핑으로 태스크를 탐색할 수 있다
- FR18: 사용자는 태스크 상세 화면에서 .md 내용을 렌더링하고 편집할 수 있다
- FR19: 사용자는 멤버 프로필에서 할당된 태스크와 활동 기록을 조회할 수 있다
- FR20: 사용자는 멀티 프로젝트의 진행률을 프로젝트 뷰에서 비교할 수 있다
- FR36: 사용자는 간트 뷰에서 태스크의 일정과 진행률을 프로젝트별 타임라인으로 조회할 수 있다

### 양방향 싱크

- FR21: 시스템은 Git 레포의 .md 파일 변경을 감지하여 대시보드에 반영한다
- FR22: 시스템은 대시보드에서의 수정을 자동으로 Git commit + push한다
- FR23: 시스템은 동시 수정 시 필드 레벨 머지를 시도한다
- FR24: 시스템은 같은 필드 충돌 시 사용자에게 선택을 요청하고 데이터를 보존한다
- FR25: 시스템은 충돌 이력을 Git 히스토리에 기록한다

### AI 인텔리전스

- FR26: AI는 레포 컨텍스트를 분석하여 태스크 분해 시 관련 코드 파일을 자동 참조한다
- FR27: AI는 Git 활동(파일 수정, PR, 커밋)에서 태스크 상태를 자동 추론한다
- FR28: 시스템은 AI 추론 결과를 제안 모드로 표시하고 사용자 확인 후 적용한다
- FR29: 사용자는 자연어로 프로젝트 상태에 대해 AI에게 질의할 수 있다

### 팀 & 권한 관리

- FR30: 팀장은 `.sira/config.yaml`에서 팀원을 등록할 수 있다 (사람 + AI 에이전트)
- FR31: 시스템은 팀장/팀원/AI 에이전트 3개 역할에 따라 권한을 제어한다
- FR32: 대시보드에서 사람과 AI 에이전트가 동등한 수준의 팀원으로 표시된다
- FR33: 팀장은 AI 에이전트의 작업 시간, 생성 파일 수 등 성과를 조회할 수 있다

### 보안 & 프라이버시

- FR34: 시스템은 API 키를 안전하게 저장하고 관리한다
- FR35: 개인 대시보드의 상세 정보는 본인만 열람할 수 있고 팀 뷰는 요약만 표시한다

## Non-Functional Requirements

### Performance

- 대시보드 초기 로딩: 3초 이내
- 태스크 테이블 필터/정렬: 500개 태스크 기준 1초 이내
- AI 태스크 분해: 자연어 입력 후 10초 이내 결과
- 양방향 싱크: webhook 기반 Git 변경 감지 → 대시보드 반영 3초 이내, polling fallback 시 10초 이내
- CLI 명령 (`sira query`, `sira init` 등 로컬 명령): 1초 이내 응답
- CLI AI 명령 (`sira ask`): 첫 토큰 2초 이내, 전체 응답 10초 이내
- 인덱스 증분 갱신: .md 파일 변경 후 2초 이내
- 인덱스 풀 리빌드: 태스크 500개 기준 10초 이내

### Security

- API 키(Claude)는 환경변수 또는 시스템 keychain으로 저장, `.gitignore`에 포함하여 절대 Git에 커밋하지 않음
- 대시보드: HTTPS 필수, CORS 정책 설정 (허용 오리진 명시)
- 대시보드 인증: 팀 멤버만 접근 가능 (토큰 기반, 만료 정책 24시간)
- AI API 전송 시 코드 컨텍스트 최소화 (필요한 파일 경로/구조만)
- RBAC 권한 위반 시 요청 거부 및 로깅

### Scalability

- MVP: 단일 팀(2-10명), 단일 레포, 태스크 500개까지 안정 동작
- Growth: 태스크 5,000개, 멀티 프로젝트, 외부 팀 5개(총 2,500+ 태스크) 지원
- 인덱스 엔진: 증분 업데이트로 태스크 수 증가 시에도 성능 유지

### Integration

- GitHub webhook: 표준 webhook payload 수신/처리
- Git 조작: `simple-git` 또는 동등한 라이브러리로 commit/push/pull 자동화
- Claude API: Anthropic SDK (TypeScript) 사용, 모델 버전 설정 가능
- Growth 단계에서 GitLab/Bitbucket provider 추가 가능한 어댑터 구조

### Reliability

- 양방향 싱크: 모든 충돌 상황에서 양쪽 변경사항이 최소 하나의 브랜치/커밋에 보존된다
- 인덱스 불일치 시 자동 복구 (full rebuild fallback)
- Git 통신 실패 시 재시도 (최대 3회, 지수 백오프) + 로컬 큐잉 (최대 100건)
- `.sira/` 디렉토리 무결성 검증: config.yaml 손상 시 백업에서 복구, 스키마 검증
