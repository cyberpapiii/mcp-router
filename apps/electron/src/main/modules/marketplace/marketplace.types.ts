// apps/electron/src/main/modules/marketplace/marketplace.types.ts

export interface RegistryServer {
  name: string;
  description: string;
  version: string;
  title?: string;
  websiteUrl?: string;
  repository?: {
    url: string;
    source: string;
  };
  icons?: Array<{
    src: string;
    mimeType?: string;
  }>;
  packages?: Array<{
    registryType: "npm" | "pypi" | "oci";
    identifier: string;
    runtimeHint?: string;
    transport: {
      type: "stdio" | "sse" | "streamable-http";
    };
  }>;
}

export interface RegistryResponse {
  servers: Array<{
    server: RegistryServer;
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: string;
        publishedAt: string;
        isLatest: boolean;
      };
    };
  }>;
  metadata: {
    nextCursor: string | null;
    count: number;
  };
}

export interface MarketplaceSearchOptions {
  search?: string;
  limit?: number;
  cursor?: string;
}

// Skills Registry Types

export type SkillsSortOption = "trending" | "popular" | "recent";

export interface SkillsSearchOptions {
  search?: string;
  limit?: number;
  cursor?: string;
  /** Sort option - API support may vary */
  sort?: SkillsSortOption;
}

export interface RegistrySkill {
  /** Unique identifier (kebab-case, e.g., "vercel-react-best-practices") */
  id: string;
  /** Display name */
  name: string;
  /** Total installation count */
  installs: number;
  /** Origin repository/source (e.g., "vercel-labs/agent-skills") */
  topSource: string;
}

export interface SkillsRegistryResponse {
  skills: RegistrySkill[];
  /** Indicates if more results are available for pagination */
  hasMore: boolean;
}
