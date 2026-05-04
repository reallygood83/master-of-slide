import { toPng } from 'html-to-image';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { type DesignSystem, defaultDesign, designToCssVars } from './design';
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SlideModule } from './sdk';

type PptxExportOptions = { lang?: string };

const SLIDE_W = 13.333333;
const SLIDE_H = 7.5;
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

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
  const [{ default: PptxGenJS }, pageImages] = await Promise.all([
    import('pptxgenjs'),
    renderPagesToPng(pages, design),
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

  pageImages.forEach((data, i) => {
    const page = pptx.addSlide();
    page.background = { color: hexColor(design.palette.bg, 'FFFFFF') };
    page.addImage({ data, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
    const note = slide.notes?.[i];
    if (note) {
      const withNotes = page as unknown as { addNotes?: (notes: string) => void };
      withNotes.addNotes?.(note);
    }
  });

  const content = await pptx.write({ outputType: 'arraybuffer' });
  if (!(content instanceof ArrayBuffer)) {
    throw new Error('PPTX export did not produce an ArrayBuffer.');
  }
  return new Blob([content], { type: PPTX_MIME });
}

async function renderPagesToPng(
  pages: NonNullable<SlideModule['default']>,
  design: DesignSystem,
): Promise<string[]> {
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

  const result: string[] = [];
  try {
    for (const Page of pages) {
      const host = document.createElement('div');
      host.setAttribute('data-osd-canvas', '');
      host.style.width = `${CANVAS_WIDTH}px`;
      host.style.height = `${CANVAS_HEIGHT}px`;
      host.style.background = design.palette.bg;
      Object.assign(host.style, designToCssVars(design));
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

      result.push(
        await toPng(host, {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          pixelRatio: 1,
          backgroundColor: design.palette.bg,
          cacheBust: true,
        }),
      );
      root.unmount();
      container.removeChild(host);
    }
  } finally {
    container.remove();
  }
  return result;
}

function materializeComputedStyles(root: HTMLElement): void {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  for (const el of elements) {
    const computed = getComputedStyle(el);
    el.style.fontFamily = computed.fontFamily;
    el.style.fontSize = computed.fontSize;
    el.style.fontWeight = computed.fontWeight;
    el.style.lineHeight = computed.lineHeight;
    el.style.letterSpacing = computed.letterSpacing;
    el.style.color = computed.color;
    el.style.backgroundColor = computed.backgroundColor;
    el.style.borderTopColor = computed.borderTopColor;
    el.style.borderRightColor = computed.borderRightColor;
    el.style.borderBottomColor = computed.borderBottomColor;
    el.style.borderLeftColor = computed.borderLeftColor;
    el.style.boxShadow = computed.boxShadow;
    el.style.borderRadius = computed.borderRadius;
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
  const animations = root.getAnimations({ subtree: true });
  if (animations.length === 0) return;

  await Promise.all(
    animations.map(async (animation) => {
      try {
        await animation.finished;
      } catch {
        // Ignore cancelled animations; the current rendered state is still safe to capture.
      }
    }),
  );
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
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
