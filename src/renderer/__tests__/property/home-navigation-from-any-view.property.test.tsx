import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, act, cleanup } from "@testing-library/react";
import React from "react";
import {
  NavigationProvider,
  useNavigation,
} from "../../contexts/NavigationContext";
import { NavigationRouter } from "../../components/NavigationRouter";
import { ToolViewContainer } from "../../components/ToolViewContainer";
import { Tool } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 6: Home navigation from any view**
 * **Validates: Requirements 3.1, 3.4**
 *
 * Property: For any navigation action to home (button click, breadcrumb click, keyboard shortcut),
 * the dashboard should navigate to the home page
 */

describe("Property 6: Home navigation from any view", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should navigate to home when home button is clicked from any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const TestComponent: React.FC = () => {
              const { navigateToTool, navigateToHome, state } = useNavigation();

              React.useEffect(() => {
                // Navigate to tool first
                act(() => {
                  navigateToTool(toolId);
                });
              }, []);

              return (
                <div>
                  <button onClick={navigateToHome} data-testid="home-btn">
                    Go Home
                  </button>
                  <div data-testid="current-view">{state.currentView}</div>
                  <NavigationRouter
                    homeView={<div>Home View</div>}
                    toolView={<div>Tool View</div>}
                  />
                </div>
              );
            };

            const { getByTestId } = render(
              <NavigationProvider>
                <TestComponent />
              </NavigationProvider>
            );

            // Complete navigation to tool
            act(() => {
              vi.runAllTimers();
            });

            // Should be on tool view
            expect(getByTestId("current-view")).toHaveTextContent("tool");

            // Click home button
            act(() => {
              getByTestId("home-btn").click();
            });

            // Complete navigation to home
            act(() => {
              vi.runAllTimers();
            });

            // Should be on home view
            expect(getByTestId("current-view")).toHaveTextContent("home");
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should navigate to home when breadcrumb home link is clicked from any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            const { container } = render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Find and click the breadcrumb home button
            const homeButton = container.querySelector(
              'button[aria-label="Navigate to home"]'
            ) as HTMLButtonElement;
            expect(homeButton).toBeInTheDocument();

            homeButton.click();

            // Verify onNavigateHome was called
            expect(mockOnNavigateHome).toHaveBeenCalled();
            expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should navigate to home when Cmd/Ctrl+H is pressed from any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Simulate Cmd+H (Mac)
            const event = new KeyboardEvent("keydown", {
              key: "h",
              metaKey: true,
              bubbles: true,
            });
            window.dispatchEvent(event);

            // Verify onNavigateHome was called
            expect(mockOnNavigateHome).toHaveBeenCalled();

            mockOnNavigateHome.mockClear();

            // Simulate Ctrl+H (Windows/Linux)
            const event2 = new KeyboardEvent("keydown", {
              key: "h",
              ctrlKey: true,
              bubbles: true,
            });
            window.dispatchEvent(event2);

            // Verify onNavigateHome was called again
            expect(mockOnNavigateHome).toHaveBeenCalled();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should navigate to home when Escape is pressed from any tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool data
        fc.record({
          toolId: fc.string({ minLength: 1, maxLength: 50 }),
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ toolId, toolName }) => {
          try {
            const mockOnNavigateHome = vi.fn();
            const mockOnStateChange = vi.fn();

            const MockToolComponent: React.FC = () =>
              React.createElement("div", null, "Tool Content");

            const mockTool: Tool = {
              id: toolId,
              name: toolName,
              description: "Test description",
              icon: "🔧",
              category: ["test"],
              component: MockToolComponent,
            };

            render(
              React.createElement(ToolViewContainer, {
                toolId,
                tool: mockTool,
                onStateChange: mockOnStateChange,
                onNavigateHome: mockOnNavigateHome,
              })
            );

            // Simulate Escape key
            const event = new KeyboardEvent("keydown", {
              key: "Escape",
              bubbles: true,
            });
            window.dispatchEvent(event);

            // Verify onNavigateHome was called
            expect(mockOnNavigateHome).toHaveBeenCalled();
            expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should navigate to home from multiple different tool views", () => {
    fc.assert(
      fc.property(
        // Generate a count of tools to test
        fc.integer({ min: 2, max: 3 }),
        (toolCount: number) => {
          // Create simple unique tool IDs
          const toolIds = Array.from(
            { length: toolCount },
            (_, idx) => `tool-${idx}`
          );
          try {
            const TestComponent: React.FC = () => {
              const { navigateToTool, navigateToHome, state } = useNavigation();

              return (
                <div>
                  {toolIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => navigateToTool(id)}
                      data-testid={`nav-to-${id}`}
                    >
                      Go to {id}
                    </button>
                  ))}
                  <button onClick={navigateToHome} data-testid="home-btn">
                    Go Home
                  </button>
                  <div data-testid="current-view">{state.currentView}</div>
                  <NavigationRouter
                    homeView={<div>Home View</div>}
                    toolView={<div>Tool View</div>}
                  />
                </div>
              );
            };

            const { getByTestId } = render(
              <NavigationProvider>
                <TestComponent />
              </NavigationProvider>
            );

            // Test navigation to home from each tool
            toolIds.forEach((toolId) => {
              // Navigate to tool
              act(() => {
                getByTestId(`nav-to-${toolId}`).click();
              });

              act(() => {
                vi.runAllTimers();
              });

              // Should be on tool view
              expect(getByTestId("current-view")).toHaveTextContent("tool");

              // Navigate back to home
              act(() => {
                getByTestId("home-btn").click();
              });

              act(() => {
                vi.runAllTimers();
              });

              // Should be on home view
              expect(getByTestId("current-view")).toHaveTextContent("home");
            });
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
