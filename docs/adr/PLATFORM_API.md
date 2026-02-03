# ADR: Platform API Architecture

## Status
Accepted

## Context

MCP Router is a cross-platform (Electron/Web) application centered around MCP server management. An API layer was needed to abstract frontend-backend communication and hide platform-specific implementations.

### Background

Initially, Electron's `window.electronAPI` was implemented with a flat structure that was simply abstracted, but the following issues existed:

1. **Unclear responsibility scope**: Related features were scattered, making methods difficult to find and understand
2. **Lack of type safety**: Many methods used `any` types
3. **Inconsistent error handling**: Different error handling patterns for each method
4. **Opaque platform differences**: Features unavailable in the web version were unknown until runtime

## Decision

### Modularization through Domain-Driven Design

Related features were reorganized into logical domains and structured into main domain APIs:

```typescript
// packages/shared/src/types/platform-api.ts
interface PlatformAPI {
  app: AppAPI;             // Application management (including token management)
  auth: AuthAPI;           // Authentication and authorization
  clientApps: ClientAppsAPI; // Client apps management (AI clients like Claude, Cursor)
  cloudSync: CloudSyncAPI; // Cloud synchronization
  logs: LogAPI;            // Log management
  marketplace: MarketplaceAPI; // MCP Registry marketplace
  packages: PackageAPI;    // Package management (including system utilities)
  projects: ProjectsAPI;   // Projects management
  servers: ServerAPI;      // MCP server management
  settings: SettingsAPI;   // Application settings
  skills: SkillsAPI;       // Skills management
  workflows: WorkflowAPI;  // Workflow and hook management
  workspaces: WorkspaceAPI; // Workspace management
}
```

## Implementation Details

### Current Codebase Structure

1. **Type definition locations**
   - `packages/shared/src/types/platform-api.ts`: Main interface definitions
   - `packages/shared/src/types/platform-api/domains/`: Type definitions for each domain API

2. **Implementation**
   - `apps/electron/src/renderer/platform-api/electron-platform-api.ts`: Implementation for Electron environment
   - `apps/electron/src/renderer/platform-api/remote-platform-api.ts`: Implementation for remote (Web) environment

3. **Backend Management**
   - `apps/electron/src/main/modules/workspace/platform-api-manager.ts`: API switching based on workspace

### Responsibilities of Each Domain API

#### ServerAPI
- CRUD operations for MCP servers
- Server start/stop/restart
- Status and metrics retrieval
- Log management

#### AuthAPI
- Login/logout
- Authentication status retrieval
- Authentication state change monitoring

#### AppAPI
- Opening external URLs
- Version information retrieval
- Token management (generation, validation, revocation)
- Update management

#### PackageAPI
- Package command resolution
- Package updates
- Package manager management
- System command checking

#### SettingsAPI
- Application settings get/update/reset
- Settings change monitoring
- Overlay count management

#### LogAPI
- Log queries
- Log clearing/export
- Real-time log update monitoring

#### WorkspaceAPI
- Workspace CRUD operations
- Active workspace management
- Workspace change monitoring

#### WorkflowAPI
- Workflow CRUD operations
- Workflow enable/disable
- Workflow execution order management
- Pre/post workflow processing

#### CloudSyncAPI
- Cloud synchronization status
- Sync trigger and management
- Conflict resolution

#### MarketplaceAPI
- MCP server search and discovery from official registry
- Server details and README fetching
- Skills search and discovery
- Skills installation from marketplace
- Cache management

#### ProjectsAPI
- Project CRUD operations
- Project configuration management
- Project-server associations

#### SkillsAPI
- Skills discovery and management
- Skills installation and removal
- Skills configuration

#### ClientAppsAPI
- Client app CRUD operations (list, get, create, update, delete)
- Client app detection (auto-detect installed AI clients)
- Client app configuration (configure MCP for clients)
- Server access control management
- Folder selection for paths

## Architecture Characteristics

### 1. Platform Abstraction

```typescript
// Electron implementation example
class ElectronPlatformAPI implements PlatformAPI {
  auth: AuthAPI = {
    signIn: (provider) => window.electronAPI.login(provider),
    signOut: () => window.electronAPI.logout(),
    // ...
  };
}
```

### 2. Type Safety

All API methods have clear type definitions, avoiding the use of `any` types:

```typescript
interface ServerAPI {
  list(): Promise<MCPServer[]>;
  get(id: string): Promise<MCPServer | null>;
  create(input: CreateServerInput): Promise<MCPServer>;
  // ...
}
```

### 3. Unified Callback Pattern

Event listeners adopt a unified pattern returning an `Unsubscribe` function:

```typescript
export type Unsubscribe = () => void;

interface AuthAPI {
  onAuthChange(callback: (status: AuthStatus) => void): Unsubscribe;
}
```

## Impact and Benefits

### Positives

1. **Improved Development Efficiency**
   - APIs organized by domain make searching easy
   - Improved IDE completion accuracy

2. **Improved Maintainability**
   - Related features are grouped and easier to understand
   - Clear impact scope when adding new features

3. **Type Safety**
   - Reduced runtime errors through strict type definitions
   - Improved refactoring safety

4. **Extensibility**
   - Easy to add new domains
   - Platform-specific implementations are hidden

### Considerations

1. **Learning curve**: Need to become familiar with the new API structure
2. **Domain boundaries**: May be uncertain where to place certain features (e.g., whether to include token management in AppAPI or make it independent)

## Future Direction

1. **Error handling improvements**: Consider introducing Result type pattern
2. **Async operation improvements**: Introduce Job API for long-running operations
3. **Batch operations**: Support bulk execution of multiple operations

## Conclusion

The domain-driven design reorganization of the Platform API has clarified the codebase structure and improved development efficiency and maintainability. This architecture meets MCP Router's cross-platform requirements while maintaining flexibility for future expansion.
