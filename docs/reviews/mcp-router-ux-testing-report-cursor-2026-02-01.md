# MCP Router UX Testing & Friction Analysis Report (Cursor Client)

## 1. Executive Summary
- **Overall Friction Score: 7/10** (1 = Seamless, 10 = Unusable)
- **Verdict:** The MCP Router successfully centralizes access to 194 tools across 9 servers, but the "Meta-Tool" architecture introduces significant latency, cognitive overhead, and reliability issues that would not exist with direct MCP access. While functional for simple tasks, complex workflows are hampered by redundant discovery steps and parameter blindness.

### Top 3 Biggest Pain Points
1. **Redundant Discovery Overhead:** Every operation requires a mandatory `tool_discovery` call to obtain a session-based UUID (`toolKey`). This doubles the number of calls for every single-tool task and multiplies it for workflows.
2. **Parameter Blindness:** The default `summary` detail level often truncates required arguments (e.g., `user_google_email` for Workspace tools), leading to "guess-and-fail" loops unless the AI proactively calls discovery with `detailLevel: full`.
3. **Systematic Reliability Gaps:** Critical tools in the Figma and Supabase servers consistently failed with internal errors (`match` of undefined) or connectivity issues, suggesting the router layer adds a point of failure.

### Top 3 Things That Work Well
1. **Centralized Discovery:** The ability to search across 9 disparate services (Slack, Gmail, Notion, iMessage) using a single keyword search is powerful.
2. **Helpful Error Recovery:** Error messages for invalid `toolKey` formats or expired keys provide clear recovery steps.
3. **Unified Capability Map:** `tool_capabilities` provides an excellent bird's-eye view of the entire ecosystem without polluting the LLM's context window.

---

## 2. Critical Bugs Found
- **Figma Systematic Failure:** `add_figma_file` consistently fails with `Cannot read properties of undefined (reading 'match')`, making design integration impossible.
- **Supabase Management API:** `get_management_api_spec` and related tools fail with access verification errors ("We couldn't verify access... visit thequery.dev/status").
- **Context7 Argument Mismatch:** `resolve-library-id` documentation says it needs `name`, but the execution layer throws validation errors requiring `query` and `libraryName`.

---

## 3. Quantitative Analysis

| Metric | Value |
|--------|-------|
| Total scenarios attempted | 22 |
| Total native calls (hypothetical) | 22 |
| Total router calls (actual) | 58 |
| Average overhead percentage | **163%** |
| Discovery success rate (first try) | 85% |
| Parameter guessing frequency | 40% (high for Workspace/Context7) |
| Tests requiring retry | 6 |
| Tests that failed completely | 3 (Figma, Supabase, Auth-blocked) |
| Servers visible out of 9 | 9 / 9 |

---

## 4. Friction Breakdown by Category

| Category | Avg Native Calls | Avg Router Calls | Overhead | Notes |
|----------|------------------|------------------|----------|-------|
| Simple single-tool (Workspace) | 1 | 3 | 200% | Needs discovery + full detail for params. |
| Simple single-tool (iMessage) | 1 | 2 | 100% | Params are simpler, discovery is faster. |
| Simple single-tool (Slack) | 1 | 2 | 100% | Easy to discover, but needs channel ID list. |
| Simple single-tool (Notion) | 1 | 2 | 100% | High relevance in search. |
| Simple single-tool (Figma) | 1 | 3 | 200% | Failed execution due to internal error. |
| Multi-tool same-server | 2 | 4 | 100% | Can reuse toolKeys if cached in turn. |
| Multi-tool cross-server | 2 | 5 | 150% | High cognitive load managing UUIDs. |
| Discovery edge cases | 0 | 1 | N/A | Vague queries fail to find deep tools. |

---

## 5. Search/Discovery Analysis

**Query Terms That Work Well:**
- **Specific tool names:** `get_events`, `search_gmail_messages`, `channels_list`.
- **Service names:** `svelte`, `figma`, `notion`.
- **Action-based keywords:** `unread`, `search`, `messages`.

