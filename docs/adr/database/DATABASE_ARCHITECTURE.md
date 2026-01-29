# ADR: Database Architecture

## Status
Approved

## Context
The database layer of the Electron application needs to support multiple workspaces and persist various entities (servers, agents, logs, etc.). The following requirements needed to be met:

- **Multi-workspace support**: Each workspace has an independent database
- **Type safety**: Safe data access utilizing TypeScript's type system
- **Performance**: Efficient processing of large amounts of log data
- **Maintainability**: Easy addition of new entities
- **Transaction management**: Guarantee data integrity

## Decision

### Directory Structure

```
apps/electron/src/main/infrastructure/database/
├── core/                      # Core database functionality
│   ├── base-repository.ts     # Repository base class
│   ├── database-context.ts    # Database context management
│   └── sqlite-manager.ts      # SQLite connection management
├── factories/                 # Factory pattern implementation
│   └── repository-factory.ts  # Repository instance management
├── migrations/                # Database migrations
│   ├── main-database-migration.ts  # Basic migration
│   └── workspace-main-database-migration.ts
├── repositories/              # Repository implementations
│   ├── log/                  # Log repository
│   ├── server/               # Server repository
│   ├── settings/             # Settings repository
│   ├── token/                # Token repository
│   └── workspace/            # Workspace repository
├── schema/                   # Schema definitions
│   ├── database-schema.ts    # Unified schema
│   ├── schema-utils.ts       # Schema utilities
│   └── tables/               # Individual table definitions
│       ├── hooks.ts
│       ├── migrations.ts
│       ├── request-logs.ts
│       ├── servers.ts
│       ├── settings.ts
│       ├── tokens.ts
│       └── workspaces.ts
└── ipc.ts                  # Public API
```

### Architecture Patterns

#### 1. Repository Pattern
```typescript
export abstract class BaseRepository<T extends { id: string }> {
  protected db: SqliteManager;
  protected tableName: string;

  // Common CRUD operations
  public getAll(options: any = {}): T[]
  public getById(id: string): T | undefined
  public create(data: Omit<T, 'id'>): T
  public update(id: string, data: Partial<T>): T | undefined
  public delete(id: string): boolean
}
```

Each entity's repository inherits from `BaseRepository` and adds entity-specific operations.

#### 2. Factory Pattern
```typescript
export class RepositoryFactory {
  private static instances: RepositoryInstances = {
    server: null,
    log: null,
    // ...
  };

  public static getServerRepository(db: SqliteManager): ServerRepository {
    if (this.isDatabaseChanged(db)) {
      this.resetAllInstances();
      this.currentDb = db;
    }

    if (!this.instances.server) {
      this.instances.server = new ServerRepository(db);
    }

    return this.instances.server;
  }
}
```

Centralizes the creation and management of repository instances, ensuring consistency during database switches.

#### 3. Context Pattern
```typescript
export class DatabaseContext {
  private currentDatabase: SqliteManager | null = null;

  public async getCurrentDatabase(): Promise<SqliteManager> {
    if (this.currentDatabase) {
      return this.currentDatabase;
    }

    if (!this.databaseProvider) {
      throw new Error("Database provider not configured");
    }

    return await this.databaseProvider();
  }
}
```

Manages the database context for the current workspace, maintaining consistency across the application.

### Database Selection: SQLite + better-sqlite3

#### Reasons for Selection
1. **Embedded database**: No external process required
2. **High performance**: better-sqlite3 provides fast synchronous API
3. **Transaction support**: Guarantees ACID properties
4. **Lightweight**: Ideal for Electron applications
5. **Type safety**: Good compatibility with TypeScript

### Multi-workspace Support

#### Database Separation
- **Main database** (`mcprouter.db`): Workspace information and global settings
- **Workspace database** (`workspace-{id}.db`): Data specific to each workspace

#### Processing During Workspace Switch
1. Close the current database connection
2. Open the new workspace's database
3. RepositoryFactory resets all repository instances
4. Recreate repositories with the new database

### Schema Management

#### Integration with Type Definitions
```typescript
// Schema definition
export const serversTableSchema = {
  id: "TEXT PRIMARY KEY",
  name: "TEXT NOT NULL",
  config: "TEXT NOT NULL", // JSON
  // ...
};

// Automatically synced with type definitions
export type ServerRecord = {
  id: string;
  name: string;
  config: string;
  // ...
};
```

#### Migration Strategy
1. **Automatic migration**: Executed at application startup
2. **Version management**: Managed via migrations table
3. **Backward compatibility**: Protection of existing data

### Performance Optimization

#### 1. Index Strategy
```sql
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_request_logs_serverId ON request_logs(serverId);
CREATE INDEX IF NOT EXISTS idx_request_logs_clientId ON request_logs(clientId);
```

#### 2. Batch Processing
```typescript
// Batch processing within transaction
this.db.transaction(() => {
  for (const item of items) {
    stmt.run(item);
  }
})();
```

#### 3. Prepared Statements
```typescript
const stmt = this.db.prepare("INSERT INTO servers VALUES (?, ?, ?)");
// Reusable
```

## Consequences

### Advantages
1. **Type safety**: Compile-time error detection
2. **Performance**: Fast access via synchronous API
3. **Maintainability**: Clear separation of responsibilities
4. **Extensibility**: Easy addition of new entities
5. **Reliability**: Data integrity through transactions

### Disadvantages
1. **SQLite limitations**: Limited concurrent writes
2. **Memory usage**: Memory consumption with large data volumes
3. **Backup**: Manual backup required

## Alternatives Considered

### 1. IndexedDB
- **Reason for rejection**: Not available in main process, complex API

### 2. PostgreSQL/MySQL
- **Reason for rejection**: Requires external process, complex deployment

### 3. LevelDB
- **Reason for rejection**: No SQL queries, unsuitable for relational data

## Security Considerations

1. **SQL injection prevention**: Use of prepared statements
2. **Data encryption**: Encryption of sensitive data (tokens)
3. **Access control**: Protection at file system level

## Future Extensibility

1. **Remote database**: Support for cloud synchronization
2. **Cache layer**: Addition of Redis-compatible cache
3. **Read-only replica**: Performance improvement
4. **Automatic backup**: Periodic backup functionality

## Update History
- **August 2025**: Unification of schema management
  - Updated all repositories to use schema definition files
  - Implemented centralized management via DATABASE_SCHEMA object
  - Limited migration responsibility to modifications of existing tables only
  - Added schema definitions for hooks and tokens tables

## References
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SQLite Best Practices](https://www.sqlite.org/bestpractice.html)
- [DATABASE_SCHEMA_MANAGEMENT.md](DATABASE_SCHEMA_MANAGEMENT.md) - Schema management strategy
- [DATABASE_DESIGN_PATTERNS.md](DATABASE_DESIGN_PATTERNS.md) - Database design patterns
