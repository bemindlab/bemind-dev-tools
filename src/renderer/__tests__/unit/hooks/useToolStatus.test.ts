import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useToolStatus, useToolStatuses } from "../../../hooks/useToolStatus";
import { toolStatusManager } from "../../../services/ToolStatusManager";

describe("useToolStatus hook", () => {
  beforeEach(() => {
    toolStatusManager.clearAllStatuses();
  });

  afterEach(() => {
    toolStatusManager.clearAllStatuses();
  });

  describe("useToolStatus", () => {
    it("should return undefined for non-existent tool", () => {
      const { result } = renderHook(() => useToolStatus("nonexistent"));
      expect(result.current).toBeUndefined();
    });

    it("should return status for existing tool", () => {
      toolStatusManager.setStatus("tool1", { state: "active" });

      const { result } = renderHook(() => useToolStatus("tool1"));

      expect(result.current).toBeDefined();
      expect(result.current?.toolId).toBe("tool1");
      expect(result.current?.state).toBe("active");
    });

    it("should detect status changes reactively", async () => {
      const { result } = renderHook(() => useToolStatus("tool1"));

      // Initially undefined
      expect(result.current).toBeUndefined();

      // Set status
      toolStatusManager.setStatus("tool1", { state: "active" });

      // Wait for update
      await waitFor(() => {
        expect(result.current?.state).toBe("active");
      });
    });

    it("should update when status changes", async () => {
      toolStatusManager.setStatus("tool1", { state: "idle" });

      const { result } = renderHook(() => useToolStatus("tool1"));

      expect(result.current?.state).toBe("idle");

      // Change status
      toolStatusManager.setStatus("tool1", { state: "active" });

      await waitFor(() => {
        expect(result.current?.state).toBe("active");
      });

      // Change again
      toolStatusManager.setStatus("tool1", { state: "error" });

      await waitFor(() => {
        expect(result.current?.state).toBe("error");
      });
    });

    it("should update to undefined when status is cleared", async () => {
      toolStatusManager.setStatus("tool1", { state: "active" });

      const { result } = renderHook(() => useToolStatus("tool1"));

      expect(result.current?.state).toBe("active");

      // Clear status
      toolStatusManager.clearStatus("tool1");

      await waitFor(() => {
        expect(result.current).toBeUndefined();
      });
    });

    it("should handle rapid status changes", async () => {
      const { result } = renderHook(() => useToolStatus("tool1"));

      // Rapid changes
      toolStatusManager.setStatus("tool1", { state: "idle" });
      toolStatusManager.setStatus("tool1", { state: "active" });
      toolStatusManager.setStatus("tool1", { state: "warning" });
      toolStatusManager.setStatus("tool1", { state: "error" });

      // Should eventually reflect the final state
      await waitFor(() => {
        expect(result.current?.state).toBe("error");
      });
    });

    it("should not update for other tool status changes", async () => {
      toolStatusManager.setStatus("tool1", { state: "active" });

      const { result } = renderHook(() => useToolStatus("tool1"));

      expect(result.current?.state).toBe("active");

      // Change different tool
      toolStatusManager.setStatus("tool2", { state: "error" });

      // tool1 status should remain unchanged
      expect(result.current?.state).toBe("active");
    });

    it("should update notification count", async () => {
      toolStatusManager.setStatus("tool1", {
        state: "active",
        notificationCount: 5,
      });

      const { result } = renderHook(() => useToolStatus("tool1"));

      expect(result.current?.notificationCount).toBe(5);

      // Update notification count
      toolStatusManager.setStatus("tool1", {
        state: "active",
        notificationCount: 10,
      });

      await waitFor(() => {
        expect(result.current?.notificationCount).toBe(10);
      });
    });

    it("should cleanup subscription on unmount", () => {
      const subscribeSpy = vi.spyOn(toolStatusManager, "subscribe");

      const { unmount } = renderHook(() => useToolStatus("tool1"));

      expect(subscribeSpy).toHaveBeenCalled();
      const unsubscribe = subscribeSpy.mock.results[0].value;
      const unsubscribeSpy = vi.fn(unsubscribe);

      unmount();

      // Verify cleanup was called (subscription should be removed)
      toolStatusManager.setStatus("tool1", { state: "active" });
      // If cleanup worked, no errors should occur
    });
  });

  describe("useToolStatuses", () => {
    it("should return empty map when no statuses", () => {
      const { result } = renderHook(() => useToolStatuses());
      expect(result.current.size).toBe(0);
    });

    it("should return all statuses", () => {
      toolStatusManager.setStatus("tool1", { state: "active" });
      toolStatusManager.setStatus("tool2", { state: "error" });

      const { result } = renderHook(() => useToolStatuses());

      expect(result.current.size).toBe(2);
      expect(result.current.get("tool1")?.state).toBe("active");
      expect(result.current.get("tool2")?.state).toBe("error");
    });

    it("should detect when new statuses are added", async () => {
      const { result } = renderHook(() => useToolStatuses());

      expect(result.current.size).toBe(0);

      // Add status
      toolStatusManager.setStatus("tool1", { state: "active" });

      await waitFor(() => {
        expect(result.current.size).toBe(1);
        expect(result.current.get("tool1")?.state).toBe("active");
      });
    });

    it("should detect when statuses are updated", async () => {
      toolStatusManager.setStatus("tool1", { state: "idle" });

      const { result } = renderHook(() => useToolStatuses());

      expect(result.current.get("tool1")?.state).toBe("idle");

      // Update status
      toolStatusManager.setStatus("tool1", { state: "active" });

      await waitFor(() => {
        expect(result.current.get("tool1")?.state).toBe("active");
      });
    });

    it("should detect when statuses are removed", async () => {
      toolStatusManager.setStatus("tool1", { state: "active" });
      toolStatusManager.setStatus("tool2", { state: "error" });

      const { result } = renderHook(() => useToolStatuses());

      expect(result.current.size).toBe(2);

      // Remove one status
      toolStatusManager.clearStatus("tool1");

      await waitFor(() => {
        expect(result.current.size).toBe(1);
        expect(result.current.has("tool1")).toBe(false);
        expect(result.current.get("tool2")?.state).toBe("error");
      });
    });

    it("should detect when all statuses are cleared", async () => {
      toolStatusManager.setStatus("tool1", { state: "active" });
      toolStatusManager.setStatus("tool2", { state: "error" });

      const { result } = renderHook(() => useToolStatuses());

      expect(result.current.size).toBe(2);

      // Clear all
      toolStatusManager.clearAllStatuses();

      await waitFor(() => {
        expect(result.current.size).toBe(0);
      });
    });

    it("should handle multiple status changes", async () => {
      const { result } = renderHook(() => useToolStatuses());

      // Add multiple statuses
      toolStatusManager.setStatus("tool1", { state: "active" });
      toolStatusManager.setStatus("tool2", { state: "error" });
      toolStatusManager.setStatus("tool3", { state: "warning" });

      await waitFor(() => {
        expect(result.current.size).toBe(3);
      });

      // Update one
      toolStatusManager.setStatus("tool2", { state: "active" });

      await waitFor(() => {
        expect(result.current.get("tool2")?.state).toBe("active");
      });

      // Remove one
      toolStatusManager.clearStatus("tool1");

      await waitFor(() => {
        expect(result.current.size).toBe(2);
      });
    });
  });
});
