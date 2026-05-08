import { toPng } from 'html-to-image';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { type DesignSystem, defaultDesign, designToCssVars } from './design';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SlideModule } from './sdk';

type PptxExportOptions = { lang?: string };

const SLIDE_W = 13.333333; // inches
const SLIDE_H = 7.5;
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

// ─────────────────────────────────────────────────────────────────────────────
// Public API — backward compatible
// ─────────────────────────────────────────────────────────────────────────────

export async function exportSlideAsPptx(
  slide: SlideModule,
  slideId: string,
  opts: PptxExportOptions = {},
): Promise<void> {
  const content = await createPptxBlob(slide, slideId, opts);
  downloadBlob(content, pptxFilename(slideId), PPTX_MIME);
}

export async function createPptxBlob(
  slide: SlideModule,
  slideId: string,
  _opts: PptxExportOptions = {},
): Promise<Blob> {
  const pages = slide.default ?? [];
  if (pages.length === 0) throw new Error('PPTX export requires at least one slide page.');

  const design = slide.design ?? defaultDesign;
  const [{ default: PptxGenJS }, pageDataList] = await Promise.all([
    import('pptxgenjs'),
    renderPagesToPptxData(pages, design),
  ]);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Master Of Slide';
  pptx.subject = slide.meta?.title ?? slideId;
  pptx.title = slide.meta?.title ?? slideId;
  pptx.company = 'Master Of Slide, based on open-slide source';
  pptx.theme = {
    headFontFace: primaryFontFace(design.fonts.display),
    bodyFontFace: primaryFontFace(design.fonts.body),
  };

  pageDataList.forEach((data, i) => {
    const page = pptx.addSlide();
    page.background = { color: hexColor(design.palette.bg, 'FFFFFF') };
    // Layer 1 — background PNG with text rendered transparent so the visual
    // (gradients, shapes, hairlines, photos, mermaid-like vector blocks)
    // matches the on-screen design exactly.
    page.addImage({ data: data.png, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });

    // Layer 2 — native text frames (one per block-level parent). Each frame
    // packs all of its inline runs (<strong>, <span style={{color}}>, etc.)
    // into a single `addText([{...},{...}])` call so PowerPoint/Keynote/Canva
    // see one text box with multi-format runs — never overlapping boxes.
    for (const frame of data.frames) {
      try {
        const runs = frame.runs.map((r) => ({
          text: r.text,
          options: {
            color: r.color,
            bold: r.bold,
            italic: r.italic,
            fontFace: r.fontFace,
            fontSize: r.fontSize,
          },
        }));
        page.addText(runs, {
          x: frame.x,
          y: frame.y,
          w: frame.w,
          h: frame.h,
          fontFace: frame.defaultFontFace,
          fontSize: frame.defaultFontSize,
          align: frame.align,
          valign: frame.valign,
          margin: 0,
          isTextBox: true,
          autoFit: false,
          wrap: true,
          // Match the on-screen line-height so PowerPoint reproduces the
          // same vertical rhythm. Without this PPT defaults to 1.0 spacing
          // and multi-line copy compresses, drifting from the captured PNG.
          lineSpacingMultiple: frame.lineHeightMultiple,
        });
      } catch {
        // pptxgenjs occasionally rejects edge-case font/colors. Skipping a
        // single frame still keeps the slide visually correct via Layer 1.
      }
    }

    const note = slide.notes?.[i];
    const narration = slide.narration?.[i];
    const speakerNote = narration ?? note;
    if (speakerNote) {
      const withNotes = page as unknown as { addNotes?: (notes: string) => void };
      withNotes.addNotes?.(speakerNote);
    }
  });

  const content = await pptx.write({ outputType: 'arraybuffer' });
  if (!(content instanceof ArrayBuffer)) {
    throw new Error('PPTX export did not produce an ArrayBuffer.');
  }
  return new Blob([content], { type: PPTX_MIME });
}

/**
 * Backward-compatible PNG-only renderer. Used by export-mp4.ts where MP4 is
 * inherently raster and we only need the bitmap stream. For PPTX use
 * `renderPagesToPptxData` instead so the file ships native text overlays.
 */
