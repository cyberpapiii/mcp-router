# MCP Router UX Testing & Friction Analysis Report

## 1. Executive Summary
- **Overall Friction Score**: 6/10
- **Top 3 Biggest Pain Points**:
  1. **Discovery Overhead**: Every task requires a mandatory `tool_discovery` call, adding constant cognitive load and latency.
  2. **Parameter Mismatch**: Discovery often doesn't reveal the exact parameter names (e.g., `schema` vs `schema_name` in Supabase), leading to avoidable errors.
  3. **Natural Language Failure**: Vague queries like "check my inbox" fail to return relevant tools (Gmail/Slack), requiring specific technical keywords.
- **Top 3 Things That Work Well**:
  1. **Server Coverage**: All 9 expected servers are connected and running.
  2. **Cross-Server Search**: Querying "search messages" effectively aggregates tools from iMessage, Slack, Gmail, and Google Chat.
  3. **Context7 Performance**: Library documentation lookup via Context7 is reliable and provides high-quality snippets.
- **One-sentence verdict**: While the MCP router successfully aggregates a massive toolset, the "meta-tool" layer introduces significant friction through mandatory discovery steps and fragile keyword matching.

## 2. Critical Bugs Found
- **Figma Tool Discrepancy**: Only 5 tools were discoverable for Figma (`add_figma_file`, `read_comments`, `view_node`, `reply_to_comment`, `post_comment`), missing several expected tools like `get_team_projects`, `get_project_files`, etc.
- **Supabase Connectivity**: Multiple attempts to query Supabase tables or execute SQL failed with "internal_error" or "couldn't verify access".
- **Slack Search Failure**: `conversations_search_messages` consistently returned `-32603 internal_error`, preventing global Slack searching.

## 3. Quantitative Analysis

| Metric | Value |
|--------|-------|
| Total tests run | 15 |
| Total native calls (hypothetical) | 15 |
| Total router calls (actual) | 38 |
| Average overhead percentage | 153% |
| Discovery success rate (first try) | 70% |
| Parameter guessing frequency | 40% |
| Tests requiring retry | 5 |
| Tests that failed completely | 2 (Supabase, Figma full set) |
| Servers visible out of 9 | 9/9 |

## 4. Friction Breakdown by Category

| Category | Avg Native Calls | Avg Router Calls | Overhead | Notes |
|----------|------------------|------------------|----------|-------|
| Simple single-tool (Workspace) | 1 | 2.2 | 120% | Most tools require `user_google_email` which isn't always obvious. |
| Simple single-tool (iMessage) | 1 | 2 | 100% | Works well; discovery keywords are intuitive. |
| Simple single-tool (Slack) | 1 | 3 | 200% | Usually need to call `channels_list` first to get ID. |
| Simple single-tool (Notion) | 1 | 2 | 100% | Validation error on empty query string. |
| Simple single-tool (Figma) | 1 | 2.5 | 150% | Limited toolset discoverable. |
| Simple single-tool (Supabase) | 1 | 4 | 300% | High failure rate and parameter confusion. |
| Simple single-tool (Context7) | 1 | 3 | 200% | Requires mandatory `resolve-library-id` step. |
| Multi-tool cross-server | 2 | 5 | 150% | Discovery overhead compounds. |
| Discovery edge cases | N/A | 1.5 | N/A | Vague queries are the weakest point. |

## 5. Search/Discovery Analysis

**Query Terms That Work Well:**
- "search messages" (aggregates iMessage, Slack, Gmail)
- "calendar" (finds Krisp and Google Calendar)
- "notion pages" (finds Notion search and fetch)

**Query Terms That Fail or Return Unexpected Results:**
- "check my inbox" (returns Drive and Notion tools, misses Gmail)
- "list files" (misses Google Drive search in top results)
- "" (empty query in Notion search throws validation error)

