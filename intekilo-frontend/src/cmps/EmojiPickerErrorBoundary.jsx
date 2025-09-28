import React from 'react'

class EmojiPickerErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('EmojiPicker Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="emoji-picker-error">
          <p>שגיאה בטעינת בורר האמוג'י</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            נסה שוב
          </button>
          <button onClick={() => window.location.reload()}>רענן דף</button>
        </div>
      )
    }

    return this.props.children
  }
}

export default EmojiPickerErrorBoundary
