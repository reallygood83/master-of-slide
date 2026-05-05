---
name: slide
description: Use this skill when the user invokes `/slide <markdown-path>` or asks to turn a Markdown/Obsidian document into a Master Of Slide deck. It is the one-command deck creation workflow for Claude Code, Codex, and other coding agents.
---

# Slide

`/slide <markdown-path>` is the fast path for creating a Master Of Slide deck
from a local Markdown or Obsidian note.

This skill delegates the content workflow to `create-slide-from-markdown`, the
technical slide-writing rules to `slide-authoring`, and image prompt generation
to `create-slide-image-prompts`.

You only write files under `slides/<id>/`. Never modify the source Markdown note.

## Invocation

Preferred user form:

```text
/slide /absolute/path/to/source.md
```

Also accept:

```text
slide /absolute/path/to/source.md
Create slides from /absolute/path/to/source.md
```

If no Markdown path is present, ask for one. If the path is relative, resolve it
from the current workspace root.

Before writing files, ask for missing creation decisions:

- page count: "몇 장짜리 슬라이드로 만들까요?"
- generated image count: "생성 이미지는 몇 개 넣을까요?"
- visual theme: "어떤 테마로 만들까요?"

If the user already provided a value, do not ask again for that value. If the
user wants speed or says to decide automatically, use 8 pages, 2 generated
images, and `auto` theme as the default. If image generation is unavailable in
the current agent environment, still ask for the intended image count, then
create that many precise `ImagePlaceholder` hints instead of bitmap assets.

When an ask-user-question UI is available, ask the theme question as a choice
picker. ALWAYS surface all 9 theme options below — never limit the picker to
just the files present in the user's workspace `themes/` directory. The slide
skill ships with bundled fallback theme docs (see "Theme fallback resolution"
below), so every option is always applicable. If the current
ask-user-question implementation limits the number of choices, use a two-step
picker:

1. Ask for a theme group: `auto/recommended`, `official themes`, or
   `demo-derived themes`.
2. Ask for the concrete theme inside that group.

For ask-user-question, use Korean option labels and descriptions so the user can
choose without reading English theme names. Recommended labels:

- `auto (자동 추천)`
- `editorial-noir (다크 매거진)`
- `paper-press (종이 리포트)`
- `neon-terminal (터미널)`
- `neo-brutalism (네오 브루탈리즘)`
- `research-brief (연구 브리프)`
- `vercel-minimal (미니멀 제품)`
- `raycast-dark-product (다크 제품)`
- `photo-editorial-tech (실사 테크 매거진)`

Use Korean one-sentence descriptions in the ask-user-question `description`
field. If ask-user-question is unavailable, ask a concise textual
multiple-choice question. Use these theme options:

- `auto (자동 추천)` — 문서 장르, 청중, 이미지 성격을 보고 가장 맞는 테마를 고른다.
- `editorial-noir (다크 매거진)` — 뉴스 인사이트, 에세이, 실사/시네마틱 덱에 맞는 어두운 매거진 스타일.
  Canva로 옮겨도 React 텍스트와 일반 이미지 구조가 유지되어 비교적 안정적이다.
- `paper-press (종이 리포트)` — 리포트, 강의안, 긴 한국어 설명에 맞는 밝은 인쇄물 스타일.
- `neon-terminal (터미널)` — 개발자 데모, CLI/툴링, 코드 설명에 맞는 어두운 터미널 스타일.
- `neo-brutalism (네오 브루탈리즘)` — 굵은 검정 테두리, 강한 그림자, 선명한 색으로
  강한 인상을 주는 스타일. 프롬프트 가이드, 제품 데모, 시각적으로 강한 덱에 적합하다. 참고 슬라이드:
  `apps/demo/slides/gpt-image-2-prompt-cheatsheet/index.tsx` and
  `apps/demo/slides/open-slide-launch/index.tsx`.
- `research-brief (연구 브리프)` — 절제된 선, 표, 차트, 설명형 레이아웃에 맞는
  밝은 연구/교육 스타일. 기술 개념 설명과 분석형 덱에 적합하다. 참고 슬라이드:
  `apps/demo/slides/llm-fundamentals/index.tsx` and
  `apps/demo/slides/ssh-explained/index.tsx`.
