import { useState, useRef, useCallback } from 'react'

export const useEmojiPicker = (initialValue = '') => {
  const [value, setValue] = useState(initialValue)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [caretPosition, setCaretPosition] = useState(0)
  const inputRef = useRef(null)

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    const input = inputRef.current
    if (!input) return

    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const newValue = value.slice(0, start) + emoji + value.slice(end)
    
    setValue(newValue)
    
    // Set cursor position after the emoji
    setTimeout(() => {
      const newPosition = start + emoji.length
      input.setSelectionRange(newPosition, newPosition)
      input.focus()
    }, 0)
  }, [value])

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setValue(e.target.value)
  }, [])

  // Handle input focus to track cursor position
  const handleInputFocus = useCallback((e) => {
    setCaretPosition(e.target.selectionStart || 0)
  }, [])

  // Handle input click to track cursor position
  const handleInputClick = useCallback((e) => {
    setCaretPosition(e.target.selectionStart || 0)
  }, [])

  // Handle key events to track cursor position
  const handleInputKeyUp = useCallback((e) => {
    setCaretPosition(e.target.selectionStart || 0)
  }, [])

  // Open emoji picker
  const openEmojiPicker = useCallback(() => {
    setIsPickerOpen(true)
  }, [])

  // Close emoji picker
  const closeEmojiPicker = useCallback(() => {
    setIsPickerOpen(false)
  }, [])

  // Toggle emoji picker
  const toggleEmojiPicker = useCallback(() => {
    setIsPickerOpen(prev => !prev)
  }, [])

  // Reset value
  const resetValue = useCallback(() => {
    setValue('')
  }, [])

  // Set value programmatically
  const setValueProgrammatically = useCallback((newValue) => {
    setValue(newValue)
  }, [])

  return {
    value,
    setValue: setValueProgrammatically,
    isPickerOpen,
    caretPosition,
    inputRef,
    handleEmojiSelect,
    handleInputChange,
    handleInputFocus,
    handleInputClick,
    handleInputKeyUp,
    openEmojiPicker,
    closeEmojiPicker,
    toggleEmojiPicker,
    resetValue
  }
}
