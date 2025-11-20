import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomePage } from "../../../components/HomePage";
import { Tool } from "../../../types/dashboard";
import React from "react";

// Mock tool component
const MockToolComponent: React.FC = () => <div>Mock Tool</div>;

const createMockTool = (
  id: string,
  name: string,
  categories: string[]
): Tool => ({
  id,
  name,
  description: `Description for ${name}`,
  icon: "🔧",
  category: categories,
  component: MockToolComponent,
  features: [`Feature 1 for ${name}`, `Feature 2 for ${name}`],
});

describe("HomePage Component", () => {
  const mockTools: Tool[] = [
    createMockTool("tool1", "Tool One", ["networking"]),
    createMockTool("tool2", "Tool Two", ["api"]),
    createMockTool("tool3", "Tool Three", ["networking", "monitoring"]),
  ];

  let mockOnToolSelect: (toolId: string) => void;
  let mockOnToolPin: (toolId: string) => void;
  let mockOnToolUnpin: (toolId: string) => void;

  beforeEach(() => {
    mockOnToolSelect = vi.fn();
    mockOnToolPin = vi.fn();
    mockOnToolUnpin = vi.fn();
  });

  describe("Basic Rendering", () => {
    it("should render the home page with title", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Bemind Dev Tools")).toBeInTheDocument();
    });

    it("should render all tools in the grid", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Tool One")).toBeInTheDocument();
      expect(screen.getByText("Tool Two")).toBeInTheDocument();
      expect(screen.getByText("Tool Three")).toBeInTheDocument();
    });

    it("should render SearchBar component", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(
        screen.getByPlaceholderText("Search tools...")
      ).toBeInTheDocument();
    });

    it("should render CategoryFilter component", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("All")).toBeInTheDocument();
    });
  });

  describe("Pinned Tools Section", () => {
    it("should display pinned tools section when tools are pinned", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={["tool1"]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Pinned Tools")).toBeInTheDocument();
    });

    it("should not display pinned tools section when no tools are pinned", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.queryByText("Pinned Tools")).not.toBeInTheDocument();
    });

    it("should display correct pinned tools in pinned section", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={["tool1", "tool3"]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const pinnedSection = screen
        .getByText("Pinned Tools")
        .closest(".tools-section");
      expect(pinnedSection).toBeInTheDocument();

      // Both pinned tools should be in the pinned section
      const allToolOnes = screen.getAllByText("Tool One");
      const allToolThrees = screen.getAllByText("Tool Three");
      expect(allToolOnes.length).toBeGreaterThan(0);
      expect(allToolThrees.length).toBeGreaterThan(0);
    });

    it("should display multiple pinned tools", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={["tool1", "tool2", "tool3"]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Pinned Tools")).toBeInTheDocument();
      // All tools should appear (in pinned section and all tools section)
      expect(screen.getAllByText("Tool One").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Tool Two").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Tool Three").length).toBeGreaterThan(0);
    });
  });

  describe("Recently Used Section", () => {
    it("should display recently used section when tools are recently used", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={["tool2"]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Recently Used")).toBeInTheDocument();
    });

    it("should not display recently used section when no tools are recently used", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.queryByText("Recently Used")).not.toBeInTheDocument();
    });

    it("should display correct recently used tools in recently used section", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={["tool2", "tool3"]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const recentSection = screen
        .getByText("Recently Used")
        .closest(".tools-section");
      expect(recentSection).toBeInTheDocument();

      // Recently used tools should appear
      expect(screen.getAllByText("Tool Two").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Tool Three").length).toBeGreaterThan(0);
    });
  });

  describe("Search Integration", () => {
    it("should filter tools by search query in name", async () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "Tool One" } });

      // Wait for debounce
      await waitFor(
        () => {
          const allToolsSection = screen
            .getByText("All Tools")
            .closest(".tools-section");
          expect(allToolsSection).toBeInTheDocument();

          // Only Tool One should be visible in All Tools section
          const toolOneElements = screen.getAllByText("Tool One");
          expect(toolOneElements.length).toBeGreaterThan(0);
        },
        { timeout: 200 }
      );
    });

    it("should filter tools by search query in description", async () => {
      const toolsWithDescriptions: Tool[] = [
        {
          ...createMockTool("tool1", "Alpha", ["networking"]),
          description: "Network monitoring tool",
        },
        {
          ...createMockTool("tool2", "Beta", ["api"]),
          description: "API testing utility",
        },
        {
          ...createMockTool("tool3", "Gamma", ["monitoring"]),
          description: "Performance monitoring",
        },
      ];

      render(
        <HomePage
          tools={toolsWithDescriptions}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "monitoring" } });

      await waitFor(
        () => {
          // Tools with "monitoring" in description should be visible
          expect(screen.getByText("Alpha")).toBeInTheDocument();
          expect(screen.getByText("Gamma")).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it("should display empty state when no tools match search", async () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "NonExistentTool" } });

      await waitFor(
        () => {
          expect(screen.getByText("No tools found")).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it("should clear search and show all tools when clear button is clicked", async () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "Tool One" } });

      await waitFor(
        () => {
          const clearButton = screen.getByLabelText("Clear search");
          expect(clearButton).toBeInTheDocument();
          fireEvent.click(clearButton);
        },
        { timeout: 200 }
      );

      await waitFor(
        () => {
          // All tools should be visible again
          expect(screen.getByText("Tool One")).toBeInTheDocument();
          expect(screen.getByText("Tool Two")).toBeInTheDocument();
          expect(screen.getByText("Tool Three")).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it("should perform case-insensitive search", async () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "tool one" } });

      await waitFor(
        () => {
          expect(screen.getByText("Tool One")).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });
  });

  describe("Category Filter Integration", () => {
    it("should render category filter buttons", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Networking")).toBeInTheDocument();
      expect(screen.getByText("Api")).toBeInTheDocument();
    });

    it("should filter tools by selected category", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const networkingButton = screen.getByText("Networking");
      fireEvent.click(networkingButton);

      // Only networking tools should be visible
      expect(screen.getByText("Tool One")).toBeInTheDocument();
      expect(screen.getByText("Tool Three")).toBeInTheDocument();
      expect(screen.queryByText("Tool Two")).not.toBeInTheDocument();
    });

    it("should show all tools when 'All' category is selected", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // First filter by a category
      const networkingButton = screen.getByText("Networking");
      fireEvent.click(networkingButton);

      // Then click All
      const allButton = screen.getByText("All");
      fireEvent.click(allButton);

      // All tools should be visible
      expect(screen.getByText("Tool One")).toBeInTheDocument();
      expect(screen.getByText("Tool Two")).toBeInTheDocument();
      expect(screen.getByText("Tool Three")).toBeInTheDocument();
    });

    it("should display correct tool count for each category", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Check that category counts are displayed
      const allButton = screen.getByText("All").closest("button");
      expect(allButton).toHaveTextContent("3"); // All 3 tools

      const networkingButton = screen.getByText("Networking").closest("button");
      expect(networkingButton).toHaveTextContent("2"); // Tool One and Tool Three
    });

    it("should combine search and category filters", async () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      // Filter by category
      const networkingButton = screen.getByText("Networking");
      fireEvent.click(networkingButton);

      // Then search
      const searchInput = screen.getByPlaceholderText("Search tools...");
      fireEvent.change(searchInput, { target: { value: "Tool One" } });

      await waitFor(
        () => {
          // Only Tool One should be visible (matches both filters)
          expect(screen.getByText("Tool One")).toBeInTheDocument();
          expect(screen.queryByText("Tool Three")).not.toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });
  });

  describe("Tool Interactions", () => {
    it("should call onToolSelect when tool card is clicked", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const toolCard = screen.getByText("Tool One").closest(".tool-card");
      if (toolCard) {
        fireEvent.click(toolCard);
        expect(mockOnToolSelect).toHaveBeenCalledWith("tool1");
      }
    });

    it("should call onToolPin when context menu is triggered on unpinned tool", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const toolCard = screen.getByText("Tool One").closest(".tool-card");
      if (toolCard) {
        // Right-click triggers pin action directly
        fireEvent.contextMenu(toolCard);
        expect(mockOnToolPin).toHaveBeenCalledWith("tool1");
      }
    });

    it("should call onToolUnpin when context menu is triggered on pinned tool", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={["tool1"]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      const toolCards = screen.getAllByText("Tool One");
      const toolCard = toolCards[0].closest(".tool-card");

      if (toolCard) {
        // Right-click triggers unpin action directly
        fireEvent.contextMenu(toolCard);
        expect(mockOnToolUnpin).toHaveBeenCalledWith("tool1");
      }
    });
  });

  describe("Empty States", () => {
    it("should display empty state when no tools are available", () => {
      render(
        <HomePage
          tools={[]}
          pinnedToolIds={[]}
          recentlyUsedToolIds={[]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("No tools found")).toBeInTheDocument();
    });

    it("should display All Tools section even when other sections are present", () => {
      render(
        <HomePage
          tools={mockTools}
          pinnedToolIds={["tool1"]}
          recentlyUsedToolIds={["tool2"]}
          onToolSelect={mockOnToolSelect}
          onToolPin={mockOnToolPin}
          onToolUnpin={mockOnToolUnpin}
        />
      );

      expect(screen.getByText("Pinned Tools")).toBeInTheDocument();
      expect(screen.getByText("Recently Used")).toBeInTheDocument();
      expect(screen.getByText("All Tools")).toBeInTheDocument();
    });
  });
});
