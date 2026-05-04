import crypto from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';

const AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
const IMPORTS_URL = 'https://api.canva.com/rest/v1/imports';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const SCOPES = 'design:content:write';
const OAUTH_COOKIE = 'master_of_slide_canva_oauth';

type TokenState = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
};

type PendingAuth = {
  codeVerifier: string;
  redirectUri: string;
};

type StoredAuth = PendingAuth & {
  state: string;
  expiresAt: number;
};

type ImportJob = {
  id: string;
  status: 'failed' | 'in_progress' | 'success';
  result?: {
    designs?: {
      urls?: { edit_url?: string; view_url?: string };
    }[];
  };
  error?: { code?: string; message?: string };
};

type CanvaPluginOptions = {
  env?: Record<string, string | undefined>;
  userCwd?: string;
};

export function canvaPlugin(opts: CanvaPluginOptions = {}): Plugin {
  const pending = new Map<string, PendingAuth>();
  let tokenState: TokenState | null = null;
  const env = opts.env ?? process.env;
  const userCwd = opts.userCwd ?? process.cwd();
  const envPath = path.join(userCwd, '.env');
  const oauthStatePath = path.join(userCwd, '.canva-oauth-state.json');

  return {
    name: 'open-slide:canva',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', requestOrigin(req));
        if (!url.pathname.startsWith('/api/canva/')) return next();

        try {
          if (url.pathname === '/api/canva/status') {
            return json(res, 200, {
              configured: Boolean(clientId() && clientSecret()),
              connected: isConnected(tokenState),
              scope: tokenState?.scope,
              clientId: clientId() ?? '',
              hasClientSecret: Boolean(clientSecret()),
              redirectUri: redirectUriFor(req),
              defaultRedirectUri: `${requestOrigin(req)}/api/canva/callback`,
            });
          }

          if (url.pathname === '/api/canva/config') {
            if (req.method === 'GET') {
              return json(res, 200, {
                clientId: clientId() ?? '',
                hasClientSecret: Boolean(clientSecret()),
                redirectUri: redirectUriFor(req),
                defaultRedirectUri: `${requestOrigin(req)}/api/canva/callback`,
              });
            }
            if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });

            const data = (await readJson(req)) as {
              clientId?: string;
              clientSecret?: string;
              redirectUri?: string;
            };
            const nextClientId = data.clientId?.trim();
            const nextClientSecret = data.clientSecret?.trim();
            const nextRedirectUri =
              data.redirectUri?.trim() || `${requestOrigin(req)}/api/canva/callback`;

            if (!nextClientId || !nextClientSecret) {
              return json(res, 400, { error: 'Client ID and Client Secret are required.' });
            }

            env.CANVA_CLIENT_ID = nextClientId;
            env.CANVA_CLIENT_SECRET = nextClientSecret;
            env.CANVA_REDIRECT_URI = nextRedirectUri;
            tokenState = null;
            await persistCanvaEnv(envPath, {
              CANVA_CLIENT_ID: nextClientId,
              CANVA_CLIENT_SECRET: nextClientSecret,
              CANVA_REDIRECT_URI: nextRedirectUri,
            });

            return json(res, 200, {
              configured: true,
              connected: false,
              redirectUri: nextRedirectUri,
            });
          }

          if (url.pathname === '/api/canva/login') {
            const id = clientId();
            const secret = clientSecret();
            if (!id || !secret) {
              return json(res, 400, {
                error: 'Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET before connecting Canva.',
              });
            }

            const redirectUri = redirectUriFor(req);
            const codeVerifier = crypto.randomBytes(96).toString('base64url');
            const codeChallenge = crypto
              .createHash('sha256')
              .update(codeVerifier)
              .digest('base64url');
            const state = crypto.randomBytes(32).toString('base64url');
            const authState = {
              codeVerifier,
              redirectUri,
              state,
              expiresAt: Date.now() + 10 * 60 * 1000,
            };
            pending.set(state, { codeVerifier, redirectUri });
            await persistOAuthState(oauthStatePath, authState);

            const auth = new URL(AUTH_URL);
            auth.searchParams.set('code_challenge', codeChallenge);
            auth.searchParams.set('code_challenge_method', 'S256');
            auth.searchParams.set('scope', SCOPES);
            auth.searchParams.set('response_type', 'code');
            auth.searchParams.set('client_id', id);
            auth.searchParams.set('state', state);
            auth.searchParams.set('redirect_uri', redirectUri);

            res.statusCode = 302;
            setOAuthCookie(res, authState);
            res.setHeader('location', auth.toString());
            res.end();
            return;
          }

          if (url.pathname === '/api/canva/callback') {
            const error = url.searchParams.get('error');
            const errorDescription = url.searchParams.get('error_description');
            if (error) {
              const detail =
                error === 'invalid_scope'
                  ? 'Canva rejected the requested scope. In Canva Developer Portal, open Scopes and enable design:content:write for this integration, then try Connect Canva again.'
                  : (errorDescription ?? error);
              return html(res, 400, detail);
            }

            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const auth = state
              ? (pending.get(state) ??
                authFromCookie(req, state) ??
                (await authFromFile(oauthStatePath, state)))
              : null;
            if (!code || !state || !auth) {
              return html(
                res,
                400,
                'Canva login session expired. Close this tab and click Connect Canva again from Master Of Slide.',
              );
            }
            pending.delete(state);
            await clearOAuthState(oauthStatePath, state);
            clearOAuthCookie(res);
            tokenState = await exchangeCode(code, auth, credentials());
            return html(res, 200, 'Canva connected. You can close this tab.', { autoClose: true });
          }

          if (url.pathname === '/api/canva/import') {
            if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
            if (!isConnected(tokenState)) {
              return json(res, 401, { error: 'Canva is not connected.' });
            }
            const title = canvaTitle(url.searchParams.get('title') || 'Master Of Slide deck');
            const bytes = await readBody(req);
            const job = await createImportJob(bytes, title, tokenState.accessToken);
            const done = await waitForImportJob(job.id, tokenState.accessToken);
            const editUrl = done.result?.designs?.[0]?.urls?.edit_url;
            if (!editUrl) return json(res, 502, { error: 'Canva did not return an edit URL.' });
            return json(res, 200, { editUrl });
          }

          return json(res, 404, { error: 'Not found.' });
        } catch (err) {
          return json(res, 500, { error: err instanceof Error ? err.message : String(err) });
        }
      });
    },
  };

  function clientId(): string | undefined {
    return env.CANVA_CLIENT_ID;
  }

  function clientSecret(): string | undefined {
    return env.CANVA_CLIENT_SECRET;
  }

  function redirectUriFor(req: Connect.IncomingMessage): string {
    return env.CANVA_REDIRECT_URI ?? `${requestOrigin(req)}/api/canva/callback`;
  }

  function credentials(): { id: string; secret: string } {
    const id = clientId();
    const secret = clientSecret();
    if (!id || !secret) throw new Error('Canva credentials are missing.');
    return { id, secret };
  }
}

