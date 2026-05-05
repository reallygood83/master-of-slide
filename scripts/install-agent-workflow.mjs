#!/usr/bin/env node
import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = process.env.HOME;

if (!home) {
  throw new Error('HOME is not set; cannot install global agent workflow.');
}

const skills = [
  'slide',
  'slide-authoring',
  'create-slide-from-markdown',
  'create-slide-image-prompts',
];

async function copyDir(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`Missing source: ${path.relative(root, src)}`);
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await cp(src, dest, { recursive: true, force: true });
}

const installLocations = [
  path.join(home, '.codex', 'skills'),
  path.join(home, '.claude', 'skills'),
];

for (const skill of skills) {
  const src = path.join(root, '.agents', 'skills', skill);
  for (const base of installLocations) {
    await copyDir(src, path.join(base, skill));
  }
}

const commandSrc = path.join(root, '.claude', 'commands', 'slide.md');
const commandDest = path.join(home, '.claude', 'commands', 'slide.md');
await mkdir(path.dirname(commandDest), { recursive: true });
await cp(commandSrc, commandDest, { force: true });

console.log('Installed Master Of Slide agent workflow:');
for (const skill of skills) {
  for (const base of installLocations) {
    const rel = path.relative(home, path.join(base, skill));
    console.log(`- ~/${rel}/`);
  }
}
console.log('- ~/.claude/commands/slide.md');
console.log('');
console.log('Bundled themes (9 total) ship inside the slide skill:');
console.log('- themes/{editorial-noir,paper-press,neon-terminal}.md');
console.log('- theme-references/{neo-brutalism,research-brief,vercel-minimal,raycast-dark-product,photo-editorial-tech}.md');
console.log('');
console.log('Restart Codex or Claude Code before using the new workflow.');
