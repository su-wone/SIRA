# SIRA AI Agent Protocol

이 문서는 AI 에이전트(Claude Code 등)가 SIRA 프로젝트의 태스크를 조작할 때 따라야 할 프로토콜을 정의합니다.

## 디렉토리 구조

```
.sira/
├── config.yaml      # 팀 설정 (읽기 전용)
├── schema.yaml      # frontmatter 스키마 정의
└── index.json       # 자동 생성 캐시 (수정 금지)

tasks/
├── epics/           # 에픽 .md 파일
├── web/             # FE 태스크 (area: web)
├── server/          # BE 태스크 (area: server)
└── shared/          # 공통 태스크 (area: shared)
```

## 태스크 파일 생성 규칙

### 파일 네이밍
- 에픽: `tasks/epics/EP-{NNN}-{제목}.md`
- 태스크: `tasks/{area}/TASK-{NNN}-{제목}.md`
- ID는 프로젝트 내 고유해야 함

### Frontmatter 필수 필드

```yaml
---
id: TASK-001
title: 태스크 제목
status: backlog          # backlog | todo | in_progress | review | done | cancelled
priority: medium         # critical | high | medium | low
created_at: "2026-03-12"
updated_at: "2026-03-12"
---
```

### Frontmatter 선택 필드

```yaml
assignee: 담당자이름     # config.yaml의 team[].name과 일치
area: web               # web | server | shared
epic_id: EP-001         # 소속 에픽 ID
story_id: STORY-001     # 소속 스토리 ID
related_files:          # 관련 코드 파일
  - src/app/login/page.tsx
tags:                   # 태그
  - auth
start_date: "2026-03-12"
due_date: "2026-03-19"
```

## 상태 변경 규칙

- `backlog` → `todo` → `in_progress` → `review` → `done`
- `cancelled`는 어떤 상태에서든 전환 가능
- AI 에이전트는 자신에게 할당된 태스크만 상태 변경 가능

## Git 커밋 규칙

- 커밋 메시지: `sira: {동작} {TASK-ID} — {설명}`
  - 예: `sira: update TASK-001 — status todo → in_progress`
- 태스크 변경 시 반드시 `updated_at` 필드 갱신

## 태스크 분해 가이드

자연어 입력을 받으면:
1. 기존 에픽/태스크 목록 확인 (`.sira/index.json`)
2. 레포 구조 분석 (코드 파일, 디렉토리)
3. 에픽 → 스토리 → 태스크 계층으로 분해
4. 각 태스크의 `related_files`에 관련 코드 파일 참조
5. 적절한 `area` 배정 (web/server/shared)
6. `.md` 파일 생성 후 git commit + push
