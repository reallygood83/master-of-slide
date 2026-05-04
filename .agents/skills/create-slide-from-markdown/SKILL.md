---
name: create-slide-from-markdown
description: Use this skill when the user gives a Markdown or Obsidian note path and wants an open-slide deck generated from that document. Handles frontmatter, headings, bullets, callouts, wikilinks, embeds, and optional AI-generated bitmap assets.
---

# Create a slide from Markdown / Obsidian

This workflow turns a local `.md` note into an open-slide deck. It extends
`create-slide`; when writing React, follow `slide-authoring`.

You only write files under `slides/<id>/`. Never modify the source note.

## Inputs

The user should provide a local Markdown path. If they also provide audience,
page count, language, tone, theme, or visual direction, treat those as
authoritative. If not, infer conservative defaults, but always resolve these
three creation
decisions before writing files:

- page count
- generated image count
- visual theme

Ask concise questions when any value is missing. Recommended Korean prompt:

```text
슬라이드 몇 장으로 만들까요? 생성 이미지는 몇 개 넣을까요? 테마는 무엇으로 할까요?
```

If the user asks the agent to decide automatically, use 8 pages and 2 generated
images, and infer `auto` theme. If image generation is unavailable, treat the
image count as the number of image placeholders/prompts to create.

## Theme selection

Offer every available theme before writing the deck. This includes both
official `themes/*.md` files and demo-derived styles that can be extracted from
existing slide examples.

When an ask-user-question UI is available, use it as a choice picker. If the
current ask-user-question implementation limits the number of choices, use a
two-step picker:

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
field. If ask-user-question is unavailable, ask a plain multiple-choice
question.

Available Master Of Slide theme options:

- `auto (자동 추천)` — 문서 장르, 청중, 이미지 성격을 보고 가장 맞는 테마를 고른다.
- `editorial-noir (다크 매거진)` — 뉴스 인사이트, 에세이, 실사/시네마틱 덱에 맞는 어두운 매거진 스타일.
- `paper-press (종이 리포트)` — 리포트, 강의안, 긴 한국어 설명에 맞는 밝은 인쇄물 스타일.
- `neon-terminal (터미널)` — 개발자 데모, CLI/툴링, 코드 설명에 맞는 어두운 터미널 스타일.
- `neo-brutalism (네오 브루탈리즘)` — 굵은 검정 테두리, 강한 그림자, 선명한 색으로 강한 인상을 주는 스타일.
  참고 슬라이드:
  `apps/demo/slides/gpt-image-2-prompt-cheatsheet/index.tsx` and
  `apps/demo/slides/open-slide-launch/index.tsx`.
- `research-brief (연구 브리프)` — 절제된 선, 표, 차트, 설명형 레이아웃에 맞는 밝은 연구/교육 스타일.
  참고 슬라이드:
  `apps/demo/slides/llm-fundamentals/index.tsx` and
  `apps/demo/slides/ssh-explained/index.tsx`.
- `vercel-minimal (미니멀 제품)` — 흰 배경, 얇은 선, 제품/인프라 설명에 맞는 미니멀 엔지니어링 스타일.
  참고 슬라이드:
  `apps/demo/slides/nextjs-ppr-cache/index.tsx`.
- `raycast-dark-product (다크 제품)` — 어두운 SaaS/제품 런칭 느낌, UI 패널과 붉은 accent가 어울리는 스타일.
  참고 슬라이드: `apps/demo/slides/raycast-api/index.tsx`.
- `photo-editorial-tech (실사 테크 매거진)` — 실사 PNG 이미지와 절제된 텍스트를 쓰는 테크 매거진 스타일.
  참고 슬라이드:
  `apps/demo/slides/harness-engineering-ko/index.tsx`.

If the user chooses a concrete official theme, read `themes/<theme-id>.md` and
apply its palette, typography, layout, fixed components, and motion rules. If
the user chooses a demo-derived theme and no matching theme file exists, read
the listed demo source slide and extract its palette, typography, layout rhythm,
component treatment, and motion rules. If the user chooses `auto`, inspect both
official theme files and demo-derived theme sources, pick one concrete theme,
and mention the selected theme in the final output.

For Obsidian notes, support common syntax:

- YAML frontmatter: use `title`, `aliases`, `tags`, `summary` if present.
- Headings: treat as the primary outline.
- Lists and paragraphs: summarize, do not paste everything.
- Callouts (`> [!note]`, `> [!warning]`): convert to emphasized slides or sidebars.
- Wikilinks (`[[Note]]`, `[[Note|Label]]`): render the label as text unless the linked note is explicitly needed.
- Embeds (`![[image.png]]`, `![[note#Heading]]`): resolve image/video assets relative to the note or vault when possible; otherwise use a placeholder.
- Code blocks, tables, Mermaid, and math: preserve only when they are central to the talk. Otherwise summarize.

## Workflow

1. Read the Markdown file.
2. Identify the likely vault/root directory from the file path. Use it to resolve relative links and Obsidian embeds.
3. Extract:
   - title
   - one-sentence thesis
   - audience / intent clues
   - major sections
   - key claims, examples, and data points
   - assets referenced by embeds or Markdown image links
4. Create a slide plan with one idea per page. Use the requested page count.
   If the user delegated the choice, prefer 8 pages.
5. Choose the theme. If a concrete official theme is selected, read its
   `themes/<theme-id>.md` file before writing JSX. If a demo-derived theme is
   selected, read its listed demo source slide before writing JSX. If `auto` is
   selected, pick one available official or demo-derived theme and keep the deck
   visually consistent with it.
6. Choose a slide id from the note title in kebab-case. Use romanized or English ids for Korean titles.
7. Create `slides/<id>/index.tsx` and copy any resolved local assets into `slides/<id>/assets/`.
8. Use Korean-friendly defaults when the source note or user request is Korean:
   - `lang: 'ko'` should be present in `open-slide.config.ts` already; do not edit it from this skill.
   - font stack: `"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`.
   - use `wordBreak: 'keep-all'`, `overflowWrap: 'anywhere'`, and line-height >= 1.35 for body copy.
9. Self-review with `slide-authoring`.

## AI-generated images

Use the requested generated image count. Place images on the pages where they
add the most value: cover hero, key concept diagram, product/UI visual, chapter
opener, or summary poster. If the current Codex environment offers image
generation, generate bitmap assets and save them under `slides/<id>/assets/`.

Rules:

- Generate exactly the requested number of images unless the user changes the
  count or the request violates policy/safety constraints.
- Prefer 16:9 images for full-bleed slides and transparent PNG cutouts for objects.
- Keep prompts concrete and tied to the source note's meaning.
- Do not generate images that pretend to be real screenshots, real charts,
  private people, internal documents, or brand assets. Use `ImagePlaceholder`
  for those instead.
- After generating or copying an asset, import it from `./assets/...` and render
  with ordinary `<img>` tags.
- If image generation is unavailable, use `ImagePlaceholder` with a precise hint
  so the user can replace it later through the Assets panel.

## Output

Tell the user:

- source Markdown path used
- slide id and created path
- how many pages were generated
- selected theme
- which assets were copied, generated, or left as placeholders
- preview URL: `http://127.0.0.1:5173/s/<id>`
