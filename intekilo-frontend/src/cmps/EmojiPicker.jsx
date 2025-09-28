import React, { useState, useRef, useEffect, useCallback } from 'react'

// Try to import emoji-picker-react with fallback
let EmojiPickerReact = null
try {
  EmojiPickerReact = require('emoji-picker-react')
} catch (error) {
  console.warn('emoji-picker-react not available, using fallback')
}

const EmojiPicker = ({ 
  onEmojiSelect, 
  isOpen, 
  onClose, 
  position = 'bottom-left',
  theme = 'light',
  className = ''
}) => {
  const pickerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Focus the picker for accessibility
      setTimeout(() => {
        if (pickerRef.current) {
          pickerRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleEmojiSelect = useCallback((emoji) => {
    // Handle both emoji object and direct emoji string
    const emojiString = typeof emoji === 'string' ? emoji : emoji.emoji
    onEmojiSelect(emojiString)
    onClose()
  }, [onEmojiSelect, onClose])

  if (!isOpen || !isVisible) {
    return null
  }


  // Fallback emoji picker if the package is not available
  if (!EmojiPickerReact) {
    return (
      <div 
        ref={pickerRef}
        className={`emoji-picker ${className} emoji-picker--${position} emoji-picker--${theme} emoji-picker-fallback`}
        role="dialog"
        aria-label="בחירת אמוג'י"
        aria-modal="true"
        tabIndex={-1}
        id="emoji-picker"
      >
        <div className="emoji-picker-fallback-content">
          <h3>בורר אמוג'י</h3>
          <p>בורר האמוג'י לא זמין כרגע</p>
          <div className="emoji-fallback-buttons">
            <button onClick={() => handleEmojiSelect('😀')}>😀</button>
            <button onClick={() => handleEmojiSelect('😂')}>😂</button>
            <button onClick={() => handleEmojiSelect('❤️')}>❤️</button>
            <button onClick={() => handleEmojiSelect('👍')}>👍</button>
            <button onClick={() => handleEmojiSelect('👎')}>👎</button>
            <button onClick={() => handleEmojiSelect('🎉')}>🎉</button>
            <button onClick={() => handleEmojiSelect('🔥')}>🔥</button>
            <button onClick={() => handleEmojiSelect('💯')}>💯</button>
          </div>
          <button className="close-button" onClick={onClose}>סגור</button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={pickerRef}
      className={`emoji-picker ${className} emoji-picker--${position} emoji-picker--${theme}`}
      role="dialog"
      aria-label="בחירת אמוג'י"
      aria-modal="true"
      tabIndex={-1}
      id="emoji-picker"
    >
      <EmojiPickerReact
        onEmojiClick={handleEmojiSelect}
        theme={theme === 'dark' ? 'dark' : 'light'}
        height={350}
        width="100%"
        searchDisabled={false}
        skinTonesDisabled={false}
        previewConfig={{
          showPreview: false
        }}
        categories={[
          'smileys',
          'people',
          'animals',
          'food',
          'activities',
          'travel',
          'objects',
          'symbols',
          'flags'
        ]}
      />
    </div>
  )
}

export default EmojiPicker
