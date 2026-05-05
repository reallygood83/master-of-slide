---
name: Neo Brutalism
description: Bold black borders, heavy shadows, primary-color blocks. Punchy, opinionated, high-contrast.
mode: light
---

# Neo Brutalism

Use for prompt cheat-sheets, product launches, and any deck where the visual itself needs to feel like a confident, opinionated poster. Reference demo slides that embody this theme: `apps/demo/slides/gpt-image-2-prompt-cheatsheet/index.tsx` and `apps/demo/slides/open-slide-launch/index.tsx`.

## Palette

| Role     | Value     | Notes                                      |
| -------- | --------- | ------------------------------------------ |
| bg       | `#f4efe6` | warm cream paper                           |
| surface  | `#fffaf0` | inset cards / chip fill                    |
| ink      | `#111111` | borders + body, near-pure black            |
| accent   | `#ff4f1a` | signal orange — one strong accent          |
| support1 | `#6d4cff` | violet, secondary accent                   |
| support2 | `#1fd1a5` | mint, callouts                             |
| support3 | `#1b78ff` | blue, links / data points                  |
| support4 | `#ffd84d` | yellow highlight, used as a fill not a hue |
| muted    | `#675f55` | captions, page numbers                     |

Always pair a fill with a 4 px black border. Never rely on hue alone for hierarchy.

## Typography

- Display: `'Inter', 'Pretendard', 'SF Pro Display', system-ui, sans-serif` — weight 800–900, slightly tightened tracking.
- Body: same family, weight 400–500.
- Mono: `'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace` for tags, code, page chrome.
- Type scale (overrides only):
  - Hero title: 240–320 px, line-height 0.92, letter-spacing -0.02em.
  - Page heading: 92–124 px, weight 900.
  - Body: 36–40 px, weight 500.
  - Eyebrow / chip: 22 px mono, 0.08em tracking, uppercase.

## Layout

- Padding: 92 px on all sides; 64 px grid background drawn as 2 px hairlines at 8 % opacity.
- One headline + one large element per page; never split the canvas into more than 3 visible blocks.
- Cards have a 4 px solid black border and a 12–16 px hard shadow offset (`box-shadow: 12px 12px 0 #111111`). No blur, no gradients.
- Corner radius: 0–8 px maximum. Rounded pill shapes only for chips.
- Use a `gridBg` background motif: two 1 px linear-gradients crossing at 64 px intervals.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 240,
      fontWeight: 900,
      lineHeight: 0.92,
      letterSpacing: '-0.02em',
      color: '#111111',
      margin: 0,
    }}
  >
    {children}
  </h1>
);
```

### Footer

```tsx
const Footer = ({ pageNum, total, label }: { pageNum: number; total: number; label: string }) => (
  <div
    style={{
      position: 'absolute',
      top: 30,
      right: 92,
      border: '4px solid #111111',
      padding: '8px 16px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: '#fffaf0',
    }}
  >
    {label} · {String(pageNum).padStart(2, '0')}/{String(total).padStart(2, '0')}
  </div>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'inline-block',
      border: '4px solid #111111',
      background: '#ffd84d',
      padding: '6px 14px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 22,
      fontWeight: 900,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      boxShadow: '8px 8px 0 #111111',
    }}
  >
    {children}
  </div>
);
```

## Motion

- Philosophy: punchy. Slides snap into place.
- Reusable keyframes:

```css
@keyframes slamUp {
  0%   { opacity: 0; transform: translateY(160px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes pop {
  0%   { opacity: 0; transform: scale(0.6); }
  60%  { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}
```

Headlines slam in. Cards pop. Bodies fade. Never use slow, smooth easing — always a steep `cubic-bezier(0.22, 1, 0.36, 1)` or `ease-out`.

## Aesthetic

A loud, opinionated poster. Heavy borders, hard shadows, primary-color blocks, mono typography for chrome. Avoid: drop shadow blur, soft gradients, beige minimalism, decorative serifs, centered timid layouts. The deck should look like risograph print — tactile, bold, slightly playful.
