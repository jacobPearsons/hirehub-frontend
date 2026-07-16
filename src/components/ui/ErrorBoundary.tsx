import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
    if (import.meta.env.PROD) {
      this.setState({ error: new Error('An unexpected error occurred. Please try again.') })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-lg font-medium text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-ink-muted mb-4 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button variant="primary" size="sm" onClick={this.handleRetry}>Try again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
