import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { ConnectionMonitor, ConnectionState } from "./connection-monitor";
import { HealthChecker } from "./health-checker";

export interface ReconnectingClientOptions {
  serverId: string;
  serverName: string;
  createTransport: () => Transport;
  onStatusChange: (status: ConnectionState) => void;
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  // For HTTP transport health checking
  healthCheckUrl?: string;
  healthCheckIntervalMs?: number;
  bearerToken?: string;
}

export class ReconnectingMCPClient {
  private client: Client;
  private transport: Transport | null = null;
  private monitor: ConnectionMonitor;
  private healthChecker: HealthChecker | null = null;
  private disposed = false;

  private readonly serverId: string;
  private readonly serverName: string;
  private readonly createTransport: () => Transport;
  private readonly onStatusChange: (status: ConnectionState) => void;
  private readonly healthCheckUrl?: string;
  private readonly healthCheckIntervalMs: number;
  private readonly bearerToken?: string;

  constructor(options: ReconnectingClientOptions) {
    this.serverId = options.serverId;
    this.serverName = options.serverName;
    this.createTransport = options.createTransport;
    this.onStatusChange = options.onStatusChange;
    this.healthCheckUrl = options.healthCheckUrl;
    this.healthCheckIntervalMs = options.healthCheckIntervalMs ?? 30000;
    this.bearerToken = options.bearerToken;

    this.client = new Client({
      name: "mcp-router",
      version: "1.0.0",
    });

    this.monitor = new ConnectionMonitor({
      serverId: options.serverId,
      onStateChange: (state) => {
        this.onStatusChange(state);
      },
      onReconnect: () => this.attemptReconnect(),
      maxRetries: options.maxRetries,
      initialDelayMs: options.initialDelayMs,
      maxDelayMs: options.maxDelayMs,
    });
  }

  async connect(): Promise<void> {
    if (this.disposed) {
      throw new Error("Client has been disposed");
    }

    this.monitor.markConnecting();
    this.transport = this.createTransport();
    this.setupTransportCallbacks(this.transport);

    await this.client.connect(this.transport);
    this.monitor.markConnected();

    // Start health checker for HTTP transports
    this.startHealthChecker();
  }

  getClient(): Client {
    return this.client;
  }

  getState(): ConnectionState {
    return this.monitor.getState();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.healthChecker?.stop();
    this.monitor.dispose();

    try {
      this.client.close();
    } catch (error) {
      console.error(
        `[ReconnectingMCPClient] Error closing client ${this.serverId}:`,
        error,
      );
    }
  }

  private setupTransportCallbacks(transport: Transport): void {
    const originalOnClose = transport.onclose;
    const originalOnError = transport.onerror;

    transport.onclose = () => {
      console.log(
        `[ReconnectingMCPClient] Transport closed for ${this.serverName}`,
      );
      originalOnClose?.();
      if (!this.disposed) {
        this.monitor.handleConnectionLost();
      }
    };

    transport.onerror = (error: Error) => {
      console.error(
        `[ReconnectingMCPClient] Transport error for ${this.serverName}:`,
        error,
      );
      originalOnError?.(error);
      if (!this.disposed) {
        this.monitor.handleError(error);
      }
    };
  }

  private async attemptReconnect(): Promise<boolean> {
    if (this.disposed) return false;

    try {
      // Close existing client cleanly
      try {
        await this.client.close();
      } catch {
        // Ignore close errors
      }

      // Check again after async operation (race condition guard)
      if (this.disposed) return false;

      // Create new client and transport
      this.client = new Client({
        name: "mcp-router",
        version: "1.0.0",
      });

      this.transport = this.createTransport();
      this.setupTransportCallbacks(this.transport);

      await this.client.connect(this.transport);

      // Restart health checker
      this.startHealthChecker();

      return true;
    } catch (error) {
      console.error(
        `[ReconnectingMCPClient] Reconnect failed for ${this.serverName}:`,
        error,
      );
      return false;
    }
  }

  private startHealthChecker(): void {
    // Only for HTTP transports with health check URL
    if (!this.healthCheckUrl) return;

    this.healthChecker?.stop();

    this.healthChecker = new HealthChecker({
      pingFn: async () => {
        try {
          const headers: Record<string, string> = {};
          if (this.bearerToken) {
            headers["Authorization"] = `Bearer ${this.bearerToken}`;
          }

          const response = await fetch(this.healthCheckUrl!, {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(5000),
          });

          return response.ok;
        } catch {
          return false;
        }
      },
      intervalMs: this.healthCheckIntervalMs,
      onHealthy: () => {
        console.log(
          `[ReconnectingMCPClient] Health check passed for ${this.serverName}`,
        );
      },
      onUnhealthy: () => {
        console.log(
          `[ReconnectingMCPClient] Health check failed for ${this.serverName}`,
        );
        if (!this.disposed && this.monitor.getState() === "connected") {
          this.monitor.handleConnectionLost();
        }
      },
      failureThreshold: 3,
    });

    this.healthChecker.start();
  }
}
