# Handoff Prompt: Continue Unified Skills Router Implementation

Copy and paste this prompt to a new Claude session to continue the work:

---

## Context

I'm working on the MCP Router project, implementing a **Unified Skills Router** feature. This transforms the skills system from a two-tab view ("My Skills" + "Discovered Skills") into a unified library where users can:
- See all skills in one view
- See which clients have each skill installed (via client icons)
- Enable/disable skills per-client
- Edit skills and sync changes across clients

## Current Status: ~85% Complete

The plan is at `~/.claude/plans/replicated-seeking-mountain.md`.

### What's Done:
- All backend services (UnifiedSkillsService, ClientSkillStateRepository)
- Database migration for `client_skill_states` table
- All IPC handlers
- All types (UnifiedSkill, ClientSkillSummary, etc.)
- Frontend components (SkillsManager, UnifiedSkillCard, UnifiedSkillDetailSheet, ClientStatusIcon)
- Preload API methods

### What's Broken (needs immediate fix):
**Discovered skills show placeholder content instead of actual SKILL.md content**

I debugged this and found the root cause:
1. The `transformToUnifiedSkills()` function in `SkillsManager.tsx` only creates client states for **installed** clients
2. Discovered skills can come from clients that aren't installed (e.g., "opencode", "gemini", "codex" which have skills dirs but aren't detected as installed)
3. When the source client isn't in the installed list, the transformation wasn't properly setting `sourcePath`

I applied a fix that:
- Dynamically adds the source client to clientStates even if not installed
- Added `readSkillMdFromPath()` method to read SKILL.md from any allowed path
- Added `getContentFromPath` API to fetch content from discovered skill paths

**The app needs to be restarted** (quit and reopen) to test if the fix works, since the main process changes require a restart.

### What Still Needs Work:

1. **Test the content loading fix** - After restart, click on a discovered skill and verify the SKILL.md content loads in the editor

2. ~~**Wire up detail sheet actions**~~ - **DONE** All action handlers in `UnifiedSkillDetailSheet.tsx` now call the proper APIs:
   - `handleEnableForClient()` - calls `platformAPI.skills.unified.enableForClient()`
   - `handleDisableForClient()` - calls `platformAPI.skills.unified.disableForClient()`
   - `handleRemoveFromClient()` - calls `platformAPI.skills.unified.removeFromClient()`
   - `handleInstallToClient()` - calls `platformAPI.skills.unified.enableForClient()` (install = enable)
   - `handleSyncToAll()` - calls `platformAPI.skills.unified.sync()`
   - `handleEnableAll()` - calls `window.electronAPI.enableAll()`
   - `handleDisableAll()` - calls `window.electronAPI.disableAll()`

3. **Add missing translations** - Console shows missing keys like `skills.unified.noDescription`, `skills.unified.clientStates`, etc.

4. **Test the full flow** - discover skill → adopt → sync to clients → enable/disable per-client

## Key Files

### Backend:
- `apps/electron/src/main/modules/skills/unified-skills.service.ts` - Main service
- `apps/electron/src/main/modules/skills/client-skill-state.repository.ts` - DB repository
- `apps/electron/src/main/modules/skills/unified-skills.ipc.ts` - IPC handlers
- `apps/electron/src/main/modules/skills/skills-file-manager.ts` - File operations (has `readSkillMdFromPath`)

### Frontend:
- `apps/electron/src/renderer/components/skills/SkillsManager.tsx` - Main view with `transformToUnifiedSkills()`
- `apps/electron/src/renderer/components/skills/UnifiedSkillDetailSheet.tsx` - Detail panel (fully wired up)
- `apps/electron/src/renderer/components/skills/UnifiedSkillCard.tsx` - Card component
- `apps/electron/src/renderer/components/skills/ClientStatusIcon.tsx` - Client icon with status

### Types:
- `packages/shared/src/types/skill-types.ts` - All skill types including `UnifiedSkill`
- `packages/shared/src/types/platform-api/domains/skills-api.ts` - API interface

## Progress Assessment

A detailed assessment is at: `docs/reviews/unified-skills-progress-assessment.md`

## Commands

```bash
# Dev server (should already be running)
pnpm dev

# Type check
pnpm typecheck

# Check for unused code
pnpm knip

# Lint
pnpm lint:fix
```

## First Steps

1. Check if the dev server is running (`pnpm dev` in terminal)
2. Restart the MCP Router app (quit and reopen)
3. Go to Skills Library and click on a discovered skill (marked with "DISCOVERED" badge)
4. Check if the SKILL.md content loads in the editor
5. If content loads, move on to wiring up the detail sheet actions
6. If content doesn't load, check browser DevTools console for errors

---

End of handoff prompt.
