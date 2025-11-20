import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { NavigationState, NavigationHistoryEntry } from "../types/dashboard";

/**
 * Navigation context value interface
 */
export interface NavigationContextValue {
  state: NavigationState;
  navigateToHome: () => void;
  navigateToTool: (toolId: string) => void;
  canGoBack: boolean;
  transitionsEnabled: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: React.ReactNode;
  transitionDuration?: number;
  enableTransitions?: boolean;
  reducedMotion?: boolean;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  transitionDuration = 300,
  enableTransitions = true,
  reducedMotion = false,
}) => {
  const [state, setState] = useState<NavigationState>({
    currentView: "home",
    activeToolId: null,
    history: [],
    transitionInProgress: false,
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for system-level reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (not available in some test environments)
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Determine if transitions should be enabled
  // Transitions are disabled if:
  // 1. enableTransitions is false, OR
  // 2. reducedMotion prop is true, OR
  // 3. System prefers reduced motion
  const transitionsEnabled =
    enableTransitions && !reducedMotion && !prefersReducedMotion;

  const navigateToHome = useCallback(() => {
    // Block navigation if transition is in progress
    if (state.transitionInProgress) {
      return;
    }

    // Start transition
    setState((prev) => ({
      ...prev,
      transitionInProgress: transitionsEnabled,
    }));

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Complete navigation after transition duration
    const timeout = setTimeout(
      () => {
        setState((prev) => {
          const historyEntry: NavigationHistoryEntry = {
            view: "home",
            timestamp: Date.now(),
          };

          return {
            currentView: "home",
            activeToolId: null,
            history: [...prev.history, historyEntry],
            transitionInProgress: false,
          };
        });
      },
      transitionsEnabled ? transitionDuration : 0
    );

    transitionTimeoutRef.current = timeout;
  }, [state.transitionInProgress, transitionsEnabled, transitionDuration]);

  const navigateToTool = useCallback(
    (toolId: string) => {
      // Block navigation if transition is in progress
      if (state.transitionInProgress) {
        return;
      }

      // Start transition
      setState((prev) => ({
        ...prev,
        transitionInProgress: transitionsEnabled,
      }));

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Complete navigation after transition duration
      const timeout = setTimeout(
        () => {
          setState((prev) => {
            const historyEntry: NavigationHistoryEntry = {
              view: "tool",
              toolId,
              timestamp: Date.now(),
            };

            return {
              currentView: "tool",
              activeToolId: toolId,
              history: [...prev.history, historyEntry],
              transitionInProgress: false,
            };
          });
        },
        transitionsEnabled ? transitionDuration : 0
      );

      transitionTimeoutRef.current = timeout;
    },
    [state.transitionInProgress, transitionsEnabled, transitionDuration]
  );

  const canGoBack = state.history.length > 0;

  const value: NavigationContextValue = {
    state,
    navigateToHome,
    navigateToTool,
    canGoBack,
    transitionsEnabled,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