export async function renderPagesToPng(
  pages: NonNullable<SlideModule['default']>,
  design: DesignSystem,
  opts: { pixelRatio?: number } = {},
): Promise<string[]> {
  const data = await renderPagesToPptxData(pages, design, {
    pixelRatio: opts.pixelRatio ?? 2,
    extractText: false,
  });
  return data.map((d) => d.png);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hybrid renderer — captures background PNG + native text entries.
// ─────────────────────────────────────────────────────────────────────────────

export type PptxTextRun = {
  text: string;
  /** Points. */
  fontSize: number;
  fontFace: string;
  /** Hex without leading '#'. */
  color: string;
  bold: boolean;
  italic: boolean;
};

export type PptxTextFrame = {
  /** Inches from slide left. */
  x: number;
  /** Inches from slide top. */
  y: number;
  /** Inches. */
  w: number;
  /** Inches. */
  h: number;
  align: 'left' | 'center' | 'right';
  valign: 'top' | 'middle' | 'bottom';
  /** Points. Used as default for runs without explicit size. */
  defaultFontSize: number;
  defaultFontFace: string;
  /** Multiple of single-line height (matches CSS line-height). */
  lineHeightMultiple: number;
  /** One or more inline runs (e.g. plain text + <strong> + colored span). */
  runs: PptxTextRun[];
};

export type PptxPageData = {
  /** Data URL (image/png). Background layer with text rendered transparent. */
  png: string;
  /** Native text frames in PPTX inch coordinates, one per block-level container. */
  frames: PptxTextFrame[];
};

export async function renderPagesToPptxData(
  pages: NonNullable<SlideModule['default']>,
  design: DesignSystem,
  opts: { pixelRatio?: number; extractText?: boolean } = {},
): Promise<PptxPageData[]> {
  const pixelRatio = opts.pixelRatio ?? 2;
  const extractText = opts.extractText ?? true;

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
    pointerEvents: 'none',
  });
  document.body.appendChild(container);

  const result: PptxPageData[] = [];
  try {
    for (const Page of pages) {
      const host = document.createElement('div');
      host.setAttribute('data-osd-canvas', '');
      host.style.width = `${CANVAS_WIDTH}px`;
      host.style.height = `${CANVAS_HEIGHT}px`;
      host.style.background = design.palette.bg;
      // CSS custom properties must be set via setProperty(); bracket-style
      // assignment through Object.assign silently fails in some engines and
      // leaves var(--osd-*) references unresolved during PNG capture, which
      // produced the "black text on dark bg" bug in PPTX/Canva export.
      for (const [key, value] of Object.entries(designToCssVars(design))) {
        host.style.setProperty(key, value);
      }
      container.appendChild(host);

      const root = createRoot(host);
      flushSync(() => {
        root.render(createElement(Page));
      });
      await nextPaint(2);
      await waitForImages(host);
      await waitForFonts();
      await waitForAnimations(host);
      await nextPaint();
      materializeComputedStyles(host);

      // 1. Extract text frames (one per block-level container, packed with
      //    inline runs) while the page is still fully visible.
      const frames = extractText ? extractTextFrames(host) : [];

      // 2. Hide text in the DOM so the captured PNG holds only the visual
      //    backdrop. Without this we'd paint every word twice (raster +
      //    native), and edits to the native overlay would silently disagree
      //    with the bitmap underneath. Also strips text-shadow and
      //    -webkit-text-stroke so glow/halo doesn't bleed through.
      const restoreTextColors = extractText ? hideAllTextColors(host) : () => {};
      await nextPaint();
      const png = await toPng(host, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pixelRatio,
        backgroundColor: design.palette.bg,
        cacheBust: true,
      });
      restoreTextColors();

      result.push({ png, frames });
      root.unmount();
      container.removeChild(host);
    }
  } finally {
    container.remove();
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text frame extraction — group inline runs (<strong>, colored <span>, plain
// text) under their nearest block-level ancestor so PPTX gets ONE text box
// per block with multi-format runs, instead of N overlapping boxes per inline
// node. This is what "fixes the broken layout" in PowerPoint/Keynote/Canva.
// ─────────────────────────────────────────────────────────────────────────────

const BLOCK_DISPLAYS = new Set([
  'block',
  'flex',
  'grid',
  'inline-block',
  'inline-flex',
  'inline-grid',
  'list-item',
  'table',
  'table-cell',
  'table-row',
  'table-row-group',
]);

function extractTextFrames(host: HTMLElement): PptxTextFrame[] {
  const frames: PptxTextFrame[] = [];
  const hostRect = host.getBoundingClientRect();
  if (hostRect.width === 0 || hostRect.height === 0) return frames;
  const sx = SLIDE_W / hostRect.width;
  const sy = SLIDE_H / hostRect.height;

  // Walk all elements; for each block-level container that has at least one
  // direct or inline-only text child, emit a frame containing every inline
  // descendant text run. Block descendants are NOT collected — they will get
  // their own frame on a later iteration.
  const allElements = [host, ...Array.from(host.querySelectorAll<HTMLElement>('*'))];

  for (const el of allElements) {
    if (!isBlockLevel(el)) continue;
    if (!isVisibleForExport(el, host)) continue;
    if (!containsLeafInlineText(el)) continue;

    const runs: PptxTextRun[] = [];
    collectInlineRuns(el, runs, host);
    if (runs.length === 0) continue;
    // Drop frames that ended up with only whitespace/punctuation noise.
    if (runs.every((r) => /^[\s,.·]+$/.test(r.text))) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;

    const blockStyle = getComputedStyle(el);
    const align: PptxTextFrame['align'] =
      blockStyle.textAlign === 'center'
        ? 'center'
        : blockStyle.textAlign === 'right'
          ? 'right'
          : 'left';
    const valign: PptxTextFrame['valign'] = inferVerticalAlign(blockStyle);

    frames.push({
      x: clamp((rect.left - hostRect.left) * sx, 0, SLIDE_W),
      y: clamp((rect.top - hostRect.top) * sy, 0, SLIDE_H),
      w: clamp(rect.width * sx, 0.05, SLIDE_W),
      h: clamp(rect.height * sy, 0.05, SLIDE_H),
      align,
      valign,
      defaultFontFace: primaryFontFace(blockStyle.fontFamily),
      defaultFontSize: pxToPt(parseFloatOr(blockStyle.fontSize, 16)),
      lineHeightMultiple: computeLineHeightMultiple(blockStyle),
      runs: mergeAdjacentEqualRuns(runs),
    });
  }

  // Sort by reading order so PowerPoint's tab-cycle through shapes matches
  // the visual top-to-bottom flow.
  frames.sort((a, b) => a.y - b.y || a.x - b.x);
  return frames;
}

function isBlockLevel(el: HTMLElement): boolean {
  const cs = getComputedStyle(el);
  return BLOCK_DISPLAYS.has(cs.display);
}

/**
 * Returns true when `el` directly contains text or contains text only inside
 * inline descendants (i.e. it is the deepest block wrapping its inline copy).
 * Block descendants are ignored — they'll be processed in their own iteration.
 */
function containsLeafInlineText(el: HTMLElement): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child.textContent?.trim().length ?? 0) > 0) return true;
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const childEl = child as HTMLElement;
    // A block child gets its own frame; do not count its text toward `el`.
    if (isBlockLevel(childEl)) continue;
    if (containsAnyInlineText(childEl)) return true;
  }
  return false;
}

