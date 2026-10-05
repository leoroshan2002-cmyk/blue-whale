import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] p-6">
          <div className="max-w-2xl rounded-3xl border border-red-200 bg-white p-10 shadow-xl">
            <h1 className="text-3xl font-semibold text-red-700">Something went wrong.</h1>
            <p className="mt-4 text-zinc-600">
              We encountered an unexpected issue while rendering this page.
            </p>
            <pre className="mt-6 whitespace-pre-wrap text-sm text-zinc-500">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
