---
name: Vercel Minimal
description: Pure white deck — Geist sans, thin lines, system diagrams. Web platform / infrastructure aesthetic.
mode: light
---

# Vercel Minimal

Use for web infrastructure explainers, dev platform launches, system diagrams, and any deck where the structure of the diagram itself carries the meaning. Reference demo slide: `apps/demo/slides/nextjs-ppr-cache/index.tsx`.

## Palette

| Role       | Value     | Notes                                |
| ---------- | --------- | ------------------------------------ |
| bg         | `#ffffff` | pure white                           |
| text       | `#000000` | pure black                           |
| muted      | `#666666` | secondary copy                       |
| subtle     | `#a1a1a1` | tertiary copy, axis labels           |
| border     | `#eaeaea` | hairline borders                     |
| surface    | `#fafafa` | inset card fill                      |
| surfaceAlt | `#f5f5f5` | secondary card fill                  |
| accent     | `#0070f3` | classic Vercel blue                  |
| pink       | `#ff0080` | hero accent (use once per deck)      |
| cyan       | `#50e3c2` | data point                           |
| amber      | `#f5a623` | warning / cache miss                 |
| green      | `#0cce6b` | success / cache hit                  |
| purple     | `#7928ca` | secondary signal                     |

## Typography

- Display: `'Geist', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` — weight 600–700.
- Body: same family, weight 400–500.
- Mono: `'Geist Mono', 'SF Mono', Menlo, Consolas, monospace`.
- Type scale:
  - Hero title: 176 px, line-height 0.98, letter-spacing -0.04em.
  - Page heading: 72 px, weight 700.
  - Body: 28 px, line-height 1.5.
  - Caption: 18 px mono, weight 500, 0.04em tracking.

Critical: use `letter-spacing: -0.04em` on display sizes — this is the single biggest signal that the deck is in this style.

## Layout

- Padding: 96 px horizontal, 80 px vertical.
- Maximum 12-column grid. Most pages use a 6 / 6 split or 8 / 4 with diagram on the larger side.
- Hairline borders 1 px in `border` separate cards. No drop shadows.
- Radius: 12 px on cards. Pill shape (999 px) for status chips.
- System diagrams use boxes with 1 px borders, monospace labels, and arrows drawn as thin lines with arrowheads. Animate request flow with horizontal `translateX` shimmer.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
      fontSize: 176,
      fontWeight: 700,
      lineHeight: 0.98,
      letterSpacing: '-0.04em',
      color: '#000000',
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
      left: 96,
      right: 96,
      bottom: 48,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 18,
      letterSpacing: '0.04em',
      color: '#a1a1a1',
      borderTop: '1px solid #eaeaea',
      paddingTop: 16,
    }}
  >
    <span>{label}</span>
    <span>{String(pageNum).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </div>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children, color = '#0070f3' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: '0.04em',
      color,
      borderBottom: `2px solid ${color}`,
      paddingBottom: 4,
    }}
  >
    {children}
  </div>
);
```

## Motion

- Philosophy: subtle, technical.
- Reusable keyframes:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes stream {
  0%   { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}
@keyframes pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
}
```

Use `shimmer` on streaming placeholder bars, `stream` on data flowing through diagram nodes, `pulse` on active status indicators.

## Aesthetic

A clean, structural, technical poster. White everywhere. Black text. Hairlines instead of borders. One accent doing the work. Diagrams animate to teach the system, not to decorate. Avoid: serifs, beige paper, gradients except subtle background washes, decorative emoji, drop shadows, rounded corners >12 px.