- `vercel-minimal (미니멀 제품)` — 흰 배경, 얇은 선, 시스템 다이어그램 중심의
  미니멀 제품/엔지니어링 스타일. 웹 플랫폼과 인프라 설명에 적합하다. 참고 슬라이드:
  `apps/demo/slides/nextjs-ppr-cache/index.tsx`.
- `raycast-dark-product (다크 제품)` — 어두운 SaaS/제품 런칭 느낌, UI 패널과
  붉은 accent가 어울리는 스타일. API, 앱, 개발자 제품 설명에 적합하다. 참고 슬라이드:
  `apps/demo/slides/raycast-api/index.tsx`.
- `photo-editorial-tech (실사 테크 매거진)` — 실사 PNG 이미지와 절제된 텍스트를
  쓰는 테크 매거진 스타일. 뉴스 인사이트, AI 전략, 시네마틱 기술 서사에 적합하다. 참고 슬라이드:
  `apps/demo/slides/harness-engineering-ko/index.tsx`.

## Workflow

1. Read the Markdown file.
2. Confirm or infer the requested page count, generated image count, and theme
   before creating the deck.
3. Follow `create-slide-from-markdown`:
   - parse frontmatter, headings, callouts, wikilinks, embeds, image links
   - infer title, thesis, sections, audience, and key claims
   - pick a short kebab-case slide id
   - create `slides/<id>/index.tsx`
   - copy referenced local assets into `slides/<id>/assets/`
4. Follow `slide-authoring` for the React implementation:
   - 1920 x 1080 canvas discipline
   - one idea per page
   - top-level `export const design: DesignSystem = { ... }`
   - Korean-safe typography when the note is Korean
   - if a non-`auto` theme is selected, resolve the theme doc using
     "Theme fallback resolution" below and apply its palette, typography,
     layout, components, and motion philosophy
   - if `auto` is selected, inspect the available themes (workspace + bundled),
     pick one explicit theme, and state the selected theme in the final output

## Theme fallback resolution

When the user picks a theme other than `auto`, resolve the theme document in
this order (use the first one that exists):

1. **Workspace official theme** — `<workspace>/themes/<theme-id>.md`
   (present in this repo for `editorial-noir`, `paper-press`, `neon-terminal`).
2. **Skill-bundled official theme** — `<this-skill>/themes/<theme-id>.md`
   (always present after `pnpm install:agents`).
3. **Skill-bundled demo-derived theme** — `<this-skill>/theme-references/<theme-id>.md`
   (covers `neo-brutalism`, `research-brief`, `vercel-minimal`,
   `raycast-dark-product`, `photo-editorial-tech`).
4. **Workspace demo slide** — only when the workspace contains
   `apps/demo/slides/<reference-slide>/index.tsx` referenced for that theme.

You MUST never tell the user "this theme is unavailable" because of missing
local files — the bundled docs in steps 2 and 3 always cover all 8 explicit
themes. Always read the resolved theme doc end-to-end before writing JSX.
5. Use `create-slide-image-prompts` for exactly the requested number of
   generated image slots, unless the source note provides enough real assets to
   make generation unnecessary:
   - cover hero artwork
   - infographic / educational diagrams
   - product or brand posters
   - UI mockups
   - chapter artwork
6. If Codex or the current environment can generate bitmap images, generate the
   requested assets and save them under `slides/<id>/assets/`. Otherwise, add
   `ImagePlaceholder` components with precise hints and include final prompts in
   the handoff.
7. Self-review:
   - all imported assets exist
   - no text overflows at 1920 x 1080
   - Korean copy uses readable line heights and safe wrapping
   - exported default array contains all pages
   - deck opens in the Web UI

## Image Guidance

Do not silently choose the image count when using `/slide`. Ask the user how
many generated images they want unless they already specified a number.

Pick the requested images for the pages where they matter most:

- one cover or hero image
- one diagram or infographic if the document explains a process
- one product / UI / brand visual if the document is commercial or product-led

Keep important Korean text as React text, not baked into generated images, so it
stays editable and exports more reliably.

## Output

Tell the user:

- source Markdown path
- created slide id
- created file path
- page count
- selected theme
- assets copied, generated, or left as placeholders
- preview URL: `http://127.0.0.1:5173/s/<id>`

If the dev server is not running, tell them to run:

```bash
pnpm dev
```