**Query Terms That Fail or Return Unexpected Results:**
- **Natural Language:** "check my inbox" (found Drive sharing check instead of Gmail).
- **Broad Queries:** "check my database" (found Notion update instead of Supabase).

**Server Name Matching:**
- Querying "imessage", "slack", "notion", "figma", "svelte" all correctly filtered results to the respective servers. This is a highlight of the system.

---

## 6. Parameter Discovery Analysis

- **Minimal Detail Level:** Provides only `toolName` and `toolKey`. Utterly insufficient for execution without prior knowledge.
- **Summary Detail Level:** Truncates argument descriptions. For `get_events`, it cut off the required `user_google_email` field, causing immediate execution failure.
- **Full Detail Level:** Essential for first-time use. Provides JSON schemas and examples. **Recommendation:** The router should probably default to `full` for the top 1-2 most relevant results.

---

## 7. Worst Experiences (Ranked)

1. **The "Wait, what's the email?" Loop:** Discovering `get_events`, trying to run it, failing because `user_google_email` is missing, then having to find another tool (`notion-get-users`) just to find the identity of the current user.
2. **Figma Error 32603:** Successfully finding a design file URL in Slack, but being unable to "get" it because the router's Figma bridge is broken.
3. **UUID Management in Cross-Server Tasks:** In "Morning Catchup" (Test 75), the agent must hold 3-4 separate 36-character UUIDs in its "working memory" while executing, which is prone to error.

---

## 8. Best Experiences (Ranked)

1. **iMessage Unread Summary:** `get_unread` worked perfectly first try and provided a very rich summary of unread messages across 26 chats.
2. **Slack History Search:** Finding the "Scream Project" across Slack was fast and the results were well-formatted.
3. **Context7 Docs:** Once the argument mismatch was solved, fetching React documentation was extremely fast and the snippets were relevant.

---

## 9. Recommendations (Ranked by Impact)

### Quick Wins (Easy to implement, high impact)
1. **Hybrid Discovery:** Return the full schema for the #1 most relevant tool in every `summary` discovery call.
2. **Identity Injection:** Allow the router to auto-fill common parameters like `user_google_email` or `user_id` if they are configured globally.

### Medium Effort
1. **Semantic Alias Mapping:** Map "check my inbox" to `list_gmail_messages` and "unread texts" to `get_unread` using a light LLM-based intent layer.
2. **Persistent ToolKeys:** Extend `toolKey` life to the entire conversation thread rather than a 60-minute session to reduce re-discovery calls.

### Larger Changes
1. **Direct Tool Exposure:** For the "Top 10" most used tools (Calendar, Gmail, Slack), expose them as direct MCP tools while keeping the rest behind the router layer.
2. **Client-Side Parameter Validation:** Perform parameter validation at the router level *before* calling the sub-server to give faster feedback to the AI.

---

## 10. Comparison Matrix

| Capability | Ideal Native | Current Router | Gap |
|------------|--------------|----------------|-----|
| Single-tool task | 1 call | 2-3 calls | **-200% Latency** |
| Multi-tool (2 tools) | 2 calls | 4-5 calls | **-150% Latency** |
| Tool discovery | Instant/none | ~2 seconds | **High Friction** |
| Parameter knowledge | Built-in | Hidden by default | **High Cognitive Load** |
| Server visibility | 9/9 | 9/9 | **Identical** |
| Search by server name | N/A | Works well | **Better than Native** |

---

## 11. Alternative Architecture Ideas

1. **"Shadow" MCP Tooling:** The router could dynamically register the "discovered" tool as a first-class tool in the current session after `tool_discovery` is called, so the AI can use standard calling syntax instead of `tool_execute`.
2. **LLM-Router Proxy:** Instead of making the AI call `tool_execute`, the router could have a `smart_execute` tool that takes natural language + params and handles the discovery/execution internally.
3. **Capability-Based Prefixes:** Expose tools as `workspace_get_events` directly. The router can manage the 200+ tool names by only sending the names of the 20 most relevant tools based on the user's initial prompt.
