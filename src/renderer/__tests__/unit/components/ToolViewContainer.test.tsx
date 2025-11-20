import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ToolViewContainer } from "../../../components/ToolViewContainer";
import { Tool, ToolComponentProps } from "../../../types/dashboard";

describe("ToolViewContainer", () => {
  // Create a simple test tool component
  const createTestTool = (testId: string = "test-tool") => {
    const TestComponent: React.FC<ToolComponentProps> = (props) => {
      return (
        <div data-testid={testId}>
          <div data-testid="tool-active">
            {props.isActive ? "active" : "inactive"}
          </div>
          <div data-testid="tool-state">
            {JSON.stringify(props.initialState)}
          </div>
          <button
            data-testid="update-state"
            onClick={() => props.onStateChange?.({ updated: true })}
          >
            Update State
          </button>
        </div>
      );
    };

    const tool: Tool = {
      id: "test-tool",
      name: "Test Tool",
      description: "A test tool",
      icon: "test-icon",
      category: ["test"],
      component: TestComponent,
    };

    return tool;
  };

  describe("Tool Mounting", () => {
    it("should render the tool component", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      expect(screen.getByTestId("test-tool")).toBeInTheDocument();
    });

    it("should pass isActive=true to the tool component", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      expect(screen.getByTestId("tool-active")).toHaveTextContent("active");
    });

    it("should pass initialState to the tool component", () => {
      const tool = createTestTool();
      const initialState = { count: 42, name: "test" };
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          initialState={initialState}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      expect(screen.getByTestId("tool-state")).toHaveTextContent(
        JSON.stringify(initialState)
      );
    });
  });

  describe("State Preservation", () => {
    it("should call onStateChange when tool updates state", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      const updateButton = screen.getByTestId("update-state");
      fireEvent.click(updateButton);

      expect(onStateChange).toHaveBeenCalledWith({ updated: true });
    });

    it("should preserve state across re-renders", () => {
      const tool = createTestTool();
      const initialState = { value: "initial" };
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      const { rerender } = render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          initialState={initialState}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      // Verify initial state
      expect(screen.getByTestId("tool-state")).toHaveTextContent(
        JSON.stringify(initialState)
      );

      // Re-render with same props
      rerender(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          initialState={initialState}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      // State should still be the same
      expect(screen.getByTestId("tool-state")).toHaveTextContent(
        JSON.stringify(initialState)
      );
    });
  });

  describe("Breadcrumb Rendering", () => {
    it("should render breadcrumb navigation with tool name", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      // Check for breadcrumb navigation
      const breadcrumb = screen.getByRole("navigation", {
        name: /breadcrumb/i,
      });
      expect(breadcrumb).toBeInTheDocument();

      // Check for tool name in breadcrumb
      expect(breadcrumb).toHaveTextContent(tool.name);
    });

    it("should render Home button in breadcrumb", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      const homeButton = screen.getByLabelText("Navigate to home");
      expect(homeButton).toBeInTheDocument();
    });

    it("should call onNavigateHome when Home button is clicked", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      const homeButton = screen.getByLabelText("Navigate to home");
      fireEvent.click(homeButton);

      expect(onNavigateHome).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle tool with no initial state", () => {
      const tool = createTestTool();
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      expect(screen.getByTestId("test-tool")).toBeInTheDocument();
    });

    it("should handle tool with complex nested state", () => {
      const tool = createTestTool();
      const complexState = {
        nested: {
          deeply: {
            value: [1, 2, 3],
            object: { key: "value" },
          },
        },
      };
      const onStateChange = vi.fn();
      const onNavigateHome = vi.fn();

      render(
        <ToolViewContainer
          toolId={tool.id}
          tool={tool}
          initialState={complexState}
          onStateChange={onStateChange}
          onNavigateHome={onNavigateHome}
        />
      );

      expect(screen.getByTestId("tool-state")).toHaveTextContent(
        JSON.stringify(complexState)
      );
    });
  });
});
