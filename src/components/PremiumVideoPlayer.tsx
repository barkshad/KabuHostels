/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, AlertTriangle, 
  Loader2, Maximize, Check, Sparkles 
} from 'lucide-react';
import { optimizeMediaUrl, isLowEndDevice } from '../utils/mediaOptimizer';

interface PremiumVideoPlayerProps {
  url: string;
  poster?: string;
  className?: string;
  autoPlayDefault?: boolean;
  loop?: boolean;
  isHoverMode?: boolean; // thumbnail hovered trigger
}

export const PremiumVideoPlayer: React.FC<PremiumVideoPlayerProps> = ({
  url,
  poster = '',
  className = '',
  autoPlayDefault = true,
  loop = true,
  isHoverMode = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLowSpec, setIsLowSpec] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Detect slow device or heavy animations flag
  useEffect(() => {
    setIsLowSpec(isLowEndDevice());
  }, []);

  // Optimize Cloudinary and progressive URLs
  const optimizedVideoUrl = optimizeMediaUrl(url, 'video');
  const optimizedPosterUrl = optimizeMediaUrl(poster, 'image');

  // Handle intersection observer to autoplay when visible and pause when leaving viewport
  useEffect(() => {
    const videoElement = videoRef.current;
    const containerElement = containerRef.current;
    if (!containerElement || !videoElement || isHoverMode) return;

    const observerOption = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.35 // trigger when 35% of element is on screen
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        setIsFullyVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          if (autoPlayDefault && videoElement && !hasError) {
            // Unify muted autoplay context for cross-browser support
            videoElement.muted = true;
            setIsMuted(true);
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setHasError(false);
                })
                .catch((e) => {
                  console.info('Playback paused or blocked by browsers autoplay policy:', e);
                  setIsPlaying(false);
                });
            }
          }
        } else {
          if (videoElement) {
            videoElement.pause();
            setIsPlaying(false);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOption);
    observer.observe(containerElement);

    return () => {
      observer.disconnect();
    };
  }, [optimizedVideoUrl, autoPlayDefault, isHoverMode, hasError]);

  // Handle miniature Hover Mode (autoplay on hover, muted, looping, pause on leave)
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isHoverMode || !videoElement) return;

    if (autoPlayDefault) {
      videoElement.muted = true;
      setIsMuted(true);
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasError(false);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isHoverMode, autoPlayDefault]);

  // Track video state listeners (buffering, progress, duration, loaded)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setHasError(false);
    };
    const onPlayingProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onError = () => {
      setIsBuffering(false);
      setHasError(true);
      let errStr = 'Playback unavailable: Codec incompatible or network dropped.';
      if (video.error) {
        if (video.error.code === 1) errStr = 'Resource fetching aborted.';
        if (video.error.code === 2) errStr = 'Network error during streaming.';
        if (video.error.code === 3) errStr = 'Video codec decode failed.';
        if (video.error.code === 4) errStr = 'Media file not supported or missing.';
      }
      setErrorMessage(errStr);
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onPlayingProgress);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('error', onError);

    // Initial load
    setIsBuffering(true);

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onPlayingProgress);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('error', onError);
    };
  }, [optimizedVideoUrl, retryCount]);

  // Interactive control triggers
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = isMuted;
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // fallback to muted play if browser blocks sound autoplay
          video.muted = true;
          setIsMuted(true);
          video.play()
            .then(() => setIsPlaying(true))
            .catch(() => setHasError(true));
        });
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    
    video.currentTime = percentage * duration;
    setProgress(percentage * 100);
  };

  const handleForceRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsBuffering(true);
    setRetryCount(prev => prev + 1);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request blocked or failed:', err);
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center transition-all group/player ${className}`}
    >
      {/* Cinematic Glowing Background Aura for Ambient Light Reflection (Only on high-end device) */}
      {!isLowSpec && isPlaying && !isHoverMode && (
        <div className="absolute -inset-10 bg-indigo-500/10 blur-[64px] pointer-events-none opacity-60 mix-blend-screen scale-110 select-none animate-pulse-slow" />
      )}

      {/* Actual HTML Video Tag */}
      <video
        ref={videoRef}
        src={optimizedVideoUrl}
        poster={optimizedPosterUrl}
        loop={loop}
        muted={isMuted}
        playsInline
        webkit-playsinline="true"
        preload="auto"
        className={`w-full h-full object-cover transition-opacity duration-700 ease-out bg-slate-900 ${
          isPlaying ? 'opacity-100 scale-100' : 'opacity-90 scale-[1.01]'
        }`}
      />

      {/* Shine visual overlay (Swipe sweep) */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/player:translate-x-full transition-transform duration-1000 select-none pointer-events-none" />

      {/* Cinematic dark overlay gradient */}
      {!isHoverMode && (
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`} />
      )}

      {/* Buffering/Loading Indicator */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center gap-2 select-none pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin text-white drop-shadow-md" />
          <span className="text-[10px] font-bold text-white tracking-widest font-mono uppercase bg-black/40 px-2 py-0.5 rounded">
            Buffering Stream
          </span>
        </div>
      )}

      {/* Fallback & Recovery Layout */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
          <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-white tracking-tight leading-none uppercase font-mono">
              Playback interrupted
            </h5>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-sans">
              {errorMessage}
            </p>
          </div>
          <button 
            onClick={handleForceRetry}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-800 text-white border border-indigo-400/20 px-3.5 py-1.5 font-bold rounded-lg text-xs transition-colors shadow-lg shadow-indigo-950/40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reconnect Media Channel
          </button>
        </div>
      )}

      {/* Hover mode identifier overlay (small tag) */}
      {isHoverMode && !isBuffering && (
        <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md px-2 py-0.7 rounded-md border border-white/10 flex items-center gap-1 shadow-md animate-fade-in pointer-events-none select-none">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-bold uppercase text-white font-mono tracking-widest leading-none">
            Ambient Live Video
          </span>
        </div>
      )}

      {/* Custom Premium Controller HUD (Hidden in miniature hover mode) */}
      {!isHoverMode && !hasError && (showControls || !isPlaying) && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 animate-fade-in">
          
          {/* Big Center Play/Pause button for immersive touch interaction */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button 
              onClick={handleTogglePlay}
              className={`w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl hover:scale-108 transition-all pointer-events-auto cursor-pointer ${
                isPlaying ? 'opacity-0 scale-90 group-hover/player:opacity-100' : 'opacity-100 scale-100'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Bottom HUD controls console */}
          <div className="space-y-3 pointer-events-auto">
            {/* Seek bar line */}
            <div 
              onClick={handleSeek}
              className="group/seek w-full h-1 bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all duration-150 hover:h-2"
            >
              {/* Progress timeline */}
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-75 relative" 
                style={{ width: `${progress}%` }}
              >
                {/* Micro slider knob */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover/seek:opacity-100 shadow-sm border border-indigo-600 transition-opacity" />
              </div>
            </div>

            {/* Icons rail */}
            <div className="flex items-center justify-between text-white font-mono text-xs select-none">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTogglePlay}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button 
                  onClick={handleToggleMute}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Live stream timeline read out */}
                <span className="text-[10px] text-slate-300 font-bold tracking-tight">
                  {videoRef.current ? (
                    `${Math.floor(videoRef.current.currentTime / 60)}:${String(Math.floor(videoRef.current.currentTime % 60)).padStart(2, '0')}`
                  ) : '0:00'}
                  <span className="text-slate-500"> / </span>
                  {duration ? (
                    `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
                  ) : '0:00'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Autoplay Active badge */}
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/20 rounded text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  <Check className="w-2.5 h-2.5" /> Auto-play Live
                </div>

                <button 
                  onClick={handleFullscreen}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
