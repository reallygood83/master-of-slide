# @open-slide/core

Runtime and CLI for Master Of Slide, based on the [open-slide](https://github.com/1weiho/open-slide) source. Write slides as React components while the framework handles the Vite/React stack, layout, navigation, hot reload, Korean-friendly rendering, exports, and fullscreen play mode.

## Install

```bash
pnpm add @open-slide/core
```

Most users get this installed automatically by running `npx @open-slide/cli init`. Use this package directly only if you're wiring up an existing workspace by hand.

## What's inside

- **Runtime** — home page, slide viewer, thumbnail rail, keyboard navigation, fullscreen presenter mode, and HTML/PDF/PPTX export. Every slide renders into a fixed **1920×1080** canvas; the framework scales it.
- **Vite plugin** — discovers `slides/<id>/index.{tsx,jsx,ts,js}`, exposes them via virtual modules, and reloads when slides are added or removed.
- **CLI** — `open-slide dev | build | preview` so workspaces never need to touch Vite, React, or tsconfig directly.

## CLI

Once installed, the `open-slide` bin is available in the workspace:

| Command | Description |
| --- | --- |
| `open-slide dev` | Start the dev server. Flags: `-p, --port <port>`, `--host [host]`, `--open`. |
| `open-slide build` | Build a static site. Flags: `--out-dir <dir>` (defaults to `dist`). |
| `open-slide preview` | Preview the production build. Flags: `-p, --port <port>`, `--host [host]`, `--open`. |
| `open-slide import:canva <file.pptx>` | Import an existing PPTX into Canva through Canva Connect API. Requires `CANVA_ACCESS_TOKEN` or `--token`. |

The browser download menu can export a deck as HTML, PDF, or PPTX. PPTX export
preserves the React/CSS rendering by placing each page as a full-slide image,
so PowerPoint can present it reliably even though individual text boxes are not
editable.

In dev, the same menu can connect Canva and open the current deck in Canva. Set
`CANVA_CLIENT_ID` and `CANVA_CLIENT_SECRET`, register
`http://127.0.0.1:5173/api/canva/callback` as a Canva app redirect URI, restart
the dev server, then choose **Connect Canva** and **Open in Canva**.

## Config

Create `open-slide.config.ts` in the workspace root (all fields optional):

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  slidesDir: 'slides',
  port: 5173,
  lang: 'ko',
};

export default openSlideConfig;
```

Set `lang: 'ko'` for Korean decks. The runtime and exported HTML/PDF will use
Korean language metadata, Korean-friendly fallback fonts, and less aggressive
Korean line breaking.

## Authoring slides

Slides live under `slides/<kebab-case-id>/index.tsx` and default-export an array of `Page` components:

```tsx
import type { Page } from '@open-slide/core';

const Cover: Page = () => (
  <div className="flex h-full w-full items-center justify-center">
    <h1 className="text-[120px] font-bold">Hello, Master Of Slide</h1>
  </div>
);

const pages: Page[] = [Cover];
export default pages;

export const meta = { title: 'Hello' };
```

## Exports

```ts
import {
  CANVAS_WIDTH,   // 1920
  CANVAS_HEIGHT,  // 1080
  type Page,
  type SlideMeta,
  type SlideModule,
  type OpenSlideConfig,
} from '@open-slide/core';
```

The Vite plugin is exposed under a subpath for advanced setups:

```ts
import { createViteConfig } from '@open-slide/core/vite';
```

## License

MIT
