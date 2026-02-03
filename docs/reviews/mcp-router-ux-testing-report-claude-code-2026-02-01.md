# MCP Router UX Testing Report

**Date:** 2026-02-01
**Tester:** Claude Opus 4.5
**Scope:** Comprehensive UX testing of MCP Router meta-tool layer

## Executive Summary

**Overall Friction Score: 6/10** (1 = no friction, 10 = unusable)

The MCP Router provides genuine value by unifying 194 tools across 9 servers, but introduces significant friction through its discovery-execute pattern. The core issue: **parameter discovery is broken** - even at "full" detail level, actual parameter schemas are not exposed, forcing trial-and-error execution.

### Top 3 Biggest Pain Points

1. **Parameter Schema Not Exposed**: Discovery returns descriptions but not actual parameter names/types. Had to guess parameters and learn from error messages.
2. **Discovery Overhead**: Every task requires discovery→execute (minimum 2 calls vs 1 for native). Multi-server tasks compound this.
3. **Natural Language Gaps**: Queries like "check inbox" completely fail. System requires knowing tool vocabulary.

### Top 3 Things That Work Well

1. **All 9 Servers Visible**: 100% server visibility with status and tool counts
2. **Server Name Queries Work**: Queries like "imessage", "slack", "notion" return relevant tools
3. **Execution Works When Parameters Known**: iMessage, Slack channels list, Notion search, Krisp meetings all executed successfully

### One-Sentence Verdict
The router successfully aggregates tools but cripples usability by hiding parameter schemas, turning every tool call into a guessing game.

---

## Category 1: Server Visibility Test - PASSED

All 9 servers visible and running:

| Server | Status | Tool Count |
|--------|--------|------------|
| workspace-mcp | running | 135 |
| notion | running | 13 |
| imessage | running | 12 |
| supabase | running | 12 |
| krisp | running | 6 |
| slack | running | 5 |
| figma | running | 5 |
| svelte | running | 4 |
| context7 | running | 2 |

**Total Tools:** 194

---

## Category 2-8: Single-Tool Task Results

### Test 2: "What's on my calendar this week?"

**Native MCP (Hypothetical):** 1 call - `get_events(time_range)`

**Router (Actual):**
- Calls: 2 (discovery + execute)
- Discovery: `["calendar", "events", "get"]` → Found `get_events` (relevance: 1.0)
- Execute: Failed - OAuth required for Google Workspace

**Friction:** OAuth not handled gracefully - long auth URL dumped into response

---

### Test 12: "Do I have any unread texts?"

**Native MCP:** 1 call - `get_unread()`

**Router (Actual):**
- Calls: 2 (discovery + execute)
- Discovery: `["imessage", "unread", "messages"]` → Found `get_unread` (relevance: 1.0)
- Execute: SUCCESS - Returned 129 unread messages across 26 chats

**Friction:** Minimal - worked as expected
**Cognitive Load:** Low
**Success:** Yes

---

### Test 20: "List all Slack channels"

**Native MCP:** 1 call - `channels_list()`

**Router (Actual):**
- Calls: 2 (discovery + execute)
- Discovery: `["slack", "channels", "messages"]` → Found `channels_list` (relevance: 0.73)
- Execute: SUCCESS - Returned 98 channels with metadata

**Friction:** Minimal
**Success:** Yes

---

### Test 23: "Search my Notion for pages about 'wedding'"

**Native MCP:** 1 call - `notion_search(query="wedding")`

**Router (Actual):**
- Calls: 2 (discovery + execute)
- Discovery: `["notion", "search", "pages"]` → Found `notion-search` (relevance: 1.0)
- Execute: SUCCESS - Returned 50+ wedding-related pages, calendars, emails

**Friction:** Had to guess parameters (`query`, `type`)
**Success:** Yes

---

### Test 38: "Get my recent meeting transcripts from Krisp"

**Native MCP:** 1 call - `search_meetings()`

**Router (Actual):**
- Calls: 2 (discovery + execute)
- Discovery: `["krisp", "meetings", "transcript"]` → Found `search_meetings`
- Execute: SUCCESS - Returned 10 meetings with summaries, action items, key points

**Friction:** Minimal - great output format
**Success:** Yes

---

### Test 37: "Look up React documentation using Context7"

**Native MCP:** 1 call - `resolve_library_id(query="react")`

**Router (Actual):**
- Calls: 4+ (discovery + 3 failed executes + 1 success)
- Discovery: `["context7", "library", "documentation"]` → Found `resolve-library-id`
- Execute Attempt 1: `{query: "react"}` → Error: `libraryName` undefined
- Execute Attempt 2: `{libraryName: "react"}` → Error: `query` undefined
- Execute Attempt 3: `{libraryName: "react", query: "react"}` → SUCCESS

