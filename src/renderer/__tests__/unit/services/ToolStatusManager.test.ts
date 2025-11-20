import { describe, it, expect, beforeEach, vi } from "vitest";
import { ToolStatusManager } from "../../../services/ToolStatusManager";
import { ToolStatus } from "../../../types/dashboard";

describe("ToolStatusManager", () => {
  let manager: ToolStatusManager;

  beforeEach(() => {
    manager = new ToolStatusManager();
  });

  describe("setStatus", () => {
    it("should set status for a tool", () => {
      manager.setStatus("tool1", {
        state: "active",
        message: "Running",
      });

      const status = manager.getStatus("tool1");
      expect(status).toBeDefined();
      expect(status?.toolId).toBe("tool1");
      expect(status?.state).toBe("active");
      expect(status?.message).toBe("Running");
      expect(status?.lastUpdated).toBeGreaterThan(0);
    });

    it("should update existing status", () => {
      manager.setStatus("tool1", { state: "active" });
      const firstStatus = manager.getStatus("tool1");

      manager.setStatus("tool1", { state: "error", message: "Failed" });
      const secondStatus = manager.getStatus("tool1");

      expect(secondStatus?.state).toBe("error");
      expect(secondStatus?.message).toBe("Failed");
      expect(secondStatus?.lastUpdated).toBeGreaterThanOrEqual(
        firstStatus!.lastUpdated
      );
    });

    it("should notify listeners when status is set", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setStatus("tool1", { state: "active" });

      expect(listener).toHaveBeenCalledTimes(1);
      const statuses = listener.mock.calls[0][0];
      expect(statuses.get("tool1")?.state).toBe("active");
    });
  });

  describe("getStatus", () => {
    it("should return undefined for non-existent tool", () => {
      const status = manager.getStatus("nonexistent");
      expect(status).toBeUndefined();
    });

    it("should return status for existing tool", () => {
      manager.setStatus("tool1", { state: "warning" });
      const status = manager.getStatus("tool1");
      expect(status?.state).toBe("warning");
    });
  });

  describe("getAllStatuses", () => {
    it("should return empty map when no statuses", () => {
      const statuses = manager.getAllStatuses();
      expect(statuses.size).toBe(0);
    });

    it("should return all statuses", () => {
      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool2", { state: "error" });
      manager.setStatus("tool3", { state: "warning" });

      const statuses = manager.getAllStatuses();
      expect(statuses.size).toBe(3);
      expect(statuses.get("tool1")?.state).toBe("active");
      expect(statuses.get("tool2")?.state).toBe("error");
      expect(statuses.get("tool3")?.state).toBe("warning");
    });

    it("should return a copy of statuses map", () => {
      manager.setStatus("tool1", { state: "active" });
      const statuses1 = manager.getAllStatuses();
      const statuses2 = manager.getAllStatuses();

      expect(statuses1).not.toBe(statuses2);
      expect(statuses1.size).toBe(statuses2.size);
    });
  });

  describe("clearStatus", () => {
    it("should clear status for a specific tool", () => {
      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool2", { state: "error" });

      manager.clearStatus("tool1");

      expect(manager.getStatus("tool1")).toBeUndefined();
      expect(manager.getStatus("tool2")).toBeDefined();
    });

    it("should notify listeners when status is cleared", () => {
      manager.setStatus("tool1", { state: "active" });
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.clearStatus("tool1");

      expect(listener).toHaveBeenCalledTimes(1);
      const statuses = listener.mock.calls[0][0];
      expect(statuses.has("tool1")).toBe(false);
    });
  });

  describe("clearAllStatuses", () => {
    it("should clear all statuses", () => {
      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool2", { state: "error" });
      manager.setStatus("tool3", { state: "warning" });

      manager.clearAllStatuses();

      expect(manager.getAllStatuses().size).toBe(0);
    });

    it("should notify listeners when all statuses are cleared", () => {
      manager.setStatus("tool1", { state: "active" });
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.clearAllStatuses();

      expect(listener).toHaveBeenCalledTimes(1);
      const statuses = listener.mock.calls[0][0];
      expect(statuses.size).toBe(0);
    });
  });

  describe("subscribe", () => {
    it("should call listener on status changes", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool2", { state: "error" });

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("should return unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      manager.setStatus("tool1", { state: "active" });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.setStatus("tool2", { state: "error" });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("should support multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.subscribe(listener1);
      manager.subscribe(listener2);

      manager.setStatus("tool1", { state: "active" });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStatusCount", () => {
    it("should return 0 when no statuses match", () => {
      manager.setStatus("tool1", { state: "active" });
      expect(manager.getStatusCount("error")).toBe(0);
    });

    it("should count tools with specific status state", () => {
      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool2", { state: "active" });
      manager.setStatus("tool3", { state: "error" });
      manager.setStatus("tool4", { state: "warning" });

      expect(manager.getStatusCount("active")).toBe(2);
      expect(manager.getStatusCount("error")).toBe(1);
      expect(manager.getStatusCount("warning")).toBe(1);
      expect(manager.getStatusCount("idle")).toBe(0);
    });
  });

  describe("hasStatus", () => {
    it("should return false for non-existent tool", () => {
      expect(manager.hasStatus("nonexistent", "active")).toBe(false);
    });

    it("should return true when tool has matching status", () => {
      manager.setStatus("tool1", { state: "active" });
      expect(manager.hasStatus("tool1", "active")).toBe(true);
    });

    it("should return false when tool has different status", () => {
      manager.setStatus("tool1", { state: "active" });
      expect(manager.hasStatus("tool1", "error")).toBe(false);
    });
  });

  describe("reactivity", () => {
    it("should update listeners immediately when status changes", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      // Set initial status
      manager.setStatus("tool1", { state: "idle" });
      expect(listener).toHaveBeenCalledTimes(1);
      let statuses = listener.mock.calls[0][0];
      expect(statuses.get("tool1")?.state).toBe("idle");

      // Update to active
      manager.setStatus("tool1", { state: "active" });
      expect(listener).toHaveBeenCalledTimes(2);
      statuses = listener.mock.calls[1][0];
      expect(statuses.get("tool1")?.state).toBe("active");

      // Update to error
      manager.setStatus("tool1", { state: "error" });
      expect(listener).toHaveBeenCalledTimes(3);
      statuses = listener.mock.calls[2][0];
      expect(statuses.get("tool1")?.state).toBe("error");
    });

    it("should handle rapid status changes", () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      // Rapid changes
      manager.setStatus("tool1", { state: "idle" });
      manager.setStatus("tool1", { state: "active" });
      manager.setStatus("tool1", { state: "warning" });
      manager.setStatus("tool1", { state: "error" });

      expect(listener).toHaveBeenCalledTimes(4);
      const finalStatuses = listener.mock.calls[3][0];
      expect(finalStatuses.get("tool1")?.state).toBe("error");
    });
  });

  describe("notification count", () => {
    it("should store and retrieve notification count", () => {
      manager.setStatus("tool1", {
        state: "active",
        notificationCount: 5,
      });

      const status = manager.getStatus("tool1");
      expect(status?.notificationCount).toBe(5);
    });

    it("should update notification count", () => {
      manager.setStatus("tool1", {
        state: "active",
        notificationCount: 5,
      });

      manager.setStatus("tool1", {
        state: "active",
        notificationCount: 10,
      });

      const status = manager.getStatus("tool1");
      expect(status?.notificationCount).toBe(10);
    });
  });
});
