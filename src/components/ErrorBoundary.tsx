import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-canvas text-white">
          <h1 className="text-4xl font-display font-bold mb-4">Something went wrong</h1>
          <p className="text-fg-muted mb-8 max-w-md">
            An unexpected error occurred. Please try reloading the page or returning home.
          </p>
          <button 
            className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-brand-primary text-black font-bold hover:bg-brand-primary/90 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
