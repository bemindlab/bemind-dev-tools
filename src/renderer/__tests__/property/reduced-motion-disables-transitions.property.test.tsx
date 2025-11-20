import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { render, act } from "@testing-library/react";
import React from "react";
import {
  NavigationProvider,
  useNavigation,
} from "../../contexts/NavigationContext";

/**
 * Feature: dev-tools-dashboard, Property 30: Reduced motion disables transitions
 * For any navigation action, when reduced motion is enabled in preferences,
 * transitions should be disabled or use instant changes
 * Validates: Requirements 9.5
 */

// Test component that exposes navigation state
const TestComponent: React.FC<{
  onStateChange: (state: {
    transitionInProgress: boolean;
    transitionsEnabled: boolean;
  }) => void;
}> = ({ onStateChange }) => {
  const { state, transitionsEnabled } = useNavigation();

  React.useEffect(() => {
    onStateChange({
      transitionInProgress: state.transitionInProgress,
      transitionsEnabled,
    });
  }, [state.transitionInProgress, transitionsEnabled, onStateChange]);

  return <div>Test</div>;
};

describe("Property 30: Reduced motion disables transitions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should disable transitions when reducedMotion prop is true", () => {
    fc.assert(
      fc.property(fc.boolean(), (enableTransitions) => {
        type StateType = {
          transitionInProgress: boolean;
          transitionsEnabled: boolean;
        };
        
        let capturedState: StateType | null = null;

        const handleStateChange = (state: StateType) => {
          capturedState = state;
        };

        render(
          <NavigationProvider
            enableTransitions={enableTransitions}
            reducedMotion={true}
          >
            <TestComponent onStateChange={handleStateChange} />
          </NavigationProvider>
        );

        // When reducedMotion is true, transitions should be disabled
        // regardless of enableTransitions value
        expect(capturedState).not.toBeNull();
        expect(capturedState!.transitionsEnabled).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("should enable transitions when reducedMotion is false and enableTransitions is true", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        type StateType = {
          transitionInProgress: boolean;
          transitionsEnabled: boolean;
        };
        
        let capturedState: StateType | null = null;

        const handleStateChange = (state: StateType) => {
          capturedState = state;
        };

        render(
          <NavigationProvider enableTransitions={true} reducedMotion={false}>
            <TestComponent onStateChange={handleStateChange} />
          </NavigationProvider>
        );

        // When reducedMotion is false and enableTransitions is true,
        // transitions should be enabled (assuming no system preference)
        expect(capturedState).not.toBeNull();
        expect(capturedState!.transitionsEnabled).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should not set transitionInProgress when transitions are disabled", () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });

    fc.assert(
      fc.property(toolIdArbitrary, (toolId) => {
        let capturedStates: Array<{
          transitionInProgress: boolean;
          transitionsEnabled: boolean;
        }> = [];

        const TestNavigationComponent: React.FC = () => {
          const { navigateToTool, state, transitionsEnabled } = useNavigation();

          React.useEffect(() => {
            capturedStates.push({
              transitionInProgress: state.transitionInProgress,
              transitionsEnabled,
            });
          }, [state.transitionInProgress, transitionsEnabled]);

          React.useEffect(() => {
            // Trigger navigation immediately
            act(() => {
              navigateToTool(toolId);
            });
          }, []);

          return <div>Test</div>;
        };

        render(
          <NavigationProvider reducedMotion={true}>
            <TestNavigationComponent />
          </NavigationProvider>
        );

        // Advance timers to complete any pending operations
        act(() => {
          vi.runAllTimers();
        });

        // When reduced motion is enabled, transitionInProgress should never be true
        const hadTransition = capturedStates.some(
          (s) => s.transitionInProgress === true
        );
        expect(hadTransition).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("should complete navigation instantly when transitions are disabled", () => {
    const toolIdArbitrary = fc.string({ minLength: 1, maxLength: 20 });

    fc.assert(
      fc.property(toolIdArbitrary, (toolId) => {
        let navigationCompleted = false;

        const TestNavigationComponent: React.FC = () => {
          const { navigateToTool, state } = useNavigation();

          React.useEffect(() => {
            if (state.currentView === "tool" && state.activeToolId === toolId) {
              navigationCompleted = true;
            }
          }, [state.currentView, state.activeToolId]);

          React.useEffect(() => {
            // Trigger navigation immediately
            act(() => {
              navigateToTool(toolId);
            });
          }, []);

          return <div>Test</div>;
        };

        render(
          <NavigationProvider reducedMotion={true}>
            <TestNavigationComponent />
          </NavigationProvider>
        );

        // With reduced motion, navigation should complete immediately (0ms)
        act(() => {
          vi.runAllTimers();
        });

        expect(navigationCompleted).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should respect system prefers-reduced-motion setting", () => {
    fc.assert(
      fc.property(fc.boolean(), (systemPrefersReducedMotion) => {
        // Mock matchMedia
        const mockMatchMedia = vi.fn((query: string) => ({
          matches: systemPrefersReducedMotion,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, "matchMedia", {
          writable: true,
          value: mockMatchMedia,
        });

        type StateType = {
          transitionInProgress: boolean;
          transitionsEnabled: boolean;
        };
        
        let capturedState: StateType | null = null;

        const handleStateChange = (state: StateType) => {
          capturedState = state;
        };

        render(
          <NavigationProvider enableTransitions={true} reducedMotion={false}>
            <TestComponent onStateChange={handleStateChange} />
          </NavigationProvider>
        );

        // When system prefers reduced motion, transitions should be disabled
        expect(capturedState).not.toBeNull();
        const state = capturedState!;
        if (systemPrefersReducedMotion) {
          expect(state.transitionsEnabled).toBe(false);
        } else {
          expect(state.transitionsEnabled).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
