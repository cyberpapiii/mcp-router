/**
 * Tool information for search.
 */
export interface ToolInfo {
  toolKey: string; // `${serverId}:${toolName}`
  serverId: string;
  toolName: string;
  serverName: string;
  projectId: string | null;
  description?: string;
  inputSchema?: {
    properties?: Record<string, { description?: string }>;
  };
  /** Output schema for structured results (MCP 2025-06-18) */
  outputSchema?: any;
  /** Behavioral hints from upstream server (MCP 2025-06-18) */
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

/**
 * Detail level for tool discovery responses.
 * - minimal: toolKey, toolName, serverName only (~5 tokens/tool)
 * - summary: + truncated description (~20 tokens/tool)
 * - full: + inputSchema, outputSchema, annotations (~100+ tokens/tool)
 */
export type DetailLevel = "minimal" | "summary" | "full";

/**
 * Expiration metadata for tool discovery responses.
 */
export interface ExpirationMetadata {
  expiresAt: string; // ISO timestamp
  expiresInSeconds: number;
  ttlMinutes: number;
}

export interface SearchRequest {
  query: string[];
  context?: string;
  maxResults?: number;
  detailLevel?: DetailLevel;
  category?: string; // Filter by category
}

export interface SearchResult {
  toolKey: string; // Always included
  toolName: string; // Always included
  serverName: string; // Always included
  serverId: string;
  projectId: string | null;
  // summary+ level
  description?: string;
  relevance?: number; // 0-1 normalized score
  // full level only
  explanation?: string;
  inputSchema?: ToolInfo["inputSchema"];
  outputSchema?: any;
  annotations?: ToolInfo["annotations"];
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchResponseMetadata {
  query: string[];
  detailLevel: DetailLevel;
  resultCount: number;
  expiration: ExpirationMetadata;
}

export interface SearchResponseWithMetadata extends SearchResponse {
  metadata: SearchResponseMetadata;
}

/**
 * Category information for tool_capabilities.
 */
export interface CategoryInfo {
  name: string;
  description: string;
  toolCount: number;
  examples: string[]; // Example tool names (not keys)
}

/**
 * Server information for tool_capabilities.
 */
export interface ServerInfo {
  name: string;
  serverId: string;
  toolCount: number;
  status: "running" | "stopped" | "error";
  categories: string[];
}

/**
 * Response from tool_capabilities.
 */
export interface ToolCapabilitiesResponse {
  totalTools: number;
  categories: CategoryInfo[];
  servers: ServerInfo[];
}

/**
 * Search request parameters for search providers.
 */
export type SearchProviderRequest = {
  query: string[];
  context?: string;
  tools: ToolInfo[];
  maxResults?: number;
  detailLevel?: DetailLevel;
};

/**
 * Interface for search providers.
 */
export interface SearchProvider {
  search(request: SearchProviderRequest): Promise<SearchResult[]>;
}
