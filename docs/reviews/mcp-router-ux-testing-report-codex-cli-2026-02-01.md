# MCP Router UX Testing & Friction Analysis

## Test 1: Server Visibility Test

**User Request:** Call `tool_capabilities` and document which servers appear

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: tool_capabilities()

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_capabilities -> 9 servers listed (all expected)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** All 9 servers visible.

---

## Test 2: What's on my calendar this week?

**User Request:** What's on my calendar this week?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_events(time_min, time_max)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("calendar events") -> get_events
  2. tool_execute(get_events, date_range=week) -> error (missing auth / user_google_email)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (date range format)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Workspace auth blocked read-only access.

---

## Test 3: Search my email for messages from Nick

**User Request:** Search my email for messages from Nick

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_gmail_messages(query="from:Nick")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("gmail search") -> search_gmail_messages
  2. tool_execute(search_gmail_messages, query="from:Nick") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query syntax)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Gmail tools consistently blocked by auth.

---

## Test 4: Find a file called "budget" in my Drive

**User Request:** Find a file called "budget" in my Drive

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_drive_files(query="budget")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("drive search files") -> search_drive_files
  2. tool_execute(search_drive_files, query="budget") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query vs name filter)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Auth blocked file search.

---

## Test 5: Show me the content of [specific doc]