function canvaTitle(title: string): string {
  const trimmed = title.trim() || 'Master Of Slide deck';
  return [...trimmed].slice(0, 50).join('');
}

function requestOrigin(req: Connect.IncomingMessage): string {
  return `http://${req.headers.host ?? 'localhost:5173'}`;
}

async function exchangeCode(
  code: string,
  auth: PendingAuth,
  credentials: { id: string; secret: string },
): Promise<TokenState> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code_verifier: auth.codeVerifier,
    code,
    redirect_uri: auth.redirectUri,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? `Canva token exchange failed (${res.status}).`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 14400) * 1000,
    scope: data.scope,
  };
}

function isConnected(tokenState: TokenState | null): tokenState is TokenState {
  return Boolean(tokenState && tokenState.expiresAt > Date.now() + 30000);
}

async function createImportJob(
  bytes: Uint8Array,
  title: string,
  token: string,
): Promise<ImportJob> {
  const res = await fetch(IMPORTS_URL, {
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

async function waitForImportJob(id: string, token: string): Promise<ImportJob> {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const res = await fetch(`${IMPORTS_URL}/${encodeURIComponent(id)}`, {
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Timed out waiting for Canva import job ${id}.`);
}

async function readBody(req: Connect.IncomingMessage): Promise<Uint8Array> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req: Connect.IncomingMessage): Promise<unknown> {
  const bytes = await readBody(req);
  const text = Buffer.from(bytes).toString('utf8');
  if (!text.trim()) return {};
  return JSON.parse(text);
}

async function persistCanvaEnv(envPath: string, values: Record<string, string>): Promise<void> {
  let current = '';
  try {
    current = await readFile(envPath, 'utf8');
  } catch (err) {
    if (!(err instanceof Error) || !('code' in err) || err.code !== 'ENOENT') throw err;
  }

  const lines = current ? current.split(/\r?\n/) : [];
  const remaining = lines.filter(
    (line) => !/^CANVA_(CLIENT_ID|CLIENT_SECRET|REDIRECT_URI)=/.test(line),
  );
  const next = [
    ...remaining.filter((line, index) => line || index < remaining.length - 1),
    `CANVA_CLIENT_ID=${quoteEnv(values.CANVA_CLIENT_ID)}`,
    `CANVA_CLIENT_SECRET=${quoteEnv(values.CANVA_CLIENT_SECRET)}`,
    `CANVA_REDIRECT_URI=${quoteEnv(values.CANVA_REDIRECT_URI)}`,
  ].join('\n');
  await writeFile(envPath, `${next}\n`, 'utf8');
}

function quoteEnv(value: string): string {
  return JSON.stringify(value);
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function html(
  res: ServerResponse,
  status: number,
  message: string,
  opts: { autoClose?: boolean } = {},
) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(
    `<!doctype html><html><body><p>${escapeHtml(message)}</p>${opts.autoClose ? '<script>window.opener?.postMessage({type:"master-of-slide:canva-connected"},"*");setTimeout(()=>window.close(),800);</script>' : ''}</body></html>`,
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setOAuthCookie(res: ServerResponse, auth: StoredAuth): void {
  const value = Buffer.from(JSON.stringify(auth), 'utf8').toString('base64url');
  res.setHeader(
    'set-cookie',
    `${OAUTH_COOKIE}=${value}; Max-Age=600; Path=/api/canva/callback; HttpOnly; SameSite=Lax`,
  );
}

function clearOAuthCookie(res: ServerResponse): void {
  res.setHeader(
    'set-cookie',
    `${OAUTH_COOKIE}=; Max-Age=0; Path=/api/canva/callback; HttpOnly; SameSite=Lax`,
  );
}

function authFromCookie(req: Connect.IncomingMessage, state: string): PendingAuth | null {
  const raw = parseCookies(req)[OAUTH_COOKIE];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as StoredAuth;
    if (parsed.state !== state || parsed.expiresAt <= Date.now()) return null;
    if (!parsed.codeVerifier || !parsed.redirectUri) return null;
    return { codeVerifier: parsed.codeVerifier, redirectUri: parsed.redirectUri };
  } catch {
    return null;
  }
}

function parseCookies(req: Connect.IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').flatMap((part) => {
      const index = part.indexOf('=');
      if (index === -1) return [];
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      return key ? [[key, value]] : [];
    }),
  );
}

async function persistOAuthState(filePath: string, auth: StoredAuth): Promise<void> {
  const states = await readOAuthStates(filePath);
  states[auth.state] = auth;
  pruneOAuthStates(states);
  await writeFile(filePath, `${JSON.stringify(states, null, 2)}\n`, 'utf8');
}

async function authFromFile(filePath: string, state: string): Promise<PendingAuth | null> {
  const states = await readOAuthStates(filePath);
  pruneOAuthStates(states);
  const auth = states[state];
  if (!auth || auth.expiresAt <= Date.now()) return null;
  if (!auth.codeVerifier || !auth.redirectUri) return null;
  return { codeVerifier: auth.codeVerifier, redirectUri: auth.redirectUri };
}

async function clearOAuthState(filePath: string, state: string): Promise<void> {
  const states = await readOAuthStates(filePath);
  delete states[state];
  pruneOAuthStates(states);
  await writeFile(filePath, `${JSON.stringify(states, null, 2)}\n`, 'utf8');
}

async function readOAuthStates(filePath: string): Promise<Record<string, StoredAuth>> {
  try {
    const text = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(text) as Record<string, StoredAuth>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') return {};
    throw err;
  }
}

function pruneOAuthStates(states: Record<string, StoredAuth>): void {
  const now = Date.now();
  for (const [state, auth] of Object.entries(states)) {
    if (!auth || auth.expiresAt <= now) delete states[state];
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
