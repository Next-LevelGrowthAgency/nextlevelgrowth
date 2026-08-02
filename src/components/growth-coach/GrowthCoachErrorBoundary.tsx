"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onReset: () => void;
};

type State = { hasError: boolean };

/**
 * Catches render errors inside the Growth Coach panel so a bug there never
 * takes down the rest of the site. The floating button (rendered by the
 * parent, outside this boundary) always stays available.
 */
export class GrowthCoachErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium text-ink-800">Something interrupted the conversation.</p>
          <p className="text-sm text-ink-500">Let&apos;s reset and pick back up.</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full bg-grove-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-grove-700"
          >
            Reset conversation
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