**User Request:** Show me the content of [specific doc]

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_doc_content(document_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("doc content") -> get_doc_content
  2. tool_execute(get_doc_content, document_id=[redacted]) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (document_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Could not retrieve doc content due to auth.

---

## Test 6: List my Google Tasks

**User Request:** List my Google Tasks

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: list_tasks()

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("google tasks") -> list_tasks
  2. tool_execute(list_tasks) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Auth blocked task list.

---

## Test 7: Upcoming calendar events with attendees

**User Request:** What are my upcoming calendar events with attendees?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_events(time_min, include_attendees=true)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("calendar events attendees") -> get_events
  2. tool_execute(get_events, time_min=now, include_attendees=true) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (include_attendees, time_min)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Auth blocked event retrieval.

---

## Test 8: Search my contacts for Andrew

**User Request:** Search my contacts for someone named Andrew

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_contacts(query="Andrew")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("contacts search") -> search_contacts
  2. tool_execute(search_contacts, query="Andrew") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query field)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Contacts inaccessible without auth.

---

## Test 9: Get responses from my Google Form

**User Request:** Get the responses from my Google Form

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: list_form_responses(form_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("google forms responses") -> list_form_responses
  2. tool_execute(list_form_responses, form_id=[redacted]) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (form_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Form access blocked by auth.

---

## Test 10: Read comments on a Google Doc

**User Request:** Read the comments on this Google Doc

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: read_document_comments(document_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("doc comments") -> read_document_comments
  2. tool_execute(read_document_comments, document_id=[redacted]) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (document_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Comments inaccessible due to auth.

---

## Test 11: What spreadsheets do I have in my Drive?

**User Request:** What spreadsheets do I have in my Drive?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_drive_files(mimeType="spreadsheets")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("drive spreadsheets") -> search_drive_files
  2. tool_execute(search_drive_files, mimeType="spreadsheet") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (mimeType filter)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth missing (user_google_email / session)

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Drive access blocked.

---

## Test 12: Do I have any unread texts?

**User Request:** Do I have any unread texts?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_unread()

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("imessage unread") -> get_unread
  2. tool_execute(get_unread) -> unread list returned (content redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** iMessage tools worked; results redacted.

---

## Test 13: What did Sukhmani text me recently?

**User Request:** What did Sukhmani text me recently?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search(query="Sukhmani")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("imessage search") -> search
  2. tool_execute(search, query="Sukhmani") -> messages returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query vs participants)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Results returned; content redacted.

---

## Test 14: Search my texts for "wedding"

**User Request:** Search my texts for "wedding"

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search(query="wedding")

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(search, query="wedding") -> results returned (redacted)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: Reused prior toolKey manually

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** ToolKey reuse worked, but still manual.

---

## Test 15: Show me my recent conversations

**User Request:** Show me my recent conversations

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: list_chats()

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("imessage list chats") -> list_chats
  2. tool_execute(list_chats) -> chat list returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Results redacted.

---

## Test 16: Find the group chat with [people]

**User Request:** Find the group chat with [people]

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: find_chat(participants=[...])

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("imessage find chat") -> find_chat
  2. tool_execute(find_chat, participants=[redacted]) -> chat found (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (participants array format)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Results redacted.

---

## Test 17: Get messages from the last 24 hours

**User Request:** Get messages from the last 24 hours

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_messages(start_time, end_time)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("imessage get messages") -> get_messages
  2. tool_execute(get_messages, time_range=last_24h) -> messages returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (time range)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Results redacted.

---

## Test 18: Show me recent messages in #general

**User Request:** Show me recent messages in #general

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: conversations_history(channel="#general")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("slack history") -> conversations_history
  2. tool_execute(conversations_history, channel_id=[redacted]) -> messages returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (channel_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Requires channel_id mapping; results redacted.

---

## Test 19: Search Slack for messages about "scream project"

**User Request:** Search Slack for messages about "scream project"

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: conversations_search_messages(query="scream project")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("slack search messages") -> conversations_search_messages
  2. tool_execute(conversations_search_messages, query="scream project") -> results returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query syntax)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Search worked but filters were unreliable in later tests.

---

## Test 20: List all Slack channels

**User Request:** List all Slack channels

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: channels_list()

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("slack channels") -> channels_list
  2. tool_execute(channels_list) -> channel list returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Straightforward.

---

## Test 21: Get the thread replies on [message]

**User Request:** Get the thread replies on [message]

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: conversations_replies(channel_id, ts)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("slack thread replies") -> conversations_replies
  2. tool_execute(conversations_replies, channel_id=[redacted], ts=[redacted]) -> error / insufficient context

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (channel_id, ts)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing message identifiers to proceed

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** No

**Notes:** Requires prior message selection with timestamp.

---

## Test 22: What did Nick say in #leads channel?

**User Request:** What did Nick say in #leads channel?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: conversations_search_messages(query="from:Nick in:#leads")

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(conversations_search_messages, query="from:Nick in:#leads") -> results returned, filters unreliable

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (filter syntax)
- [x] Search terms didn't match intuitively (filters ignored)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Partial

**Notes:** Search returned many results not clearly scoped to #leads.

---

## Test 23: Search my Notion for pages about "wedding"

**User Request:** Search my Notion for pages about "wedding"

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search(query="wedding")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion search") -> notion-search
  2. tool_execute(notion-search, query="wedding") -> mixed results (pages + mail/calendar), redacted

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (query only)
- [x] Search terms didn't match intuitively (returned non-Notion sources)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion vs mail/calendar)
- [ ] Server not visible in router (critical bug)
- [x] Other: Cross-silo results noisy

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Partial

**Notes:** Results included mail/calendar items in addition to Notion pages.

---

## Test 24: Get the content of my project tracker page

**User Request:** Get the content of my project tracker page

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_page(page_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion search") -> notion-search
  2. tool_execute(notion-search, query="project tracker") -> page found, but no get_page tool available

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (page identification)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (search results only)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing get_page/get_block_children tools

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** No

**Notes:** Search worked, but content fetch tool missing.

---

## Test 25: Query my tasks database in Notion

**User Request:** Query my tasks database in Notion

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: query_database(database_id, filters)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion database query") -> no matching query_database tool found
  2. tool_execute(notion-search, query="tasks") -> results, but not a database query

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (database_id, filters)
- [x] Search terms didn't match intuitively (no query_database)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (search vs database)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing query_database tool

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** No

**Notes:** Unable to query database directly.

---

## Test 26: Find Notion pages modified this week

**User Request:** Find Notion pages modified this week

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search(query="", filter=last_edited_time)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion search modified") -> notion-search
  2. tool_execute(notion-search, query="updated") -> mixed results (mail/calendar/pages)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (date filter not exposed)
- [x] Search terms didn't match intuitively (no date filter)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (cross-silo results)
- [ ] Server not visible in router (critical bug)
- [x] Other: No filter controls for modified time

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Partial

**Notes:** Results not scoped to "this week."

---

## Test 27: Get comments on a Notion page

**User Request:** Get comments on a Notion page

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_comments(page_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion comments") -> no clear get_comments tool
  2. tool_execute(notion-search, query="comments") -> unrelated results

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (page_id)
- [x] Search terms didn't match intuitively (comments tool missing)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (search only)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing get_comments tool

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** No

**Notes:** Comments unavailable via router.

---

## Test 28: Get contents of my Figma design file

**User Request:** Get the contents of my Figma design file

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_file(file_key)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("figma file contents") -> missing get_file/get_file_nodes

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key)
- [x] Search terms didn't match intuitively (tool missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Expected Figma tools missing

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Only limited Figma tools available.

---

## Test 29: List my Figma team projects

**User Request:** List my Figma team projects

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_team_projects(team_id)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("figma team projects") -> tool not found

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (team_id)
- [x] Search terms didn't match intuitively (tool missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Expected Figma tools missing

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Figma server lacks project listing.

---

## Test 30: Get comments on a Figma file

**User Request:** Get comments on a Figma file

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_comments(file_key)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("figma comments") -> read_comments
  2. tool_execute(read_comments, file_key=[redacted]) -> error / missing file_key context

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: File key not discoverable in router

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Comments accessible only with external file_key.

---

## Test 31: Find components in my Figma file

**User Request:** Find components in my Figma file

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_team_components(file_key)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("figma components") -> tool missing

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key)
- [x] Search terms didn't match intuitively (tool missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Expected Figma tools missing

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Missing components tooling.

---

## Test 32: Export images from a Figma file

**User Request:** Export images from a Figma file

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_images(file_key, node_ids)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("figma export images") -> tool missing

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key, node_ids)
- [x] Search terms didn't match intuitively (tool missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Expected Figma tools missing

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Image export unavailable.

---

## Test 33: Query my users table in Supabase

**User Request:** Query my users table in Supabase

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: query(table="users", sql)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("supabase query") -> query
  2. tool_execute(query, table="users") -> error / access denied

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (table vs sql)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Supabase access/auth failure

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Supabase tools failed to execute.

---

## Test 34: List all tables in my Supabase database

**User Request:** List all tables in my Supabase database

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: list_tables()

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("supabase list tables") -> list_tables
  2. tool_execute(list_tables) -> error / access denied

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Supabase access/auth failure

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Supabase not accessible.

---

## Test 35: Get schema for a specific table

**User Request:** Get the schema for a specific table

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_table_schema(table="...")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("supabase schema") -> get_table_schema
  2. tool_execute(get_table_schema, table="...") -> error / access denied

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (table name)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Supabase access/auth failure

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Schema retrieval blocked.

---

## Test 36: List files in Supabase storage

**User Request:** List files in Supabase storage

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: storage_list(bucket, path)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("supabase storage list") -> storage_list
  2. tool_execute(storage_list, bucket=[redacted]) -> error / access denied

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (bucket, path)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Supabase access/auth failure

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Storage tools unavailable.

---

## Test 37: Look up React documentation using Context7

**User Request:** Look up React documentation using Context7

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: resolve_library_id("react"), get_library_docs(libraryId, query)

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_discovery("context7 resolve") -> resolve_library_id + get_library_docs
  2. tool_execute(resolve_library_id, query="react") -> libraryId returned
  3. tool_execute(get_library_docs, libraryId=[redacted], query="hooks") -> docs returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query, libraryId usage)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Context7 worked as expected.

---

## Test 38: Get my recent meeting transcripts from Krisp

**User Request:** Get my recent meeting transcripts from Krisp

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search_meetings(limit=N), get_document(meeting_id)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("krisp search meetings") -> search_meetings
  2. tool_execute(search_meetings, limit=recent) -> meeting list returned
  3. tool_discovery("krisp get document") -> get_document
  4. tool_execute(get_document, documentId=[redacted]) -> transcript returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (documentId)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** get_document returns very large transcript payload and download link (redacted).

---

## Test 39: Search for a meeting about "project kickoff" in Krisp

**User Request:** Search for a meeting about "project kickoff" in Krisp

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_meetings(search="project kickoff")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("krisp search") -> search_meetings
  2. tool_execute(search_meetings, search="project kickoff") -> results not clearly relevant

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (search string)
- [x] Search terms didn't match intuitively (unexpected results)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Partial

**Notes:** Search appears weak for topical queries.

---

## Test 40: Look up Svelte component documentation

**User Request:** Look up Svelte component documentation

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: search_docs(query="component")

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("svelte docs search") -> only get_docs available (no search_docs)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (component name)
- [x] Search terms didn't match intuitively (search tool missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing search_docs tool

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Svelte server incomplete for search use cases.

---

## Test 41: Find docs for a specific npm library

**User Request:** Find docs for a specific npm library

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: resolve_library_id("library"), get_library_docs(libraryId, query)

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_discovery("context7 library docs") -> resolve_library_id + get_library_docs
  2. tool_execute(resolve_library_id, query="[library]") -> libraryId returned
  3. tool_execute(get_library_docs, libraryId=[redacted], query="overview") -> docs returned (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query, libraryId flow)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Works well for library docs.

---

## Test 42: Search Gmail for emails about project, then get full content of top 3

**User Request:** Search Gmail for emails about the project, then get the full content of the top 3

**Native MCP (Hypothetical):**
- Calls needed: 4
- Would call: search_gmail_messages(query="project"), get_gmail_message_content(id) x3

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("gmail search") -> search_gmail_messages
  2. tool_execute(search_gmail_messages, query="project") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query, follow-up IDs)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks multi-step workflow

**Cognitive Load:** High
**Time to First Result:** Fast
**Success:** No

**Notes:** Could not proceed to message content.

---

## Test 43: Find a Drive file and read its content

**User Request:** Find a Drive file and read its content

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search_drive_files(query), get_drive_file_content(file_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("drive search") -> search_drive_files
  2. tool_execute(search_drive_files, query="[file]") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query, file_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks file access

**Cognitive Load:** High
**Time to First Result:** Fast
**Success:** No

**Notes:** Multi-step Drive flow failed at first step.

---

## Test 44: List calendars then get events from work calendar

**User Request:** List my calendars and then get events from my work calendar

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: list_calendars(), get_events(calendar_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("list calendars") -> list_calendars
  2. tool_execute(list_calendars) -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (calendar_id for step 2)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks calendar listing

**Cognitive Load:** High
**Time to First Result:** Fast
**Success:** No

**Notes:** Could not reach event fetch.

---

## Test 45: Search contacts then get full details

**User Request:** Search contacts and then get full details for one of them

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search_contacts(query), get_contact(contact_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("contacts search") -> search_contacts
  2. tool_execute(search_contacts, query="[name]") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query, contact_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks contact access

**Cognitive Load:** High
**Time to First Result:** Fast
**Success:** No

**Notes:** Search blocked at first step.

---

## Test 46: Search Notion for project pages, then get details of one

**User Request:** Search Notion for project pages, then get details of one

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search(query="project"), get_page(page_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery("notion search") -> notion-search
  2. tool_execute(notion-search, query="project") -> results returned, but no get_page tool

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (page_id)
- [x] Search terms didn't match intuitively (no detail fetch tool)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (search vs page fetch)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing get_page/get_block_children tools

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Search worked; detail fetch unavailable.

---

## Test 47: Query Figma file, then get specific component details

**User Request:** Query Figma file, then get specific component details

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_file_nodes(file_key), get_team_components(file_key)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("figma file nodes/components") -> tools missing

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key, node_ids)
- [x] Search terms didn't match intuitively (tools missing)
- [ ] Had to retry with different query
- [ ] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Missing core Figma tools

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** Figma coverage too limited.

---

## Test 48: Check unread texts AND recent Slack DMs

**User Request:** Check my unread texts AND recent Slack DMs

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_unread(), conversations_history(dm_channel)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("imessage unread") -> get_unread
  2. tool_execute(get_unread) -> unread list (redacted)
  3. tool_discovery("slack history") -> conversations_history
  4. tool_execute(conversations_history, channel_id=[redacted]) -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (DM channel_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Slack DMs require channel_id; no direct "recent DMs" tool.

---

## Test 49: Meetings tomorrow + related Slack discussions

**User Request:** What meetings do I have tomorrow and any related Slack discussions?

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_events(time_range=tomorrow), conversations_search_messages(query)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("calendar events") -> get_events
  2. tool_execute(get_events, date=tomorrow) -> error (missing auth / user_google_email or session)
  3. tool_discovery("slack search messages") -> conversations_search_messages
  4. tool_execute(conversations_search_messages, query="meeting topics") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (date filters, query)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks calendar portion

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Calendar portion failed; Slack search still returned results.

---

## Test 50: Search for what Nick said about CringeMart across Slack and email

**User Request:** Search for what Nick said about CringeMart across Slack and email

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: conversations_search_messages(query="CringeMart from:Nick"), search_gmail_messages(query="CringeMart from:Nick")

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("slack search") -> conversations_search_messages
  2. tool_execute(conversations_search_messages, query="CringeMart from:Nick") -> results (redacted)
  3. tool_discovery("gmail search") -> search_gmail_messages
  4. tool_execute(search_gmail_messages, query="CringeMart from:Nick") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (filter syntax)
- [x] Search terms didn't match intuitively (Gmail blocked)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks Gmail portion

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Slack portion OK; Gmail blocked.

---

## Test 51: Get schedule and check if Sukhmani texted about meetings

**User Request:** Get my schedule and check if Sukhmani texted me about any of those meetings

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_events(time_range), search(query="Sukhmani")

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("calendar events") -> get_events
  2. tool_execute(get_events, date_range=upcoming) -> error (missing auth / user_google_email or session)
  3. tool_discovery("imessage search") -> search
  4. tool_execute(search, query="Sukhmani") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (calendar range)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks calendar portion

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Could not correlate without calendar data.

---

## Test 52: Find all communications about "wedding" across texts, email, and Slack

**User Request:** Find all communications about "wedding" across texts, email, and Slack

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: search(iMessage), search_gmail_messages(), conversations_search_messages()

**Router (Actual):**
- Calls made: 6
- Call sequence:
  1. tool_discovery("imessage search") -> search
  2. tool_execute(search, query="wedding") -> results (redacted)
  3. tool_discovery("gmail search") -> search_gmail_messages
  4. tool_execute(search_gmail_messages, query="wedding") -> error (missing auth / user_google_email or session)
  5. tool_discovery("slack search") -> conversations_search_messages
  6. tool_execute(conversations_search_messages, query="wedding") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query syntax)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocks Gmail portion

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Gmail portion failed.

---

## Test 53: Check calendar, then search Slack for discussions about those meetings

**User Request:** Check my calendar, then search Slack for discussions about those meetings

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_events(), conversations_search_messages(query_from_titles)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("calendar freebusy") -> query_freebusy
  2. tool_execute(query_freebusy, time_range=[redacted]) -> error (missing auth / user_google_email or session)
  3. tool_discovery("slack search") -> conversations_search_messages
  4. tool_execute(conversations_search_messages, query="[meeting terms]") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (freebusy time_range)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Calendar blocked by auth

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Calendar data missing.

---

## Test 54: Compare email vs Slack about [project]

**User Request:** Compare what was discussed in email vs Slack about [project]

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search_gmail_messages(query="[project]"), conversations_search_messages(query="[project]")

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("gmail search") -> search_gmail_messages
  2. tool_execute(search_gmail_messages, query="[project]") -> error (missing auth / user_google_email or session)
  3. tool_discovery("slack search") -> conversations_search_messages
  4. tool_execute(conversations_search_messages, query="[project]") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (project query)
- [ ] Search terms didn't match intuitively (Gmail blocked)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail blocked by auth

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Email portion failed.

---

## Test 55: Get my Krisp meeting notes and find related Notion pages

**User Request:** Get my Krisp meeting notes and find related Notion pages

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: search_meetings(), get_document(meeting_id), search(query)

**Router (Actual):**
- Calls made: 6
- Call sequence:
  1. tool_discovery("krisp search") -> search_meetings
  2. tool_execute(search_meetings, search="[topic]") -> meetings returned
  3. tool_discovery("krisp get document") -> get_document
  4. tool_execute(get_document, documentId=[redacted]) -> meeting notes returned (redacted)
  5. tool_discovery("notion search") -> notion-search
  6. tool_execute(notion-search, query="[topic]") -> results (mixed types)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (documentId, query)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [x] Tool name ambiguity (Notion search results)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** High
**Time to First Result:** Slow
**Success:** Yes

**Notes:** Notion results noisy; Krisp notes rich.

---

## Test 56: Search Figma comments and related Slack discussions about a design

**User Request:** Search Figma comments and related Slack discussions about a design

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_comments(file_key), conversations_search_messages(query)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_discovery("figma comments") -> read_comments
  2. tool_execute(read_comments, file_key=[redacted]) -> error / file_key missing
  3. tool_discovery("slack search") -> conversations_search_messages
  4. tool_execute(conversations_search_messages, query="[design]") -> results (redacted)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (file_key, query)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Figma requires external file_key

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Slack portion worked; Figma blocked without key.

---

## Test 57: Find Notion project page and related Gmail threads

**User Request:** Find Notion project page and related Gmail threads

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: search(query="project"), search_gmail_messages(query="project")

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_execute(notion-search, query="Project") -> results (mixed types)
  2. tool_execute(search_gmail_messages, query="Project") -> error (missing auth / user_google_email or session)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (query terms)
- [x] Search terms didn't match intuitively (Notion results broad)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion search results)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail blocked by auth

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Partial

**Notes:** Notion search ok; Gmail blocked.

---

## Test 58: Get meeting transcript from Krisp and find follow-up tasks in Notion

**User Request:** Get meeting transcript from Krisp and find follow-up tasks in Notion

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: search_meetings(), get_document(meeting_id), search(query="follow-up")

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_execute(search_meetings, search="yesterday") -> meetings returned
  2. tool_execute(get_document, documentId=[redacted]) -> transcript returned (redacted)
  3. tool_execute(notion-search, query="follow-up") -> results (mixed types)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (documentId)
- [x] Search terms didn't match intuitively (Notion cross-silo)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion search results)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Transcript payload large; Notion results noisy.

---

## Test 59: Discovery by server name queries

**User Request:** Try finding tools using server names

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct tool access)

**Router (Actual):**
- Calls made: 8
- Call sequence:
  1. tool_discovery("imessage") -> iMessage tools returned
  2. tool_discovery("slack") -> Slack tools returned
  3. tool_discovery("notion") -> Notion tools returned
  4. tool_discovery("figma") -> Figma tools returned (limited)
  5. tool_discovery("supabase") -> Supabase tools returned (mgmt/logs skew)
  6. tool_discovery("krisp") -> Krisp tools returned
  7. tool_discovery("context7") -> Context7 tools returned
  8. tool_discovery("svelte") -> Svelte tools returned

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (supabase results skew)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (cross-server results vary)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Server-name discovery generally works, but tool coverage varies.

---

## Test 60: Vague / natural language queries

**User Request:** Try vague/natural language queries

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct tool access)

**Router (Actual):**
- Calls made: 5
- Call sequence:
  1. tool_discovery("send a text") -> non-iMessage tools surfaced
  2. tool_discovery("check my inbox") -> mixed results
  3. tool_discovery("look at my files") -> mixed results
  4. tool_discovery("find my designs") -> mixed results
  5. tool_discovery("check my database") -> Notion/Supabase ambiguity

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (wrong servers)
- [x] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (multiple servers returned)
- [ ] Server not visible in router (critical bug)
- [x] Other: Natural language intent routing weak

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Discovery does not map intent to correct server reliably.

---

## Test 61: Multi-server matching queries

**User Request:** Try queries that match multiple servers

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct tool access)

**Router (Actual):**
- Calls made: 5
- Call sequence:
  1. tool_discovery("search messages") -> mixed Slack/iMessage/Notion
  2. tool_discovery("get messages") -> mixed results
  3. tool_discovery("send") -> mostly write tools (not allowed)
  4. tool_discovery("search") -> too broad
  5. tool_discovery("query") -> mixed Notion/Supabase

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (too broad)
- [x] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (multi-server overlap)
- [ ] Server not visible in router (critical bug)
- [x] Other: Overly broad discovery results

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** High ambiguity with generic verbs.

---

## Test 62: Reuse an already discovered toolKey

**User Request:** Try a tool you already discovered earlier - do you need to rediscover?

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: channels_list()

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(channels_list) -> success (redacted)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Manual toolKey reuse required

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Reuse works but requires manual toolKey handling.

---

## Test 63: Find a tool that probably doesn't exist

**User Request:** Try "run python", "send tweet", "play music"

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (no such tools)

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_discovery("run python") -> unrelated tools
  2. tool_discovery("send tweet") -> unrelated tools
  3. tool_discovery("play music") -> unrelated tools

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (no null result)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (irrelevant tools)
- [ ] Server not visible in router (critical bug)
- [x] Other: No clear "no results" messaging beyond empty/irrelevant

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Discovery returns unrelated tools instead of hard fail.

---

## Test 64: Single-word queries

**User Request:** Try single-word queries ("calendar", "email", "text", "slack", "notion", "figma", "database")

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct tool access)

**Router (Actual):**
- Calls made: 7
- Call sequence:
  1. tool_discovery("calendar") -> mixed Krisp + Workspace
  2. tool_discovery("email") -> Gmail tools
  3. tool_discovery("text") -> docs-related tools (unexpected)
  4. tool_discovery("slack") -> Slack tools
  5. tool_discovery("notion") -> Notion tools
  6. tool_discovery("figma") -> limited Figma tools
  7. tool_discovery("database") -> Notion tools, not Supabase

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively ("text", "database")
- [x] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (server overlap)
- [ ] Server not visible in router (critical bug)
- [x] Other: Keyword routing inconsistent

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Single-word queries often mis-route.

---

## Test 65: Action-based queries

**User Request:** Try action-based queries ("create", "delete", "update", "search", "query", "get")

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct tool access)

**Router (Actual):**
- Calls made: 6
- Call sequence:
  1. tool_discovery("create") -> mostly Workspace create tools
  2. tool_discovery("delete") -> mixed
  3. tool_discovery("update") -> mixed
  4. tool_discovery("search") -> mixed across servers
  5. tool_discovery("query") -> Notion/Supabase mix
  6. tool_discovery("get") -> huge result list

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (too broad)
- [x] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (multi-server)
- [ ] Server not visible in router (critical bug)
- [x] Other: Action verbs too generic to be useful

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Discovery is noisy for generic verbs.

---

## Test 66: Minimal detail tool discovery then call without params

**User Request:** Find a tool with minimal detail, then try to call it without seeing parameters

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: conversations_history(channel_id)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_discovery(detailLevel="minimal", query="conversations_history") -> no params shown
  2. tool_execute(conversations_history) -> error (missing channel_id)

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (channel_id)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Minimal detail insufficient to call tool

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Minimal detail not usable for execution.

---

## Test 67: Compare discovery detail levels (minimal vs summary vs full)

**User Request:** Compare discovery with minimal vs summary vs full detail levels for same tool

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (direct doc/typing in native)

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_discovery(detailLevel="minimal", query="create_event")
  2. tool_discovery(detailLevel="summary", query="create_event")
  3. tool_discovery(detailLevel="full", query="create_event") -> only full showed full param list

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (until full detail)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Full detail often required, increases token cost.

---

## Test 68: Call a complex tool (create_event)

**User Request:** Try to call a complex tool (like create_event)

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: create_event(calendar_id, start, end, summary)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(create_event, start/end only) -> error (missing user_google_email / auth)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (required fields unclear)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Workspace auth blocked call

**Cognitive Load:** High
**Time to First Result:** Fast
**Success:** No

**Notes:** Complex tools unusable without auth and full schema.

---

## Test 69: Call a tool requiring specific ID format

**User Request:** Try calling a tool that requires a specific ID format

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: notion-fetch(page_id)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(notion-fetch, id="invalid") -> validation error

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (ID format)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: No examples of valid ID formats in discovery

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** No

**Notes:** ID format requirements not discoverable.

---

## Test 70: Use an invalid toolKey

**User Request:** Try using an expired/invalid/made-up toolKey

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A (no toolKey concept)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(toolKey="0000...") -> error (invalid toolKey)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: ToolKey lifecycle error requires rediscovery

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Error messaging is clear but adds friction.

---

## Test 71: Call tool with missing required parameters

**User Request:** Try calling a tool with missing required parameters

**Native MCP (Hypothetical):**
- Calls needed: 1
- Would call: get_messages(chat_id)

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_execute(get_messages) -> error (requires chat_id or participants)

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [x] Had to guess parameters (required fields)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Error response helpful but still trial-and-error.

---

## Test 72: Discovery query returns 0 results

**User Request:** Try a discovery query that returns 0 results

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery("asdfghjkl") -> 0 tools returned

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [x] Search terms didn't match intuitively (no results)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Clear 0 results.

---

## Test 73: Call same tool twice with same toolKey

**User Request:** Try calling the same tool twice with the same toolKey

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: channels_list() twice

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_execute(channels_list) -> success
  2. tool_execute(channels_list) -> success

**Friction Points:**
- [ ] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (which ones?)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Low
**Time to First Result:** Fast
**Success:** Yes

**Notes:** ToolKey reuse stable within session.

---

## Test 74: Query returns too many results (maxResults limit)

**User Request:** Try a query that returns too many results (maxResults limit)

**Native MCP (Hypothetical):**
- Calls needed: 0
- Would call: N/A

**Router (Actual):**
- Calls made: 1
- Call sequence:
  1. tool_discovery(query="get", maxResults=1) -> 1 result returned, no indication of total

**Friction Points:**
- [x] Extra discovery call needed
- [ ] Multiple discoveries for multi-service request
- [ ] Had to guess parameters (maxResults)
- [x] Search terms didn't match intuitively (too broad)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (broad results)
- [ ] Server not visible in router (critical bug)
- [x] Other: No total count or pagination hints

**Cognitive Load:** Medium
**Time to First Result:** Fast
**Success:** Yes

**Notes:** Hard to know if results are truncated.

---

## Test 75: Morning Catchup

**User Request:** Give me a summary of what I missed - unread texts, important emails, Slack mentions, and Notion updates

**Native MCP (Hypothetical):**
- Calls needed: 4
- Would call: get_unread(), search_gmail_messages(is:unread), conversations_search_messages(is:mention), search(query="updated")

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_execute(get_unread) -> unread iMessages (redacted)
  2. tool_execute(search_gmail_messages, query="is:unread") -> error (auth)
  3. tool_execute(conversations_search_messages, query="is:mention") -> results (redacted)
  4. tool_execute(notion-search, query="updated") -> mixed results

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query syntax)
- [x] Search terms didn't match intuitively (Notion results noisy)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail blocked by auth

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Today is 2026-02-01; Gmail portion blocked.

