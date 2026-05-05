---
name: Research Brief
description: Light academic-style deck — serif display, restrained sans body, one violet accent. Ideal for technical explainers and analytical decks.
mode: light
---

# Research Brief

Use for technical concept explainers, ML/AI fundamentals, infrastructure write-ups, and any deck that needs the texture of a quiet research paper. Reference demo slides: `apps/demo/slides/llm-fundamentals/index.tsx` and `apps/demo/slides/ssh-explained/index.tsx`.

## Palette

| Role        | Value                          | Notes                          |
| ----------- | ------------------------------ | ------------------------------ |
| bg          | `#f7f5f0`                      | warm off-white                 |
| surface     | `#ffffff`                      | inset cards, charts            |
| text        | `#1a1814`                      | near-black, warm undertone     |
| muted       | `#6b6660`                      | captions, axis labels          |
| faint       | `#a8a29a`                      | gridlines, secondary annotation |
| line        | `#e4e0d8`                      | hairline borders               |
| accent      | `#6d4cff`                      | violet — primary signal color  |
| accentSoft  | `rgba(109, 76, 255, 0.10)`     | callout fill                   |
| warm        | `#c2410c`                      | secondary accent for contrast  |

Variant: swap accent to `#2563eb` (blue) for systems / networking decks (matches `ssh-explained`).

## Typography

- Display: `"Times New Roman", "Georgia", serif` — weight 700.
- Body: `-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", system-ui, sans-serif`.
- Mono: `"SF Mono", "JetBrains Mono", "Menlo", monospace`.
- Type scale:
  - Hero title: 196 px serif, line-height 1.02, letter-spacing -0.02em.
  - Page heading: 84 px serif.
  - Body: 28 px sans, line-height 1.55.
  - Caption / Eyebrow: 22 px sans, 0.16em tracking, uppercase.

## Layout

- Padding: 100 px horizontal, 84 px vertical.
- Two-column rhythm allowed: left column for prose, right for diagram / chart / token chunks.
- Hairline rules in `line` separate sections. Charts use 1 px gridlines in `faint`.
- Radius: 16 px on cards and chart panels.
- Diagrammatic devices: token chips with colored borders, deterministic color cycling for code tokens or dataset rows.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: '"Times New Roman", "Georgia", serif',
      fontSize: 196,
      fontWeight: 700,
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      color: '#1a1814',
      margin: 0,
    }}
  >
    {children}
  </h1>
);
```

### Footer

```tsx
const Footer = ({ pageNum, total, section }: { pageNum: number; total: number; section: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 100,
      right: 100,
      bottom: 56,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: '-apple-system, system-ui, sans-serif',
      fontSize: 20,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: '#6b6660',
      borderTop: '1px solid #e4e0d8',
      paddingTop: 18,
    }}
  >
    <span>{section}</span>
    <span>{String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </div>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: '-apple-system, system-ui, sans-serif',
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: '#6d4cff',
    }}
  >
    {children}
  </div>
);
```

## Motion

- Philosophy: quiet, paper-like.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Reusable keyframes:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes barGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(var(--scale, 1)); }
}
```

Use `lineGrow` for dividers, `barGrow` for chart bars, `fadeUp` for body paragraphs.

## Aesthetic

A measured, paper-like academic deck. Serif headlines do the heavy lifting; sans body text earns trust; one violet (or blue) accent carries meaning. Avoid: drop shadows, gradients, illustrative emoji, gradient text, stage-y motion, dark backgrounds. The deck should feel like a quiet quarterly research note.
