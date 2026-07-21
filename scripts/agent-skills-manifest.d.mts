/** Types for `agent-skills-manifest.mjs` — the plain-ESM index builder. */

export declare const SCHEMA_URL: string;
export declare const SKILLS_DIR: string;
export declare const INDEX_PATH: string;

export interface SkillEntry {
  name: string;
  type: 'skill-md' | 'archive';
  description: string;
  url: string;
  digest: string;
}

export interface SkillsIndex {
  $schema: string;
  skills: SkillEntry[];
}

export declare function buildSkillsIndex(rootDir: string): SkillsIndex;