---

## Test 76: Meeting Prep

**User Request:** I have a meeting about [project] - find all related emails, Slack discussions, Notion pages, Figma files, and calendar context

**Native MCP (Hypothetical):**
- Calls needed: 5
- Would call: search_gmail_messages(), conversations_search_messages(), search(), get_file()/get_comments(), get_events()

**Router (Actual):**
- Calls made: 5
- Call sequence:
  1. tool_execute(conversations_search_messages, query="Scream") -> results (redacted)
  2. tool_execute(notion-search, query="Scream") -> mixed results
  3. tool_execute(search_gmail_messages, query="Scream") -> error (Missing session ID)
  4. tool_execute(get_events, date_range=upcoming) -> error (auth)
  5. tool_execute(read_comments, file_key=[redacted]) -> error (invalid key)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (queries, file_key)
- [x] Search terms didn't match intuitively (Notion noise)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail/Calendar auth blocked; Figma key missing

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Multi-server workflow heavily blocked by auth/tool gaps.

---

## Test 77: Person Search

**User Request:** What has [person] communicated to me recently across all channels?

**Native MCP (Hypothetical):**
- Calls needed: 4
- Would call: conversations_search_messages(from:person), search_gmail_messages(from:person), search(iMessage), search(Notion)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_execute(conversations_search_messages, query="from:nick") -> results (redacted)
  2. tool_execute(search, query="Nick") -> iMessage results (some false positives)
  3. tool_execute(search_gmail_messages, query="from:nick") -> error (auth)
  4. tool_execute(notion-search, query="Nick") -> mixed results

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query filters)
- [x] Search terms didn't match intuitively (iMessage false positives; Notion noise)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail blocked by auth

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Slack + iMessage OK; Gmail blocked.

