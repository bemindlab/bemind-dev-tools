import React, { useState, useCallback, useEffect, useRef } from "react";
import { Tool, ToolComponentProps } from "../types/dashboard";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import "./ToolViewContainer.css";

interface ToolViewContainerProps {
  toolId: string;
  tool: Tool;
  initialState?: unknown;
  onStateChange: (state: unknown) => void;
  onNavigateHome: () => void;
}

/**
 * ToolViewContainer wraps individual tool components and manages their lifecycle
 * Provides breadcrumb navigation and state preservation
 */
export const ToolViewContainer: React.FC<ToolViewContainerProps> = ({
  toolId,
  tool,
  initialState,
  onStateChange,
  onNavigateHome,
}) => {
  // Track if this tool is currently active
  const [isActive, setIsActive] = useState(true);

  // Store the current tool state in session
  const toolStateRef = useRef<unknown>(initialState);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key returns to home
      if (e.key === "Escape") {
        e.preventDefault();
        onNavigateHome();
      }
      // Cmd/Ctrl+H returns to home
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        onNavigateHome();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigateHome]);

  // Handle state changes from the tool component
  const handleStateChange = useCallback(
    (newState: unknown) => {
      toolStateRef.current = newState;
      onStateChange(newState);
    },
    [onStateChange]
  );

  // Update active state when tool changes
  useEffect(() => {
    setIsActive(true);
    return () => {
      setIsActive(false);
    };
  }, [toolId]);

  // Get the tool component
  const ToolComponent = tool.component;

  // Prepare props for the tool component
  const toolProps: ToolComponentProps = {
    isActive,
    onStateChange: handleStateChange,
    initialState: toolStateRef.current,
  };

  return (
    <div className="tool-view-container">
      <BreadcrumbNavigation
        currentView="tool"
        toolName={tool.name}
        onNavigateHome={onNavigateHome}
      />
      <div className="tool-content">
        <ToolComponent {...toolProps} />
      </div>
    </div>
  );
};