**Server Name Matching:**
- Querying "imessage" finds iMessage tools: **Yes**
- Querying "slack" finds Slack tools: **Yes**
- Querying "notion" finds Notion tools: **Yes**
- Querying "gmail" finds Gmail tools: **Yes**

**Natural Language Understanding:**
- Discovery relies heavily on exact keyword matching in tool names or descriptions. Natural language intent (e.g., "what's new") is not handled well.

## 6. Parameter Discovery Analysis

**Minimal Detail Level:**
- Provides only name and server. Not enough to call tools with required IDs or emails.

**Summary Detail Level:**
- Provides name, server, and a truncated description. Often sufficient for common tools but fails for those requiring specific ID formats.

**Full Detail Level:**
- **Necessary?** Yes, for about 40% of tools to understand required fields like `user_google_email` or specific JSON structures for reminders/filters.
- **Token Cost**: High. Some tool descriptions are several paragraphs long.

## 7. Worst Experiences (Ranked)

1. **Supabase Querying**: Passing `schema` instead of `schema_name` caused a validation error, and subsequent correct calls failed with internal errors. Very discouraging.
2. **"Check my inbox" failure**: A very common user request yielded zero communication tools in the top 10 results.
3. **Slack Channel IDs**: Having to call `channels_list`, parse a long CSV, find the ID, and then call `conversations_history` is a 3-step process for a "1-step" user intent.
4. **Figma Missing Tools**: Searching for "Figma" only returned 5 tools, despite documentation promising a much richer set.
5. **Notion Empty Query**: `notion-search` failing on an empty string when the user just wants "recent updates" requires a dummy query character like 'a'.

## 8. Best Experiences (Ranked)

1. **"Search Messages"**: Successfully aggregated results from 4 different platforms in a single discovery query.
2. **Krisp `list_upcoming_meetings`**: Very intuitive, didn't require an email parameter, and returned clean, actionable data.
3. **Context7 Workflow**: Although it requires 2-3 steps, the documentation returned was extremely high fidelity and correctly formatted.

## 9. Recommendations (Ranked by Impact)

**Quick Wins:**
1. **Implicit Parameters**: Automate the injection of `user_google_email` if it has already been discovered or stored in context.
2. **Keyword Expansion**: Add common synonyms (inbox, mail, dm, text) to the discovery search index.
3. **Notion Default**: Allow empty query in `notion-search` to return recently modified pages by default.

**Medium Effort:**
1. **ID Resolver**: A tool that takes a name (e.g., "#general") and returns the ID (e.g., "C039NRB81UL") without needing a full channel list fetch.
2. **Parameter Aliasing**: Allow `schema` as an alias for `schema_name` in Supabase tools.

**Larger Changes:**
1. **Discovery Caching**: Cache discovered toolKeys for the duration of the session to skip the discovery step for repeated tasks.
2. **Intent-based Discovery**: Use a small LLM or embedding-based search for `tool_discovery` instead of pure keyword matching.

## 10. Comparison Matrix

| Capability | Ideal Native | Current Router | Gap |
|------------|--------------|----------------|-----|
| Single-tool task | 1 call | 2-3 calls | Discovery overhead |
| Multi-tool workflow (2 tools) | 2 calls | 4-5 calls | Compounding overhead |
| Tool discovery | Instant/none | ~2-5s per query | High latency |
| Parameter knowledge | Built-in | Manual/Full Detail | Fragile validation |
| Server visibility | 9/9 | 9/9 | Perfect |
| Search by server name | N/A | Works | Good |

## 11. Alternative Architecture Ideas
- **Implicit Discovery**: Instead of a separate `tool_discovery` tool, allow `tool_execute` to take a semantic name or description, performing the discovery internally if no toolKey is provided.
- **Namespaced Tool Access**: Allow calling tools as `server:tool_name` (e.g., `slack:conversations_history`) to bypass discovery entirely when the server and tool name are known.
- **Discovery Side-car**: Provide a `tool_capabilities` response that includes the top 3-5 tools per server by default, so the most common tasks never require discovery.