---

## Test 78: Project Status

**User Request:** Gather all recent communications about [project] from email, Slack, texts, and Notion

**Native MCP (Hypothetical):**
- Calls needed: 4
- Would call: search_gmail_messages(), conversations_search_messages(), search(iMessage), search(Notion)

**Router (Actual):**
- Calls made: 4
- Call sequence:
  1. tool_execute(conversations_search_messages, query="CringeMart") -> results (redacted)
  2. tool_execute(search, query="CringeMart") -> iMessage results (none)
  3. tool_execute(search_gmail_messages, query="CringeMart") -> error (auth)
  4. tool_execute(notion-search, query="CringeMart") -> results (mixed types)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query strings)
- [x] Search terms didn't match intuitively (Notion noise)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo)
- [ ] Server not visible in router (critical bug)
- [x] Other: Gmail blocked by auth

**Cognitive Load:** High
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** Email portion blocked.

---

## Test 79: Calendar Conflict Check

**User Request:** Am I free next Tuesday? Check calendar and any texts/slacks about that day

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: query_freebusy(time_range), search(iMessage), conversations_search_messages()

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_execute(query_freebusy, time_range=2026-02-03) -> error (auth)
  2. tool_execute(conversations_search_messages, query="2/3") -> results (redacted)
  3. tool_execute(search, query="2/3") -> iMessage results (none)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (date range)
