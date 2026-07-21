/**
 * Builds the Agent Skills discovery index (Agent Skills Discovery RFC v0.2.0)
 * from the SKILL.md files published under `public/.well-known/agent-skills/`.
 *
 * Each entry carries a SHA-256 digest of its artifact, so the index is derived
 * from the files on disk rather than hand-written — a digest can never drift
 * from the bytes we actually serve. `build-agent-skills-index.mjs` writes it;
 * `src/lib/api/agent-skills.test.ts` fails if the committed file goes stale.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const SCHEMA_URL = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

/** Repo-relative home of the published skills. */
export const SKILLS_DIR = path.join('public', '.well-known', 'agent-skills');
export const INDEX_PATH = path.join(SKILLS_DIR, 'index.json');

/** Reads `name` / `description` out of the SKILL.md YAML frontmatter. */
function readFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.+?)\s*$/.exec(line);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

/** Digest is over the raw artifact bytes, so hash the buffer as read. */
const digestOf = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

export function buildSkillsIndex(rootDir) {
  const skillsRoot = path.join(rootDir, SKILLS_DIR);

  const skills = readdirSync(skillsRoot)
    .filter((entry) => statSync(path.join(skillsRoot, entry)).isDirectory())
    .sort()
    .map((dir) => {
      const bytes = readFileSync(path.join(skillsRoot, dir, 'SKILL.md'));
      const { name, description } = readFrontmatter(bytes.toString('utf8'));

      if (!description) {
        throw new Error(`${dir}/SKILL.md is missing a "description" in its frontmatter.`);
      }
      // The directory name forms the discovery URL, so a mismatch would publish
      // an entry pointing at a differently-named skill.
      if (name && name !== dir) {
        throw new Error(`${dir}/SKILL.md declares name "${name}" but lives in "${dir}".`);
      }

      return {
        name: dir,
        type: 'skill-md',
        description,
        url: `/.well-known/agent-skills/${dir}/SKILL.md`,
        digest: digestOf(bytes),
      };
    });

  return { $schema: SCHEMA_URL, skills };
}
