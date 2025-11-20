import React, { Component, ErrorInfo, ReactNode } from "react";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  onNavigateHome?: () => void;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component for catching and displaying React errors
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleNavigateHome = (): void => {
    if (this.props.onNavigateHome) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
      this.props.onNavigateHome();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠️</div>
            <h1 className="error-boundary-title">Something went wrong</h1>
            <p className="error-boundary-message">
              {this.props.fallbackMessage ||
                "The application encountered an unexpected error. You can try to recover or reload the application."}
            </p>

            {this.state.error && (
              <div className="error-boundary-details">
                <h3>Error Details:</h3>
                <pre className="error-boundary-error-message">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="error-boundary-stack">
                    <summary>Stack Trace</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="error-boundary-actions">
              {this.props.onNavigateHome && (
                <button
                  className="error-boundary-button primary"
                  onClick={this.handleNavigateHome}
                >
                  Return to Home
                </button>
              )}
              <button
                className="error-boundary-button primary"
                onClick={this.handleReset}
              >
                Try to Recover
              </button>
              <button
                className="error-boundary-button secondary"
                onClick={this.handleReload}
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
