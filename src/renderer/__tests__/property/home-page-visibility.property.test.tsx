import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, act, cleanup } from "@testing-library/react";
import React from "react";
import {
  NavigationProvider,
  useNavigation,
} from "../../contexts/NavigationContext";
import { NavigationRouter } from "../../components/NavigationRouter";

/**
 * **Feature: dev-tools-dashboard, Property 3: Home page visibility during tool view**
 * **Validates: Requirements 2.2**
 *
 * Property: For any tool view, when that tool is active, the home page component should not be rendered
 */

describe("Property 3: Home page visibility during tool view", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  it("should hide home page when navigating to any tool", () => {
    fc.assert(
      fc.property(
        // Generate random tool ID
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId: string) => {
          const TestComponent: React.FC = () => {
            const { navigateToTool } = useNavigation();

            React.useEffect(() => {
              act(() => {
                navigateToTool(toolId);
              });
            }, []);

            return (
              <NavigationRouter
                homeView={<div data-testid="home-view">Home View</div>}
                toolView={<div data-testid="tool-view">Tool View</div>}
              />
            );
          };

          const { container } = render(
            <NavigationProvider>
              <TestComponent />
            </NavigationProvider>
          );

          // Complete transition
          act(() => {
            vi.runAllTimers();
          });

          // Check that home view has inactive class
          const homeView = container.querySelector(".home-view");
          expect(homeView).toHaveClass("inactive");
          expect(homeView).not.toHaveClass("active");

          // Check that tool view has active class
          const toolView = container.querySelector(".tool-view");
          expect(toolView).toHaveClass("active");
          expect(toolView).not.toHaveClass("inactive");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should show home page when on home view", () => {
    fc.assert(
      fc.property(
        // Generate random tool ID to navigate to and back from
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId: string) => {
          const TestComponent: React.FC = () => {
            const { navigateToTool, navigateToHome } = useNavigation();

            React.useEffect(() => {
              // Navigate to tool first
              act(() => {
                navigateToTool(toolId);
              });

              // Complete transition
              act(() => {
                vi.runAllTimers();
              });

              // Then navigate back to home
              act(() => {
                navigateToHome();
              });
            }, []);

            return (
              <NavigationRouter
                homeView={<div data-testid="home-view">Home View</div>}
                toolView={<div data-testid="tool-view">Tool View</div>}
              />
            );
          };

          const { container } = render(
            <NavigationProvider>
              <TestComponent />
            </NavigationProvider>
          );

          // Complete all transitions
          act(() => {
            vi.runAllTimers();
          });

          // Check that home view has active class
          const homeView = container.querySelector(".home-view");
          expect(homeView).toHaveClass("active");
          expect(homeView).not.toHaveClass("inactive");

          // Check that tool view has inactive class
          const toolView = container.querySelector(".tool-view");
          expect(toolView).toHaveClass("inactive");
          expect(toolView).not.toHaveClass("active");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should toggle visibility correctly when navigating between views", () => {
    fc.assert(
      fc.property(
        // Generate a single tool ID
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId: string) => {
          const TestComponent: React.FC = () => {
            const { navigateToTool, navigateToHome, state } = useNavigation();

            return (
              <div>
                <button onClick={() => navigateToHome()}>Go Home</button>
                <button onClick={() => navigateToTool(toolId)}>
                  Go to Tool
                </button>
                <div data-testid="current-view">{state.currentView}</div>
                <NavigationRouter
                  homeView={<div data-testid="home-view">Home View</div>}
                  toolView={<div data-testid="tool-view">Tool View</div>}
                />
              </div>
            );
          };

          const { container, getByText, getByTestId } = render(
            <NavigationProvider>
              <TestComponent />
            </NavigationProvider>
          );

          try {
            // Initially on home
            expect(getByTestId("current-view")).toHaveTextContent("home");
            let homeView = container.querySelector(".home-view");
            expect(homeView).toHaveClass("active");

            // Navigate to tool
            act(() => {
              getByText("Go to Tool").click();
            });

            act(() => {
              vi.runAllTimers();
            });

            // Should be on tool view
            expect(getByTestId("current-view")).toHaveTextContent("tool");
            homeView = container.querySelector(".home-view");
            const toolView = container.querySelector(".tool-view");
            expect(homeView).toHaveClass("inactive");
            expect(toolView).toHaveClass("active");

            // Navigate back to home
            act(() => {
              getByText("Go Home").click();
            });

            act(() => {
              vi.runAllTimers();
            });

            // Should be back on home
            expect(getByTestId("current-view")).toHaveTextContent("home");
            expect(homeView).toHaveClass("active");
            expect(toolView).toHaveClass("inactive");
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain visibility state during transition", () => {
    fc.assert(
      fc.property(
        // Generate random tool ID
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolId: string) => {
          const TestComponent: React.FC = () => {
            const { navigateToTool } = useNavigation();

            React.useEffect(() => {
              act(() => {
                navigateToTool(toolId);
              });
            }, []);

            return (
              <NavigationRouter
                homeView={<div data-testid="home-view">Home View</div>}
                toolView={<div data-testid="tool-view">Tool View</div>}
              />
            );
          };

          const { container } = render(
            <NavigationProvider transitionDuration={300}>
              <TestComponent />
            </NavigationProvider>
          );

          // During transition, both views should exist in DOM
          const homeView = container.querySelector(".home-view");
          const toolView = container.querySelector(".tool-view");

          expect(homeView).toBeInTheDocument();
          expect(toolView).toBeInTheDocument();

          // Complete transition
          act(() => {
            vi.advanceTimersByTime(300);
          });

          // After transition, home should be inactive, tool should be active
          expect(homeView).toHaveClass("inactive");
          expect(toolView).toHaveClass("active");
        }
      ),
      { numRuns: 100 }
    );
  });
});
