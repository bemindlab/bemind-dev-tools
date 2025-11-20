import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UserPreferencesService } from "../../../services/UserPreferences";

describe("UserPreferencesService", () => {
  let service: UserPreferencesService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    service = new UserPreferencesService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPreferences", () => {
    it("should return default preferences on initialization", () => {
      const prefs = service.getPreferences();

      expect(prefs).toEqual({
        pinnedTools: [],
        recentlyUsedTools: [],
        enableTransitions: true,
        reducedMotion: false,
      });
    });

    it("should return a copy of preferences (not reference)", () => {
      const prefs1 = service.getPreferences();
      const prefs2 = service.getPreferences();

      expect(prefs1).not.toBe(prefs2);
      expect(prefs1).toEqual(prefs2);
    });
  });

  describe("pinTool", () => {
    it("should pin a tool", () => {
      service.pinTool("tool1");

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toContain("tool1");
    });

    it("should pin multiple tools", () => {
      service.pinTool("tool1");
      service.pinTool("tool2");
      service.pinTool("tool3");

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1", "tool2", "tool3"]);
    });

    it("should not pin the same tool twice", () => {
      service.pinTool("tool1");
      service.pinTool("tool1");

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1"]);
    });

    it("should throw error when pinning more than 6 tools", () => {
      service.pinTool("tool1");
      service.pinTool("tool2");
      service.pinTool("tool3");
      service.pinTool("tool4");
      service.pinTool("tool5");
      service.pinTool("tool6");

      expect(() => service.pinTool("tool7")).toThrow(
        "Maximum 6 pinned tools. Unpin one first."
      );
    });

    it("should maintain pin limit at exactly 6", () => {
      for (let i = 1; i <= 6; i++) {
        service.pinTool(`tool${i}`);
      }

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toHaveLength(6);
    });
  });

  describe("unpinTool", () => {
    it("should unpin a pinned tool", () => {
      service.pinTool("tool1");
      service.pinTool("tool2");

      service.unpinTool("tool1");

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool2"]);
    });

    it("should handle unpinning non-existent tool", () => {
      service.pinTool("tool1");

      expect(() => service.unpinTool("tool2")).not.toThrow();

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1"]);
    });

    it("should handle unpinning from empty list", () => {
      expect(() => service.unpinTool("tool1")).not.toThrow();

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual([]);
    });
  });

  describe("isToolPinned", () => {
    it("should return true for pinned tool", () => {
      service.pinTool("tool1");

      expect(service.isToolPinned("tool1")).toBe(true);
    });

    it("should return false for unpinned tool", () => {
      expect(service.isToolPinned("tool1")).toBe(false);
    });

    it("should return false after unpinning", () => {
      service.pinTool("tool1");
      service.unpinTool("tool1");

      expect(service.isToolPinned("tool1")).toBe(false);
    });
  });

  describe("getPinnedTools", () => {
    it("should return empty array initially", () => {
      expect(service.getPinnedTools()).toEqual([]);
    });

    it("should return all pinned tools", () => {
      service.pinTool("tool1");
      service.pinTool("tool2");

      expect(service.getPinnedTools()).toEqual(["tool1", "tool2"]);
    });

    it("should return a copy of pinned tools array", () => {
      service.pinTool("tool1");

      const pinned1 = service.getPinnedTools();
      const pinned2 = service.getPinnedTools();

      expect(pinned1).not.toBe(pinned2);
      expect(pinned1).toEqual(pinned2);
    });
  });

  describe("addRecentlyUsed", () => {
    it("should add a tool to recently used", () => {
      service.addRecentlyUsed("tool1");

      const recent = service.getRecentlyUsedTools();
      expect(recent).toHaveLength(1);
      expect(recent[0].toolId).toBe("tool1");
      expect(recent[0].lastAccessedAt).toBeGreaterThan(0);
    });

    it("should add multiple tools to recently used", () => {
      service.addRecentlyUsed("tool1");
      service.addRecentlyUsed("tool2");
      service.addRecentlyUsed("tool3");

      const recent = service.getRecentlyUsedTools();
      expect(recent).toHaveLength(3);
      expect(recent[0].toolId).toBe("tool3"); // Most recent first
      expect(recent[1].toolId).toBe("tool2");
      expect(recent[2].toolId).toBe("tool1");
    });

    it("should limit recently used to 3 tools", () => {
      service.addRecentlyUsed("tool1");
      service.addRecentlyUsed("tool2");
      service.addRecentlyUsed("tool3");
      service.addRecentlyUsed("tool4");

      const recent = service.getRecentlyUsedTools();
      expect(recent).toHaveLength(3);
      expect(recent[0].toolId).toBe("tool4");
      expect(recent[1].toolId).toBe("tool3");
      expect(recent[2].toolId).toBe("tool2");
    });

    it("should move existing tool to front when accessed again", () => {
      service.addRecentlyUsed("tool1");
      service.addRecentlyUsed("tool2");
      service.addRecentlyUsed("tool3");
      service.addRecentlyUsed("tool1"); // Access tool1 again

      const recent = service.getRecentlyUsedTools();
      expect(recent).toHaveLength(3);
      expect(recent[0].toolId).toBe("tool1"); // Moved to front
      expect(recent[1].toolId).toBe("tool3");
      expect(recent[2].toolId).toBe("tool2");
    });

    it("should update lastAccessedAt when tool is accessed again", () => {
      service.addRecentlyUsed("tool1");
      const firstAccess = service.getRecentlyUsedTools()[0].lastAccessedAt;

      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);

      service.addRecentlyUsed("tool1");
      const secondAccess = service.getRecentlyUsedTools()[0].lastAccessedAt;

      expect(secondAccess).toBeGreaterThan(firstAccess);

      vi.useRealTimers();
    });
  });

  describe("getRecentlyUsedTools", () => {
    it("should return empty array initially", () => {
      expect(service.getRecentlyUsedTools()).toEqual([]);
    });

    it("should return all recently used tools", () => {
      service.addRecentlyUsed("tool1");
      service.addRecentlyUsed("tool2");

      const recent = service.getRecentlyUsedTools();
      expect(recent).toHaveLength(2);
    });

    it("should return a copy of recently used array", () => {
      service.addRecentlyUsed("tool1");

      const recent1 = service.getRecentlyUsedTools();
      const recent2 = service.getRecentlyUsedTools();

      expect(recent1).not.toBe(recent2);
      expect(recent1).toEqual(recent2);
    });
  });

  describe("clearRecentlyUsed", () => {
    it("should clear all recently used tools", () => {
      service.addRecentlyUsed("tool1");
      service.addRecentlyUsed("tool2");
      service.addRecentlyUsed("tool3");

      service.clearRecentlyUsed();

      expect(service.getRecentlyUsedTools()).toEqual([]);
    });

    it("should handle clearing empty list", () => {
      expect(() => service.clearRecentlyUsed()).not.toThrow();
      expect(service.getRecentlyUsedTools()).toEqual([]);
    });
  });

  describe("setReducedMotion", () => {
    it("should set reduced motion to true", () => {
      service.setReducedMotion(true);

      const prefs = service.getPreferences();
      expect(prefs.reducedMotion).toBe(true);
    });

    it("should set reduced motion to false", () => {
      service.setReducedMotion(true);
      service.setReducedMotion(false);

      const prefs = service.getPreferences();
      expect(prefs.reducedMotion).toBe(false);
    });
  });

  describe("setTransitionsEnabled", () => {
    it("should set transitions enabled to false", () => {
      service.setTransitionsEnabled(false);

      const prefs = service.getPreferences();
      expect(prefs.enableTransitions).toBe(false);
    });

    it("should set transitions enabled to true", () => {
      service.setTransitionsEnabled(false);
      service.setTransitionsEnabled(true);

      const prefs = service.getPreferences();
      expect(prefs.enableTransitions).toBe(true);
    });
  });

  describe("persist", () => {
    it("should persist preferences to localStorage", async () => {
      service.pinTool("tool1");
      service.addRecentlyUsed("tool2");
      service.setReducedMotion(true);

      await service.persist();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "dev-tools-dashboard-preferences",
        expect.any(String)
      );

      const stored = JSON.parse(
        localStorageMock["dev-tools-dashboard-preferences"]
      );
      expect(stored.pinnedTools).toContain("tool1");
      expect(stored.recentlyUsedTools[0].toolId).toBe("tool2");
      expect(stored.reducedMotion).toBe(true);
    });

    it("should handle localStorage errors", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      vi.spyOn(localStorage, "setItem").mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      await expect(service.persist()).rejects.toThrow("Storage quota exceeded");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to persist preferences:",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("restore", () => {
    it("should restore preferences from localStorage", async () => {
      const storedPrefs = {
        pinnedTools: ["tool1", "tool2"],
        recentlyUsedTools: [{ toolId: "tool3", lastAccessedAt: Date.now() }],
        enableTransitions: false,
        reducedMotion: true,
      };

      localStorageMock["dev-tools-dashboard-preferences"] =
        JSON.stringify(storedPrefs);

      await service.restore();

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1", "tool2"]);
      expect(prefs.recentlyUsedTools[0].toolId).toBe("tool3");
      expect(prefs.enableTransitions).toBe(false);
      expect(prefs.reducedMotion).toBe(true);
    });

    it("should handle missing localStorage data", async () => {
      await service.restore();

      const prefs = service.getPreferences();
      expect(prefs).toEqual({
        pinnedTools: [],
        recentlyUsedTools: [],
        enableTransitions: true,
        reducedMotion: false,
      });
    });

    it("should handle corrupted localStorage data", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      localStorageMock["dev-tools-dashboard-preferences"] = "invalid json{";

      await service.restore();

      const prefs = service.getPreferences();
      expect(prefs).toEqual({
        pinnedTools: [],
        recentlyUsedTools: [],
        enableTransitions: true,
        reducedMotion: false,
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to restore preferences:",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it("should merge with defaults for partial data", async () => {
      const partialPrefs = {
        pinnedTools: ["tool1"],
      };

      localStorageMock["dev-tools-dashboard-preferences"] =
        JSON.stringify(partialPrefs);

      await service.restore();

      const prefs = service.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1"]);
      expect(prefs.recentlyUsedTools).toEqual([]);
      expect(prefs.enableTransitions).toBe(true);
      expect(prefs.reducedMotion).toBe(false);
    });
  });

  describe("clear", () => {
    it("should reset preferences to defaults", () => {
      service.pinTool("tool1");
      service.addRecentlyUsed("tool2");
      service.setReducedMotion(true);
      service.setTransitionsEnabled(false);

      service.clear();

      const prefs = service.getPreferences();
      expect(prefs).toEqual({
        pinnedTools: [],
        recentlyUsedTools: [],
        enableTransitions: true,
        reducedMotion: false,
      });
    });
  });

  describe("persistence round-trip", () => {
    it("should preserve all data through persist and restore cycle", async () => {
      // Set up preferences
      service.pinTool("tool1");
      service.pinTool("tool2");
      service.addRecentlyUsed("tool3");
      service.addRecentlyUsed("tool4");
      service.setReducedMotion(true);
      service.setTransitionsEnabled(false);

      // Persist
      await service.persist();

      // Create new service instance and restore
      const newService = new UserPreferencesService();
      await newService.restore();

      // Verify all data is preserved
      const prefs = newService.getPreferences();
      expect(prefs.pinnedTools).toEqual(["tool1", "tool2"]);
      expect(prefs.recentlyUsedTools).toHaveLength(2);
      expect(prefs.recentlyUsedTools[0].toolId).toBe("tool4");
      expect(prefs.recentlyUsedTools[1].toolId).toBe("tool3");
      expect(prefs.reducedMotion).toBe(true);
      expect(prefs.enableTransitions).toBe(false);
    });
  });

  describe("validation", () => {
    it("should enforce pin limit validation", () => {
      for (let i = 1; i <= 6; i++) {
        service.pinTool(`tool${i}`);
      }

      expect(() => service.pinTool("tool7")).toThrow();
      expect(service.getPinnedTools()).toHaveLength(6);
    });

    it("should enforce recently used limit", () => {
      for (let i = 1; i <= 5; i++) {
        service.addRecentlyUsed(`tool${i}`);
      }

      expect(service.getRecentlyUsedTools()).toHaveLength(3);
    });
  });
});
