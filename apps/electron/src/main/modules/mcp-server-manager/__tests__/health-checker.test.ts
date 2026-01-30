import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { HealthChecker } from "../health-checker";

describe("HealthChecker", () => {
  let checker: HealthChecker;
  let onHealthy: Mock<() => void>;
  let onUnhealthy: Mock<() => void>;

  beforeEach(() => {
    vi.useFakeTimers();
    onHealthy = vi.fn<() => void>();
    onUnhealthy = vi.fn<() => void>();
  });

  afterEach(() => {
    checker?.stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should not run until started", async () => {
    const pingFn = vi.fn().mockResolvedValue(true);
    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
    });

    await vi.advanceTimersByTimeAsync(5000);
    expect(pingFn).not.toHaveBeenCalled();
  });

  it("should ping at specified interval", async () => {
    const pingFn = vi.fn().mockResolvedValue(true);
    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
    });

    checker.start();

    // Initial ping
    await vi.advanceTimersByTimeAsync(0);
    expect(pingFn).toHaveBeenCalledTimes(1);

    // After 1 second
    await vi.advanceTimersByTimeAsync(1000);
    expect(pingFn).toHaveBeenCalledTimes(2);

    // After another second
    await vi.advanceTimersByTimeAsync(1000);
    expect(pingFn).toHaveBeenCalledTimes(3);
  });

  it("should call onUnhealthy after consecutive failures", async () => {
    const pingFn = vi.fn().mockResolvedValue(false);
    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
      failureThreshold: 3,
    });

    checker.start();

    // First two failures - no callback yet
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUnhealthy).not.toHaveBeenCalled();

    // Third failure triggers callback
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUnhealthy).toHaveBeenCalledTimes(1);
  });

  it("should reset failure count on success", async () => {
    const pingFn = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true) // Success resets count
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(false);

    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
      failureThreshold: 3,
    });

    checker.start();

    // 2 failures
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    // 1 success (resets)
    await vi.advanceTimersByTimeAsync(1000);
    // 2 more failures (not enough)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    expect(onUnhealthy).not.toHaveBeenCalled();

    // 3rd consecutive failure
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUnhealthy).toHaveBeenCalledTimes(1);
  });

  it("should call onHealthy when recovering from unhealthy", async () => {
    const pingFn = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false) // Triggers unhealthy
      .mockResolvedValueOnce(true); // Recovery

    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
      failureThreshold: 3,
    });

    checker.start();

    // Become unhealthy
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onUnhealthy).toHaveBeenCalled();

    // Recover
    await vi.advanceTimersByTimeAsync(1000);
    expect(onHealthy).toHaveBeenCalledTimes(1);
  });

  it("should stop pinging when stopped", async () => {
    const pingFn = vi.fn().mockResolvedValue(true);
    checker = new HealthChecker({
      pingFn,
      intervalMs: 1000,
      onHealthy,
      onUnhealthy,
    });

    checker.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(pingFn).toHaveBeenCalledTimes(1);

    checker.stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(pingFn).toHaveBeenCalledTimes(1);
  });
});
