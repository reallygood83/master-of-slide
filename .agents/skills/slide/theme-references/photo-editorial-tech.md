---
name: Photo Editorial Tech
description: Photo-driven tech magazine — full-bleed PNG imagery, restrained type, green/amber pull quotes. Korean-friendly cinematic pacing.
mode: light
---

# Photo Editorial Tech

Use for AI strategy decks, news-insight presentations, cinematic technology storytelling, and Korean-language reports that lean on real photography. Reference demo slide: `apps/demo/slides/harness-engineering-ko/index.tsx`.

## Palette

| Role     | Value     | Notes                                |
| -------- | --------- | ------------------------------------ |
| bg       | `#f4f0e8` | warm sand paper                      |
| surface  | `#fffaf1` | cards over bg, slightly lifted       |
| ink      | `#15181d` | near-black, cool tint                |
| accent   | `#00a676` | grounded green — primary signal      |
| muted    | `#66706f` | captions, page chrome                |
| line     | `#d7d0c3` | hairline borders                     |
| red      | `#d94d42` | risk / alert callouts                |
| blue     | `#2c6bed` | data points, hyperlinks              |
| amber    | `#e2a12c` | pull-quote highlight                 |
| violet   | `#6d5bd0` | secondary signal                     |

Accent rotates per section (green → blue → amber → violet) to mark chapters; never use more than two accents per page.

## Typography

- Display: `"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` — weight 700–800.
- Body: same family, weight 400–500.
- Mono (rare, for data labels): `"JetBrains Mono", "SF Mono", monospace`.
- Type scale:
  - Hero title: 124 px, line-height 1.05, letter-spacing -0.02em.
  - Page heading: 72 px, weight 800.
  - Body: 34 px, line-height 1.55.
  - Caption / chip: 22 px, weight 700, color `muted`.

CRITICAL Korean rules: `wordBreak: 'keep-all'`, `overflowWrap: 'anywhere'`. Never let Korean break mid-jamo.

## Layout

- Padding: 118 px horizontal, 82 px vertical.
- Photography is full-bleed or 60-40 split: image left, copy right (or reversed).
- Cards have 1 px `line` borders and 8 px radius. Subtle warm `surface` fill, no shadow.
- Footer: 2 px solid `line`, mono section name on left, page count on right.
- Section dividers: full-width 2 px `accent` rule that grows from left on entry.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: '"Pretendard", "Noto Sans KR", system-ui, sans-serif',
      fontSize: 124,
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      color: '#15181d',
      margin: 0,
      wordBreak: 'keep-all',
      overflowWrap: 'anywhere',
    }}
  >
    {children}
  </h1>
);
```

### Footer

```tsx
const Footer = ({ page, section, total = 10 }: { page: number; section: string; total?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 118,
      right: 118,
      bottom: 38,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '2px solid #d7d0c3',
      paddingTop: 16,
      color: '#66706f',
      fontSize: 22,
      fontWeight: 700,
    }}
  >
    <span>{section}</span>
    <span>{String(page).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </div>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children, color = '#00a676' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: '"Pretendard", "Noto Sans KR", system-ui, sans-serif',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '0.02em',
      color,
    }}
  >
    <span style={{ width: 32, height: 2, background: color }} />
    {children}
  </div>
);
```

### Photo frame

```tsx
const Photo = ({ src, alt }: { src: string; alt: string }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: 8,
      border: '1px solid #d7d0c3',
    }}
  >
    <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);
```

## Motion

- Philosophy: cinematic, paced.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Reusable keyframes:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes growX {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50%      { transform: scale(1.18); opacity: 1; }
}
```

Use `growX` on section dividers, `pulseDot` on data callouts, `fadeUp` on body and pull quotes.

## Aesthetic

A cinematic Korean tech magazine. Real photography over generated illustration. One accent per chapter. Pretendard everywhere for Korean readability. Avoid: low-resolution stock photos, decorative emoji, gradients, dark backgrounds, neon palettes, English-default fonts. Important Korean text MUST stay as React text — never bake it into a generated image.
