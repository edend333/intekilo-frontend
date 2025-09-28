import { useState, useEffect, useRef, useCallback } from 'react'

export function AvatarCropper({ 
    imageUrl, 
    onCropComplete, 
    onCancel, 
    isUploading = false 
}) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const imageRef = useRef(null)
    
    const [imageLoaded, setImageLoaded] = useState(false)
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
    const [containerSize, setContainerSize] = useState({ width: 400, height: 400 })
    
    // Constants
    const MIN_SCALE = 1
    const MAX_SCALE = 3
    const CIRCLE_RADIUS = 150 // Half of container size for 300px circle

    // Load image and calculate initial position
    useEffect(() => {
        if (!imageUrl) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            setImageSize({ width: img.width, height: img.height })
            setImageLoaded(true)
            
            // Calculate initial scale to cover the circle completely
            const scaleX = (containerSize.width * 1.2) / img.width
            const scaleY = (containerSize.height * 1.2) / img.height
            const initialScale = Math.max(scaleX, scaleY, MIN_SCALE)
            
            setCropPosition({
                x: (containerSize.width - img.width * initialScale) / 2,
                y: (containerSize.height - img.height * initialScale) / 2,
                scale: initialScale
            })
        }
        img.src = imageUrl
        imageRef.current = img
    }, [imageUrl, containerSize])

    // Update container size on mount and resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setContainerSize({ width: rect.width, height: rect.height })
            }
        }
        
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    // Draw the cropper
    const drawCropper = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !imageLoaded || !imageRef.current) return

        const ctx = canvas.getContext('2d')
        const { width, height } = containerSize
        const { x, y, scale } = cropPosition
        const img = imageRef.current

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Create clipping path for circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, CIRCLE_RADIUS, 0, 2 * Math.PI)
        ctx.clip()

        // Draw image with current transform
        ctx.drawImage(
            img,
            x, y,
            img.width * scale,
            img.height * scale
        )

        ctx.restore()

        // Draw circle outline
        ctx.strokeStyle = '#0095f6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, CIRCLE_RADIUS, 0, 2 * Math.PI)
        ctx.stroke()

        // Draw grid lines for better visibility
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(width / 2, height / 2 - CIRCLE_RADIUS)
        ctx.lineTo(width / 2, height / 2 + CIRCLE_RADIUS)
        ctx.stroke()
        
        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(width / 2 - CIRCLE_RADIUS, height / 2)
        ctx.lineTo(width / 2 + CIRCLE_RADIUS, height / 2)
        ctx.stroke()
        
        ctx.setLineDash([])
    }, [imageLoaded, cropPosition, containerSize])

    // Redraw when dependencies change
    useEffect(() => {
        drawCropper()
    }, [drawCropper])

    // Mouse event handlers
    const handleMouseDown = (e) => {
        setIsDragging(true)
        setDragStart({
            x: e.clientX - cropPosition.x,
            y: e.clientY - cropPosition.y
        })
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return

        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y

        // Constrain movement to keep image covering the circle
        const img = imageRef.current
        if (!img) return

        const scaledWidth = img.width * cropPosition.scale
        const scaledHeight = img.height * cropPosition.scale

        const minX = containerSize.width / 2 - CIRCLE_RADIUS - scaledWidth
        const maxX = containerSize.width / 2 + CIRCLE_RADIUS
        const minY = containerSize.height / 2 - CIRCLE_RADIUS - scaledHeight
        const maxY = containerSize.height / 2 + CIRCLE_RADIUS

        setCropPosition(prev => ({
            ...prev,
            x: Math.max(minX, Math.min(maxX, newX)),
            y: Math.max(minY, Math.min(maxY, newY))
        }))
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Wheel event for zoom
    const handleWheel = (e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, cropPosition.scale * delta))
        
        if (newScale !== cropPosition.scale) {
            // Adjust position to keep image centered during zoom
            const img = imageRef.current
            if (!img) return

            const scaleRatio = newScale / cropPosition.scale
            const centerX = containerSize.width / 2
            const centerY = containerSize.height / 2
            
            const newX = centerX - (centerX - cropPosition.x) * scaleRatio
            const newY = centerY - (centerY - cropPosition.y) * scaleRatio

            setCropPosition({
                x: newX,
                y: newY,
                scale: newScale
            })
        }
    }

    // Keyboard event handlers
    const handleKeyDown = (e) => {
        if (!imageLoaded) return

        const step = 10
        const zoomStep = 0.1
        let newX = cropPosition.x
        let newY = cropPosition.y
        let newScale = cropPosition.scale

        switch (e.key) {
            case 'ArrowLeft':
                newX += step
                break
            case 'ArrowRight':
                newX -= step
                break
            case 'ArrowUp':
                newY += step
                break
            case 'ArrowDown':
                newY -= step
                break
            case '+':
            case '=':
                newScale = Math.min(MAX_SCALE, cropPosition.scale + zoomStep)
                break
            case '-':
                newScale = Math.max(MIN_SCALE, cropPosition.scale - zoomStep)
                break
            case 'r':
            case 'R':
                // Reset to initial position
                const img = imageRef.current
                if (img) {
                    const scaleX = (containerSize.width * 1.2) / img.width
                    const scaleY = (containerSize.height * 1.2) / img.height
                    const initialScale = Math.max(scaleX, scaleY, MIN_SCALE)
                    
                    setCropPosition({
                        x: (containerSize.width - img.width * initialScale) / 2,
                        y: (containerSize.height - img.height * initialScale) / 2,
                        scale: initialScale
                    })
                }
                return
            default:
                return
        }

        // Apply constraints
        const img = imageRef.current
        if (img) {
            const scaledWidth = img.width * newScale
            const scaledHeight = img.height * newScale

            const minX = containerSize.width / 2 - CIRCLE_RADIUS - scaledWidth
            const maxX = containerSize.width / 2 + CIRCLE_RADIUS
            const minY = containerSize.height / 2 - CIRCLE_RADIUS - scaledHeight
            const maxY = containerSize.height / 2 + CIRCLE_RADIUS

            setCropPosition({
                x: Math.max(minX, Math.min(maxX, newX)),
                y: Math.max(minY, Math.min(maxY, newY)),
                scale: newScale
            })
        }

        e.preventDefault()
    }

    // Generate cropped image
    const generateCroppedImage = () => {
        const canvas = canvasRef.current
        if (!canvas || !imageLoaded) return null

        // Create a new canvas for the cropped image
        const cropCanvas = document.createElement('canvas')
        const cropCtx = cropCanvas.getContext('2d')
        
        // Set size to 512x512 for high quality
        cropCanvas.width = 512
        cropCanvas.height = 512

        // Create circular clipping path
        cropCtx.save()
        cropCtx.beginPath()
        cropCtx.arc(256, 256, 256, 0, 2 * Math.PI)
        cropCtx.clip()

        // Draw the cropped portion
        const { x, y, scale } = cropPosition
        const img = imageRef.current
        
        // Calculate the source rectangle that covers the circle
        const sourceX = (containerSize.width / 2 - CIRCLE_RADIUS - x) / scale
        const sourceY = (containerSize.height / 2 - CIRCLE_RADIUS - y) / scale
        const sourceSize = (CIRCLE_RADIUS * 2) / scale

        cropCtx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, 512, 512
        )

        cropCtx.restore()

        return cropCanvas.toDataURL('image/jpeg', 0.9)
    }

    // Handle save
    const handleSave = () => {
        const croppedDataUrl = generateCroppedImage()
        if (croppedDataUrl && onCropComplete) {
            onCropComplete(croppedDataUrl)
        }
    }

    // Handle reset
    const handleReset = () => {
        if (!imageRef.current) return

        const img = imageRef.current
        const scaleX = (containerSize.width * 1.2) / img.width
        const scaleY = (containerSize.height * 1.2) / img.height
        const initialScale = Math.max(scaleX, scaleY, MIN_SCALE)
        
        setCropPosition({
            x: (containerSize.width - img.width * initialScale) / 2,
            y: (containerSize.height - img.height * initialScale) / 2,
            scale: initialScale
        })
    }

    if (!imageUrl) {
        return (
            <div className="avatar-cropper-placeholder">
                <p>אנא בחרי תמונה תחילה</p>
            </div>
        )
    }

    return (
        <div className="avatar-cropper">
            <div className="cropper-instructions">
                <p>גרור למיקום • גלגל לזום • לחץ שמור</p>
                <p className="keyboard-hint">מקלדת: חיצים לזוז, +/- לזום, R לאיפוס</p>
            </div>
            
            <div className="cropper-preview-section">
                <div className="preview-label">תצוגה מקדימה:</div>
                <div className="circular-preview">
                    <img 
                        src={imageUrl} 
                        alt="Preview" 
                        style={{
                            transform: `translate(${-cropPosition.x * 0.4}px, ${-cropPosition.y * 0.4}px) scale(${cropPosition.scale * 0.4})`,
                            transformOrigin: 'center center'
                        }}
                    />
                </div>
            </div>
            
            <div 
                ref={containerRef}
                className="cropper-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <canvas
                    ref={canvasRef}
                    width={containerSize.width}
                    height={containerSize.height}
                    className="cropper-canvas"
                />
                
                {!imageLoaded && (
                    <div className="cropper-loading">
                        <div className="loading-spinner"></div>
                        <p>טוען תמונה...</p>
                    </div>
                )}
            </div>

            <div className="cropper-controls">
                <button 
                    className="btn-reset"
                    onClick={handleReset}
                    disabled={!imageLoaded || isUploading}
                >
                    איפוס
                </button>
                <button 
                    className="btn-cancel"
                    onClick={onCancel}
                    disabled={isUploading}
                >
                    בטל
                </button>
                <button 
                    className="btn-save"
                    onClick={handleSave}
                    disabled={!imageLoaded || isUploading}
                >
                    {isUploading ? 'שומר...' : 'שמור'}
                </button>
            </div>
        </div>
    )
}
