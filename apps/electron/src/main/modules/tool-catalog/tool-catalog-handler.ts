import { randomUUID } from "node:crypto";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  AGGREGATOR_SERVER_NAME,
  MCPServer,
  MCPTool,
  UNASSIGNED_PROJECT_ID,
} from "@mcp_router/shared";
import type { DetailLevel, ExpirationMetadata } from "@mcp_router/shared";
import { TokenValidator } from "@/main/modules/mcp-server-runtime/token-validator";
import { RequestHandlerBase } from "@/main/modules/mcp-server-runtime/request-handler-base";
import { getProjectService } from "@/main/modules/projects/projects.service";
import { ToolCatalogService } from "./tool-catalog.service";
import { transformResourceLinksInResult } from "@/main/utils/uri-utils";
import { ReconnectingMCPClient } from "@/main/modules/mcp-server-manager/reconnecting-mcp-client";

interface ToolKeyEntry {
  serverId: string;
  toolName: string;
  createdAt: number;
}

// Configurable TTL (can be overridden via config in future)
const TOOL_KEY_TTL_MINUTES = 60;
const TOOL_KEY_TTL_MS = TOOL_KEY_TTL_MINUTES * 60 * 1000;

export const META_TOOLS: MCPTool[] = [
  {
    name: "tool_discovery",
    description: `REQUIRED FIRST STEP: Search for available tools before execution.

You have access to 200+ tools across multiple servers, but they are NOT listed directly to save context space.

WORKFLOW (you MUST follow this):
1. Call tool_discovery with keywords describing what you need
2. Review the returned tools and their toolKeys
3. Use tool_execute with the exact toolKey to run a tool

AVAILABLE SERVERS: Slack, GitHub, Notion, Google Workspace, filesystem, git, and more.

EXAMPLE QUERIES:
- ["send", "slack", "message"] → Slack messaging tools
- ["github", "pull", "request"] → GitHub PR tools
- ["read", "file"] → File reading tools
- ["calendar", "events"] → Calendar tools

PARAMETERS:
- query (required): Keywords array describing functionality needed
- detailLevel (optional): "minimal" | "summary" | "full" (default: summary)
- maxResults (optional): Max results to return (default: 10, max: 100)
- category (optional): Filter by category from tool_capabilities
- context (optional): Your current task context to improve relevance

ERROR RECOVERY:
- If toolKey expires, call tool_discovery again with the same query
- Use tool_capabilities first if unsure what categories exist`,
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "array",
          items: { type: "string" },
          description: "Keywords describing the functionality you need.",
        },
        detailLevel: {
          type: "string",
          enum: ["minimal", "summary", "full"],
          description:
            "Response detail level. minimal=~5 tokens/tool, summary=~20, full=~100+",
        },
        maxResults: {
          type: "number",
          description: "Maximum results (default: 10, max: 100).",
        },
        category: {
          type: "string",
          description:
            "Filter by category (use tool_capabilities to see categories).",
        },
        context: {
          type: "string",
          description: "Your current task context to improve relevance.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "tool_execute",
    description: `Execute a discovered tool using its toolKey.

PREREQUISITE: You must first call tool_discovery to obtain a valid toolKey.

PARAMETERS:
- toolKey (required): Exact key from tool_discovery results (UUID format)
- arguments (required): Tool-specific parameters as JSON object

ERROR RECOVERY:
- "toolKey has expired" → Call tool_discovery again with same query, use new toolKey
- "toolKey not found" → Verify toolKey matches exactly from discovery results
- "permission denied" → Tool requires elevated access, check tool_capabilities

IMPORTANT: toolKeys expire after 60 minutes. If you cached a toolKey and get an expiration error, simply re-run tool_discovery.`,
    inputSchema: {
      type: "object",
      properties: {
        toolKey: {
          type: "string",
          description: "Tool identifier (UUID) from tool_discovery results.",
        },
        arguments: {
          type: "object",
          description: "Arguments to pass to the tool.",
        },
      },
      required: ["toolKey"],
    },
  },
  {
    name: "tool_capabilities",
    description: `Browse available tool categories and servers WITHOUT consuming context.

Use this for high-level exploration BEFORE detailed search:
- "What kinds of tools are available?"
- "What can the GitHub server do?"
- "Show me messaging capabilities"

Returns categories with tool counts and example operations.
Does NOT return executable toolKeys—use tool_discovery for that.

WORKFLOW:
1. Call tool_capabilities to see what's available
2. Call tool_discovery with specific category or keywords
3. Call tool_execute with discovered toolKey`,
    inputSchema: {
      type: "object",
      properties: {
        server: {
          type: "string",
          description: "Filter to a specific server (e.g., 'github', 'slack').",
        },
        category: {
          type: "string",
          description: "Filter to a specific category.",
        },
      },
      required: [],
    },
  },
];

