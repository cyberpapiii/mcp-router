import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import {
  ReconnectingMCPClient,
  ReconnectingClientOptions,
} from "../reconnecting-mcp-client";

// Create mock client instance factory
const createMockClientInstance = () => ({
  connect: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  listTools: vi.fn().mockResolvedValue({ tools: [] }),
});

// Mock the MCP SDK Client as a class
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn().mockImplementation(function (this: any) {
    const instance = createMockClientInstance();
    Object.assign(this, instance);
    return this;
  }),
}));

describe("ReconnectingMCPClient", () => {
  let client: ReconnectingMCPClient;
  let onStatusChange: Mock<(status: string) => void>;
  let createTransport: Mock<() => any>;
  let mockTransport: {
    onclose: (() => void) | undefined;
    onerror: ((error: Error) => void) | undefined;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    onStatusChange = vi.fn<(status: string) => void>();

    mockTransport = {
      onclose: undefined,
      onerror: undefined,
    };

    createTransport = vi.fn().mockReturnValue(mockTransport);
  });

  afterEach(() => {
    client?.dispose();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const createClient = (
    overrides: Partial<ReconnectingClientOptions> = {},
  ): ReconnectingMCPClient => {
    return new ReconnectingMCPClient({
      serverId: "test-server",
      serverName: "Test Server",
      createTransport,
      onStatusChange,
      maxRetries: 3,
      initialDelayMs: 100,
      ...overrides,
    });
  };

  it("should connect and set up transport callbacks", async () => {
    client = createClient();
    await client.connect();

    expect(createTransport).toHaveBeenCalled();
    expect(mockTransport.onclose).toBeDefined();
    expect(mockTransport.onerror).toBeDefined();
    expect(onStatusChange).toHaveBeenCalledWith("connected");
  });

  it("should trigger reconnection when transport closes", async () => {
    client = createClient();
    await client.connect();

    // Clear previous status changes
    onStatusChange.mockClear();

    // Simulate transport close
    mockTransport.onclose?.();

    expect(onStatusChange).toHaveBeenCalledWith("reconnecting");
  });

  it("should trigger reconnection when transport errors", async () => {
    client = createClient();
    await client.connect();

    onStatusChange.mockClear();

    // Simulate transport error
    mockTransport.onerror?.(new Error("Connection lost"));

    expect(onStatusChange).toHaveBeenCalledWith("reconnecting");
  });

  it("should expose underlying client for MCP operations", async () => {
    client = createClient();
    await client.connect();

    const mcpClient = client.getClient();
    expect(mcpClient).toBeDefined();
    expect(mcpClient.listTools).toBeDefined();
  });

  it("should clean up on dispose", async () => {
    client = createClient();
    await client.connect();

    const mcpClient = client.getClient();
    client.dispose();

    expect(mcpClient.close).toHaveBeenCalled();
  });

  it("should report connecting state during connection", async () => {
    client = createClient();
    const connectPromise = client.connect();

    expect(onStatusChange).toHaveBeenCalledWith("connecting");

    await connectPromise;
  });

  it("should return current connection state", async () => {
    client = createClient();

    expect(client.getState()).toBe("disconnected");

    await client.connect();

    expect(client.getState()).toBe("connected");
  });

  it("should not reconnect after dispose", async () => {
    client = createClient();
    await client.connect();

    client.dispose();
    onStatusChange.mockClear();

    // Simulate transport close after dispose
    mockTransport.onclose?.();

    // Should not trigger reconnection
    expect(onStatusChange).not.toHaveBeenCalledWith("reconnecting");
  });

  it("should throw error when connecting after dispose", async () => {
    client = createClient();
    client.dispose();

    await expect(client.connect()).rejects.toThrow("Client has been disposed");
  });
});
