import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Authentication Error</h1>
          <p style={{ color: '#9ca3af', maxWidth: '400px', textAlign: 'center' }}>
            Your Clerk Publishable Key is incomplete or invalid. The string from your screenshot was truncated.
          </p>
          <div style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', marginTop: '20px', fontSize: '12px', color: '#fbbf24', textAlign: 'left', overflowX: 'auto', maxWidth: '800px' }}>
            <strong style={{color: '#ef4444'}}>TRUE REACT ERROR:</strong><br/>
            {this.state.error && this.state.error.toString()}<br/><br/>
            <strong style={{color: '#a855f7'}}>COMPONENT STACK:</strong><br/>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No stack available'}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
