import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import React from "react";
import { HomePage } from "../../components/HomePage";
import { SearchBar } from "../../components/SearchBar";
import { CategoryFilter } from "../../components/CategoryFilter";
import { BreadcrumbNavigation } from "../../components/BreadcrumbNavigation";
import { ToolCard } from "../../components/ToolCard";
import { Tool, Category } from "../../types/dashboard";

/**
 * **Feature: dev-tools-dashboard, Property 34: Focus indicator visibility**
 * **Validates: Requirements 10.4**
 *
 * Property: For any interactive element with focus, a visible focus indicator should be present in the rendered output
 */

describe("Property 34: Focus indicator visibility", () => {
  it(
    "should have visible focus indicators on tool cards",
    { timeout: 30000 },
    () => {
      fc.assert(
        fc.property(
          // Generate random tools
          fc
            .array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                description: fc.string({ minLength: 1, maxLength: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            )
            .map((toolData) =>
              toolData.map((data, index) => ({
                id: `tool-${index}`,
                name: data.name,
                description: data.description,
                icon: "🔧",
                category: ["test"],
                component: () => React.createElement("div", null, "Mock Tool"),
              }))
            ),
          (tools: Tool[]) => {
            const mockOnToolSelect = vi.fn();
            const mockOnToolPin = vi.fn();
            const mockOnToolUnpin = vi.fn();

            const { container } = render(
              React.createElement(HomePage, {
                tools,
                pinnedToolIds: [],
                recentlyUsedToolIds: [],
                onToolSelect: mockOnToolSelect,
                onToolPin: mockOnToolPin,
                onToolUnpin: mockOnToolUnpin,
              })
            );

            // Get all tool cards
            const toolCards = container.querySelectorAll(".tool-card");

            // Focus each tool card and verify focus indicator is present
            toolCards.forEach((card) => {
              (card as HTMLElement).focus();
              expect(document.activeElement).toBe(card);

              // Get computed styles to check for focus indicator
              const styles = window.getComputedStyle(card);

              // Check that the element has a visible focus indicator
              // This can be outline, border, box-shadow, or other visual indicator
              const hasOutline =
                styles.outline !== "none" &&
                styles.outline !== "" &&
                styles.outline !== "0px";
              const hasOutlineWidth =
                styles.outlineWidth !== "0px" && styles.outlineWidth !== "";
              const hasFocusVisibleStyles = hasOutline || hasOutlineWidth;

              expect(hasFocusVisibleStyles).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it("should have visible focus indicators on category filter buttons", () => {
    fc.assert(
      fc.property(
        // Generate random categories
        fc
          .array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 30 }),
            }),
            { minLength: 1, maxLength: 5 }
          )
          .map((catData) =>
            catData.map((data, index) => ({
              id: data.id || `cat-${index}`,
              name: data.name,
              toolCount: index + 1,
            }))
          ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (
          categories: (Category & { toolCount: number })[],
          selectedCategory: string
        ) => {
          if (categories.length === 0) return;

          const mockOnCategorySelect = vi.fn();

          const { container } = render(
            React.createElement(CategoryFilter, {
              categories,
              selectedCategory: categories[0].id,
              onCategorySelect: mockOnCategorySelect,
            })
          );

          // Get all category buttons
          const buttons = container.querySelectorAll(".category-button");

          // Focus each button and verify focus indicator is present
          // Only check first 3 buttons to avoid timeout
          const buttonsToCheck = Array.from(buttons).slice(0, 3);
          buttonsToCheck.forEach((button) => {
            (button as HTMLElement).focus();
            expect(document.activeElement).toBe(button);

            // Get computed styles to check for focus indicator
            const styles = window.getComputedStyle(button);

            // Check that the element has a visible focus indicator
            const hasOutline =
              styles.outline !== "none" &&
              styles.outline !== "" &&
              styles.outline !== "0px";
            const hasOutlineWidth =
              styles.outlineWidth !== "0px" && styles.outlineWidth !== "";
            const hasFocusVisibleStyles = hasOutline || hasOutlineWidth;

            expect(hasFocusVisibleStyles).toBe(true);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it("should have visible focus indicators on search input", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 50 }), (initialValue: string) => {
        const mockOnChange = vi.fn();
        const mockOnClear = vi.fn();

        const { container } = render(
          React.createElement(SearchBar, {
            value: initialValue,
            onChange: mockOnChange,
            onClear: mockOnClear,
          })
        );

        // Get the search input
        const input = container.querySelector(".search-input");
        expect(input).not.toBeNull();

        // Focus the input
        (input as HTMLElement).focus();
        expect(document.activeElement).toBe(input);

        // Get computed styles to check for focus indicator
        const styles = window.getComputedStyle(input!);

        // Check that the element has a visible focus indicator
        // For inputs, this might be border-color, box-shadow, or outline
        const hasOutline =
          styles.outline !== "none" &&
          styles.outline !== "" &&
          styles.outline !== "0px";
        const hasOutlineWidth =
          styles.outlineWidth !== "0px" && styles.outlineWidth !== "";
        const hasBoxShadow =
          styles.boxShadow !== "none" && styles.boxShadow !== "";
        const hasFocusVisibleStyles =
          hasOutline || hasOutlineWidth || hasBoxShadow;

        expect(hasFocusVisibleStyles).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should have visible focus indicators on breadcrumb navigation buttons", { timeout: 15000 }, () => {
    fc.assert(
      fc.property(
        fc.constantFrom("home" as const, "tool" as const),
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
          nil: undefined,
        }),
        (currentView: "home" | "tool", toolName: string | undefined) => {
          const mockOnNavigateHome = vi.fn();

          const { container } = render(
            React.createElement(BreadcrumbNavigation, {
              currentView,
              toolName: currentView === "tool" ? toolName : undefined,
              onNavigateHome: mockOnNavigateHome,
            })
          );

          // Get the breadcrumb link button
          const button = container.querySelector(".breadcrumb-link");
          expect(button).not.toBeNull();

          // Focus the button
          (button as HTMLElement).focus();
          expect(document.activeElement).toBe(button);

          // Get computed styles to check for focus indicator
          const styles = window.getComputedStyle(button!);

          // Check that the element has a visible focus indicator
          const hasOutline =
            styles.outline !== "none" &&
            styles.outline !== "" &&
            styles.outline !== "0px";
          const hasOutlineWidth =
            styles.outlineWidth !== "0px" && styles.outlineWidth !== "";
          const hasFocusVisibleStyles = hasOutline || hasOutlineWidth;

          expect(hasFocusVisibleStyles).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should have visible focus indicators on search clear button when present", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Non-empty string to ensure clear button is present
        (value: string) => {
          const mockOnChange = vi.fn();
          const mockOnClear = vi.fn();

          const { container } = render(
            React.createElement(SearchBar, {
              value,
              onChange: mockOnChange,
              onClear: mockOnClear,
            })
          );

          // Get the clear button (only present when value is non-empty)
          const clearButton = container.querySelector(".search-clear");

          if (clearButton) {
            // Focus the button
            (clearButton as HTMLElement).focus();
            expect(document.activeElement).toBe(clearButton);

            // Get computed styles to check for focus indicator
            const styles = window.getComputedStyle(clearButton);

            // Check that the element has a visible focus indicator
            const hasOutline =
              styles.outline !== "none" &&
              styles.outline !== "" &&
              styles.outline !== "0px";
            const hasOutlineWidth =
              styles.outlineWidth !== "0px" && styles.outlineWidth !== "";
            const hasBoxShadow =
              styles.boxShadow !== "none" && styles.boxShadow !== "";
            const hasFocusVisibleStyles =
              hasOutline || hasOutlineWidth || hasBoxShadow;

            // Note: The clear button might not have explicit focus styles in current implementation
            // This test will help identify if we need to add them
            expect(hasFocusVisibleStyles).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
