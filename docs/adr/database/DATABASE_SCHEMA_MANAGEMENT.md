# ADR: Unification of Database Schema Management

## Status
Approved (Implemented August 2025)

## Context
In the MCP Router project, there were 9 repository classes for managing multiple database tables.
Initially, these repository classes directly wrote SQL statements within their respective initializeTable() methods.
Additionally, some tables (hooks) were also created in migration files, causing the following issues:

1. **Duplicate table definitions**: Same table definitions exist in multiple locations
2. **Inconsistent management**: Schema definition files exist but are not utilized
3. **Reduced maintainability**: Multiple locations need modification when changing table structure
4. **Ambiguous responsibility**: Table creation responsibility is distributed

## Decisions

### 1. Centralized Schema Definition Management
Manage all table definitions in TypeScript files under the `schema/tables/` directory. Each schema file has the following structure:

```typescript
import { DatabaseTableSchema } from "@mcp_router/shared";

export const TABLE_NAME_SCHEMA: DatabaseTableSchema = {
  createSQL: `CREATE TABLE IF NOT EXISTS ...`,
  indexes: [
    "CREATE INDEX IF NOT EXISTS ...",
    // Other indexes
  ]
};

export const TABLE_NAME_REQUIRED_COLUMNS = ["col1", "col2"];
```

### 2. Unified Pattern for Repository Classes
All repository classes import the corresponding schema definition and use it in the initializeTable() method:

```typescript
import { TABLE_SCHEMA } from "../../schema/tables/table-name";

protected initializeTable(): void {
  try {
    // Create table using schema definition
    this.db.execute(TABLE_SCHEMA.createSQL);

    // Create indexes from schema definition
    if (TABLE_SCHEMA.indexes) {
      TABLE_SCHEMA.indexes.forEach((indexSQL) => {
        this.db.execute(indexSQL);
      });
    }

    console.log(`[${this.constructor.name}] Table initialization completed`);
  } catch (error) {
    console.error(`[${this.constructor.name}] Error during table initialization:`, error);
    throw error;
  }
}
```

### 3. Aggregation via DATABASE_SCHEMA Object
Aggregate all schema definitions in the `database-schema.ts` file:

```typescript
export const DATABASE_SCHEMA = {
  servers: SERVERS_SCHEMA,
  requestLogs: REQUEST_LOGS_SCHEMA,
  settings: SETTINGS_SCHEMA,
  migrations: MIGRATIONS_SCHEMA,
  workspaces: WORKSPACES_SCHEMA,
  hooks: HOOKS_SCHEMA,
  tokens: TOKENS_SCHEMA,
} as const;
```

### 4. Migration Responsibility Scope
Migrations are responsible only for modifications to existing tables (ALTER TABLE) and do not create new tables. Table creation is executed during repository class initialization.

## Implementation Details

### Repository Class List and Mapping

| Repository Class | Table Name | Schema File | Inherits BaseRepository |
|---|---|---|---|
| HookRepository | hooks | hooks.ts | Yes |
| McpLoggerRepository | requestLogs | request-logs.ts | Yes |
| McpServerManagerRepository | servers | servers.ts | Yes |
| SettingsRepository | settings | settings.ts | No |
| McpAppsManagerRepository | tokens | tokens.ts | Yes |
| WorkspaceRepository | workspaces | workspaces.ts | Yes |

### Special Handling for SettingsRepository
SettingsRepository does not inherit from BaseRepository, so it implements its own initializeTable() method. However, it uses the same pattern with schema definitions.

## Consequences

### Advantages
1. **DRY principle achieved**: Complete elimination of duplicate table definitions
2. **Improved maintainability**: Table structure changes managed in one location
3. **Type safety**: Type checking via DatabaseTableSchema type
4. **Consistency**: All tables managed with the same pattern
5. **Readability**: Clear roles and easy-to-understand structure

### Disadvantages
1. **Initial implementation cost**: Modification of existing 9 repository classes required
2. **Indirection**: Need to reference separate file to check table definitions

## Alternatives Considered

### Alternative 1: Continue Direct SQL Statement Writing
Maintain the current approach of directly writing SQL statements in each repository class.
- Advantage: Direct and easy to understand
- Disadvantage: High duplication, low maintainability

### Alternative 2: ORM Introduction
Introduce an ORM such as TypeORM or Prisma.
- Advantage: Higher level of abstraction, migration management
- Disadvantage: Learning cost, increased dependencies, performance overhead

### Alternative 3: Schema Definition Auto-generation
Create schema definitions by reverse-engineering from the database.
- Advantage: Consistency with existing DB is guaranteed
- Disadvantage: Separate method needed for initial DB creation, challenges in CI/CD environments

## Future Considerations

1. **Schema versioning**: Consider methods for schema version management
2. **Migration strategy**: Support for more complex migrations
3. **Test strategy**: Add tests to ensure accuracy of schema definitions
4. **Documentation generation**: Auto-generate documentation from schema definitions

## References
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Overall database architecture design
