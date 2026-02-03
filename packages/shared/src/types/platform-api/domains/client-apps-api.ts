/**
 * Client Apps management domain API
 */

import type {
  ClientApp,
  CreateClientAppInput,
  UpdateClientAppInput,
  ClientAppResult,
  ClientDetectionResult,
} from "../../client-app-types";
import type { DiscoveredSkill } from "../../skill-types";
import type { TokenServerAccess } from "../../token-types";

/**
 * Client Apps management API
 */
export interface ClientAppsAPI {
  // CRUD operations
  list: () => Promise<ClientApp[]>;
  get: (id: string) => Promise<ClientApp | null>;
  create: (input: CreateClientAppInput) => Promise<ClientAppResult>;
  update: (id: string, input: UpdateClientAppInput) => Promise<ClientAppResult>;
  delete: (id: string) => Promise<ClientAppResult>;

  // Detection and configuration
  detect: () => Promise<ClientDetectionResult[]>;
  configure: (id: string) => Promise<ClientAppResult>;

  // Server access
  updateServerAccess: (
    id: string,
    serverAccess: TokenServerAccess,
  ) => Promise<ClientAppResult>;

  // Folder selection (returns path or null if canceled)
  selectFolder: () => Promise<string | null>;

  // Skill discovery from client apps
  discoverSkillsFromClients: () => Promise<DiscoveredSkill[]>;
}
