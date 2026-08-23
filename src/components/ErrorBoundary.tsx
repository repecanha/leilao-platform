"use client";

import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error(`[ErrorBoundary:${this.props.label}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-danger/40 bg-danger-bg p-4 text-sm text-danger">
          <p className="font-semibold">Erro em “{this.props.label}”</p>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{String(this.state.error.stack || this.state.error.message)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
