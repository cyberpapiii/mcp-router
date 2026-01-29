1. OAuth/Authentication Token Vulnerabilities (Critical)

- apps/electron/src/main/modules/auth/auth.service.ts:94 — Strengthen state validation in handleAuthToken (reject when state/currentAuthState is not set). Also clarify argument name to code.
- apps/electron/src/main/modules/auth/auth.service.ts:223 — getDecryptedAuthToken returns plaintext. Change to actual encryption implementation, or align function name/specification.
- apps/electron/src/main/modules/auth/auth.service.ts:255 — Stop status() from returning token (don't pass token to renderer).
- apps/electron/src/main/modules/auth/auth.ipc.ts:22 — Exclude sensitive information like tokens from auth:status return value. Introduce authorization checks.
- apps/electron/src/main/modules/auth/auth.ipc.ts:36 — Add caller verification/rate limiting/reentrancy prevention for auth:handle-token.
- apps/electron/src/main/modules/workspace/workspace.ipc.ts:50 — Deprecate workspace:get-credentials or add authorization guard (don't expose credentials to UI).
- apps/electron/src/main/infrastructure/shared-config-manager.ts:104 — Change from plaintext storage in saveConfig to secure storage (OS Keychain/Keytar or encryption + secure key management).
- apps/electron/src/preload.ts:160 — Review exposed content of getWorkspaceCredentials and onAuthStatusChanged (don't bridge sensitive information).
- apps/electron/src/main.ts:444 — Strictly parse mcpr:// URLs received by handleProtocolUrl with limited use cases (reject non-authentication flows).

2. SSRF (URL Injection) (Critical)

- apps/electron/src/main/utils/fetch-utils.ts:28 — Deprecate allowing arbitrary URLs starting with http/https. Only allow allowlist-based base URL concatenation.
- apps/electron/src/main/modules/mcp-apps-manager/mcp-client.ts:50 — Validate scheme/host/path before new URL(server.remoteUrl) (https only, prohibit internal/local, etc.).
- apps/electron/src/main/modules/mcp-apps-manager/mcp-client.ts:81 — Similarly validate remoteUrl for SSE.
- apps/electron/src/main/modules/workspace/platform-api-manager.ts:208 — Validate remoteConfig.apiUrl at save/read time before adoption (allowed domains/schemes).
- apps/electron/src/main/modules/mcp-server-manager/mcp-server-manager.ipc.ts:26 — Strict validation of remoteUrl/bearerToken during add/update (protocol, port, prohibit private addresses).
- apps/electron/src/main/modules/system/system-handler.ts:30 — Only allow fixed feedback submission destinations. Strict validation if made configurable in the future.

3. Token Management/Access Control Bypass (Critical)

- apps/electron/src/main/modules/mcp-apps-manager/token-manager.ts:46 — Add expiration/revocation/scope validation to validateToken.
- apps/electron/src/main/modules/mcp-apps-manager/token-manager.ts:13 — Add expiration/rotation attributes like expiresAt to generated tokens.
- apps/electron/src/main/modules/mcp-server-manager/server-service.ts:41 — Remove automatic permission granting to all tokens for new servers (change to explicit permission flow).
- apps/electron/src/main/infrastructure/shared-config-manager.ts:351 — Deprecate batch permission granting via syncTokensWithWorkspaceServers / change to consent-based.
- apps/electron/src/main/infrastructure/shared-config-manager.ts:222 — Deprecate "grant all servers" during migration (migrate with least privilege).
- apps/electron/src/main/modules/mcp-server-manager/mcp-server-manager.ipc.ts:9 — Introduce authorization checks for start/stop/update IPCs.

4. Path Traversal/FS Access (Critical)

- apps/electron/src/main/utils/uri-utils.ts:10 — Normalize/validate path in parseResourceUri to prevent ../ scheme injection.
- apps/electron/src/main/modules/mcp-server-runtime/request-handlers.ts:435 — Apply allowed scheme/server-side constraints before passing raw paths to createUriVariants in readResourceByUri.
- apps/electron/src/main/modules/mcp-server-manager/dxt-processor/dxt-processor.ts:45 — Prevent extraction escape in unpackExtension (Zip Slip countermeasures, extraction destination validation).
- apps/electron/src/main/modules/mcp-server-manager/dxt-processor/dxt-converter.ts:162 — Normalize and exclude paths outside allowed directories after path variable expansion.
- apps/electron/src/main/modules/mcp-server-manager/mcp-server-manager.ipc.ts:91 — Restrict acceptance of server:selectFile (enforce mode/filters, path validation).
- apps/electron/src/main/modules/workspace/workspace.service.ts:432 — Don't allow user input for databasePath / normalize (reject traversal).
- apps/electron/src/main/infrastructure/database/sqlite-manager.ts:17 — Normalize and check path composition on relative input (exclude ..).

5. Arbitrary Code Execution via Hooks/Workflows (Critical)

- apps/electron/src/main/modules/workflow/hook.service.ts:206 — Strengthen vm.runInContext sandbox (freeze Object/Array/Pipeline, block require/process, prohibit I/O).
- apps/electron/src/main/modules/workflow/hook.ipc.ts:10 — Strict validation and authorization for create/update/execute IPCs (admin only, etc.).
- apps/electron/src/main/modules/workflow/workflow.ipc.ts:10 — Same as above (validation during enable/execute).
- apps/electron/src/main/modules/mcp-server-runtime/request-handler-base.ts:39 — Remove or dummy tokens/sensitive data from workflow execution context.
- apps/electron/src/main/modules/workflow/workflow.repository.ts:... — Defense measures such as script validation/signing/size limits before saving.

6. Plaintext Storage of Sensitive Data (Critical)

- apps/electron/src/main/modules/mcp-server-manager/mcp-server-manager.repository.ts:235 — Encrypt bearer_token storage (Keytar, KMS preferred).
- apps/electron/src/main/infrastructure/shared-config-manager.ts:116 — Don't store settings.authToken etc. as plaintext to file (migrate to secure storage).
- apps/electron/src/main/modules/workspace/workspace.repository.ts:160 — Deprecate Base64 pseudo "encryption". Change to genuine encryption + key management.
- apps/electron/src/main/modules/mcp-logger/mcp-logger.repository.ts:146 — Remove/mask sensitive information mixed into request_params/response_data, store only minimum necessary.
- apps/electron/src/renderer/stores/auth-store.ts:122 — Don't hold authToken in renderer state (temporary memory only when needed, prefer main-side processing).

7. HTTP Server Input Processing (High)

- apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts:56 — Unify dual/inconsistent Bearer token processing (consolidate pre/post processing).
- apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts:110 — Strengthen resolveProjectFilter validation (format/length/existence check, don't skip validation even for remote).
- apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts:47 — Limit cors() to allowed origins. Add size limit with express.json({limit}).
- apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts:390 — Change listen(port) to listen(port, '127.0.0.1') (local bind). Also consider TLS introduction.
- apps/electron/src/main/modules/mcp-server-runtime/http/mcp-http-server.ts:145 — Deprecate/minimize _meta.token assignment (don't flow sensitive information to downstream/logs).

8. Workflow DoS/Information Leakage (High)

- apps/electron/src/main/modules/workflow/workflow-executor.ts:210 — Strengthen graph validation (robust cycle detection, node/edge limits, timeout/step limits).
- apps/electron/src/main/modules/workflow/hook.service.ts:206 — Limit hook script CPU/memory consumption, execution count, and maximum output.
- apps/electron/src/main/modules/mcp-server-runtime/request-handler-base.ts:39 — Remove sensitive information from context/logs (minimum meta only).
- apps/electron/src/main/modules/workflow/workflow.service.ts:119 — Strengthen validation during activation (make structure/load/permission checks mandatory).

Supplementary (Recommended Cross-Cutting Measures)

- apps/electron/src/main.ts:295 — CSP should prohibit unsafe-eval/unsafe-inline in production. Relax only during development.
- apps/electron/src/renderer/components/mcp/apps/McpAppsManager.tsx:303 — Remove dangerouslySetInnerHTML or apply strict sanitization (XSS countermeasures).
- Introduce input schema validation (zod, etc.), authorization guards, and rate limiting to all IPCs. Always mask sensitive information in logs.

If needed, this list can be converted into a checklist (with priority/effort estimates), or preparation for specific fix PRs can be provided.
