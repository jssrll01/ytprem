import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', color: '#fff', background: '#141414' }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h1>
        <p style={{ opacity: .75, maxWidth: 420, fontSize: 14, wordBreak: 'break-word' }}>{String(this.state.error && this.state.error.message || this.state.error)}</p>
        <a href="/" style={{ padding: '10px 22px', borderRadius: 4, background: '#fff', color: '#000', fontWeight: 700, textDecoration: 'none' }}>Back to Home</a>
      </div>
    )
  }
}
