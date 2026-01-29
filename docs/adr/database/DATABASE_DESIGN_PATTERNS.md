# ADR: Database Design Patterns

## Status
Approved (August 2025)

## Context
The database layer of the MCP Router project uses SQLite, accessed through the Better-SQLite3 library. As the project grew, the following design patterns needed to be established:

1. Abstraction of the data access layer
2. Unified error handling
3. Transaction management
4. Ensuring type safety

## Decisions

### 1. Adoption of Repository Pattern

#### BaseRepository Class
Implemented `BaseRepository<T>` as the base class for all repositories:

```typescript
export abstract class BaseRepository<T> {
  protected db: SqliteManager;
  protected tableName: string;

  constructor(db: SqliteManager, tableName: string) {
    this.db = db;
    this.tableName = tableName;
    this.initializeTable();
  }

  // Abstract methods
  protected abstract initializeTable(): void;
  protected abstract mapRowToEntity(row: any): T;
  protected abstract mapEntityToRow(entity: T): Record<string, any>;

  // Common CRUD operations
  public add(entity: T): void { /* ... */ }
  public getById(id: string): T | null { /* ... */ }
  public update(id: string, entity: Partial<T>): void { /* ... */ }
  public delete(id: string): boolean { /* ... */ }
  public getAll(options?: QueryOptions): T[] { /* ... */ }
}
```

#### Advantages
- Code reusability
- Consistent API interface
- Ensuring type safety
- Improved testability

### 2. DB Connection Management via SqliteManager

#### Design
```typescript
export class SqliteManager {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // Wrapper methods
  execute(sql: string, params?: any): Database.RunResult;
  get<T>(sql: string, params?: any): T | undefined;
  all<T>(sql: string, params?: any): T[];
  transaction<T>(fn: () => T): T;
}
```

#### Responsibilities
- Database connection management
- SQL query execution
- Transaction management
- Prepared statement management

### 3. Singleton Management via RepositoryFactory

```typescript
export class RepositoryFactory {
  private static instances: Record<string, any> = {};
  private static currentDb: SqliteManager | null = null;

  public static getRepository<T>(
    RepositoryClass: new (db: SqliteManager) => T,
    db: SqliteManager
  ): T {
    if (this.isDatabaseChanged(db)) {
      this.resetAllInstances();
      this.currentDb = db;
    }

    const key = RepositoryClass.name;
    if (!this.instances[key]) {
      this.instances[key] = new RepositoryClass(db);
    }

    return this.instances[key];
  }
}
```

### 4. Entity Mapping Strategy

#### Database Row to Entity
```typescript
protected mapRowToEntity(row: any): Entity {
  // Parse JSON strings
  // Type conversion (0/1 to boolean)
  // snake_case to camelCase conversion
  return {
    id: row.id,
    isActive: row.is_active === 1,
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: new Date(row.created_at)
  };
}
```

#### Entity to Database Row
```typescript
protected mapEntityToRow(entity: Entity): Record<string, any> {
  // JSON serialization
  // Type conversion (boolean to 0/1)
  // camelCase to snake_case conversion
  return {
    id: entity.id,
    is_active: entity.isActive ? 1 : 0,
    metadata: JSON.stringify(entity.metadata),
    created_at: entity.createdAt.toISOString()
  };
}
```

### 5. Error Handling

#### Unified Error Handling Pattern
```typescript
try {
  // Database operation
} catch (error) {
  console.error(`[${this.constructor.name}] Error during operation:`, error);
  throw error; // Handle at upper layer
}
```

### 6. Encryption Strategy

Sensitive data (tokens, passwords, etc.) is encrypted using Electron's safeStorage:

```typescript
protected mapEntityToRowForInsert(entity: Server): Record<string, any> {
  const row = this.mapEntityToRow(entity);

  // Encrypt sensitive data
  if (row.bearer_token && safeStorage.isEncryptionAvailable()) {
    row.bearer_token = safeStorage.encryptString(row.bearer_token)
      .toString('base64');
  }

  return row;
}
```

## Consequences

### Advantages
1. **Maintainability**: Easy-to-understand code through unified patterns
2. **Extensibility**: Easy addition of new entities
3. **Type safety**: Maximum utilization of TypeScript's type system
4. **Testability**: Easy mocking through dependency injection
5. **Security**: Automatic encryption of sensitive data

### Disadvantages
1. **Abstraction overhead**: Even simple operations go through multiple layers
2. **Learning curve**: Time required for new developers to understand

## Alternatives Considered

### Alternative 1: Active Record Pattern
Include data access logic within the entity itself.
- Advantage: Simple and intuitive
- Disadvantage: Unclear separation of responsibilities, difficult to test

### Alternative 2: Data Mapper Pattern (using ORM)
Use existing ORMs like TypeORM or Prisma.
- Advantage: Rich features, community support
- Disadvantage: Increased dependencies, performance overhead

## Future Considerations

1. **Query builder**: Implementation of type-safe builder for complex queries
2. **Caching strategy**: Caching of frequently accessed data
3. **Audit logging**: Automatic recording of data changes
4. **Performance optimization**: Review of index strategy

## References
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Overall database architecture
- [DATABASE_SCHEMA_MANAGEMENT.md](DATABASE_SCHEMA_MANAGEMENT.md) - Schema management strategy
