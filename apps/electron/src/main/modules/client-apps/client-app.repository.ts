import { BaseRepository } from "@/main/infrastructure/database/base-repository";
import type { SqliteManager } from "@/main/infrastructure/database/sqlite-manager";
import { getSqliteManager } from "@/main/infrastructure/database/sqlite-manager";
import type { ClientApp } from "@mcp_router/shared";

/**
 * Client app repository for database operations
 */
export class ClientAppRepository extends BaseRepository<ClientApp> {
  private static instance: ClientAppRepository | null = null;

  private constructor(db: SqliteManager) {
    super(db, "client_apps");
  }

  public static getInstance(): ClientAppRepository {
    const db = getSqliteManager();
    if (
      !ClientAppRepository.instance ||
      ClientAppRepository.instance.database !== db
    ) {
      ClientAppRepository.instance = new ClientAppRepository(db);
    }
    return ClientAppRepository.instance;
  }

  public static resetInstance(): void {
    ClientAppRepository.instance = null;
  }

  protected initializeTable(): void {
    this.db.execute(`
      CREATE TABLE IF NOT EXISTS client_apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        installed INTEGER NOT NULL DEFAULT 0,
        mcp_config_path TEXT NOT NULL,
        mcp_configured INTEGER NOT NULL DEFAULT 0,
        has_other_mcp_servers INTEGER NOT NULL DEFAULT 0,
        skills_path TEXT NOT NULL,
        skills_configured INTEGER NOT NULL DEFAULT 0,
        server_access TEXT NOT NULL DEFAULT '{}',
        token TEXT,
        is_standard INTEGER NOT NULL DEFAULT 0,
        is_custom INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  protected mapRowToEntity(row: any): ClientApp {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon ?? undefined,
      installed: Boolean(row.installed),
      mcpConfigPath: row.mcp_config_path,
      mcpConfigured: Boolean(row.mcp_configured),
      hasOtherMcpServers: Boolean(row.has_other_mcp_servers),
      skillsPath: row.skills_path,
      skillsConfigured: Boolean(row.skills_configured),
      serverAccess: row.server_access ? JSON.parse(row.server_access) : {},
      token: row.token ?? undefined,
      isStandard: Boolean(row.is_standard),
      isCustom: Boolean(row.is_custom),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  protected mapEntityToRow(entity: ClientApp): Record<string, any> {
    const now = Date.now();
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon ?? null,
      installed: entity.installed ? 1 : 0,
      mcp_config_path: entity.mcpConfigPath,
      mcp_configured: entity.mcpConfigured ? 1 : 0,
      has_other_mcp_servers: entity.hasOtherMcpServers ? 1 : 0,
      skills_path: entity.skillsPath,
      skills_configured: entity.skillsConfigured ? 1 : 0,
      server_access: JSON.stringify(entity.serverAccess ?? {}),
      token: entity.token ?? null,
      is_standard: entity.isStandard ? 1 : 0,
      is_custom: entity.isCustom ? 1 : 0,
      created_at: entity.createdAt ?? now,
      updated_at: now,
    };
  }

  /**
   * Find client app by name (case-insensitive)
   */
  public findByName(name: string): ClientApp | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    const row = this.db.get<any>(
      "SELECT * FROM client_apps WHERE name = :name COLLATE NOCASE",
      { name: trimmed },
    );

    return row ? this.mapRowToEntity(row) : null;
  }
}
