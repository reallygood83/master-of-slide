import { createPptxBlob } from './export-pptx';
import type { SlideModule } from './sdk';

const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export type CanvaStatus = {
  configured: boolean;
  connected: boolean;
  scope?: string;
  clientId?: string;
  hasClientSecret?: boolean;
  redirectUri?: string;
  defaultRedirectUri?: string;
};

export type CanvaConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export async function getCanvaStatus(): Promise<CanvaStatus> {
  const res = await fetch('/api/canva/status');
  return (await res.json()) as CanvaStatus;
}

export function openCanvaLogin(): Window | null {
  return window.open('/api/canva/login', 'master-of-slide-canva', 'popup,width=720,height=900');
}

export async function saveCanvaConfig(config: CanvaConfig): Promise<CanvaStatus> {
  const res = await fetch('/api/canva/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const data = (await res.json()) as CanvaStatus & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Canva config failed (${res.status}).`);
  return data;
}

export async function importSlideToCanva(
  slide: SlideModule,
  slideId: string,
  opts: { lang?: string } = {},
): Promise<string> {
  // Canva receives the same visually flattened PPTX used by Download.
  // Each React page is rendered to a full-slide PNG first, so Canva import
  // should preserve the visual slide instead of trying to interpret JSX/CSS.
  const blob = await createPptxBlob(slide, slideId, opts);
  const title = canvaTitle(slide.meta?.title ?? slideId);
  const res = await fetch(`/api/canva/import?title=${encodeURIComponent(title)}`, {
    method: 'POST',
    headers: { 'Content-Type': PPTX_MIME },
    body: blob,
  });
  const data = (await res.json()) as { editUrl?: string; error?: string };
  if (!res.ok || !data.editUrl) {
    throw new Error(data.error ?? `Canva import failed (${res.status}).`);
  }
  return data.editUrl;
}

function canvaTitle(title: string): string {
  const trimmed = title.trim() || 'Master Of Slide deck';
  return [...trimmed].slice(0, 50).join('');
}
