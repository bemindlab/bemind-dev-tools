import React from "react";
import { useNavigation } from "../contexts/NavigationContext";
import "./NavigationRouter.css";

interface NavigationRouterProps {
  homeView: React.ReactNode;
  toolView: React.ReactNode;
  onNavigate?: (view: "home" | "tool", toolId?: string) => void;
}

export const NavigationRouter: React.FC<NavigationRouterProps> = ({
  homeView,
  toolView,
  onNavigate,
}) => {
  const { state, transitionsEnabled } = useNavigation();

  // Notify parent of navigation changes
  React.useEffect(() => {
    if (onNavigate && !state.transitionInProgress) {
      onNavigate(state.currentView, state.activeToolId || undefined);
    }
  }, [
    state.currentView,
    state.activeToolId,
    state.transitionInProgress,
    onNavigate,
  ]);

  return (
    <div
      className={`navigation-router ${
        state.transitionInProgress ? "transitioning" : ""
      } ${!transitionsEnabled ? "no-transitions" : ""}`}
    >
      <div
        className={`view-container home-view ${
          state.currentView === "home" ? "active" : "inactive"
        }`}
      >
        {homeView}
      </div>
      <div
        className={`view-container tool-view ${
          state.currentView === "tool" ? "active" : "inactive"
        }`}
      >
        {toolView}
      </div>
    </div>
  );
};
