// apps/electron/src/main/modules/marketplace/skills-registry.service.ts

/**
 * Skills Registry Service
 * Integrates with skills.sh API to fetch and search AI agent skills
 */

// Re-export types for consumers that import from this module
export type {
  SkillsSearchOptions,
  RegistrySkill,
  SkillsRegistryResponse,
} from "./marketplace.types";

import type {
  SkillsSearchOptions,
  RegistrySkill,
  SkillsRegistryResponse,
} from "./marketplace.types";

const SKILLS_REGISTRY_BASE = "https://skills.sh/api";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class SkillsRegistryService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Search skills from the skills.sh registry
   */
  async searchSkills(
    options: SkillsSearchOptions = {},
  ): Promise<SkillsRegistryResponse> {
    const cacheKey = `search:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey) as
      | CacheEntry<SkillsRegistryResponse>
      | undefined;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const params = new URLSearchParams();
    if (options.search) params.set("search", options.search);
    if (options.limit) params.set("limit", String(options.limit));
    if (options.cursor) params.set("cursor", options.cursor);
    // Note: sort parameter support depends on skills.sh API implementation
    if (options.sort) params.set("sort", options.sort);

    const url = `${SKILLS_REGISTRY_BASE}/skills${params.toString() ? `?${params}` : ""}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Skills Registry API error: ${response.status}`);
    }

    const data = (await response.json()) as SkillsRegistryResponse;
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Get details for a specific skill by ID
   * Note: skills.sh may not have a dedicated details endpoint,
   * so this searches for the skill and returns the first match
   */
  async getSkillDetails(skillId: string): Promise<RegistrySkill | null> {
    const cacheKey = `details:${skillId}`;
    const cached = this.cache.get(cacheKey) as
      | CacheEntry<RegistrySkill | null>
      | undefined;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Search for the specific skill by ID
    const response = await this.searchSkills({ search: skillId, limit: 50 });

    // Find exact match by ID
    const skill = response.skills.find((s) => s.id === skillId) ?? null;

    this.cache.set(cacheKey, { data: skill, timestamp: Date.now() });
    return skill;
  }

  /**
   * Fetch SKILL.md content from a GitHub repository
   * Tries main branch first, then master
   */
  async fetchSkillMd(repoUrl: string): Promise<string | null> {
    // Handle both full URLs and owner/repo format
    let owner: string;
    let repo: string;

    if (repoUrl.includes("github.com")) {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return null;
      [, owner, repo] = match;
    } else {
      // Assume owner/repo format (e.g., "vercel-labs/agent-skills")
      const parts = repoUrl.split("/");
      if (parts.length !== 2) return null;
      [owner, repo] = parts;
    }

    // Clean repo name (remove .git suffix if present)
    repo = repo.replace(/\.git$/, "");

    const cacheKey = `skill-content:${owner}/${repo}`;
    const cached = this.cache.get(cacheKey) as
      | CacheEntry<string | null>
      | undefined;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const branches = ["main", "master"];

    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/SKILL.md`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const content = await response.text();
          this.cache.set(cacheKey, { data: content, timestamp: Date.now() });
          return content;
        }
      } catch (error) {
        console.debug(
          `[SkillsRegistry] Failed to fetch SKILL.md from ${branch}:`,
          error,
        );
        continue;
      }
    }

    this.cache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton
let instance: SkillsRegistryService | null = null;

export function getSkillsRegistryService(): SkillsRegistryService {
  if (!instance) {
    instance = new SkillsRegistryService();
  }
  return instance;
}
