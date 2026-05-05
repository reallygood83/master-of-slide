---
name: Raycast Dark Product
description: Dark SaaS / product launch deck — UI panels, red accent, glow halos. Ideal for API and developer-tool decks.
mode: dark
---

# Raycast Dark Product

Use for API launches, developer tool announcements, dark SaaS product decks, and any pitch that wants to feel like a polished native app screenshot. Reference demo slide: `apps/demo/slides/raycast-api/index.tsx`.

## Palette

| Role        | Value                          | Notes                          |
| ----------- | ------------------------------ | ------------------------------ |
| bg          | `#0E0E0E`                      | near-black canvas              |
| surface     | `#1A1A1A`                      | inset card / panel             |
| surfaceHi   | `#222222`                      | hover / active state           |
| border      | `#2A2A2A`                      | hairline borders               |
| text        | `#F5F5F5`                      | primary copy                   |
| muted       | `#8B8B8B`                      | secondary copy, captions       |
| accent      | `#FF6363`                      | warm red — single accent       |
| accentSoft  | `rgba(255, 99, 99, 0.12)`      | accent fill, halo              |

## Typography

- Display: `-apple-system, BlinkMacSystemFont, "Inter", "SF Pro Display", system-ui, sans-serif` — weight 700.
- Body: same family, weight 400–500.
- Mono: `"SF Mono", "JetBrains Mono", "Menlo", monospace`.
- Type scale:
  - Hero title: 112 px, line-height 1.04, letter-spacing -0.02em.
  - Page heading: 64 px, weight 700.
  - Body: 24 px, line-height 1.55, color `#F5F5F5`.
  - Caption / chip: 18 px mono, color `#8B8B8B`.

Display sizes are deliberately smaller than other themes — this style trusts spacing and panels to do the structural work.

## Layout

- Padding: 96 px horizontal, 80 px vertical.
- Heavy use of stacked panels (`surface` over `bg`), each with 1 px `border` and 14 px radius.
- Glow halos — large radial-gradient blobs at 12–18 % opacity behind hero content; never sharply defined.
- Command-palette pattern: input bar with caret, list of results below. Reuse for feature tables and CLI-like demos.
- Radius: 14 px on panels, 999 px on chips.

## Fixed components

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h1
    style={{
      fontFamily: '-apple-system, "Inter", system-ui, sans-serif',
      fontSize: 112,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: '-0.02em',
      color: '#F5F5F5',
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
      fontFamily: '"SF Mono", "JetBrains Mono", monospace',
      fontSize: 18,
      letterSpacing: '0.04em',
      color: '#8B8B8B',
      borderTop: '1px solid #2A2A2A',
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
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 999,
      background: 'rgba(255, 99, 99, 0.12)',
      border: '1px solid rgba(255, 99, 99, 0.35)',
      fontFamily: '"SF Mono", "JetBrains Mono", monospace',
      fontSize: 16,
      letterSpacing: '0.04em',
      color: '#FF6363',
    }}
  >
    {children}
  </div>
);
```

### Glow halo

```tsx
const Glow = ({ x = '50%', y = '50%', size = 1200 }: { x?: string; y?: string; size?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      background: 'radial-gradient(circle, rgba(255,99,99,0.18) 0%, transparent 60%)',
      pointerEvents: 'none',
    }}
  />
);
```

## Motion

- Philosophy: refined, native-app feel.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Reusable keyframes:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes glow {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.85; }
}
@keyframes caret {
  0%, 60%   { opacity: 1; }
  61%, 100% { opacity: 0; }
}
```

Use `glow` on halo blobs, `caret` on command-palette input cursors, `fadeUp` on body content.

## Aesthetic

A polished dark product screenshot. Panels stack. One accent (`#FF6363`) carries hover, focus, and signal states. Halos suggest depth without painting it. Avoid: serifs, paper backgrounds, multi-color charts, drop shadows, high-saturation gradients, decorative emoji. The deck should feel like an enlarged screenshot of a beautifully designed dark Mac app.
