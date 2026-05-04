# Master Of Slide workspace

Slides as React components, powered by `@open-slide/core` and based on the open-slide source. Each slide lives under `slides/<id>/index.tsx` and default-exports an array of page components. The runtime handles layout, scaling, navigation, thumbnails, Korean-friendly rendering, exports, and fullscreen play mode — you just write the pages.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `slides/getting-started/index.tsx`, or create a new slide at `slides/<your-slide>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |

## Authoring a slide

```tsx
// slides/my-slide/index.tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: SlideMeta = { title: 'My slide' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `slides/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make slides about X" and the `create-slide` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

If you have an Obsidian or Markdown note, give the agent the local `.md` path
and ask it to use `create-slide-from-markdown`. It will summarize the note into
pages, resolve common Obsidian syntax, and can use generated bitmap assets when
the agent environment supports image generation.

## Config

Optional `open-slide.config.ts` at the workspace root:

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  port: 5173,
  lang: 'ko',
};

export default openSlideConfig;
```

Supported fields: `slidesDir`, `port`, `lang`.

Use `lang: 'ko'` for Korean decks so browser preview and exported HTML/PDF use
Korean-friendly metadata, fallback fonts, and line breaking.

## Export and Canva

The browser download menu exports HTML, PDF, and PPTX. PPTX uses one full-slide
image per page so the React design survives import into PowerPoint or Canva.

For direct Canva handoff during development, create a Canva Connect API app,
register `http://127.0.0.1:5173/api/canva/callback` as a redirect URI, then run:

```bash
CANVA_CLIENT_ID=... CANVA_CLIENT_SECRET=... pnpm dev
```

Use **Connect Canva** and then **Open in Canva** from the download menu.
