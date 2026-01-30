import MiniSearch from "minisearch";
import type {
  ToolInfo,
  SearchResult,
  DetailLevel,
  SearchProvider,
  SearchProviderRequest,
} from "@mcp_router/shared";
import { expandQueryWithSynonyms } from "@mcp_router/shared";

/**
 * CLI-aware tokenizer that preserves short commands like 'ls', 'rm', 'ps'.
 */
function cliTokenizer(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s_\-./,;:!?()[\]{}'"]+/)
    .filter((token) => token.length > 0); // Don't filter short tokens!
}

/**
 * Extract searchable text from a tool's input schema.
 */
function extractSchemaText(tool: ToolInfo): string {
  const props = tool.inputSchema?.properties;
  if (!props) return "";

  const parts: string[] = [];
  for (const [name, prop] of Object.entries(props)) {
    parts.push(name);
    if (prop.description) {
      parts.push(prop.description);
    }
  }
  return parts.join(" ");
}

/**
 * MiniSearch-based search provider with fuzzy matching and synonym expansion.
 */
export class MiniSearchProvider implements SearchProvider {
  private index: MiniSearch<ToolInfo> | null = null;
  private indexedToolsHash: string = "";
  private customSynonyms?: Record<string, string[]>;

  constructor(options?: { customSynonyms?: Record<string, string[]> }) {
    this.customSynonyms = options?.customSynonyms;
  }

  /**
   * Build or rebuild the search index from tools.
   */
  private buildIndex(tools: ToolInfo[]): MiniSearch<ToolInfo> {
    const index = new MiniSearch<ToolInfo>({
      fields: ["toolName", "serverName", "description", "schemaText"],
      storeFields: [
        "toolKey",
        "serverId",
        "toolName",
        "serverName",
        "projectId",
        "description",
        "inputSchema",
        "outputSchema",
        "annotations",
      ],
      tokenize: cliTokenizer,
      searchOptions: {
        boost: {
          toolName: 3,
          serverName: 2,
          description: 1.5,
          schemaText: 0.5,
        },
        fuzzy: 0.2, // Allow ~20% character difference for typo tolerance
        prefix: true, // Match prefixes
        combineWith: "OR", // More inclusive results
      },
      // Custom extraction for schema text
      extractField: (document, fieldName) => {
        if (fieldName === "schemaText") {
          return extractSchemaText(document);
        }
        return (document as any)[fieldName];
      },
    });

    // Add documents with unique IDs
    const docsWithIds = tools.map((tool, idx) => ({
      ...tool,
      id: idx,
      schemaText: extractSchemaText(tool),
    }));

    index.addAll(docsWithIds);
    return index;
  }

  /**
   * Search for tools matching the query.
   */
  public async search(request: SearchProviderRequest): Promise<SearchResult[]> {
    const { query, tools, maxResults = 20, detailLevel = "summary" } = request;

    // Rebuild index if tools changed (use content-based hash for proper cache invalidation)
    const toolsHash = tools
      .map((t) => t.toolKey)
      .sort()
      .join(",");
    if (this.indexedToolsHash !== toolsHash || !this.index) {
      this.index = this.buildIndex(tools);
      this.indexedToolsHash = toolsHash;
    }

    // Expand query with synonyms
    const queryString = query.join(" ");
    const expandedQuery = expandQueryWithSynonyms(
      queryString,
      this.customSynonyms,
    );

    // Search
    const searchResults = this.index.search(expandedQuery);

    if (searchResults.length === 0) {
      return [];
    }

    // Limit results
    const limitedResults = searchResults.slice(0, maxResults);

    // Normalize scores to 0-1 range
    const maxScore = limitedResults[0].score;

    return limitedResults.map((result) => {
      const tool =
        tools.find((t) => t.toolKey === result.toolKey) ||
        (result as unknown as ToolInfo);
      return this.formatResult(tool, result.score / maxScore, detailLevel);
    });
  }

  /**
   * Format a search result based on detail level.
   */
  private formatResult(
    tool: ToolInfo,
    relevance: number,
    detailLevel: DetailLevel,
  ): SearchResult {
    // Minimal: just identification
    const minimal: SearchResult = {
      toolKey: tool.toolKey,
      toolName: tool.toolName,
      serverName: tool.serverName,
      serverId: tool.serverId,
      projectId: tool.projectId,
    };

    if (detailLevel === "minimal") {
      return minimal;
    }

    // Summary: add truncated description and relevance
    const summary: SearchResult = {
      ...minimal,
      description: tool.description?.substring(0, 150),
      relevance,
    };

    if (detailLevel === "summary") {
      return summary;
    }

    // Full: everything
    return {
      ...summary,
      description: tool.description, // Full description
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations: tool.annotations,
    };
  }
}