function containsAnyInlineText(el: HTMLElement): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if ((child.textContent?.trim().length ?? 0) > 0) return true;
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const childEl = child as HTMLElement;
    if (isBlockLevel(childEl)) continue; // boundary — stop descending here
    if (containsAnyInlineText(childEl)) return true;
  }
  return false;
}

/**
 * Depth-first collection of inline text runs starting at `block`. Stops at
 * any block-level descendant boundary so we never duplicate text that another
 * frame will already cover.
 */
function collectInlineRuns(block: HTMLElement, runs: PptxTextRun[], host: HTMLElement): void {
  for (const child of Array.from(block.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const raw = child.textContent ?? '';
      if (!raw.trim()) continue;
      const parent = (child as Text).parentElement;
      if (!parent || !isVisibleForExport(parent, host)) continue;
      const cs = getComputedStyle(parent);
      runs.push(makeRun(raw, cs));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const childEl = child as HTMLElement;
    if (childEl instanceof HTMLImageElement) continue;
    if (childEl instanceof HTMLBRElement) {
      runs.push({ text: '\n', fontSize: 12, fontFace: '', color: '000000', bold: false, italic: false });
      continue;
    }
    if (isBlockLevel(childEl)) continue; // boundary
    if (!isVisibleForExport(childEl, host)) continue;
    collectInlineRuns(childEl, runs, host);
  }
}

function makeRun(rawText: string, cs: CSSStyleDeclaration): PptxTextRun {
  const fontWeightNum = parseFloatOr(cs.fontWeight, 400);
  return {
    // Collapse runs of whitespace but preserve a single leading/trailing
    // space so adjacent runs don't get glued together visually.
    text: rawText.replace(/[\t\n\r]+/g, ' ').replace(/ {2,}/g, ' '),
    fontSize: pxToPt(parseFloatOr(cs.fontSize, 16)),
    fontFace: primaryFontFace(cs.fontFamily),
    color: rgbToHex(cs.color, '111111'),
    bold: fontWeightNum >= 600 || cs.fontWeight === 'bold',
    italic: cs.fontStyle === 'italic',
  };
}

function mergeAdjacentEqualRuns(runs: PptxTextRun[]): PptxTextRun[] {
  const merged: PptxTextRun[] = [];
  for (const run of runs) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.color === run.color &&
      prev.bold === run.bold &&
      prev.italic === run.italic &&
      prev.fontFace === run.fontFace &&
      prev.fontSize === run.fontSize
    ) {
      prev.text += run.text;
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

function isVisibleForExport(start: Element, host: HTMLElement): boolean {
  let cur: Element | null = start;
  while (cur && cur !== host) {
    if (cur.getAttribute('aria-hidden') === 'true') return false;
    if (cur instanceof HTMLImageElement) return false;
    const cs = getComputedStyle(cur);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity || '1') < 0.05) return false;
    cur = cur.parentElement;
  }
  return true;
}