type ToolCatalogHandlerDeps = {
  servers: Map<string, MCPServer>;
  clients: Map<string, ReconnectingMCPClient>;
  serverStatusMap: Map<string, boolean>;
  toolCatalogService: ToolCatalogService;
};

/**
 * Handles tool_discovery and tool_execute meta-tools.
 */
export class ToolCatalogHandler extends RequestHandlerBase {
  private servers: Map<string, MCPServer>;
  private clients: Map<string, ReconnectingMCPClient>;
  private serverStatusMap: Map<string, boolean>;
  private toolCatalogService: ToolCatalogService;
  private toolKeyMap: Map<string, ToolKeyEntry> = new Map();

  constructor(tokenValidator: TokenValidator, deps: ToolCatalogHandlerDeps) {
    super(tokenValidator);
    this.servers = deps.servers;
    this.clients = deps.clients;
    this.serverStatusMap = deps.serverStatusMap;
    this.toolCatalogService = deps.toolCatalogService;
  }

  private normalizeProjectId(projectId: unknown): string | null {
    if (
      projectId === undefined ||
      projectId === null ||
      projectId === "" ||
      projectId === UNASSIGNED_PROJECT_ID
    ) {
      return null;
    }
    if (typeof projectId === "string") {
      return projectId;
    }
    return null;
  }

