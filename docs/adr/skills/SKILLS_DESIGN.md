# Agent Skills Management Design

## Overview

Agent Skills is an open standard for teaching AI agents specialized knowledge and workflows. MCP Router centrally manages Skills and automatically creates symbolic links to each AI agent's personal directory.

## Architecture

### Module Structure

```
apps/electron/src/main/modules/skills/
├── agent-path.repository.ts # Agent path DB operations
├── skills-agent-paths.ts    # Agent path utilities
├── skills-file-manager.ts   # File system operations
├── skills.repository.ts     # Database operations
├── skills.service.ts        # Business logic
└── skills.ipc.ts            # IPC handlers
```

### Type Definitions

```
packages/shared/src/types/
├── skill-types.ts                      # Domain types
└── platform-api/domains/skills-api.ts  # API types
```

## Data Model

### Skill Entity

```typescript
interface Skill {
  id: string;
  name: string;              // Directory name (unique), path can be derived from name
  projectId: string | null;  // Optional project association
  enabled: boolean;          // Skill enabled/disabled state
  createdAt: number;
  updatedAt: number;
}

// For API responses (includes content)
interface SkillWithContent extends Skill {
  content: string | null;    // SKILL.md content
}
```

> **Note:** The skill folder path can be derived from `name` (`{userData}/skills/{name}`), so it is not stored in the DB.

## API Design

Consolidated into CRUD + actions, with a nested `agentPaths` sub-API for managing agent integrations.

```typescript
interface SkillsAPI {
  // CRUD operations
  list: () => Promise<SkillWithContent[]>;
  create: (input: CreateSkillInput) => Promise<Skill>;
  update: (id: string, updates: UpdateSkillInput) => Promise<Skill>;
  delete: (id: string) => Promise<void>;

  // Actions
  openFolder: (id?: string) => Promise<void>;  // Omit id to open entire skills directory
  import: () => Promise<Skill>;                 // Folder selection dialog → import

  // Agent Paths sub-API
  agentPaths: {
    list: () => Promise<AgentPath[]>;           // List all agent paths
    create: (input: CreateAgentPathInput) => Promise<AgentPath>;  // Add custom agent path
    delete: (id: string) => Promise<void>;      // Remove agent path
    selectFolder: () => Promise<string | null>; // Open folder selection dialog, return selected path
  };
}

// enabled/content can also be updated via update
interface UpdateSkillInput {
  name?: string;
  projectId?: string | null;
  enabled?: boolean;
  content?: string;
}

interface CreateAgentPathInput {
  name: string;
  path: string;
}
```

## Supported Agents

By default, 5 agents are supported and registered as initial data in the `agent_paths` table. Users can add or remove custom agent paths through the UI.

| Agent | Skills Directory |
|-------|-----------------|
| Claude Code | `~/.claude/skills` |
| OpenAI Codex | `~/.codex/skills` |
| GitHub Copilot | `~/.copilot/skills` |
| Cline | `~/.cline/skills` |
| OpenCode | `~/.config/opencode/skill` |

### Custom Agent Paths

Users can add custom agent paths from the "Integrations" page. Added paths are saved in the `agent_paths` table, and symbolic links are created when skills are enabled.

## Key Design Decisions

### 1. Automatic Symlink Creation

When a skill is created, symbolic links are automatically created for all agents. This allows users to manage skills in one place and share the same skill across multiple agents.

### 2. Filesystem-based Symlink Management

Symlink state is managed with the filesystem as the source of truth. Instead of tracking symlinks in the DB, we maintain simplicity by syncing with the filesystem at startup.

### 3. Skill Enable/Disable Toggle

Each skill can be toggled On/Off. When disabled, symbolic links are removed from all agents; when enabled, they are recreated. The UI provides a simple switch for toggling.

### 4. Optional Project Association

Skills can optionally be associated with a project. Managed via `projectId: string | null`.

### 5. SKILL.md Template Generation

A SKILL.md template is automatically generated when a skill is created.

### 6. Symlink Verification & Repair

At app startup, symlink state is verified and broken links are automatically repaired (recreated).

### 7. Folder Import

External folders can be imported via a folder selection dialog. When imported, they are copied to the skills directory and symbolic links are automatically created.

## Storage Location

Skills are stored in:
- macOS: `~/Library/Application Support/MCP Router/skills/`
- Windows: `%APPDATA%/MCP Router/skills/`
- Linux: `~/.config/MCP Router/skills/`

## Database Schema

### skills table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| name | TEXT | Unique skill name (path derived from `{userData}/skills/{name}`) |
| project_id | TEXT | Optional project ID |
| enabled | INTEGER | 1=enabled, 0=disabled |
| created_at | INTEGER | Timestamp |
| updated_at | INTEGER | Timestamp |

### agent_paths table

Manages agent paths used as symlink destinations.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| name | TEXT | Unique agent name (e.g., "claude-code") |
| path | TEXT | Skills directory path (e.g., "~/.claude/skills") |
| created_at | INTEGER | Timestamp |
| updated_at | INTEGER | Timestamp |

The 5 standard agents are automatically registered on first launch.

## Future Considerations

1. **Remote Workspace Support**: Currently only local workspaces are supported
2. **Skill Export**: Skill export/backup functionality (import is already implemented)
3. **Skill Templates**: Pre-defined skill templates
4. **Cloud Sync**: Skill synchronization via cloud
