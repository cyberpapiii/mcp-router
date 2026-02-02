# MCP Server Info Cloud Sync (E2E Encrypted JSON Bundle) Design

## TL;DR
- Encrypt the existing JSON Export format and store all workspaces as a single encrypted blob (workspace list included).
- Keys are derived directly from a passphrase via KDF; the cloud cannot decrypt.
- Sync is a full replacement. Conflicts are resolved using server timestamp-based LWW (Last Write Wins).

## Background / Current State
- MCP server configurations are stored in plaintext in local SQLite.
- When stored in remote workspaces/cloud, there is a risk of sensitive information (`bearerToken`/`env`/`remoteUrl`) being handled in plaintext.
- There is a need to use the same server configuration across multiple devices, but currently there is no secure cloud sync mechanism.

## Goals / Non-Goals
- Goals
  - Enable E2E encrypted cloud storage and sync of MCP server information.
  - Allow secure recovery of decryption keys when adding a device (passphrase/recovery code).
  - Introduce with minimal changes to existing local UI/operation flows.
- Non-Goals
  - Server configuration search/filtering on the cloud side (only ciphertext is stored).
  - Sharing/collaborative editing (shared key management for teams is a separate design).
  - Cloud sharing of `authToken` or `localConfig` and other device-dependent/sensitive information.
  - Resistance to client compromise or OS-level malware.

## Threat Model
- Assumed attackers: Cloud operators, cloud DB leaks, network eavesdropping.
- Not addressed: Complete client device compromise, user passphrase leakage.

## Architecture Overview
### Local (Electron/Router)
- `WorkspaceService`: Provides the existing local workspace list (`mcprouter.db`).
- `CloudSyncService`: Single class that handles all cloud sync operations including:
  - KDF from passphrase and parameter management
  - Bundling workspace list and server configurations into JSON (using existing Export format)
  - Change detection, encryption, full sync, and decryption application
  - Cloud API calls for blob get/update

### Cloud
- `server_vault_blob`: Storage area for encrypted JSON blobs (cannot be decrypted).
- `vault` API: Provides blob get/update.

## Encryption Design
### Key Derivation (KDF)
- Derive a 32-byte key from the passphrase using `Argon2id`.
- `kdf_salt` is stored alongside the blob.
- No key rotation; re-encrypt when passphrase is changed.

### Data Encryption
- Algorithm: `AES-256-GCM` (12-byte nonce).
- Encryption target: Workspace list and each workspace's server configuration (server configs use the existing JSON Export format).
- `nonce` and `kdf_salt` are stored in plaintext.
- Format example:
  ```json
  {
    "nonce": "base64",
    "ciphertext": "base64",
    "schemaVersion": 1,
    "updatedAt": "2025-01-01T00:00:00Z",
    "kdf": "argon2id",
    "kdfSalt": "base64"
  }
  ```

## Data Model

### Cloud (server_vault_blob)
- One row per user.
- `ciphertext` (base64)
- `nonce` (base64)
- `schema_version`
- `updated_at`
- `size_bytes`
- `kdf` ("argon2id")
- `kdf_salt` (base64)

### Local (CloudSyncMetadata)
- `lastSyncedAt`: Timestamp of last successful sync (server's updatedAt)
- `localModifiedAt`: Timestamp of last local modification

## API Design (Example: tRPC / REST Common)
### Server Configuration Sync (JSON Blob)
- `GET /vault/servers/blob`
- `PUT /vault/servers/blob`
  ```ts
  type WorkspaceBundleEntry = {
    id: string;
    name: string;
    type: "local" | "remote";
    remoteConfig?: {
      apiUrl: string;
    };
    // Existing JSON Export format (local workspace only)
    mcpServers?: MCPServerConfig[];
  };
  type WorkspaceBundlePayload = {
    workspaces: WorkspaceBundleEntry[];
  };
  type BlobEnvelope = {
    nonce: string;
    ciphertext: string;
    schemaVersion: number;
    updatedAt: string;
    kdf: "argon2id";
    kdfSalt: string;
  };
  type PutRequest = { blob: BlobEnvelope };
  type PutResponse = BlobEnvelope;
  type GetResponse = BlobEnvelope | null;
  ```
- `authToken` and `localConfig` are not included in the Payload (re-login/generate locally on the device).

## Sync Flow (Improved: Timestamp-Based Auto Sync)

### Change Detection and Tracking
1. **Change Detection**: When create/update/delete occurs in any local Workspace:
   - Update `localModifiedAt` to the current time
   - Set the `dirty` flag
2. **Metadata Management**:
   - `lastSyncedAt`: Timestamp of last successful sync (server's updatedAt)
   - `localModifiedAt`: Timestamp of last local modification

### Auto Sync Logic (syncNow)
The actual implementation uses a simplified pull-if-newer/push-otherwise approach:

```typescript
async function syncNow() {
  const remote = await fetchRemoteBlob();

  // Pull if remote is newer than last sync
  if (remote && remote.updatedAt > lastSyncedAt) {
    const plaintext = await decrypt(remote);
    await applyWorkspaceBundle(plaintext);
    updateMetadata(remote.updatedAt);
    return "pulled";
  }

  // Otherwise push local changes
  const localBundle = await serializeWorkspaceBundle();
  const encrypted = await encrypt(localBundle);
  const response = await pushBlob(encrypted);
  updateMetadata(response.updatedAt);
  return "pushed";
}
```

### Data Collection and Bundling
1. Collect local workspace list (`mcprouter.db`) and each workspace's server configuration (`type=local` only)
2. Bundle into a single JSON with `WorkspaceBundleSerializer`
3. Encrypt the JSON string with `AES-256-GCM` and generate `BlobEnvelope`

### Application Processing
1. Upsert the workspace list; delete workspaces not in the Payload (exclude `local-default`)
2. Import each workspace's server configuration with full replacement
3. Update metadata (lastSyncedAt)

### Error Handling
- On passphrase setup: If remote data exists, attempt decryption before saving; return error on failure (passphrase is not saved)
- Decryption failure: Treat as "missing key" and display warning in UI
- Network error: Retry on next sync
- Conflict resolution: Auto-resolved based on timestamp (no user intervention required)

## UI / UX
- Add "Cloud Sync (E2E)" toggle in settings.
- Display passphrase and recovery code on first enable.
- Show "Please don't forget" warning in the passphrase input field.
- On new devices, restore key by entering passphrase (show error if existing data cannot be decrypted with the entered passphrase).
- Sync runs on all workspaces (ON/OFF is global only).
- Remote workspaces sync list only; require re-login when accessed.
- Display sync status (last sync time/failure).

## Logging / Metrics
- No sync logging/metrics are performed.

## Migration
- New feature; no migration required.

## Test Plan
- Encryption/decryption unit tests (ensure nonce reuse is prohibited).
- 2-device sync tests (full replacement conflicts, server timestamp LWW reflection).
- Retry and UI display on connection loss/401/403.

## Open Issues
- Whether to require passphrase (trade-off with UX).
- Extension design for team sharing (multiple users).
- Integration with local encryption (adoption policy for safeStorage/keytar).
