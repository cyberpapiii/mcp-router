// Input parameter definition for MCP servers
export interface MCPInputParam {
  type?: "string" | "number" | "boolean" | "directory" | "file";
  title?: string;
  description?: string;
  sensitive?: boolean;
  required?: boolean;
  default?: string | number | boolean;
  min?: number;
  max?: number;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  env: Record<string, string>;
  autoStart?: boolean;
  disabled?: boolean;
  description?: string;
  serverType: "local" | "remote" | "remote-streamable";
  command?: string;
  args?: string[];
  remoteUrl?: string;
  bearerToken?: string;
  // Project grouping
  projectId?: string | null;

  setupInstructions?: string;
  inputParams?: Record<string, MCPInputParam>;
  verificationStatus?: "verified" | "unverified";
  required?: string[];

  latestVersion?: string;
  version?: string;

  toolPermissions?: MCPServerToolPermissions;
}

export interface MCPTool {
  name: string;
  description?: string;
  enabled?: boolean;
  inputSchema?: any;
  /** Output schema for structured tool results (MCP 2025-06-18) */
  outputSchema?: any;
  /** Behavioral hints for clients (MCP 2025-06-18) */
  annotations?: MCPToolAnnotations;
}

/**
 * Tool annotations for behavioral hints (MCP 2025-06-18 spec)
 * These are HINTS only - never rely on them for security decisions
 */
export interface MCPToolAnnotations {
  /** Human-readable title for UI display */
  title?: string;
  /** Tool does not modify environment (default: false) */
  readOnlyHint?: boolean;
  /** Tool may perform destructive updates (default: true when readOnlyHint=false) */
  destructiveHint?: boolean;
  /** Repeated calls with same args have no additional effect (default: false) */
  idempotentHint?: boolean;
  /** Tool interacts with external entities (default: true) */
  openWorldHint?: boolean;
}

export interface MCPServerToolPermissions {
  [toolName: string]: boolean;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface MCPServer extends MCPServerConfig {
  id: string;
  status: "running" | "starting" | "stopping" | "stopped" | "error";
  errorMessage?: string; // Error message when status is "error"
  logs?: string[];
  // Properties for the MCP Test Page
  tools?: MCPTool[];
  resources?: MCPResource[];
  prompts?: MCPPrompt[];
}

export interface APIMCPServer {
  id: string;
  tags: string[];
  displayId: string;
  description: string;
  userId: string;
  iconUrl: string;
  createdAt: number;
  githubUrl: string;
  name: string;
  latestVersion: string;
  updatedAt: number;
  version: string;
}

export interface LocalMCPServer {
  id: string;
  displayId?: string;
  githubUrl: string | null;
  name: string;
  description: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  command?: string;
  args?: string[];
  envs?: Record<string, string>;
  iconUrl?: string;
  tags?: string[];
  verificationStatus?: "verified" | "unverified";
  inputParams?: Record<string, MCPInputParam>;
  latestVersion?: string;
  version?: string;
  required?: string[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
