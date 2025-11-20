import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "../../../components/ErrorBoundary";

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should render error UI when child component throws", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("should show Return to Home button when onNavigateHome is provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onNavigateHome = vi.fn();

    render(
      <ErrorBoundary onNavigateHome={onNavigateHome}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const returnButton = screen.getByText("Return to Home");
    expect(returnButton).toBeInTheDocument();

    fireEvent.click(returnButton);
    expect(onNavigateHome).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it("should display custom fallback message when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const customMessage = "Custom error message for testing";

    render(
      <ErrorBoundary fallbackMessage={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("should have Try to Recover and Reload Application buttons", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Try to Recover")).toBeInTheDocument();
    expect(screen.getByText("Reload Application")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
