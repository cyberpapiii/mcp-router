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

export interface SearchRequest {
  query: string[];
  context?: string;
  maxResults?: number;
}

export interface SearchResult {
  toolName: string;
  serverId: string;
  serverName: string;
  projectId: string | null;
  description?: string;
  relevance: number; // 0-1 normalized score
  explanation?: string; // Optional explanation (e.g., selection reason)
  /** Output schema for structured results */
  outputSchema?: any;
  /** Behavioral hints from upstream server */
  annotations?: ToolInfo["annotations"];
}

export interface SearchResponse {
  results: SearchResult[];
}
