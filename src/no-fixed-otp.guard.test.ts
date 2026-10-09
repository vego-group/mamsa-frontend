// @vitest-environment node
/**
 * Guard: the repo holds no OTP value.
 *
 * The mock accepts any six digits, so it needs no code of its own — and a code
 * written down anywhere (a default, an env template, a README line, a comment
 * saying which real environment it matches) is exactly what must not live in
 * this repository. Old commits still hold one; that closes when the repo goes
 * private, not by rewriting history.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (!TEST_FILE.test(path)) yield path;
  }
}

/** `file:line` for every line of `paths` that matches `pattern`. */
function hits(paths: Iterable<string>, pattern: RegExp): string[] {
  const found: string[] = [];
  for (const path of paths) {
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (pattern.test(line)) found.push(`${relative(ROOT, path)}:${i + 1}`);
      });
  }
  return found;
}

const DOCS = ['README.md', '.env.example'].map((f) => join(ROOT, f)).filter(existsSync);
const MOCK_CODE = ['src/lib/api/mock', 'src/data/mock'].flatMap((d) => [...files(join(ROOT, d))]);
const APP = ['src', 'messages'].flatMap((d) => [...files(join(ROOT, d))]);

describe('no OTP value in the repo', () => {
  it('the mock code holds no six-digit literal', () => {
    expect(hits(MOCK_CODE, /(['"`])\d{6}\1/)).toEqual([]);
  });

  it('the README and the env template name no code', () => {
    expect(hits(DOCS, /(^|\D)\d{6}(\D|$)/)).toEqual([]);
  });

  it('nothing configures or describes a fixed mock code', () => {
    expect(hits([...APP, ...DOCS], /MOCK_OTP|OTP_FIXED_CODE|MOCK_EMAIL_OTP/)).toEqual([]);
  });
});