function inferVerticalAlign(cs: CSSStyleDeclaration): PptxTextFrame['valign'] {
  // Honor inline alignment hints; default to top so multiline copy reads from
  // the box origin (matches HTML behavior).
  if (cs.alignItems === 'center' || cs.justifyContent === 'center') return 'middle';
  if (cs.alignItems === 'flex-end' || cs.justifyContent === 'flex-end') return 'bottom';
  return 'top';
}

function hideAllTextColors(host: HTMLElement): () => void {
  const restorations: Array<() => void> = [];
  // Hide text by zeroing the rendered glyph color and any glow/halo so the
  // captured PNG carries pure background visuals only. We avoid
  // `visibility:hidden` because it would collapse spans inside flex/grid
  // containers and shift the layout we just measured.
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_ELEMENT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const el = node as HTMLElement;
    if (!hasDirectTextChild(el)) continue;
    const origColor = el.style.color;
    const origShadow = el.style.textShadow;
    const origStroke = el.style.webkitTextStroke;
    const origFill = el.style.getPropertyValue('-webkit-text-fill-color');
    el.style.color = 'transparent';
    el.style.textShadow = 'none';
    el.style.webkitTextStroke = '0 transparent';
    el.style.setProperty('-webkit-text-fill-color', 'transparent');
    restorations.push(() => {
      el.style.color = origColor;
      el.style.textShadow = origShadow;
      el.style.webkitTextStroke = origStroke;
      if (origFill) el.style.setProperty('-webkit-text-fill-color', origFill);
      else el.style.removeProperty('-webkit-text-fill-color');
    });
  }
  return () => {
    for (const r of restorations) r();
  };
}