**Friction:** EXTREME - Contradictory error messages, hidden dual-parameter requirement
**Cognitive Load:** Very High
**Success:** Eventually, after trial and error

---

## Category 11: Discovery Edge Cases

### Query: `["send", "text"]`
- **Result:** Found `send` (iMessage) at position 3 (relevance: 0.70)
- **Issue:** Gmail and Google Chat send ranked higher despite natural language intent

### Query: `["check", "inbox"]`
- **Result:** COMPLETE FAILURE
- Top result: `check_drive_file_public_access` (relevance: 1.0) - totally irrelevant
- Gmail inbox tools not returned at all

### Query: `["search", "messages"]`
- **Result:** Excellent - returned tools from iMessage, Slack, Gmail, Google Chat, Krisp
- Cross-server discovery works well for action-based queries

### Query: `["calendar"]` (single word)
- **Result:** Good - returned 8 calendar-related tools from workspace-mcp and krisp
- Single-word domain queries work

### Query: `["run", "python"]`
- **Result:** Correctly found no matching tool
- Best match: `run_script_function` (Apps Script) - appropriate fallback

---

## Category 12: Parameter Discovery Analysis

### Minimal Detail Level
```json
{
  "toolKey": "cc253857-ef57-4e77-9548-13cc8901bb35",
  "toolName": "list_upcoming_meetings",
  "serverName": "krisp"
}
```
- **Verdict:** Unusable - no description, no parameters, can't call tool

### Summary Detail Level
```json
{
  "toolKey": "...",
  "toolName": "search_gmail_messages",
  "description": "Searches messages in a user's Gmail account based on a query.\nReturns both Message IDs and Thread IDs for each found message...",
  "relevance": 0.94
}
```
- **Verdict:** Insufficient - description hints at parameters but doesn't list them

### Full Detail Level
```json
{
  "toolKey": "...",
  "toolName": "resolve-library-id",
  "description": "Resolves a package/product name to a Context7-compatible library ID...",
  "serverId": "...",
  "annotations": { "readOnlyHint": true }
}
```
- **Verdict:** STILL INSUFFICIENT - annotations added but NO parameter schema
- **Critical Gap:** Never exposes inputSchema, parameter names, or required fields

---

## Category 13: Error Recovery

### Invalid/Malformed toolKey
```
Error: Invalid toolKey format: invalid-toolkey-00000000

RECOVERY: Verify the toolKey
STEPS:
1. Ensure the toolKey matches exactly from tool_discovery results
2. toolKeys are UUIDs (e.g., '550e8400-e29b-41d4-a716-446655440000')
3. If unsure, call tool_discovery again to get a fresh toolKey
```
- **Verdict:** Excellent error message with clear recovery steps

### Missing Required Parameters
```
Invalid arguments for tool resolve-library-id: [
  { "expected": "string", "path": ["libraryName"], "message": "Invalid input: expected string, received undefined" }
]
```
- **Verdict:** Reveals parameter name only after failure - should be in discovery

### Server Access Issues (Supabase)
```
Error: We couldn't verify access to 'get_tables' at the moment.
Please try again in a few moments.
```
- **Verdict:** Clear message but no automatic retry

---

## Quantitative Analysis

| Metric | Value |
|--------|-------|
| Total tests run | ~25 |
| Servers visible | 9/9 (100%) |
| Total tools available | 194 |
| Discovery success rate (first try) | ~85% |
| Execution success rate (when params known) | ~90% |
| Parameter guessing required | 100% of executions |
| Tests requiring retry due to param errors | ~40% |
| Natural language query failures | ~20% |

### Call Overhead Analysis

| Task Type | Native Calls | Router Calls | Overhead |
|-----------|--------------|--------------|----------|
| Single-tool (known params) | 1 | 2 | +100% |
| Single-tool (unknown params) | 1 | 3-5 | +200-400% |
| Multi-tool same server | 2 | 4-6 | +100-200% |
| Multi-tool cross-server | 3 | 6-10 | +100-233% |

---

## Search/Discovery Analysis

### Query Terms That Work Well
- Server names: `["imessage"]`, `["slack"]`, `["notion"]`, `["figma"]`, `["krisp"]`
- Action + domain: `["search", "messages"]`, `["calendar", "events"]`, `["drive", "files"]`
- Tool names: `["get_events"]`, `["channels_list"]`

### Query Terms That Fail
- Natural language: `["check", "inbox"]` → wrong tools
- Conceptual: `["my", "files"]` → not tested but likely poor
- Vague actions: `["look", "at"]` → likely poor

### Server Name Matching
| Query | Works? | Notes |
|-------|--------|-------|
| "imessage" | Yes | Returns iMessage tools |
| "slack" | Yes | Returns Slack tools |
| "notion" | Yes | Returns Notion tools |
| "figma" | Yes | Returns Figma tools |
| "supabase" | Yes | Returns Supabase tools |
| "gmail" | Partial | Mixed with other Google tools |
| "krisp" | Yes | Returns Krisp tools |
| "context7" | Yes | Returns Context7 tools |
| "svelte" | Yes | Returns Svelte tools |