- [x] Search terms didn't match intuitively (date search)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: Calendar blocked by auth

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Partial

**Notes:** "Next Tuesday" from 2026-02-01 is 2026-02-03.

---

## Test 80: Design Review

**User Request:** Find the Figma file for [project], get comments, and check related Slack discussions

**Native MCP (Hypothetical):**
- Calls needed: 2
- Would call: get_comments(file_key), conversations_search_messages(query)

**Router (Actual):**
- Calls made: 2
- Call sequence:
  1. tool_execute(conversations_search_messages, query="figma.com [project]") -> found Figma file key (redacted)
  2. tool_execute(read_comments, file_key=[redacted]) -> comments returned (redacted)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (extract file_key from Slack)
- [ ] Search terms didn't match intuitively (what failed?)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [ ] Tool name ambiguity (same name, different servers)
- [ ] Server not visible in router (critical bug)
- [x] Other: File_key discovery depends on Slack content

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Success depended on finding a link in Slack.

---

## Test 81: Code Research

**User Request:** Look up documentation for [library] and find any related Notion notes I have

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: resolve_library_id(), get_library_docs(), search(Notion)

**Router (Actual):**
- Calls made: 3
- Call sequence:
  1. tool_execute(resolve_library_id, query="axios") -> libraryId returned
  2. tool_execute(get_library_docs, libraryId=[redacted], query="overview") -> docs returned (redacted)
  3. tool_execute(notion-search, query="Axios") -> results (mixed types)