function hasDirectTextChild(el: HTMLElement): boolean {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && (child.textContent?.trim().length ?? 0) > 0) {
      return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Style materialization — runs after React mounts so `var(--osd-*)` and
// `currentColor` get resolved before html-to-image clones the tree.
// ─────────────────────────────────────────────────────────────────────────────

function materializeComputedStyles(root: HTMLElement): void {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  for (const el of elements) {
    const computed = getComputedStyle(el);
    // Typography
    el.style.fontFamily = computed.fontFamily;
    el.style.fontSize = computed.fontSize;
    el.style.fontWeight = computed.fontWeight;
    el.style.fontStyle = computed.fontStyle;
    el.style.lineHeight = computed.lineHeight;
    el.style.letterSpacing = computed.letterSpacing;
    el.style.textAlign = computed.textAlign;
    el.style.textDecoration = computed.textDecoration;
    // Color
    el.style.color = computed.color;
    el.style.backgroundColor = computed.backgroundColor;
    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
      el.style.backgroundImage = computed.backgroundImage;
    }
    // Borders
    el.style.borderTopColor = computed.borderTopColor;
    el.style.borderRightColor = computed.borderRightColor;
    el.style.borderBottomColor = computed.borderBottomColor;
    el.style.borderLeftColor = computed.borderLeftColor;
    el.style.borderTopWidth = computed.borderTopWidth;
    el.style.borderRightWidth = computed.borderRightWidth;
    el.style.borderBottomWidth = computed.borderBottomWidth;
    el.style.borderLeftWidth = computed.borderLeftWidth;
    el.style.borderTopStyle = computed.borderTopStyle;
    el.style.borderRightStyle = computed.borderRightStyle;
    el.style.borderBottomStyle = computed.borderBottomStyle;
    el.style.borderLeftStyle = computed.borderLeftStyle;
    el.style.borderRadius = computed.borderRadius;
    // Effects
    el.style.boxShadow = computed.boxShadow;
    el.style.opacity = computed.opacity;
    el.style.filter = computed.filter;
    el.style.transform = computed.transform;
    el.style.transformOrigin = computed.transformOrigin;
  }
}

function nextPaint(frames = 1): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      requestAnimationFrame(() => {
        if (remaining <= 1) resolve();
        else step(remaining - 1);
      });
    };
    step(frames);
  });
}

async function waitForFonts(): Promise<void> {
  if ('fonts' in document) await document.fonts.ready;
}

async function waitForAnimations(root: HTMLElement): Promise<void> {
  // Export must capture the FINAL visual state — never a mid-flight frame.
  //
  // Why the previous "finish() + style.animation=none" approach wasn't enough:
  // html-to-image clones the host DOM into an SVG <foreignObject> for raster.
  // The clone re-evaluates CSS — animation state is NOT carried over from the
  // source. So even though we finished animations on the source, the clone
  // saw `class="r-fadeup"` and a CSS rule `animation: rFadeUp 900ms both` and
  // started a brand-new animation cycle from `from { opacity: 0 }`. The PNG
  // captured that initial invisible frame, which is why MP4 export was
  // missing every animated word while the static footer/hero photo stayed.
  //
  // Fix: inject a <style> sheet INTO the host that forces every animation to
  // its terminal frame instantly via negative delay + 1ms duration + forwards
  // fill. This is the standard CSS-only animation-skipper used by Storybook
  // visual tests and Playwright snapshots — the rule travels with the clone,
  // so the clone's animation also "finishes" before the rasterizer paints.
  //
  // We still finish() animations on the source as a belt-and-braces measure
  // for `getAnimations()`-driven JS animations.
  const animations = root.getAnimations?.({ subtree: true }) ?? [];
  for (const animation of animations) {
    try {
      animation.finish();
    } catch {
      try {
        animation.cancel();
      } catch {
        // Ignore — the injected stylesheet below will recover the pose.
      }
    }
  }

  // Inject the kill-switch stylesheet. Scoped under [data-osd-canvas] so it
  // can never leak into the editing surface; it lives only on the offscreen
  // export host and gets thrown away with it.
  const killer = document.createElement('style');
  killer.setAttribute('data-osd-export-killer', '');
  killer.textContent = `
    [data-osd-canvas], [data-osd-canvas] *, [data-osd-canvas] *::before, [data-osd-canvas] *::after {
      animation-delay: -1s !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      animation-fill-mode: forwards !important;
      animation-play-state: running !important;
      transition: none !important;
    }
  `;
  root.appendChild(killer);

  // Force a style recalc so the new rules apply before any opacity sweep
  // and before html-to-image clones the tree.
  void root.offsetHeight;

  // Defense in depth: pin opacity to 1 on every element that the export should
  // surface. We can't trust computed-opacity heuristics here — `from { opacity: 0 }`
  // entry keyframes resolve to 0 during animation-delay, so a "skip if op == 0"
  // rule would silently drop animated text. Instead we pin opacity to 1 across
  // the board, and EXPLICITLY preserve any inline opacity authored on the
  // element (those are intentional design tokens like 0.05 overlays).
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  for (const el of elements) {
    if (el.dataset.osdExportKiller !== undefined) continue;
    const inlineOpacity = el.style.opacity;
    if (inlineOpacity && inlineOpacity !== '' && parseFloat(inlineOpacity) < 1) continue;
    el.style.setProperty('opacity', '1', 'important');
  }
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  const imgWaits = imgs.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
    });
  });

  const bgUrls = new Set<string>();
  for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') continue;
    for (const m of bg.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      bgUrls.add(m[2]);
    }
  }
  const bgWaits = Array.from(bgUrls).map(
    (src) =>
      new Promise<void>((resolve) => {
        const probe = new Image();
        probe.onload = () => resolve();
        probe.onerror = () => resolve();
        probe.src = src;
      }),
  );

  await Promise.all([...imgWaits, ...bgWaits]);
}

