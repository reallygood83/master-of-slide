import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';

const CANVA_IMPORTS_URL = 'https://api.canva.com/rest/v1/imports';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export interface CanvaImportOptions {
  title?: string;
  token?: string;
  open?: boolean;
  pollMs?: number;
  timeoutMs?: number;
}

type ImportJob = {
  id: string;
  status: 'failed' | 'in_progress' | 'success';
  result?: {
    designs?: {
      id: string;
      title?: string;
      urls?: { edit_url?: string; view_url?: string };
    }[];
  };
  error?: { code?: string; message?: string };
};

export async function importToCanva(file: string, opts: CanvaImportOptions = {}): Promise<void> {
  const token = opts.token ?? process.env.CANVA_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Missing Canva access token. Set CANVA_ACCESS_TOKEN or pass --token.');
  }

  const abs = path.resolve(process.cwd(), file);
  const bytes = await readFile(abs);
  const title = canvaTitle(opts.title ?? path.basename(abs, path.extname(abs)));

  const created = await createImportJob(bytes, title, token);
  process.stdout.write(`Canva import job started: ${created.id}\n`);

  const job = await waitForImportJob(created.id, token, {
    pollMs: opts.pollMs ?? 2000,
    timeoutMs: opts.timeoutMs ?? 120000,
  });

  const design = job.result?.designs?.[0];
  const editUrl = design?.urls?.edit_url;
  if (!editUrl) {
    throw new Error('Canva import succeeded but did not return an edit URL.');
  }

  process.stdout.write(`${chalk.green('✓')} Imported to Canva: ${editUrl}\n`);
  if (opts.open !== false) openUrl(editUrl);
}

async function createImportJob(
  bytes: Uint8Array,
  title: string,
  token: string,
): Promise<ImportJob> {
  const res = await fetch(CANVA_IMPORTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Import-Metadata': JSON.stringify({
        title_base64: Buffer.from(title).toString('base64'),
        mime_type: PPTX_MIME,
      }),
    },
    body: new Blob([toArrayBuffer(bytes)], { type: PPTX_MIME }),
  });
  const data = (await res.json()) as { job?: ImportJob; error?: { message?: string } };
  if (!res.ok || !data.job) {
    throw new Error(data.error?.message ?? `Canva import request failed (${res.status}).`);
  }
  return data.job;
}

async function waitForImportJob(
  id: string,
  token: string,
  opts: { pollMs: number; timeoutMs: number },
): Promise<ImportJob> {
  const deadline = Date.now() + opts.timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${CANVA_IMPORTS_URL}/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { job?: ImportJob; error?: { message?: string } };
    if (!res.ok || !data.job) {
      throw new Error(data.error?.message ?? `Canva import status failed (${res.status}).`);
    }
    if (data.job.status === 'success') return data.job;
    if (data.job.status === 'failed') {
      throw new Error(data.job.error?.message ?? data.job.error?.code ?? 'Canva import failed.');
    }
    await sleep(opts.pollMs);
  }
  throw new Error(`Timed out waiting for Canva import job ${id}.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canvaTitle(title: string): string {
  const trimmed = title.trim() || 'Master Of Slide deck';
  return [...trimmed].slice(0, 50).join('');
}

function openUrl(url: string): void {
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
