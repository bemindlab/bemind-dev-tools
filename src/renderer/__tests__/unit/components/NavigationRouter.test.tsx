import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import {
  NavigationProvider,
  useNavigation,
} from "../../../contexts/NavigationContext";
import { NavigationRouter } from "../../../components/NavigationRouter";

/**
 * Unit tests for NavigationRouter component
 * Tests transition states, reduced motion, and timing
 * Requirements: 9.1, 9.3, 9.5
 */

describe("NavigationRouter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render home view by default", () => {
    render(
      <NavigationProvider>
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
        />
      </NavigationProvider>
    );

    expect(screen.getByText("Home View")).toBeInTheDocument();
  });

  it("should apply transitioning class when transition is in progress", () => {
    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
        />
      );
    };

    const { container } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Check for transitioning class
    const router = container.querySelector(".navigation-router");
    expect(router).toHaveClass("transitioning");
  });

  it("should remove transitioning class after transition completes", () => {
    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
        />
      );
    };

    const { container } = render(
      <NavigationProvider transitionDuration={300}>
        <TestComponent />
      </NavigationProvider>
    );

    // Advance timers to complete transition
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Check that transitioning class is removed
    const router = container.querySelector(".navigation-router");
    expect(router).not.toHaveClass("transitioning");
  });

  it("should apply no-transitions class when transitions are disabled", () => {
    const { container } = render(
      <NavigationProvider reducedMotion={true}>
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
        />
      </NavigationProvider>
    );

    const router = container.querySelector(".navigation-router");
    expect(router).toHaveClass("no-transitions");
  });

  it("should not apply no-transitions class when transitions are enabled", () => {
    const { container } = render(
      <NavigationProvider reducedMotion={false}>
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
        />
      </NavigationProvider>
    );

    const router = container.querySelector(".navigation-router");
    expect(router).not.toHaveClass("no-transitions");
  });

  it("should complete transition within 300ms", () => {
    const onNavigate = vi.fn();

    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
          onNavigate={onNavigate}
        />
      );
    };

    render(
      <NavigationProvider transitionDuration={300}>
        <TestComponent />
      </NavigationProvider>
    );

    // Clear initial call for home view
    onNavigate.mockClear();

    // Advance timers by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called onNavigate after transition completes
    expect(onNavigate).toHaveBeenCalledWith("tool", "test-tool");
  });

  it("should block navigation during transition", () => {
    let navigateToToolFn: ((toolId: string) => void) | null = null;
    let navigateToHomeFn: (() => void) | null = null;

    const TestComponent: React.FC = () => {
      const { navigateToTool, navigateToHome, state } = useNavigation();

      navigateToToolFn = navigateToTool;
      navigateToHomeFn = navigateToHome;

      return (
        <div>
          <div data-testid="current-view">{state.currentView}</div>
          <div data-testid="transition-in-progress">
            {state.transitionInProgress ? "true" : "false"}
          </div>
          <NavigationRouter
            homeView={<div>Home View</div>}
            toolView={<div>Tool View</div>}
          />
        </div>
      );
    };

    render(
      <NavigationProvider transitionDuration={300}>
        <TestComponent />
      </NavigationProvider>
    );

    // Start first navigation
    act(() => {
      navigateToToolFn!("test-tool");
    });

    // Should be transitioning
    expect(screen.getByTestId("transition-in-progress")).toHaveTextContent(
      "true"
    );

    // Try to navigate again immediately (should be blocked)
    act(() => {
      navigateToHomeFn!();
    });

    // Should still be transitioning to tool (second navigation blocked)
    expect(screen.getByTestId("transition-in-progress")).toHaveTextContent(
      "true"
    );

    // Complete first transition
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should now be on tool view (first navigation completed)
    expect(screen.getByTestId("current-view")).toHaveTextContent("tool");
    expect(screen.getByTestId("transition-in-progress")).toHaveTextContent(
      "false"
    );
  });

  it("should switch views instantly when reduced motion is enabled", () => {
    const onNavigate = vi.fn();

    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
          onNavigate={onNavigate}
        />
      );
    };

    render(
      <NavigationProvider reducedMotion={true}>
        <TestComponent />
      </NavigationProvider>
    );

    // With reduced motion, navigation should complete immediately (0ms)
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Should have called onNavigate immediately
    expect(onNavigate).toHaveBeenCalledWith("tool", "test-tool");
  });

  it("should show active view and hide inactive view", () => {
    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
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

    const homeView = container.querySelector(".home-view");
    const toolView = container.querySelector(".tool-view");

    expect(homeView).toHaveClass("inactive");
    expect(toolView).toHaveClass("active");
  });

  it("should call onNavigate callback after transition completes", () => {
    const onNavigate = vi.fn();

    const TestComponent: React.FC = () => {
      const { navigateToTool, navigateToHome } = useNavigation();

      return (
        <div>
          <button onClick={() => navigateToTool("test-tool")}>
            Navigate to Tool
          </button>
          <button onClick={() => navigateToHome()}>Navigate to Home</button>
          <NavigationRouter
            homeView={<div>Home View</div>}
            toolView={<div>Tool View</div>}
            onNavigate={onNavigate}
          />
        </div>
      );
    };

    render(
      <NavigationProvider transitionDuration={300}>
        <TestComponent />
      </NavigationProvider>
    );

    // Clear initial call for home view
    onNavigate.mockClear();

    // Navigate to tool
    act(() => {
      screen.getByText("Navigate to Tool").click();
    });

    // Complete transition
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called with tool view
    expect(onNavigate).toHaveBeenCalledWith("tool", "test-tool");

    // Clear calls
    onNavigate.mockClear();

    // Navigate back to home
    act(() => {
      screen.getByText("Navigate to Home").click();
    });

    // Complete transition
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called with home view
    expect(onNavigate).toHaveBeenCalledWith("home", undefined);
  });

  it("should respect custom transition duration", () => {
    const onNavigate = vi.fn();
    const customDuration = 500;

    const TestComponent: React.FC = () => {
      const { navigateToTool } = useNavigation();

      React.useEffect(() => {
        act(() => {
          navigateToTool("test-tool");
        });
      }, []);

      return (
        <NavigationRouter
          homeView={<div>Home View</div>}
          toolView={<div>Tool View</div>}
          onNavigate={onNavigate}
        />
      );
    };

    render(
      <NavigationProvider transitionDuration={customDuration}>
        <TestComponent />
      </NavigationProvider>
    );

    // Clear initial call for home view
    onNavigate.mockClear();

    // Should not complete before custom duration
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onNavigate).not.toHaveBeenCalled();

    // Should complete after custom duration
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onNavigate).toHaveBeenCalledWith("tool", "test-tool");
  });
});