function downloadBlob(blob: Blob, filename: string, type: string): void {
  const file =
    typeof File === 'function' ? new File([blob], filename, { type }) : new Blob([blob], { type });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.type = type;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function pptxFilename(slideId: string): string {
  const base = slideId.trim() || 'master-of-slide';
  return base.toLowerCase().endsWith('.pptx') ? base : `${base}.pptx`;
}

function primaryFontFace(stack: string): string {
  const [first] = stack.split(',');
  return first?.trim().replace(/^["']|["']$/g, '') || 'Aptos';
}

function hexColor(value: string, fallback: string): string {
  const trimmed = value.trim();
  const match = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  return match?.[1]?.toUpperCase() ?? fallback;
}

function rgbToHex(color: string, fallback: string): string {
  const trimmed = color.trim();
  const hexMatch = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  if (hexMatch) return hexMatch[1].toUpperCase();
  const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(trimmed);
  if (!rgb) return fallback.toUpperCase();
  const [, r, g, b] = rgb;
  return [r, g, b]
    .map((v) => Math.max(0, Math.min(255, parseInt(v, 10))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function parseFloatOr(value: string, fallback: number): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Convert a CSS pixel size to PPTX points using the canvas-to-slide ratio.
 *
 * Our authoring canvas is 1920×1080 CSS px and gets stretched to a
 * 13.33"×7.5" PPTX slide (LAYOUT_WIDE). One canvas pixel therefore equals
 * 1920 px / (13.33" × 96 dpi) = 1.5 logical px per slide px, which means
 * one canvas pixel projects to 0.5 slide points (px × 7.5 in / 1080 × 72
 * pt/in = px × 0.5).
 *
 * Using the standard 96-dpi conversion (px × 0.75) bloats every glyph by
 * 50%, overflows its parent box, and produces the "PPTX is broken" feel
 * users were seeing in PowerPoint, Keynote, and Canva.
 */
function pxToPt(px: number): number {
  return Math.max(6, +(px * 0.5).toFixed(1));
}

/**
 * Resolve the CSS line-height into a multiplier of the font size, suitable
 * for pptxgenjs' `lineSpacingMultiple` option. Defaults to 1.2 when the
 * style yields `normal`, matching most browsers' single-line rhythm.
 */
function computeLineHeightMultiple(cs: CSSStyleDeclaration): number {
  const raw = cs.lineHeight;
  if (!raw || raw === 'normal') return 1.2;
  const fontPx = parseFloatOr(cs.fontSize, 16) || 16;
  const lhPx = parseFloat(raw);
  if (!Number.isFinite(lhPx) || lhPx <= 0) return 1.2;
  // CSS line-height returns the resolved px even when authored unitless.
  const ratio = lhPx / fontPx;
  // Clamp to a sane range — pptxgenjs misrenders below 0.5 / above 4.
  return Math.max(0.85, Math.min(3, +ratio.toFixed(2)));
}
