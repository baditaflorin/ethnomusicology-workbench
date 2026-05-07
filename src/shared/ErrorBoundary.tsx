import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryState = {
  error?: Error;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <section className="empty-state">
            <h1>Something interrupted the workbench.</h1>
            <p>{this.state.error.message}</p>
            <button type="button" onClick={() => this.setState({ error: undefined })}>
              Try again
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