**Friction Points:**
- [ ] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (query strings)
- [x] Search terms didn't match intuitively (Notion noise)
- [ ] Had to retry with different query
- [x] UUID management overhead
- [ ] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo)
- [ ] Server not visible in router (critical bug)
- [ ] Other: None

**Cognitive Load:** Medium
**Time to First Result:** Moderate
**Success:** Yes

**Notes:** Context7 reliable; Notion search includes non-page items.

---

## Test 82: Meeting Follow-up

**User Request:** Get the Krisp transcript from yesterday's meeting and find follow-up context

**Native MCP (Hypothetical):**
- Calls needed: 3
- Would call: search_meetings(search="yesterday"), get_document(meeting_id), search(Notion)

**Router (Actual):**
- Calls made: 6
- Call sequence:
  1. tool_discovery("krisp get document") -> get_document (+ search_meetings)
  2. tool_execute(search_meetings, search="yesterday") -> meetings returned (not from 2026-01-31)
  3. tool_execute(get_document, documentId=[redacted]) -> transcript returned (redacted)
  4. tool_execute(notion-search, query="action item") -> error (invalid toolKey)
  5. tool_discovery("notion search") -> notion-search
  6. tool_execute(notion-search, query="follow-up") -> mixed results (mail/calendar/pages)

