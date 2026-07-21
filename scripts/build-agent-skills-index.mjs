/**
 * Regenerates public/.well-known/agent-skills/index.json from the SKILL.md
 * files on disk. Run after adding or editing a skill:
 *
 *   pnpm skills:index
 *
 * The accompanying test fails if the committed index stops matching, so a
 * forgotten run is caught before stale digests reach agents.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSkillsIndex, INDEX_PATH } from './agent-skills-manifest.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = buildSkillsIndex(rootDir);

writeFileSync(path.join(rootDir, INDEX_PATH), `${JSON.stringify(index, null, 2)}\n`, 'utf8');

console.log(`Wrote ${INDEX_PATH} — ${index.skills.length} skill(s):`);
for (const s of index.skills) console.log(`  ${s.name.padEnd(16)} ${s.digest}`);
