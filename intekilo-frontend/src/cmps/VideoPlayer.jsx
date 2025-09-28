import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

export const VideoPlayer = forwardRef(({ 
  src, 
  poster, 
  duration, 
  width, 
  height, 
  autoPlay = false, 
  muted = true, 
  loop = false,
  onPlay,
  onPause,
  onEnded,
  className = '',
  style = {}
}, ref) => {
  const videoRef = useRef(null)
  
  // Expose video element methods to parent
  useImperativeHandle(ref, () => ({
    pause: () => videoRef.current?.pause(),
    play: () => videoRef.current?.play(),
    getCurrentTime: () => videoRef.current?.currentTime,
    setCurrentTime: (time) => {
      if (videoRef.current) videoRef.current.currentTime = time
    }
  }))
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(muted)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      videoRef.current.play()
      setIsPlaying(true)
      onPlay?.()
    }
  }, [isPlaying, onPlay, onPause])

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    
    // Ensure volume is set to 1 when unmuting
    if (!newMuted) {
      videoRef.current.volume = 1.0
    }
    
    setIsMuted(newMuted)
    
    // Debug logging
    console.log('🔊 Video mute toggle:', {
      newMuted,
      videoMuted: videoRef.current.muted,
      videoVolume: videoRef.current.volume,
      videoSrc: videoRef.current.src,
      audioTracks: videoRef.current.audioTracks?.length || 'N/A'
    })
  }, [isMuted])

  // Handle playback rate change
  const changePlaybackRate = useCallback((rate) => {
    if (!videoRef.current) return
    
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  // Handle back 10 seconds
  const goBack10s = useCallback(() => {
    if (!videoRef.current) return
    
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
  }, [])

  // Handle seek
  const handleSeek = useCallback((e) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    videoRef.current.currentTime = newTime
  }, [duration])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!videoRef.current) return
    
    switch (e.key.toLowerCase()) {
      case 'k':
      case ' ':
        e.preventDefault()
        togglePlay()
        break
      case 'm':
        e.preventDefault()
        toggleMute()
        break
      case 'j':
        e.preventDefault()
        goBack10s()
        break
      case 'arrowleft':
        e.preventDefault()
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
        break
      case 'arrowright':
        e.preventDefault()
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5)
        break
      case '.':
        if (e.shiftKey) {
          e.preventDefault()
          changePlaybackRate(playbackRate === 1.5 ? 1.0 : playbackRate + 0.25)
        }
        break
      case ',':
        if (e.shiftKey) {
          e.preventDefault()
          changePlaybackRate(playbackRate === 0.5 ? 1.0 : playbackRate - 0.25)
        }
        break
    }
  }, [togglePlay, toggleMute, goBack10s, changePlaybackRate, playbackRate, duration])

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedData = () => {
    setIsLoading(false)
    setError(null)
    
    // Debug audio track info
    if (videoRef.current) {
      console.log('🎬 Video loaded:', {
        src: videoRef.current.src,
        muted: videoRef.current.muted,
        volume: videoRef.current.volume,
        duration: videoRef.current.duration,
        audioTracks: videoRef.current.audioTracks?.length || 'N/A',
        videoTracks: videoRef.current.videoTracks?.length || 'N/A'
      })
    }
  }

  const handleError = () => {
    setError('שגיאה בטעינת הווידיאו')
    setIsLoading(false)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    onEnded?.()
  }

  // Mouse events for controls visibility
  const handleMouseEnter = () => setShowControls(true)
  const handleMouseLeave = () => setShowControls(false)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial properties
    video.muted = isMuted
    video.volume = isMuted ? 0 : 1.0
    video.playbackRate = playbackRate
    
    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('canplay', () => {
      console.log('🎬 Video can play:', {
        src: video.src,
        muted: video.muted,
        volume: video.volume,
        duration: video.duration
      })
    })

    // Auto play if requested
    if (autoPlay) {
      video.play().then(() => {
        setIsPlaying(true)
        onPlay?.()
      }).catch(err => {
        console.warn('Auto-play failed:', err)
      })
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('ended', handleEnded)
    }
  }, [autoPlay, isMuted, playbackRate, onPlay])

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (error) {
    return (
      <div className={`video-error ${className}`} style={style}>
        <div className="error-icon">🎬</div>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div 
      className={`video-player ${className}`} 
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || src}
        width={width}
        height={height}
        loop={loop}
        preload="metadata"
        playsInline
        controls={false}
        className="video-element"
        onClick={togglePlay}
      />
      
      {isLoading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {/* Small play badge in corner */}
      {!isPlaying && !isLoading && (
        <div className="play-badge-corner">
          <div className="play-icon-small">▶</div>
        </div>
      )}
      
      {/* Floating mute button */}
      <div className="mute-button-floating">
        <button 
          className="mute-btn-floating"
          onClick={toggleMute}
          aria-label={isMuted ? 'השתק' : 'השתק'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      
      {(showControls || !isPlaying) && (
        <div className="video-controls">
          {/* Progress bar */}
          <div className="progress-container" onClick={handleSeek}>
            <div 
              className="progress-bar"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Control buttons */}
          <div className="controls-row">
            <div className="controls-left">
              <button 
                className="control-btn play-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? 'השהה' : 'נגן'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button 
                className="control-btn back-btn"
                onClick={goBack10s}
                aria-label="חזור 10 שניות"
              >
                ⏪
              </button>
              
              
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="controls-right">
              <div className="playback-rate">
                <button 
                  className={`rate-btn ${playbackRate === 0.5 ? 'active' : ''}`}
                  onClick={() => changePlaybackRate(0.5)}
                  aria-label="מהירות 0.5x"
                >
                  0.5x
                </button>
                <button 
                  className={`rate-btn ${playbackRate === 1.0 ? 'active' : ''}`}
                  onClick={() => changePlaybackRate(1.0)}
                  aria-label="מהירות 1.0x"
                >
                  1.0x
                </button>
                <button 
                  className={`rate-btn ${playbackRate === 1.25 ? 'active' : ''}`}
                  onClick={() => changePlaybackRate(1.25)}
                  aria-label="מהירות 1.25x"
                >
                  1.25x
                </button>
                <button 
                  className={`rate-btn ${playbackRate === 1.5 ? 'active' : ''}`}
                  onClick={() => changePlaybackRate(1.5)}
                  aria-label="מהירות 1.5x"
                >
                  1.5x
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Keyboard shortcuts hint */}
      {showControls && (
        <div className="keyboard-hints">
          <span>k/space: נגן/השהה | m: השתק | j: חזור 10s | ←→: 5s | Shift+./,: מהירות</span>
        </div>
      )}
    </div>
  )
})
