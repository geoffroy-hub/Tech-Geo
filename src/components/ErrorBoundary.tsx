'use client';

import { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '50vh', padding: '2rem', textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4757', marginBottom: '1rem' }}>Une erreur est survenue</h2>
          <p style={{ color: 'var(--clr-muted)', marginBottom: '2rem' }}>
            {this.state.error?.message || 'Erreur inattendue'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: undefined }); window.location.reload(); }}
            className="btn btn-primary"
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
