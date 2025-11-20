import React from "react";
import "./BreadcrumbNavigation.css";

interface BreadcrumbNavigationProps {
  currentView: "home" | "tool";
  toolName?: string;
  onNavigateHome: () => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentView,
  toolName,
  onNavigateHome,
}) => {
  return (
    <nav className="breadcrumb-navigation" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <button
            className="breadcrumb-link"
            onClick={onNavigateHome}
            aria-label="Navigate to home"
          >
            Home
          </button>
        </li>
        {currentView === "tool" && toolName && (
          <>
            <li className="breadcrumb-separator" aria-hidden="true">
              /
            </li>
            <li
              className="breadcrumb-item breadcrumb-current"
              aria-current="page"
            >
              {toolName}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};
