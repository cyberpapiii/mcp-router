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
