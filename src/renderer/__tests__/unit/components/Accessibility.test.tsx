import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { HomePage } from "../../../components/HomePage";
import { SearchBar } from "../../../components/SearchBar";
import { CategoryFilter } from "../../../components/CategoryFilter";
import { BreadcrumbNavigation } from "../../../components/BreadcrumbNavigation";
import { ToolCard } from "../../../components/ToolCard";
import { Tool, Category } from "../../../types/dashboard";

/**
 * Accessibility Unit Tests
 * Tests ARIA labels, semantic HTML, and focus management
 * Requirements: 10.4
 */

describe("Accessibility - ARIA Labels", () => {
  it("should have ARIA label on tool card", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const toolCard = container.querySelector(".tool-card");
    expect(toolCard).toHaveAttribute("aria-label", "Open Test Tool");
  });

  it("should have ARIA label on search input", () => {
    render(<SearchBar value="" onChange={vi.fn()} onClear={vi.fn()} />);

    const searchInput = screen.getByLabelText("Search tools");
    expect(searchInput).toBeInTheDocument();
  });

  it("should have ARIA label on search clear button", () => {
    render(<SearchBar value="test" onChange={vi.fn()} onClear={vi.fn()} />);

    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();
  });

  it("should have ARIA label on category filter buttons", () => {
    const categories: (Category & { toolCount: number })[] = [
      { id: "all", name: "All", toolCount: 5 },
      { id: "networking", name: "Networking", toolCount: 2 },
    ];

    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="all"
        onCategorySelect={vi.fn()}
      />
    );

    const allButton = screen.getByLabelText("Filter by All");
    const networkingButton = screen.getByLabelText("Filter by Networking");

    expect(allButton).toBeInTheDocument();
    expect(networkingButton).toBeInTheDocument();
  });

  it("should have ARIA pressed state on category filter buttons", () => {
    const categories: (Category & { toolCount: number })[] = [
      { id: "all", name: "All", toolCount: 5 },
      { id: "networking", name: "Networking", toolCount: 2 },
    ];

    const { rerender } = render(
      <CategoryFilter
        categories={categories}
        selectedCategory="all"
        onCategorySelect={vi.fn()}
      />
    );

    const allButton = screen.getByLabelText("Filter by All");
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    rerender(
      <CategoryFilter
        categories={categories}
        selectedCategory="networking"
        onCategorySelect={vi.fn()}
      />
    );

    const networkingButton = screen.getByLabelText("Filter by Networking");
    expect(networkingButton).toHaveAttribute("aria-pressed", "true");
    expect(allButton).toHaveAttribute("aria-pressed", "false");
  });

  it("should have ARIA label on breadcrumb navigation button", () => {
    render(
      <BreadcrumbNavigation currentView="home" onNavigateHome={vi.fn()} />
    );

    const homeButton = screen.getByLabelText("Navigate to home");
    expect(homeButton).toBeInTheDocument();
  });

  it("should have ARIA label on status badge", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        status={{ toolId: tool.id, state: "active", message: "Running", lastUpdated: Date.now() }}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const statusBadge = container.querySelector(".status-badge");
    expect(statusBadge).toHaveAttribute("aria-label", "Status: active");
  });

  it("should have ARIA label on notification badge", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        notificationCount={5}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const notificationBadge = container.querySelector(".notification-badge");
    expect(notificationBadge).toHaveAttribute("aria-label", "5 notifications");
  });

  it("should have ARIA label on recently used indicator", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={true}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const recentlyUsedIndicator = container.querySelector(
      ".recently-used-indicator"
    );
    expect(recentlyUsedIndicator).toHaveAttribute(
      "aria-label",
      "Recently used"
    );
  });
});