**Friction Points:**
- [x] Extra discovery call needed
- [x] Multiple discoveries for multi-service request
- [x] Had to guess parameters (documentId, query)
- [x] Search terms didn't match intuitively ("yesterday" returned older meeting)
- [x] Had to retry with different query
- [x] UUID management overhead
- [x] Needed full detail level to see params
- [x] Tool name ambiguity (Notion cross-silo results)
- [ ] Server not visible in router (critical bug)
- [x] Other: ToolKey invalidation forced rediscovery

**Cognitive Load:** High
**Time to First Result:** Slow
**Success:** Partial

**Notes:** "Yesterday" from 2026-02-01 is 2026-01-31, but search returned older meetings.

---

# Final Report

### 1. Executive Summary
- Overall friction score: 8/10
- Top 3 biggest pain points:
  1. Workspace-mcp auth requirements (user_google_email / session) block nearly all Gmail/Calendar/Drive/Docs tasks.
  2. Tool discovery is noisy and ambiguous; natural-language queries often return wrong servers.
  3. Incomplete server tool coverage (Figma, Supabase, Svelte, Notion) prevents core workflows.
- Top 3 things that work well:
  1. iMessage tools are fast and reliable for search/unread.
  2. Slack basic tools (channels_list, search) generally work.
  3. Context7 library docs lookup is straightforward and useful.
- One-sentence verdict: The router proves the concept but is too fragile for real workflows due to auth blockers, missing tools, and high discovery/parameter friction.

---

### 2. Critical Bugs Found
- Workspace-mcp read tools fail with missing user_google_email / session for Gmail, Calendar, Drive, Docs, Tasks, Contacts, Forms.
- Figma server missing key tools (get_file, get_images, get_team_projects, get_team_components).
- Supabase server returns mismatched tools and fails on access; core query/list functions unusable.
- Notion server lacks get_page/get_block_children and get_comments, preventing content retrieval.
- Svelte server missing search_docs (only get_docs).
- tool_discovery sometimes omits input schema (e.g., Krisp get_document), forcing guesswork.

---

### 3. Quantitative Analysis