  private requireValidToken(token?: string): {
    token: string;
    clientId: string;
  } {
    if (!token || typeof token !== "string") {
      throw new McpError(ErrorCode.InvalidRequest, "Token is required");
    }

    const validation = this.tokenValidator.validateToken(token);
    if (!validation.isValid) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        validation.error || "Invalid token",
      );
    }

    return { token, clientId: validation.clientId || "unknownClient" };
  }

  private parseToolKey(toolKey: string): {
    serverId: string;
    toolName: string;
  } {
    // First, try to resolve from the temporary toolKey map
    const entry = this.toolKeyMap.get(toolKey);
    if (entry) {
      // Check TTL
      if (Date.now() - entry.createdAt > TOOL_KEY_TTL_MS) {
        this.toolKeyMap.delete(toolKey);
        throw new McpError(
          ErrorCode.InvalidRequest,
          `toolKey has expired: ${toolKey}`,
        );
      }
      return {
        serverId: entry.serverId,
        toolName: entry.toolName,
      };
    }

    // Fallback: parse as legacy format (serverId:toolName)
    const separatorIndex = toolKey.indexOf(":");
    if (separatorIndex <= 0 || separatorIndex >= toolKey.length - 1) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid toolKey format: ${toolKey}`,
      );
    }

    return {
      serverId: toolKey.slice(0, separatorIndex),
      toolName: toolKey.slice(separatorIndex + 1),
    };
  }

  private buildToolKey(serverId: string, toolName: string): string {
    // Cleanup expired entries periodically
    this.cleanupExpiredToolKeys();

    // Generate a temporary UUID-based toolKey
    const toolKey = randomUUID();
    this.toolKeyMap.set(toolKey, {
      serverId,
      toolName,
      createdAt: Date.now(),
    });
    return toolKey;
  }

  private cleanupExpiredToolKeys(): void {
    const now = Date.now();
    for (const [key, entry] of this.toolKeyMap) {
      if (now - entry.createdAt > TOOL_KEY_TTL_MS) {
        this.toolKeyMap.delete(key);
      }
    }
  }

  private buildExpirationMetadata(): ExpirationMetadata {
    const now = Date.now();
    const expiresAt = new Date(now + TOOL_KEY_TTL_MS);
    return {
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: TOOL_KEY_TTL_MINUTES * 60,
      ttlMinutes: TOOL_KEY_TTL_MINUTES,
    };
  }

  private getProjectOptimization(projectId: string | null) {
    if (!projectId) {
      return undefined;
    }
    return getProjectService().getOptimization(projectId);
  }

  /**
   * Handle tool_discovery request.
   */
  public async handleToolDiscovery(request: any): Promise<any> {
    const token = request.params._meta?.token as string | undefined;
    const projectId = this.normalizeProjectId(request.params._meta?.projectId);
    const { clientId, token: validatedToken } = this.requireValidToken(token);

    const args = request.params.arguments || {};
    const rawQuery = args.query;
    const query = Array.isArray(rawQuery)
      ? rawQuery.filter((q): q is string => typeof q === "string")
      : [];
    if (query.length === 0) {
      throw new McpError(ErrorCode.InvalidRequest, "Query is required");
    }

    const context = typeof args.context === "string" ? args.context : undefined;
    const maxResults =
      typeof args.maxResults === "number" ? args.maxResults : 10;
    const detailLevel: DetailLevel =
      args.detailLevel === "minimal" || args.detailLevel === "full"
        ? args.detailLevel
        : "summary";
    const category =
      typeof args.category === "string" ? args.category : undefined;

    const optimization = this.getProjectOptimization(projectId);

    return await this.executeWithHooksAndLogging(
      "tools/discovery",
      { query, context, maxResults, detailLevel, category },
      clientId,
      AGGREGATOR_SERVER_NAME,
      "ToolDiscovery",
      async () => {
        const allowedServerIds = new Set<string>();
        for (const serverId of this.servers.keys()) {
          if (this.tokenValidator.hasServerAccess(validatedToken, serverId)) {
            allowedServerIds.add(serverId);
          }
        }

        const response = await this.toolCatalogService.searchTools(
          { query, context, maxResults, detailLevel, category },
          {
            projectId,
            allowedServerIds,
            toolCatalogEnabled: !!optimization,
          },
        );

        // Format results based on detail level
        const results = response.results.map((result) => {
          const toolKey = this.buildToolKey(result.serverId, result.toolName);

          // Minimal: just identification
          const minimal = {
            toolKey,
            toolName: result.toolName,
            serverName: result.serverName,
          };

          if (detailLevel === "minimal") {
            return minimal;
          }

          // Summary: add description and relevance
          const summary = {
            ...minimal,
            description: result.description?.substring(0, 150),
            relevance: result.relevance,
          };

          if (detailLevel === "summary") {
            return summary;
          }

          // Full: everything
          return {
            ...summary,
            description: result.description,
            serverId: result.serverId,
            explanation: result.explanation,
            outputSchema: result.outputSchema,
            annotations: result.annotations,
          };
        });

        // Build response with metadata
        const expiration = this.buildExpirationMetadata();
        const responsePayload = {
          tools: results,
          metadata: {
            query,
            detailLevel,
            resultCount: results.length,
            expiration,
          },
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(responsePayload, null, 2),
            },
          ],
        };
      },
    );
  }

  /**
   * Handle tool_execute request.
   */
  public async handleToolExecute(request: any): Promise<any> {
    const token = request.params._meta?.token as string | undefined;
    const projectId = this.normalizeProjectId(request.params._meta?.projectId);
    const { clientId, token: validatedToken } = this.requireValidToken(token);

    const args = request.params.arguments || {};
    const toolKey = typeof args.toolKey === "string" ? args.toolKey.trim() : "";
    if (!toolKey) {
      throw new McpError(ErrorCode.InvalidRequest, "toolKey is required");
    }

    const { serverId, toolName } = this.parseToolKey(toolKey);
    const server = this.servers.get(serverId);
    if (!server) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown server: ${serverId}`,
      );
    }

    const serverName = server.name || serverId;

    if (!this.tokenValidator.hasServerAccess(validatedToken, serverId)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Token does not have access to this server",
      );
    }

    if (!this.toolCatalogService.matchesProject(server, projectId)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "Tool not available for the selected project",
      );
    }

    if (server.toolPermissions && server.toolPermissions[toolName] === false) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Tool "${toolName}" is disabled for this server`,
      );
    }

    const client = this.clients.get(serverId);
    if (!client) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Server ${serverName} is not connected`,
      );
    }

    if (!this.serverStatusMap.get(serverName)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Server ${serverName} is not running`,
      );
    }

    const toolArguments = args.arguments ?? {};

    return await this.executeWithHooksAndLogging(
      "tools/call",
      { toolKey, toolName, arguments: toolArguments },
      clientId,
      serverName,
      "ToolExecute",
      async () => {
        const result = await client.getClient().callTool(
          {
            name: toolName,
            arguments: toolArguments,
          },
          undefined,
          {
            timeout: 60 * 60 * 1000, // 60 minutes
            resetTimeoutOnProgress: true,
          },
        );
        // Transform resource links to use router's namespace
        return transformResourceLinksInResult(result, serverName);
      },
      { serverId },
    );
  }
}