describe("Accessibility - Semantic HTML", () => {
  it("should use semantic nav element for breadcrumb navigation", () => {
    const { container } = render(
      <BreadcrumbNavigation currentView="home" onNavigateHome={vi.fn()} />
    );

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
  });

  it("should use semantic button elements for interactive controls", () => {
    const categories: (Category & { toolCount: number })[] = [
      { id: "all", name: "All", toolCount: 5 },
    ];

    const { container } = render(
      <CategoryFilter
        categories={categories}
        selectedCategory="all"
        onCategorySelect={vi.fn()}
      />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should use semantic heading elements in HomePage", () => {
    const tools: Tool[] = [
      {
        id: "tool-1",
        name: "Tool 1",
        description: "Description 1",
        icon: "🔧",
        category: ["test"],
        component: () => <div>Mock Tool</div>,
      },
    ];

    const { container } = render(
      <HomePage
        tools={tools}
        pinnedToolIds={[]}
        recentlyUsedToolIds={[]}
        onToolSelect={vi.fn()}
        onToolPin={vi.fn()}
        onToolUnpin={vi.fn()}
      />
    );

    // Check for h1 (main heading)
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe("Bemind Dev Tools");

    // Check for h2 (section headings)
    const h2Elements = container.querySelectorAll("h2");
    expect(h2Elements.length).toBeGreaterThan(0);
  });

  it("should use semantic section elements in HomePage", () => {
    const tools: Tool[] = [
      {
        id: "tool-1",
        name: "Tool 1",
        description: "Description 1",
        icon: "🔧",
        category: ["test"],
        component: () => <div>Mock Tool</div>,
      },
    ];

    const { container } = render(
      <HomePage
        tools={tools}
        pinnedToolIds={[]}
        recentlyUsedToolIds={[]}
        onToolSelect={vi.fn()}
        onToolPin={vi.fn()}
        onToolUnpin={vi.fn()}
      />
    );

    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThan(0);
  });

  it("should use ordered list for breadcrumb navigation", () => {
    const { container } = render(
      <BreadcrumbNavigation
        currentView="tool"
        toolName="Test Tool"
        onNavigateHome={vi.fn()}
      />
    );

    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();

    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThan(0);
  });

  it("should use aria-current for current breadcrumb item", () => {
    const { container } = render(
      <BreadcrumbNavigation
        currentView="tool"
        toolName="Test Tool"
        onNavigateHome={vi.fn()}
      />
    );

    const currentItem = container.querySelector('[aria-current="page"]');
    expect(currentItem).toBeInTheDocument();
    expect(currentItem?.textContent).toBe("Test Tool");
  });

  it("should use aria-hidden for decorative elements", () => {
    const { container } = render(
      <BreadcrumbNavigation
        currentView="tool"
        toolName="Test Tool"
        onNavigateHome={vi.fn()}
      />
    );

    const separator = container.querySelector('[aria-hidden="true"]');
    expect(separator).toBeInTheDocument();
  });
});

describe("Accessibility - Focus Management", () => {
  it("should have tabIndex on tool cards for keyboard navigation", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const toolCard = container.querySelector(".tool-card");
    expect(toolCard).toHaveAttribute("tabIndex", "0");
  });

  it("should have role='button' on tool cards", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const toolCard = container.querySelector(".tool-card");
    expect(toolCard).toHaveAttribute("role", "button");
  });

  it("should maintain focus order in HomePage", () => {
    const tools: Tool[] = [
      {
        id: "tool-1",
        name: "Tool 1",
        description: "Description 1",
        icon: "🔧",
        category: ["test"],
        component: () => <div>Mock Tool</div>,
      },
      {
        id: "tool-2",
        name: "Tool 2",
        description: "Description 2",
        icon: "🔧",
        category: ["test"],
        component: () => <div>Mock Tool</div>,
      },
    ];

    const { container } = render(
      <HomePage
        tools={tools}
        pinnedToolIds={[]}
        recentlyUsedToolIds={[]}
        onToolSelect={vi.fn()}
        onToolPin={vi.fn()}
        onToolUnpin={vi.fn()}
      />
    );

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'input, button, [tabindex="0"]'
    );

    // Verify we have multiple focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);

    // Verify all have valid tabIndex
    focusableElements.forEach((element) => {
      const tabIndex = (element as HTMLElement).tabIndex;
      expect(tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  it("should have visible focus indicators with sufficient contrast", () => {
    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "🔧",
      category: ["test"],
      component: () => <div>Mock Tool</div>,
    };

    const { container } = render(
      <ToolCard
        tool={tool}
        isPinned={false}
        isRecentlyUsed={false}
        onSelect={vi.fn()}
        onPin={vi.fn()}
        onUnpin={vi.fn()}
      />
    );

    const toolCard = container.querySelector(".tool-card") as HTMLElement;
    toolCard.focus();

    const styles = window.getComputedStyle(toolCard);

    // Check for outline (focus indicator)
    const hasOutline =
      styles.outline !== "none" &&
      styles.outline !== "" &&
      styles.outline !== "0px";

    expect(hasOutline).toBe(true);
  });
});

describe("Accessibility - Dynamic Content", () => {
  it("should handle empty state with accessible message", () => {
    const { container } = render(
      <HomePage
        tools={[]}
        pinnedToolIds={[]}
        recentlyUsedToolIds={[]}
        onToolSelect={vi.fn()}
        onToolPin={vi.fn()}
        onToolUnpin={vi.fn()}
      />
    );

    const emptyState = container.querySelector(".empty-state");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState?.textContent).toContain("No tools found");
  });

  it("should update ARIA pressed state when category changes", () => {
    const categories: (Category & { toolCount: number })[] = [
      { id: "all", name: "All", toolCount: 5 },
      { id: "networking", name: "Networking", toolCount: 2 },
    ];

    const mockOnCategorySelect = vi.fn();

    const { rerender } = render(
      <CategoryFilter
        categories={categories}
        selectedCategory="all"
        onCategorySelect={mockOnCategorySelect}
      />
    );

    const allButton = screen.getByLabelText("Filter by All");
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    // Simulate category change
    rerender(
      <CategoryFilter
        categories={categories}
        selectedCategory="networking"
        onCategorySelect={mockOnCategorySelect}
      />
    );

    expect(allButton).toHaveAttribute("aria-pressed", "false");
    const networkingButton = screen.getByLabelText("Filter by Networking");
    expect(networkingButton).toHaveAttribute("aria-pressed", "true");
  });
});
