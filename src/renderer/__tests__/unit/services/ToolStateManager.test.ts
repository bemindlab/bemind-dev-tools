import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ToolStateManagerService } from "../../../services/ToolStateManager";

describe("ToolStateManager", () => {
  let stateManager: ToolStateManagerService;

  beforeEach(() => {
    localStorage.clear();
    stateManager = new ToolStateManagerService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("saveToolState", () => {
    it("should save tool state to memory", () => {
      const toolId = "test-tool";
      const state = { counter: 42, text: "hello" };

      stateManager.saveToolState(toolId, state);

      const loadedState = stateManager.loadToolState(toolId);
      expect(loadedState).toEqual(state);
    });

    it("should overwrite existing state", () => {
      const toolId = "test-tool";
      const initialState = { value: 1 };
      const updatedState = { value: 2 };

      stateManager.saveToolState(toolId, initialState);
      stateManager.saveToolState(toolId, updatedState);

      const loadedState = stateManager.loadToolState(toolId);
      expect(loadedState).toEqual(updatedState);
    });

    it("should handle multiple tools independently", () => {
      const tool1State = { id: 1 };
      const tool2State = { id: 2 };

      stateManager.saveToolState("tool1", tool1State);
      stateManager.saveToolState("tool2", tool2State);

      expect(stateManager.loadToolState("tool1")).toEqual(tool1State);
      expect(stateManager.loadToolState("tool2")).toEqual(tool2State);
    });
  });

  describe("loadToolState", () => {
    it("should return undefined for non-existent tool", () => {
      const state = stateManager.loadToolState("non-existent");
      expect(state).toBeUndefined();
    });

    it("should load previously saved state", () => {
      const toolId = "test-tool";
      const state = { data: "test" };

      stateManager.saveToolState(toolId, state);
      const loadedState = stateManager.loadToolState(toolId);

      expect(loadedState).toEqual(state);
    });
  });

  describe("clearToolState", () => {
    it("should remove tool state from memory", () => {
      const toolId = "test-tool";
      const state = { value: 123 };

      stateManager.saveToolState(toolId, state);
      stateManager.clearToolState(toolId);

      const loadedState = stateManager.loadToolState(toolId);
      expect(loadedState).toBeUndefined();
    });

    it("should remove tool state from localStorage", async () => {
      const toolId = "test-tool";
      const state = { value: 123 };

      stateManager.saveToolState(toolId, state);
      await stateManager.persistState();

      stateManager.clearToolState(toolId);

      // Verify it's removed from localStorage
      const stored = localStorage.getItem(
        `dev-tools-dashboard-tool-state-${toolId}`
      );
      expect(stored).toBeNull();
    });

    it("should not affect other tools", () => {
      const tool1State = { id: 1 };
      const tool2State = { id: 2 };

      stateManager.saveToolState("tool1", tool1State);
      stateManager.saveToolState("tool2", tool2State);

      stateManager.clearToolState("tool1");

      expect(stateManager.loadToolState("tool1")).toBeUndefined();
      expect(stateManager.loadToolState("tool2")).toEqual(tool2State);
    });
  });

  describe("persistState", () => {
    it("should persist tool states to localStorage", async () => {
      const toolId = "test-tool";
      const state = { counter: 42 };

      stateManager.saveToolState(toolId, state);
      await stateManager.persistState();

      const stored = localStorage.getItem(
        `dev-tools-dashboard-tool-state-${toolId}`
      );
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(state);
    });

    it("should persist multiple tool states", async () => {
      const tool1State = { id: 1 };
      const tool2State = { id: 2 };

      stateManager.saveToolState("tool1", tool1State);
      stateManager.saveToolState("tool2", tool2State);

      await stateManager.persistState();

      const stored1 = localStorage.getItem(
        "dev-tools-dashboard-tool-state-tool1"
      );
      const stored2 = localStorage.getItem(
        "dev-tools-dashboard-tool-state-tool2"
      );

      expect(JSON.parse(stored1!)).toEqual(tool1State);
      expect(JSON.parse(stored2!)).toEqual(tool2State);
    });

    it("should handle serialization errors gracefully", async () => {
      const toolId = "test-tool";
      // Create a circular reference that can't be serialized
      const circularState: any = { value: 1 };
      circularState.self = circularState;

      stateManager.saveToolState(toolId, circularState);

      // Should not throw
      await expect(stateManager.persistState()).resolves.not.toThrow();
    });

    it("should continue persisting other tools if one fails", async () => {
      const goodToolState = { value: 1 };
      const badToolState: any = {};
      badToolState.self = badToolState; // Circular reference

      stateManager.saveToolState("good-tool", goodToolState);
      stateManager.saveToolState("bad-tool", badToolState);

      await stateManager.persistState();

      // Good tool should still be persisted
      const stored = localStorage.getItem(
        "dev-tools-dashboard-tool-state-good-tool"
      );
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toEqual(goodToolState);
    });
  });

  describe("restoreState", () => {
    it("should restore tool states from localStorage", async () => {
      const toolId = "test-tool";
      const state = { counter: 42 };

      // Manually set localStorage
      localStorage.setItem(
        `dev-tools-dashboard-tool-state-${toolId}`,
        JSON.stringify(state)
      );

      await stateManager.restoreState();

      const loadedState = stateManager.loadToolState(toolId);
      expect(loadedState).toEqual(state);
    });

    it("should restore multiple tool states", async () => {
      const tool1State = { id: 1 };
      const tool2State = { id: 2 };

      localStorage.setItem(
        "dev-tools-dashboard-tool-state-tool1",
        JSON.stringify(tool1State)
      );
      localStorage.setItem(
        "dev-tools-dashboard-tool-state-tool2",
        JSON.stringify(tool2State)
      );

      await stateManager.restoreState();

      expect(stateManager.loadToolState("tool1")).toEqual(tool1State);
      expect(stateManager.loadToolState("tool2")).toEqual(tool2State);
    });

    it("should handle corrupted state gracefully", async () => {
      const toolId = "test-tool";

      // Set invalid JSON
      localStorage.setItem(
        `dev-tools-dashboard-tool-state-${toolId}`,
        "{ invalid json"
      );

      // Should not throw
      await expect(stateManager.restoreState()).resolves.not.toThrow();

      // Corrupted state should not be loaded
      const loadedState = stateManager.loadToolState(toolId);
      expect(loadedState).toBeUndefined();
    });

    it("should clear corrupted state from localStorage", async () => {
      const toolId = "test-tool";
      const key = `dev-tools-dashboard-tool-state-${toolId}`;

      localStorage.setItem(key, "{ invalid json");

      await stateManager.restoreState();

      // Corrupted state should be removed
      const stored = localStorage.getItem(key);
      expect(stored).toBeNull();
    });

    it("should handle empty localStorage", async () => {
      await expect(stateManager.restoreState()).resolves.not.toThrow();

      const loadedState = stateManager.loadToolState("any-tool");
      expect(loadedState).toBeUndefined();
    });

    it("should only restore tool state keys", async () => {
      const toolState = { value: 1 };

      // Set a tool state key
      localStorage.setItem(
        "dev-tools-dashboard-tool-state-tool1",
        JSON.stringify(toolState)
      );

      // Set a non-tool-state key
      localStorage.setItem("some-other-key", "some-value");

      await stateManager.restoreState();

      // Tool state should be restored
      expect(stateManager.loadToolState("tool1")).toEqual(toolState);

      // Other key should not be loaded as tool state
      expect(stateManager.loadToolState("some-other-key")).toBeUndefined();
    });
  });

  describe("clearAllStates", () => {
    it("should clear all tool states from memory", () => {
      stateManager.saveToolState("tool1", { id: 1 });
      stateManager.saveToolState("tool2", { id: 2 });

      stateManager.clearAllStates();

      expect(stateManager.loadToolState("tool1")).toBeUndefined();
      expect(stateManager.loadToolState("tool2")).toBeUndefined();
    });

    it("should clear all tool states from localStorage", async () => {
      stateManager.saveToolState("tool1", { id: 1 });
      stateManager.saveToolState("tool2", { id: 2 });

      await stateManager.persistState();

      stateManager.clearAllStates();

      const stored1 = localStorage.getItem(
        "dev-tools-dashboard-tool-state-tool1"
      );
      const stored2 = localStorage.getItem(
        "dev-tools-dashboard-tool-state-tool2"
      );

      expect(stored1).toBeNull();
      expect(stored2).toBeNull();
    });

    it("should not affect non-tool-state localStorage keys", async () => {
      stateManager.saveToolState("tool1", { id: 1 });
      await stateManager.persistState();

      // Set a non-tool-state key
      localStorage.setItem("some-other-key", "some-value");

      stateManager.clearAllStates();

      // Tool state should be cleared
      const toolState = localStorage.getItem(
        "dev-tools-dashboard-tool-state-tool1"
      );
      expect(toolState).toBeNull();

      // Other key should remain
      const otherValue = localStorage.getItem("some-other-key");
      expect(otherValue).toBe("some-value");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete save-persist-restore cycle", async () => {
      const toolId = "test-tool";
      const state = { counter: 42, text: "hello" };

      // Save and persist
      stateManager.saveToolState(toolId, state);
      await stateManager.persistState();

      // Create new instance and restore
      const newStateManager = new ToolStateManagerService();
      await newStateManager.restoreState();

      const restoredState = newStateManager.loadToolState(toolId);
      expect(restoredState).toEqual(state);
    });

    it("should handle state updates across persist cycles", async () => {
      const toolId = "test-tool";
      const initialState = { value: 1 };
      const updatedState = { value: 2 };

      // Save initial state
      stateManager.saveToolState(toolId, initialState);
      await stateManager.persistState();

      // Update state
      stateManager.saveToolState(toolId, updatedState);
      await stateManager.persistState();

      // Restore in new instance
      const newStateManager = new ToolStateManagerService();
      await newStateManager.restoreState();

      const restoredState = newStateManager.loadToolState(toolId);
      expect(restoredState).toEqual(updatedState);
    });

    it("should handle clear-persist-restore cycle", async () => {
      const toolId = "test-tool";
      const state = { value: 123 };

      // Save and persist
      stateManager.saveToolState(toolId, state);
      await stateManager.persistState();

      // Clear and persist
      stateManager.clearToolState(toolId);
      await stateManager.persistState();

      // Restore in new instance
      const newStateManager = new ToolStateManagerService();
      await newStateManager.restoreState();

      const restoredState = newStateManager.loadToolState(toolId);
      expect(restoredState).toBeUndefined();
    });
  });
});
