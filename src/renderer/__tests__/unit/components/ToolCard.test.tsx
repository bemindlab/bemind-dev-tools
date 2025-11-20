import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCard } from "../../../components/ToolCard";
import { Tool, ToolStatus } from "../../../types/dashboard";

describe("ToolCard - Status Updates and Badge Reactivity", () => {
  const mockTool: Tool = {
    id: "test-tool",
    name: "Test Tool",
    description: "A test tool",
    icon: "🔧",
    category: ["test"],
    component: () => <div>Test Component</div>,
  };

  const mockHandlers = {
    onSelect: vi.fn(),
    onPin: vi.fn(),
    onUnpin: vi.fn(),
  };

  describe("Status Badge Updates", () => {
    it("should not display status badge when status is undefined", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={undefined}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).toBeNull();
    });

    it("should display status badge when status is provided", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={status}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).not.toBeNull();
      expect(statusBadge?.textContent).toBe("active");
    });

    it("should update badge when status changes from undefined to active", () => {
      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={undefined}
          {...mockHandlers}
        />
      );

      // Initially no badge
      let statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).toBeNull();

      // Update to active
      const activeStatus: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={activeStatus}
          {...mockHandlers}
        />
      );

      // Now should have badge
      statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).not.toBeNull();
      expect(statusBadge?.textContent).toBe("active");
    });

    it("should update badge when status state changes", () => {
      const initialStatus: ToolStatus = {
        toolId: "test-tool",
        state: "idle",
        lastUpdated: Date.now(),
      };

      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={initialStatus}
          {...mockHandlers}
        />
      );

      // Check initial state
      let statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge?.textContent).toBe("idle");

      // Update to active
      const activeStatus: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={activeStatus}
          {...mockHandlers}
        />
      );

      statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge?.textContent).toBe("active");

      // Update to warning
      const warningStatus: ToolStatus = {
        toolId: "test-tool",
        state: "warning",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={warningStatus}
          {...mockHandlers}
        />
      );

      statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge?.textContent).toBe("warning");

      // Update to error
      const errorStatus: ToolStatus = {
        toolId: "test-tool",
        state: "error",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={errorStatus}
          {...mockHandlers}
        />
      );

      statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge?.textContent).toBe("error");
    });

    it("should remove badge when status changes from defined to undefined", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={status}
          {...mockHandlers}
        />
      );

      // Initially has badge
      let statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).not.toBeNull();

      // Remove status
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={undefined}
          {...mockHandlers}
        />
      );

      // Badge should be removed
      statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge).toBeNull();
    });

    it("should apply correct color class for active status", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={status}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector(".status-badge");
      expect(statusBadge?.classList.contains("status-blue")).toBe(true);
    });

    it("should apply correct color class for warning status", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "warning",
        lastUpdated: Date.now(),
      };

      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={status}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector(".status-badge");
      expect(statusBadge?.classList.contains("status-yellow")).toBe(true);
    });

    it("should apply correct color class for error status", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "error",
        lastUpdated: Date.now(),
      };

      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={status}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector(".status-badge");
      expect(statusBadge?.classList.contains("status-red")).toBe(true);
    });

    it("should update color class when status state changes", () => {
      const activeStatus: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={activeStatus}
          {...mockHandlers}
        />
      );

      let statusBadge = container.querySelector(".status-badge");
      expect(statusBadge?.classList.contains("status-blue")).toBe(true);

      // Change to error
      const errorStatus: ToolStatus = {
        toolId: "test-tool",
        state: "error",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={errorStatus}
          {...mockHandlers}
        />
      );

      statusBadge = container.querySelector(".status-badge");
      expect(statusBadge?.classList.contains("status-blue")).toBe(false);
      expect(statusBadge?.classList.contains("status-red")).toBe(true);
    });
  });

  describe("Notification Badge Updates", () => {
    it("should not display notification badge when count is undefined", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={undefined}
          {...mockHandlers}
        />
      );

      const notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge).toBeNull();
    });

    it("should not display notification badge when count is 0", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={0}
          {...mockHandlers}
        />
      );

      const notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge).toBeNull();
    });

    it("should display notification badge when count is greater than 0", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={5}
          {...mockHandlers}
        />
      );

      const notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge).not.toBeNull();
      expect(notificationBadge?.textContent).toBe("5");
    });

    it("should update notification count when it changes", () => {
      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={5}
          {...mockHandlers}
        />
      );

      let notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge?.textContent).toBe("5");

      // Update count
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={10}
          {...mockHandlers}
        />
      );

      notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge?.textContent).toBe("10");
    });

    it("should remove notification badge when count changes to 0", () => {
      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={5}
          {...mockHandlers}
        />
      );

      let notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge).not.toBeNull();

      // Change to 0
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          notificationCount={0}
          {...mockHandlers}
        />
      );

      notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      expect(notificationBadge).toBeNull();
    });
  });

  describe("Recently Used Indicator Updates", () => {
    it("should not display recently used indicator when false", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          {...mockHandlers}
        />
      );

      const indicator = container.querySelector('[aria-label="Recently used"]');
      expect(indicator).toBeNull();
    });

    it("should display recently used indicator when true", () => {
      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={true}
          {...mockHandlers}
        />
      );

      const indicator = container.querySelector('[aria-label="Recently used"]');
      expect(indicator).not.toBeNull();
      expect(indicator?.textContent).toBe("⭐");
    });

    it("should update indicator when isRecentlyUsed changes", () => {
      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          {...mockHandlers}
        />
      );

      let indicator = container.querySelector('[aria-label="Recently used"]');
      expect(indicator).toBeNull();

      // Change to true
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={true}
          {...mockHandlers}
        />
      );

      indicator = container.querySelector('[aria-label="Recently used"]');
      expect(indicator).not.toBeNull();

      // Change back to false
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          {...mockHandlers}
        />
      );

      indicator = container.querySelector('[aria-label="Recently used"]');
      expect(indicator).toBeNull();
    });
  });

  describe("Combined Badge Updates", () => {
    it("should display all badges simultaneously when all are active", () => {
      const status: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      const { container } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={true}
          status={status}
          notificationCount={5}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector('[aria-label^="Status:"]');
      const notificationBadge = container.querySelector(
        '[aria-label$="notifications"]'
      );
      const recentlyUsedIndicator = container.querySelector(
        '[aria-label="Recently used"]'
      );

      expect(statusBadge).not.toBeNull();
      expect(notificationBadge).not.toBeNull();
      expect(recentlyUsedIndicator).not.toBeNull();
    });

    it("should update multiple badges independently", () => {
      const initialStatus: ToolStatus = {
        toolId: "test-tool",
        state: "idle",
        lastUpdated: Date.now(),
      };

      const { container, rerender } = render(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={initialStatus}
          notificationCount={0}
          {...mockHandlers}
        />
      );

      // Only status badge should be visible
      expect(container.querySelector('[aria-label^="Status:"]')).not.toBeNull();
      expect(
        container.querySelector('[aria-label$="notifications"]')
      ).toBeNull();
      expect(
        container.querySelector('[aria-label="Recently used"]')
      ).toBeNull();

      // Add notification count
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={false}
          status={initialStatus}
          notificationCount={3}
          {...mockHandlers}
        />
      );

      expect(container.querySelector('[aria-label^="Status:"]')).not.toBeNull();
      expect(
        container.querySelector('[aria-label$="notifications"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Recently used"]')
      ).toBeNull();

      // Add recently used
      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={true}
          status={initialStatus}
          notificationCount={3}
          {...mockHandlers}
        />
      );

      expect(container.querySelector('[aria-label^="Status:"]')).not.toBeNull();
      expect(
        container.querySelector('[aria-label$="notifications"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Recently used"]')
      ).not.toBeNull();

      // Change status state
      const activeStatus: ToolStatus = {
        toolId: "test-tool",
        state: "active",
        lastUpdated: Date.now(),
      };

      rerender(
        <ToolCard
          tool={mockTool}
          isPinned={false}
          isRecentlyUsed={true}
          status={activeStatus}
          notificationCount={3}
          {...mockHandlers}
        />
      );

      const statusBadge = container.querySelector('[aria-label^="Status:"]');
      expect(statusBadge?.textContent).toBe("active");
      expect(
        container.querySelector('[aria-label$="notifications"]')
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Recently used"]')
      ).not.toBeNull();
    });
  });
});
