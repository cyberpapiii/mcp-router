// apps/electron/src/main/modules/marketplace/marketplace.service.ts
import type {
  RegistryResponse,
  RegistryServer,
  MarketplaceSearchOptions,
} from "./marketplace.types";

const REGISTRY_BASE = "https://registry.modelcontextprotocol.io";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: RegistryResponse;
  timestamp: number;
}

export class MarketplaceService {
  private cache: Map<string, CacheEntry> = new Map();

  async searchServers(
    options: MarketplaceSearchOptions = {},
  ): Promise<RegistryResponse> {
    const cacheKey = JSON.stringify(options);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const params = new URLSearchParams();
    if (options.search) params.set("search", options.search);
    if (options.limit) params.set("limit", String(options.limit));
    if (options.cursor) params.set("cursor", options.cursor);
    params.set("version", "latest");

    const response = await fetch(`${REGISTRY_BASE}/v0.1/servers?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Registry API error: ${response.status}`);
    }

    const data = (await response.json()) as RegistryResponse;
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getServerDetails(serverName: string): Promise<RegistryServer | null> {
    const response = await fetch(
      `${REGISTRY_BASE}/v0.1/servers/${encodeURIComponent(serverName)}/versions/latest`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Registry API error: ${response.status}`);
    }

    return response.json();
  }

  async fetchReadme(repoUrl: string): Promise<string | null> {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const branches = ["main", "master"];

    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      try {
        const response = await fetch(url);
        if (response.ok) return response.text();
      } catch {
        continue;
      }
    }
    return null;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton
let instance: MarketplaceService | null = null;

export function getMarketplaceService(): MarketplaceService {
  if (!instance) {
    instance = new MarketplaceService();
  }
  return instance;
}
