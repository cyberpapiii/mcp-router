# ADR: Quality of Life Features

## Status
Accepted

## Date
2026-01-29

## Context

MCP Router needed feature parity with mcp-hub for improved developer experience and external integration capabilities. The following features were identified as essential for production use:

1. External REST API for programmatic server management
2. Real-time event streaming for monitoring and integration
3. Server discovery from the official MCP registry
4. Automatic server restart during development
5. Production-ready structured logging

## Decision

Implemented 5 Quality of Life features that extend MCP Router's capabilities:

### 1. REST API

**Location:** `apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts`

Extends MCPHttpServer with `/api/*` endpoints for external control:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint |
| `/api/servers` | GET | List all servers with status |
| `/api/servers/:id/start` | POST | Start a specific server |
| `/api/servers/:id/stop` | POST | Stop a specific server |
| `/api/servers/:id/tools` | GET | List tools for a server |
| `/api/events` | GET | SSE event stream |
| `/api/marketplace` | GET | List marketplace servers |
| `/api/marketplace/:serverName` | GET | Get marketplace server details |

All endpoints require Bearer token authentication.

### 2. SSE Events

**Location:** `apps/electron/src/main/modules/event-bridge/event-bridge.service.ts`

EventBridge service broadcasts IPC events to SSE clients at `/api/events`:

- Subscribes to internal IPC event channels
- Maintains SSE client connections with keep-alive heartbeats
- Broadcasts events in JSON format with `event:` and `data:` fields
- Supports reconnection via `Last-Event-ID` header

Event types include:
- `server:status` - Server state changes
- `server:log` - Server log output
- `mcp:request` / `mcp:response` - MCP protocol traffic

### 3. Marketplace Integration

**Location:** `apps/electron/src/main/modules/marketplace/marketplace.service.ts`

Integrates official MCP Registry API at `registry.modelcontextprotocol.io`:

- Fetches server list with 1-hour caching to reduce API load
- Provides server details including description, repository, author
- Supports filtering and search through API parameters
- Graceful fallback when registry is unavailable

### 4. Hot Reload for Development

**Location:** `apps/electron/src/main/modules/dev-watcher/dev-watcher.service.ts`

DevWatcherService uses chokidar for file watching:

- Watches servers with `dev.enabled: true` in configuration
- Monitors `dev.watchPaths` directories for changes
- 500ms debounce to batch rapid file changes
- Auto-restarts server on detected changes
- Ignores `node_modules`, `.git`, and common build artifacts

Configuration in server definition:
```json
{
  "dev": {
    "enabled": true,
    "watchPaths": ["./src"],
    "command": "npm run dev"
  }
}
```

### 5. Structured Logging

**Location:** `apps/electron/src/main/modules/logging/logging.service.ts`

Pino-based structured logging with XDG-compliant file output:

- JSON-formatted logs for machine parsing
- Log levels: trace, debug, info, warn, error, fatal
- Automatic log file rotation by date
- 30-day log retention with automatic cleanup
- File output to `~/.local/share/mcp-router/logs/` (XDG_DATA_HOME)
- Configurable log level via settings

Log format:
```json
{
  "level": 30,
  "time": 1706540000000,
  "pid": 12345,
  "hostname": "machine",
  "module": "server-service",
  "msg": "Server started",
  "serverId": "abc123"
}
```

## Implementation Details

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCPHttpServer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ /api/health │  │ /api/servers│  │ /api/events (SSE)   │ │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘ │
└───────────────────────────────────────────────┼─────────────┘
                                                │
┌───────────────────────────────────────────────┼─────────────┐
│                    EventBridge                 │             │
│                        ↑                       │             │
│           IPC Events ──┴────────────────SSE────┘             │
└─────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────┼───────────────────────────────────┐
│              Internal Services                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ ServerService  │  │ DevWatcher     │  │ Marketplace    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  LoggingService (Pino)                       │
│           ~/.local/share/mcp-router/logs/                    │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies Added

- `chokidar` - File watching for hot reload
- `pino` - Structured logging
- `pino-pretty` - Log formatting for development

## Consequences

### Positive

- **External Integration**: REST API enables programmatic server management from external tools, scripts, and CI/CD pipelines
- **Real-time Monitoring**: SSE events allow building dashboards and monitoring systems
- **Server Discovery**: Marketplace integration simplifies finding and installing MCP servers
- **Developer Experience**: Hot reload eliminates manual server restarts during development
- **Production Readiness**: Structured logging enables log aggregation and analysis

### Considerations

- **Security**: All REST endpoints require authentication; SSE connections must be properly closed
- **Resource Usage**: File watching and SSE connections consume system resources
- **Cache Invalidation**: Marketplace cache may serve stale data for up to 1 hour
- **Log Storage**: 30-day retention may consume significant disk space for verbose logging

## Related Documentation

- [Platform API Architecture](./PLATFORM_API.md) - API design patterns
- [Security](../SECURITY.md) - Security considerations for new endpoints
