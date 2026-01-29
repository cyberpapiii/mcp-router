/**
 * Tool naming utilities for MCP Router
 *
 * These utilities handle prefixing tool names with their source server name
 * to avoid naming conflicts when aggregating tools from multiple MCP servers.
 */

/**
 * Delimiter used to separate server name from tool name in prefixed tool names.
 * Example: "krisp__search_meetings" where "krisp" is the server and "search_meetings" is the tool.
 */
export const TOOL_DELIMITER = "__";

/**
 * Creates a prefixed tool name by combining the server name and tool name.
 *
 * @param serverName - The name of the MCP server providing the tool
 * @param toolName - The original tool name from the server
 * @returns The prefixed tool name in format: `${serverName}${TOOL_DELIMITER}${toolName}`
 *
 * @example
 * prefixToolName("krisp", "search_meetings") // Returns "krisp__search_meetings"
 * prefixToolName("slack", "send_message") // Returns "slack__send_message"
 */
export function prefixToolName(serverName: string, toolName: string): string {
  return `${serverName}${TOOL_DELIMITER}${toolName}`;
}

/**
 * Extracts the original tool name from a prefixed tool name.
 *
 * Uses the first occurrence of the delimiter to split, which correctly handles
 * cases where the original tool name itself contains the delimiter sequence.
 *
 * @param prefixedName - The prefixed tool name (e.g., "krisp__search_meetings")
 * @returns The original tool name without the server prefix
 *
 * @example
 * stripServerPrefix("krisp__search_meetings") // Returns "search_meetings"
 * stripServerPrefix("server__tool__with__underscores") // Returns "tool__with__underscores"
 * stripServerPrefix("no_prefix_here") // Returns "no_prefix_here" (no delimiter found)
 */
export function stripServerPrefix(prefixedName: string): string {
  const delimiterIndex = prefixedName.indexOf(TOOL_DELIMITER);
  if (delimiterIndex === -1) {
    return prefixedName;
  }
  return prefixedName.substring(delimiterIndex + TOOL_DELIMITER.length);
}
