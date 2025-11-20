import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import React from "react";
import { BreadcrumbNavigation } from "../../components/BreadcrumbNavigation";

/**
 * **Feature: dev-tools-dashboard, Property 8: Breadcrumb tool name display**
 * **Validates: Requirements 3.3**
 *
 * Property: For any active tool, the breadcrumb navigation should display that tool's name
 */

describe("Property 8: Breadcrumb tool name display", () => {
  it("should display the tool name in breadcrumb when in tool view", () => {
    fc.assert(
      fc.property(
        // Generate random tool names
        fc.string({ minLength: 1, maxLength: 50 }),
        (toolName) => {
          const handleNavigateHome = () => {};

          // Render breadcrumb in tool view with the tool name
          const { container } = render(
            React.createElement(BreadcrumbNavigation, {
              currentView: "tool",
              toolName,
              onNavigateHome: handleNavigateHome,
            })
          );

          // Verify the tool name is displayed in the breadcrumb
          const breadcrumbText = container.textContent || "";
          expect(breadcrumbText).toContain(toolName);

          // Verify it's marked as current page
          const currentItem = container.querySelector('[aria-current="page"]');
          expect(currentItem).not.toBeNull();
          expect(currentItem?.textContent).toBe(toolName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not display tool name when in home view", () => {
    fc.assert(
      fc.property(
        // Generate random tool names that don't overlap with "Home"
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter(
            (name) =>
              name !== "Home" &&
              !name.split("").every((c) => "Home".includes(c))
          ),
        (toolName) => {
          const handleNavigateHome = () => {};

          // Render breadcrumb in home view
          const { container, unmount } = render(
            React.createElement(BreadcrumbNavigation, {
              currentView: "home",
              toolName,
              onNavigateHome: handleNavigateHome,
            })
          );

          // Verify the tool name is NOT displayed
          const currentItem = container.querySelector('[aria-current="page"]');
          expect(currentItem).toBeNull();

          // Should only show "Home" and separator should not be present
          const separator = container.querySelector(".breadcrumb-separator");
          expect(separator).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should always display Home link regardless of view", () => {
    fc.assert(
      fc.property(
        // Generate random tool names and view states
        fc.record({
          toolName: fc.string({ minLength: 1, maxLength: 50 }),
          currentView: fc.constantFrom("home" as const, "tool" as const),
        }),
        ({ toolName, currentView }) => {
          const handleNavigateHome = () => {};

          // Render breadcrumb
          const { container, unmount } = render(
            React.createElement(BreadcrumbNavigation, {
              currentView,
              toolName: currentView === "tool" ? toolName : undefined,
              onNavigateHome: handleNavigateHome,
            })
          );

          // Verify "Home" is always present
          const breadcrumbText = container.textContent || "";
          expect(breadcrumbText).toContain("Home");

          // Verify Home button exists in this specific container
          const homeButton = container.querySelector(
            '[aria-label="Navigate to home"]'
          );
          expect(homeButton).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