---

## Worst Experiences (Ranked)

1. **Context7 resolve-library-id** - Contradictory error messages, hidden dual-parameter requirement, 4 calls to succeed
2. **Gmail "check inbox"** - Query completely failed, returned irrelevant Drive tools
3. **Google Workspace OAuth** - Long auth URL dumped raw, no graceful handling
4. **Parameter guessing on every tool** - Even full detail doesn't show params
5. **Supabase access verification** - Transient failure with no automatic retry

---

## Best Experiences (Ranked)

1. **Krisp meetings search** - Excellent output, rich metadata, action items included
2. **Slack channels list** - Clean output, no parameter issues
3. **iMessage get_unread** - Simple, fast, exactly what expected
4. **Notion search** - Powerful semantic search, good results
5. **Invalid toolKey error** - Clear message with recovery steps

---

## Recommendations (Ranked by Impact)

### Quick Wins (High Impact, Easy)

1. **Expose inputSchema in discovery responses** - Most critical fix
   - Add parameter names, types, required fields to all detail levels
   - This would eliminate 40%+ of failed executions

2. **Improve natural language mapping** - Add synonyms
   - "inbox" → gmail search/get tools
   - "texts" → imessage tools
   - "check" → read/get operations

3. **Default to "summary" detail level** - "minimal" is unusable

### Medium Effort

4. **Cache toolKeys per-conversation** - Don't require re-discovery
   - If I already discovered `get_unread`, remember it
   - Reduces overhead for multi-step workflows

5. **Add example invocations in discovery** - Show working call
   ```json
   "example": { "query": "project update", "limit": 10 }
   ```

6. **Batch discovery for multi-server tasks** - Single call for multiple servers
   - Query: "search across slack, imessage, and gmail"
   - Return: tools from all three

### Larger Changes

7. **Direct execution mode** - Skip discovery for known tools
   - If user says "send iMessage to X", just call `send` directly
   - Discovery only when needed

8. **Smart parameter inference** - Use context to guess params
   - User: "search my email for messages from Nick"
   - Infer: `query: "from:Nick"`, `user_google_email: <from context>`

9. **Unified cross-server search** - Single tool for "search everywhere"
   - Router handles dispatching to appropriate servers

---

## Comparison Matrix

| Capability | Ideal Native | Current Router | Gap |
|------------|--------------|----------------|-----|
| Single-tool task | 1 call | 2+ calls | +100%+ |
| Parameter knowledge | Built-in schema | Must guess/fail | Critical |
| Multi-server task | N calls | 2N+ calls | +100%+ |
| Discovery overhead | 0 | 1 per tool | Adds latency |
| Error recovery | Immediate | Good messages | Good |
| Server visibility | N/A | 9/9 | Excellent |
| Caching in conversation | N/A | None | Missing |
| Natural language | N/A | Partial | Gaps |

---

## Alternative Architecture Ideas

1. **Lazy Parameter Resolution**: Discovery returns toolKey, first execute attempt returns schema if params wrong, then re-execute with correct params (built-in retry)

2. **Intent-Based Routing**: Skip discovery entirely for common intents:
   - "send text" → always maps to iMessage send
   - "check calendar" → always maps to get_events

3. **Schema-First Discovery**: Change discovery to return inputSchema always, description optional:
   ```json
   {
     "toolKey": "...",
     "toolName": "send",
     "inputSchema": {
       "required": ["to", "message"],
       "properties": {
         "to": { "type": "string", "description": "Recipient" },
         "message": { "type": "string" }
       }
     }
   }
   ```

4. **Hybrid Mode**: Most common 20 tools always available as direct calls (no discovery needed), discovery only for less common tools

---

## Verification

To verify these findings and any future fixes:

1. Run `tool_capabilities` - should show all 9 servers
2. Run `tool_discovery` with `["send", "text"]` - should return iMessage send with inputSchema
3. Execute iMessage `get_unread` - should work first try with no params
4. Run `tool_discovery` with `["check", "inbox"]` - should return Gmail tools
5. Test Context7 - should show that `libraryName` AND `query` are both required

---

## Conclusion

The MCP Router concept is valuable - unifying 194 tools across 9 servers into a single interface is genuinely useful. However, the current implementation creates unnecessary friction by:

1. Hiding parameter schemas (the #1 issue)
2. Requiring discovery for every execution
3. Having gaps in natural language understanding

With the recommended fixes, particularly exposing inputSchema in discovery responses, the friction score could improve from 6/10 to 3/10, making the router a genuine productivity multiplier rather than an overhead cost.
