import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateSlidesModule } from './open-slide-plugin.ts';

describe('generateSlidesModule', () => {
  it('includes known slide ids in not-found errors', async () => {
    const slidesRoot = path.resolve('/workspace/slides');
    const mod = generateSlidesModule(
      [path.join(slidesRoot, 'existing-slide', 'index.tsx')],
      slidesRoot,
      false,
    );

    expect(mod).toContain('export const slideIds = ["existing-slide"]');
    expect(mod).toContain('Known slides: ');
    expect(mod).toContain('Expected file: /workspace/slides/');
    expect(mod).toContain('restart open-slide dev');
  });
});
