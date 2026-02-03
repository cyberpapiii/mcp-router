import { BaseRepository } from "@/main/infrastructure/database/base-repository";
import type { SqliteManager } from "@/main/infrastructure/database/sqlite-manager";
import { getSqliteManager } from "@/main/infrastructure/database/sqlite-manager";
import type {
  ClientSkillState,
  ClientSkillStateType,
  SkillSource,
  SymlinkStatus,
} from "@mcp_router/shared";

// Note: The ClientSkillState interface uses 'source' for SkillSource field,
// but we use 'source_type' in the database for clarity

/**
 * Repository for managing per-client skill states
 * Tracks which skills are enabled/disabled for each client app
 */
export class ClientSkillStateRepository extends BaseRepository<ClientSkillState> {
  private static instance: ClientSkillStateRepository | null = null;

  private constructor(db: SqliteManager) {
    super(db, "client_skill_states");
  }

  public static getInstance(): ClientSkillStateRepository {
    const db = getSqliteManager();
    if (
      !ClientSkillStateRepository.instance ||
      ClientSkillStateRepository.instance.database !== db
    ) {
      ClientSkillStateRepository.instance = new ClientSkillStateRepository(db);
    }
    return ClientSkillStateRepository.instance;
  }

  public static resetInstance(): void {
    ClientSkillStateRepository.instance = null;
  }

  protected initializeTable(): void {
    this.db.execute(`
      CREATE TABLE IF NOT EXISTS client_skill_states (
        id TEXT PRIMARY KEY,
        skill_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'not-installed',
        is_managed INTEGER NOT NULL DEFAULT 0,
        source_type TEXT NOT NULL DEFAULT 'local',
        discovered_path TEXT,
        symlink_status TEXT NOT NULL DEFAULT 'none',
        last_sync_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(skill_id, client_id)
      )
    `);

    // Create indexes for common query patterns
    this.db.execute(
      "CREATE INDEX IF NOT EXISTS idx_client_skill_states_skill_id ON client_skill_states(skill_id)",
    );
    this.db.execute(
      "CREATE INDEX IF NOT EXISTS idx_client_skill_states_client_id ON client_skill_states(client_id)",
    );
    this.db.execute(
      "CREATE INDEX IF NOT EXISTS idx_client_skill_states_state ON client_skill_states(state)",
    );
  }

  protected mapRowToEntity(row: any): ClientSkillState {
    return {
      id: row.id,
      skillId: row.skill_id,
      clientId: row.client_id,
      state: row.state as ClientSkillStateType,
      isManaged: row.is_managed === 1,
      source: row.source_type as SkillSource,
      discoveredPath: row.discovered_path ?? undefined,
      symlinkStatus: row.symlink_status as SymlinkStatus,
      lastSyncAt: row.last_sync_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  protected mapEntityToRow(entity: ClientSkillState): Record<string, any> {
    const now = Date.now();
    return {
      id: entity.id,
      skill_id: entity.skillId,
      client_id: entity.clientId,
      state: entity.state,
      is_managed: entity.isManaged ? 1 : 0,
      source_type: entity.source,
      discovered_path: entity.discoveredPath ?? null,
      symlink_status: entity.symlinkStatus,
      last_sync_at: entity.lastSyncAt ?? null,
      created_at: entity.createdAt ?? now,
      updated_at: now,
    };
  }

  /**
   * Find state by skill and client combination
   */
  public findBySkillAndClient(
    skillId: string,
    clientId: string,
  ): ClientSkillState | null {
    const row = this.db.get<any>(
      "SELECT * FROM client_skill_states WHERE skill_id = :skillId AND client_id = :clientId",
      { skillId, clientId },
    );

    return row ? this.mapRowToEntity(row) : null;
  }

  /**
   * Find all states for a skill
   */
  public findBySkill(skillId: string): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE skill_id = :skillId ORDER BY client_id",
      { skillId },
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all states for a client
   */
  public findByClient(clientId: string): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE client_id = :clientId ORDER BY skill_id",
      { clientId },
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all enabled states for a skill
   */
  public findEnabledBySkill(skillId: string): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE skill_id = :skillId AND state = 'enabled' ORDER BY client_id",
      { skillId },
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all enabled states for a client
   */
  public findEnabledByClient(clientId: string): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE client_id = :clientId AND state = 'enabled' ORDER BY skill_id",
      { clientId },
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Delete all states for a skill (cleanup when skill is deleted)
   */
  public deleteBySkill(skillId: string): void {
    this.db.execute(
      "DELETE FROM client_skill_states WHERE skill_id = :skillId",
      { skillId },
    );
  }

  /**
   * Delete all states for a client (cleanup when client is removed)
   */
  public deleteByClient(clientId: string): void {
    this.db.execute(
      "DELETE FROM client_skill_states WHERE client_id = :clientId",
      { clientId },
    );
  }

  /**
   * Upsert a client skill state (insert or update based on skill_id + client_id)
   */
  public upsert(state: Omit<ClientSkillState, "id">): ClientSkillState {
    const existing = this.findBySkillAndClient(state.skillId, state.clientId);

    if (existing) {
      const updated = this.update(existing.id, state);
      if (!updated) {
        throw new Error(
          `Failed to update client skill state for skill=${state.skillId}, client=${state.clientId}`,
        );
      }
      return updated;
    }

    return this.add(state);
  }

  /**
   * Bulk upsert multiple states in a transaction
   */
  public bulkUpsert(
    states: Omit<ClientSkillState, "id">[],
  ): ClientSkillState[] {
    return this.transaction(() => {
      return states.map((state) => this.upsert(state));
    });
  }

  /**
   * Update symlink status for a specific state
   */
  public updateSymlinkStatus(
    skillId: string,
    clientId: string,
    symlinkStatus: SymlinkStatus,
  ): ClientSkillState | null {
    const existing = this.findBySkillAndClient(skillId, clientId);
    if (!existing) {
      return null;
    }

    return this.update(existing.id, { symlinkStatus }) ?? null;
  }

  /**
   * Update last sync timestamp
   */
  public updateLastSyncAt(
    skillId: string,
    clientId: string,
  ): ClientSkillState | null {
    const existing = this.findBySkillAndClient(skillId, clientId);
    if (!existing) {
      return null;
    }

    return this.update(existing.id, { lastSyncAt: Date.now() }) ?? null;
  }

  /**
   * Find all states with broken symlinks
   */
  public findBrokenSymlinks(): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE symlink_status = 'broken' ORDER BY skill_id, client_id",
      {},
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Find all managed states (router manages the symlink)
   */
  public findManaged(): ClientSkillState[] {
    const rows = this.db.all<any>(
      "SELECT * FROM client_skill_states WHERE is_managed = 1 ORDER BY skill_id, client_id",
      {},
    );

    return rows.map((row) => this.mapRowToEntity(row));
  }

  /**
   * Count states by state type for a skill
   */
  public countByStateForSkill(
    skillId: string,
  ): Record<ClientSkillStateType, number> {
    const rows = this.db.all<{ state: string; count: number }>(
      "SELECT state, COUNT(*) as count FROM client_skill_states WHERE skill_id = :skillId GROUP BY state",
      { skillId },
    );

    const result: Record<ClientSkillStateType, number> = {
      enabled: 0,
      disabled: 0,
      "not-installed": 0,
    };

    for (const row of rows) {
      if (row.state in result) {
        result[row.state as ClientSkillStateType] = row.count;
      }
    }

    return result;
  }
}
