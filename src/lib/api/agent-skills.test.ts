import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildSkillsIndex, INDEX_PATH, SCHEMA_URL } from '../../../scripts/agent-skills-manifest.mjs';

const rootDir = path.resolve(__dirname, '../../..');
const committed = JSON.parse(readFileSync(path.join(rootDir, INDEX_PATH), 'utf8'));
const rebuilt = buildSkillsIndex(rootDir);

describe('agent-skills index', () => {
  // The whole point of the digest is that an agent can verify the artifact it
  // fetched. A stale index is worse than none: it fails that verification.
  it('matches the SKILL.md files on disk — run `pnpm skills:index` if this fails', () => {
    expect(committed).toEqual(rebuilt);
  });

  it('declares the RFC v0.2.0 schema', () => {
    expect(committed.$schema).toBe(SCHEMA_URL);
  });

  it('publishes at least one skill', () => {
    expect(committed.skills.length).toBeGreaterThan(0);
  });

  it.each(['name', 'type', 'description', 'url', 'digest'])('gives every entry a %s', (field) => {
    for (const skill of committed.skills) expect(skill[field]).toBeTruthy();
  });

  it('uses well-formed names, types, urls and digests', () => {
    for (const skill of committed.skills) {
      // RFC: 1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing
      // or consecutive hyphens.
      expect(skill.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(skill.name.length).toBeLessThanOrEqual(64);
      expect(['skill-md', 'archive']).toContain(skill.type);
      expect(skill.description.length).toBeLessThanOrEqual(1024);
      expect(skill.url).toBe(`/.well-known/agent-skills/${skill.name}/SKILL.md`);
      expect(skill.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });
});
