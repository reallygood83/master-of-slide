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
page count, language, tone, or visual direction, treat those as authoritative.
If not, infer conservative defaults, but always resolve these two creation
decisions before writing files:

- page count
- generated image count

Ask concise questions when either value is missing. Recommended Korean prompt:

```text
슬라이드 몇 장으로 만들까요? 생성 이미지는 몇 개 넣을까요?
```

If the user asks the agent to decide automatically, use 8 pages and 2 generated
images. If image generation is unavailable, treat the image count as the number
of image placeholders/prompts to create.

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
5. Choose a slide id from the note title in kebab-case. Use romanized or English ids for Korean titles.
6. Create `slides/<id>/index.tsx` and copy any resolved local assets into `slides/<id>/assets/`.
7. Use Korean-friendly defaults when the source note or user request is Korean:
   - `lang: 'ko'` should be present in `open-slide.config.ts` already; do not edit it from this skill.
   - font stack: `"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`.
   - use `wordBreak: 'keep-all'`, `overflowWrap: 'anywhere'`, and line-height >= 1.35 for body copy.
8. Self-review with `slide-authoring`.

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
- which assets were copied, generated, or left as placeholders
- preview URL: `http://127.0.0.1:5173/s/<id>`
