import React, { useState } from 'react'
import { useEmojiPicker } from '../customHooks/useEmojiPicker'
import EmojiPicker from './EmojiPicker'

const TextInputWithEmoji = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 3,
  maxLength,
  disabled = false,
  required = false,
  autoFocus = false,
  emojiPosition = 'bottom-right',
  theme = 'light',
  showEmojiButton = true,
  ...props
}) => {
  const {
    isPickerOpen,
    inputRef,
    handleEmojiSelect: hookHandleEmojiSelect,
    handleInputChange: hookHandleInputChange,
    handleInputFocus,
    handleInputClick,
    handleInputKeyUp,
    openEmojiPicker,
    closeEmojiPicker,
    toggleEmojiPicker
  } = useEmojiPicker(value)

  // Custom emoji select that calls both hook and external onChange
  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const newValue = value.slice(0, start) + emoji + value.slice(end)
    
    // Call external onChange if provided
    if (onChange) {
      onChange({ target: { value: newValue } })
    }
    
    // Also call hook's handler for cursor positioning
    hookHandleEmojiSelect(emoji)
  }

  // Custom input change that calls both hook and external onChange
  const handleInputChange = (e) => {
    // Call external onChange if provided
    if (onChange) {
      onChange(e)
    }
    
    // Also call hook's handler
    hookHandleInputChange(e)
  }

  // Handle input change with external onChange
  const handleChange = (e) => {
    handleInputChange(e)
  }

  // Emoji button icon (smiley face)
  const EmojiIcon = () => (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      width="18" 
      height="18"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )

  return (
    <div className={`text-input-with-emoji ${className}`}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onKeyUp={handleInputKeyUp}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className="text-input"
        aria-label={placeholder}
        {...props}
      />
      
      {showEmojiButton && (
        <button
          type="button"
          className={`emoji-button ${isPickerOpen ? 'emoji-button--active' : ''}`}
          onClick={toggleEmojiPicker}
          aria-label="הוסף אמוג'י"
          aria-expanded={isPickerOpen}
          aria-haspopup="dialog"
          aria-controls="emoji-picker"
          disabled={disabled}
        >
          <EmojiIcon />
        </button>
      )}

      {isPickerOpen && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          isOpen={isPickerOpen}
          onClose={closeEmojiPicker}
          position={emojiPosition}
          theme={theme}
        />
      )}
    </div>
  )
}

export default TextInputWithEmoji
