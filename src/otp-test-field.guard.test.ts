// @vitest-environment node
/**
 * Guard: the test-only OTP field never enters the application.
 *
 * Staging (never production) can return the OTP itself in its response, for
 * numbers in its synthetic block. That is for test tooling only: the app must
 * not autofill it, show it or log it. The client already keeps nothing but
 * "sent" from a dispatch; this makes sure no file of the application can so
 * much as name the field, so nobody wires it back in by accident. Test files
 * are exempt — they are where that response shape is simulated.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const SCANNED = ['src', 'messages'];
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;
// debug_otp, debugOtp, DebugOtp, DEBUG_OTP, debug-otp …
const FIELD = /debug[_-]?otp/i;

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else yield path;
  }
}

describe('the test-only OTP field', () => {
  it('is named nowhere in the application', () => {
    const hits: string[] = [];
    for (const top of SCANNED) {
      for (const path of files(join(ROOT, top))) {
        if (TEST_FILE.test(path)) continue;
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (FIELD.test(line)) hits.push(`${relative(ROOT, path)}:${i + 1}`);
          });
      }
    }
    expect(hits).toEqual([]);
  });
});
