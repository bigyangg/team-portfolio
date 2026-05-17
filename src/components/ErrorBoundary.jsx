import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
          <h1 className="text-2xl font-semibold text-[var(--navy)]">Page failed to render</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Please refresh the page. If it still appears blank, clear site data for localhost and reload.
          </p>
        </section>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
