# IVDR 문서 공장 — 부서별 Claude 스킬 7개

앱의 **문서 공장**(`/auto/factory`) 층마다 스킬이 하나씩 있다. 층의 직원(문서)들이 하는 일을 그 층의 스킬이 맡는다.

| 층 | 스킬 | 부서 | 담당 문서 수 |
|---|---|---|---|
| 7F | [`ivdr-approval`](ivdr-approval/SKILL.md) | 결재실 | — |
| 6F | [`ivdr-ra`](ivdr-ra/SKILL.md) | RA 규제팀 | 16 |
| 5F | [`ivdr-design`](ivdr-design/SKILL.md) | 개발·설계팀 | 25 |
| 4F | [`ivdr-performance`](ivdr-performance/SKILL.md) | 성능평가 실험실 | 7 |
| 3F | [`ivdr-production`](ivdr-production/SKILL.md) | 생산팀 | 7 |
| 2F | [`ivdr-quality`](ivdr-quality/SKILL.md) | 품질(QA)팀 | 21 |
| 1F | [`ivdr-intake`](ivdr-intake/SKILL.md) | 접수 | — |

## 검증 스킬

| 스킬 | 하는 일 |
|---|---|
| [`mfds-review-panel`](mfds-review-panel/SKILL.md) | 식약처 심사관 관점의 **가상** 5인 패널이 체크리스트(51개 항목)와 시험 제품 6개로 이 툴을 점검하고 보고서를 쓴다. 실제 식약처 심사·자문이 아니다. 보고서: [1차](mfds-review-panel/reports/2026-10-30-1차.md) · [2차](mfds-review-panel/reports/2026-10-30-2차.md) |

## 일의 흐름

1F 접수(스펙) → 6F RA(분류·문서 세트) → 4F 성능평가(실험계획) · 3F 생산(운송·공정) → 5F 개발·설계 · 2F 품질 → 7F 결재실(사람의 결정·서명)

모든 부서가 같은 원칙을 따른다.
- 수치를 지어내지 않고 `[실험 후 입력]`·`[사양: … — 사람이 정함]`·`[… 원문 기준]`으로 남긴다.
- 확인하지 않은 규제 사실에는 "원문 확인 필요"를 붙인다.
- 결정은 7F로 넘긴다.
- 사람이 쓴 초안은 덮어쓰지 않는다.

## 설치

- **Claude Code**: 이 폴더의 스킬 디렉터리를 프로젝트의 `.claude/skills/`나 `~/.claude/skills/`에 복사한다.
  예: `cp -r skills/ivdr-* ~/.claude/skills/`
- **claude.ai**: 설정 → 기능(Capabilities) → 스킬에서 스킬 폴더를 zip으로 묶어 올린다. 폴더 하나가 zip 하나다.

## 다시 만들기

`references/documents.md`와 `references/spec-fields.md`는 앱 데이터(`src/data/docTree.ts`, `src/data/documents.ts`, `src/data/spec/fields.ts`)에서 뽑아 만들었다. 앱의 문서나 스펙 항목이 바뀌면 다시 생성해야 맞는다. 각 `SKILL.md`의 '일하는 순서'는 사람이 쓴 부분이다.

규칙과 인용은 RA 담당자가 한 번 검토한 뒤 쓴다. 앱 화면의 "규칙 RA 검토 전 — 참고용" 표시와 같은 상태다.