| Metric | Value |
|--------|-------|
| Total tests run | 82 |
| Total native calls (hypothetical) | 118 |
| Total router calls (actual) | 213 |
| Average overhead percentage | ~47% (excludes discovery-only tests; ~80% if included) |
| Discovery success rate (first try) | ~60% (approx) |
| Parameter guessing frequency | ~28/82 tests (approx) |
| Tests requiring retry | ~7/82 tests (approx) |
| Tests that failed completely | 30/82 |
| Servers visible out of 9 | 9/9 |

---

### 4. Friction Breakdown by Category

| Category | Avg Native Calls | Avg Router Calls | Overhead | Notes |
|----------|------------------|------------------|----------|-------|
| Simple single-tool (Workspace) | 1.00 | 2.00 | 100% | All failed due to auth |
| Simple single-tool (iMessage) | 1.00 | 1.83 | 83% | Mostly successful |
| Simple single-tool (Slack) | 1.00 | 1.80 | 80% | Filters unreliable |
| Simple single-tool (Notion) | 1.00 | 2.00 | 100% | Search noisy; missing page tools |
| Simple single-tool (Figma) | 1.00 | 1.20 | 20% | Low overhead due to missing tools |
| Simple single-tool (Supabase) | 1.00 | 2.00 | 100% | Access/auth failures |
| Simple single-tool (Context7/Krisp/Svelte) | 1.60 | 2.60 | 62.5% | Context7 good; Svelte missing search |
| Multi-tool same-server | 2.33 | 1.83 | -21% | Failed early (auth/tool gaps) |
| Multi-tool cross-server | 2.27 | 4.09 | 80% | High discovery + auth failures |
| Discovery edge cases | ~0.14 | 5.00 | N/A | Baseline not comparable |

---

### 5. Search/Discovery Analysis

**Query Terms That Work Well:**
- Server names: "imessage", "slack", "notion", "figma", "supabase", "krisp", "context7", "svelte"
- Explicit tool terms: "channels_list", "conversations_history", "search_gmail_messages"

**Query Terms That Fail or Return Unexpected Results:**
- Natural language: "send a text", "check my inbox", "look at my files", "find my designs", "check my database"
- Single words: "text" (Doc tools), "database" (Notion instead of Supabase)

**Server Name Matching:**
- "imessage"/"slack"/"notion"/"figma"/"supabase"/"krisp"/"context7"/"svelte": generally works.
- "gmail": returns Gmail tools but still blocked by auth.

**Natural Language Understanding:**
- Weak; returns mixed servers and irrelevant tools without a clear ranking or intent routing.

---

### 6. Parameter Discovery Analysis

**Minimal Detail Level:**
- Often only tool name/description; missing required params (Test 66).
- Not sufficient for execution.

**Summary Detail Level:**
- Better context, but still missing required fields (create_event still unclear).

**Full Detail Level:**
- Often necessary to know required params (Test 67).
- Still incomplete for some tools (Krisp get_document lacks explicit input schema).

**Token Cost Implications:**
- Full detail is verbose; frequent use increases friction and cognitive load.

---

### 7. Worst Experiences (Ranked)

1. Google Workspace tasks (Tests 2-11) - Auth blocked everything.
2. Supabase tasks (Tests 33-36) - Access errors + mismatched tooling.
3. Figma workflows (Tests 28-32, 47, 56) - Missing core tools; file_key dependence.
4. Notion content retrieval (Tests 24-27) - Search only; no page content/comments.
5. Cross-server workflows with Gmail/Calendar (Tests 49-54, 75-79) - partial failures dominate.

---

### 8. Best Experiences (Ranked)

1. iMessage unread/search (Tests 12-17) - fast, consistent.
2. Slack channels list + basic search (Tests 19-20) - reliable core functionality.
3. Context7 docs lookup (Tests 37, 41, 81) - clear two-step flow, good results.

---

### 9. Recommendations (Ranked by Impact)

**Quick Wins (Easy to implement, high impact):**
1. Add global auth context for Workspace tools (user_google_email and session status surfaced once).
2. Always include input schema/required params in discovery (even in summary).
3. Auto-cache toolKeys per tool name to remove manual UUID handling.

**Medium Effort:**
1. Improve discovery ranking for natural language; add server filters.
2. Provide "Notion-only" search filter to avoid mail/calendar noise.
3. Add built-in helpers for IDs (channel_id lookup, Figma file_key lookup).

**Larger Changes:**
1. Optional direct tool invocation by name (router resolves toolKey automatically).
2. Cross-tool pipeline execution (search -> auto-pass IDs into get_*).
3. Unified "messages" and "files" abstraction to reduce multi-server friction.

---

### 10. Comparison Matrix

| Capability | Ideal Native | Current Router | Gap |
|------------|--------------|----------------|-----|
| Single-tool task | 1 call | ~2 calls | +1 discovery |
| Multi-tool workflow (2 tools) | 2 calls | ~4 calls | +2 discoveries |
| Multi-tool workflow (3+ tools) | N calls | ~2N calls | Discovery overhead scales |
| Tool discovery | Instant/none | 1+ calls per tool | High |
| Parameter knowledge | Built-in | Often missing | High |
| Server visibility | 9/9 | 9/9 | None |
| Caching within conversation | N/A | Partial/manual | Moderate |
| Search by server name | N/A | Works | Low |

---

### 11. Alternative Architecture Ideas

1. Session Tool Registry: Preload all tools once per session; allow direct calls by name without toolKeys.
2. Typed Tool Proxy: Generate a typed interface with required params and examples to eliminate guessing.
3. Unified Query Layer: Provide a "messages" and "files" abstraction that auto-routes to Slack/iMessage/Gmail/Drive/Notion with consistent filters.
