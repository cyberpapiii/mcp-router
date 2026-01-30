import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { ConnectionMonitor, ConnectionState } from "../connection-monitor";

describe("ConnectionMonitor", () => {
  let monitor: ConnectionMonitor;
  let onStateChange: Mock<(state: ConnectionState) => void>;
  let onReconnect: Mock<() => Promise<boolean>>;

  beforeEach(() => {
    vi.useFakeTimers();
    onStateChange = vi.fn<(state: ConnectionState) => void>();
    onReconnect = vi.fn<() => Promise<boolean>>().mockResolvedValue(true);
    monitor = new ConnectionMonitor({
      serverId: "test-server",
      onStateChange,
      onReconnect,
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 1000,
    });
  });

  afterEach(() => {
    monitor.dispose();
    vi.useRealTimers();
  });

  it("should start in disconnected state", () => {
    expect(monitor.getState()).toBe("disconnected");
  });

  it("should transition to connected when markConnected is called", () => {
    monitor.markConnected();
    expect(monitor.getState()).toBe("connected");
    expect(onStateChange).toHaveBeenCalledWith("connected");
  });

  it("should attempt reconnection on connection loss", async () => {
    monitor.markConnected();
    monitor.handleConnectionLost();

    expect(monitor.getState()).toBe("reconnecting");
    expect(onStateChange).toHaveBeenCalledWith("reconnecting");

    // Advance timer to trigger first reconnect attempt
    await vi.advanceTimersByTimeAsync(100);

    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it("should use exponential backoff on failed reconnects", async () => {
    onReconnect.mockResolvedValue(false);
    monitor.markConnected();
    monitor.handleConnectionLost();

    // First attempt after 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(onReconnect).toHaveBeenCalledTimes(1);

    // Second attempt after 200ms (100 * 2)
    await vi.advanceTimersByTimeAsync(200);
    expect(onReconnect).toHaveBeenCalledTimes(2);

    // Third attempt after 400ms (200 * 2)
    await vi.advanceTimersByTimeAsync(400);
    expect(onReconnect).toHaveBeenCalledTimes(3);
  });

  it("should cap delay at maxDelayMs", async () => {
    onReconnect.mockResolvedValue(false);
    monitor = new ConnectionMonitor({
      serverId: "test",
      onStateChange,
      onReconnect,
      maxRetries: 10,
      initialDelayMs: 500,
      maxDelayMs: 1000,
    });
    monitor.markConnected();
    monitor.handleConnectionLost();

    // First: 500ms
    await vi.advanceTimersByTimeAsync(500);
    // Second: 1000ms (capped, not 1000)
    await vi.advanceTimersByTimeAsync(1000);
    // Third: 1000ms (still capped)
    await vi.advanceTimersByTimeAsync(1000);

    expect(onReconnect).toHaveBeenCalledTimes(3);
  });

  it("should transition to failed after max retries", async () => {
    onReconnect.mockResolvedValue(false);
    monitor.markConnected();
    monitor.handleConnectionLost();

    // Exhaust all retries (3 attempts with backoff: 100, 200, 400)
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(400);

    expect(monitor.getState()).toBe("failed");
    expect(onStateChange).toHaveBeenLastCalledWith("failed");
  });

  it("should reset retry count on successful reconnect", async () => {
    onReconnect.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    monitor.markConnected();
    monitor.handleConnectionLost();

    await vi.advanceTimersByTimeAsync(100); // First attempt fails
    await vi.advanceTimersByTimeAsync(200); // Second attempt succeeds

    expect(monitor.getState()).toBe("connected");
    expect(monitor.getRetryCount()).toBe(0);
  });

  it("should cancel pending reconnect on dispose", async () => {
    monitor.markConnected();
    monitor.handleConnectionLost();
    monitor.dispose();

    await vi.advanceTimersByTimeAsync(1000);
    expect(onReconnect).not.toHaveBeenCalled();
  });
});
