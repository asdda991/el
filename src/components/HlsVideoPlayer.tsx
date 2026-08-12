import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Volume2, VolumeX, Play, Pause, Maximize, RotateCcw } from "lucide-react";

interface HlsVideoPlayerProps {
  src: string;
  className?: string;
}

export default function HlsVideoPlayer({ src, className = "" }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0); // Controllable volume level (0 to 1)
  const [showUnmuteToast, setShowUnmuteToast] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Dynamic buffer settings loaded from server (set by admin)
  const [bufferSettings, setBufferSettings] = useState({
    maxBufferLength: 10,
    maxMaxBufferLength: 15,
    liveSyncDurationCount: 3
  });

  // Fetch buffer settings on mount
  useEffect(() => {
    fetch("/api/admin/buffer-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setBufferSettings({
            maxBufferLength: Number(data.maxBufferLength) || 10,
            maxMaxBufferLength: Number(data.maxMaxBufferLength) || 15,
            liveSyncDurationCount: Number(data.liveSyncDurationCount) || 3
          });
        }
      })
      .catch((err) => console.error("Error loading buffer settings for player:", err));
  }, []);

  // Sync volume state to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, retryKey]);

  // Clean and prepare the stream URL
  const processedUrl = (() => {
    if (!src) return "";
    const trimmed = src.trim();

    // Check if the protocol is HTTPS and device is Safari or iOS
    const isHttps = trimmed.toLowerCase().startsWith("https://");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // On iOS or Safari, always prefer direct HTTPS URL to avoid proxy range request decoding failures (black screen)
    if (isHttps && (isIOS || isSafari)) {
      return trimmed;
    }

    // Proxy all HTTP and HTTPS external links to bypass CORS & Mixed Content
    if (trimmed.toLowerCase().startsWith("http://") || trimmed.toLowerCase().startsWith("https://")) {
      return `/api/stream-proxy?url=${encodeURIComponent(trimmed)}`;
    }
    return trimmed;
  })();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !processedUrl) return;

    let hls: Hls | null = null;
    let playAttempted = false;
    let hlsRetryCount = 0;
    const maxHlsRetries = 3;
    let retryTimeoutId: any = null;

    setIsBuffering(true);
    setHasError(false);
    setErrorMessage("");

    const handleLoadStart = () => setIsBuffering(true);
    
    const attemptPlay = () => {
      if (playAttempted) return;
      playAttempted = true;

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              if (video.muted) {
                setIsMuted(true);
                setShowUnmuteToast(true);
              } else {
                setIsMuted(false);
                setShowUnmuteToast(false);
              }
            })
            .catch((err) => {
              if (err.name === "AbortError") {
                console.log("[HlsVideoPlayer] Play request was interrupted by another load request (benign).");
                return;
              }
              console.warn("Autoplay blocked. Attempting muted play...", err);
              video.muted = true;
              setIsMuted(true);
              
              const mutedPlayPromise = video.play();
              if (mutedPlayPromise !== undefined) {
                mutedPlayPromise
                  .then(() => {
                    setIsPlaying(true);
                    setShowUnmuteToast(true);
                  })
                  .catch((e) => {
                    if (e.name === "AbortError") {
                      console.log("[HlsVideoPlayer] Muted play request was interrupted (benign).");
                      return;
                    }
                    console.error("Muted autoplay failed as well:", e);
                    setIsPlaying(false);
                    setIsBuffering(false);
                  });
              }
            });
        }
      } catch (err) {
        console.error("Error initiating playback:", err);
      }
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      attemptPlay();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      // Don't flag error immediately if HLS is still retrying
      if (!hls) {
        setHasError(true);
        setErrorMessage("تعذر تحميل الفيديو أو انقطع الاتصال بالبث");
      }
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadedmetadata", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    const lowerSrc = src.toLowerCase();
    const isHls = lowerSrc.includes(".m3u8") || 
                  lowerSrc.includes("/live/") || 
                  lowerSrc.includes("hls") || 
                  lowerSrc.includes("stream") || 
                  (!lowerSrc.includes(".mp4") && !lowerSrc.includes(".webm") && !lowerSrc.includes(".mkv") && !lowerSrc.includes(".mp3"));
    if (isHls) {
      if (Hls.isSupported()) {
        // Detect mobile/tablet to optimize buffer and memory footprint
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Hls.js library (Chrome, Firefox, Edge, Android) - Prefer Hls.js for robust custom decoding
        hls = new Hls({
          // Dynamic adaptive buffering suited for mobile networks and RAM constraints
          maxBufferLength: isMobileDevice ? Math.min(6, bufferSettings.maxBufferLength) : bufferSettings.maxBufferLength,
          maxMaxBufferLength: isMobileDevice ? Math.min(10, bufferSettings.maxMaxBufferLength) : bufferSettings.maxMaxBufferLength,
          maxBufferSize: isMobileDevice ? 25 * 1024 * 1024 : 60 * 1024 * 1024, // 25MB max on mobile to prevent tab crashes
          liveSyncDurationCount: bufferSettings.liveSyncDurationCount,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: isMobileDevice ? 10 : 30, // Periodically ejects older segments from RAM
          manifestLoadingMaxRetry: 6,
          levelLoadingMaxRetry: 6,
          // CRITICAL: Caps quality level based on physical player/screen dimensions to stop HD lags/crashes on mobile & tablets
          capLevelToPlayerSize: true, 
          testBandwidth: true,
          abrEwmaDefaultEstimate: 1500000 // 1.5 Mbps default estimate to avoid starting in oversized quality level
        });

        hls.loadSource(processedUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          attemptPlay();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (hlsRetryCount < maxHlsRetries) {
                  hlsRetryCount++;
                  console.warn(`[HlsVideoPlayer] Fatal network error in HLS playback. Retrying (${hlsRetryCount}/${maxHlsRetries}) in 2s...`);
                  setIsBuffering(true);
                  if (retryTimeoutId) clearTimeout(retryTimeoutId);
                  retryTimeoutId = setTimeout(() => {
                    hls?.startLoad();
                  }, 2000);
                } else {
                  console.error("[HlsVideoPlayer] Max HLS network retries reached.");
                  setHasError(true);
                  setErrorMessage("خطأ في الاتصال بالشبكة للبث المباشر. قد يكون السيرفر متوقف حالياً أو تم إيقاف الرابط.");
                  hls?.destroy();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("[HlsVideoPlayer] Fatal media error in HLS playback. Recovering...");
                hls?.recoverMediaError();
                break;
              default:
                console.error("[HlsVideoPlayer] Unrecoverable HLS error:", data);
                setHasError(true);
                setErrorMessage("خطأ في تشغيل البث المباشر. قد يكون السيرفر متوقف حالياً.");
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari, iOS)
        video.src = processedUrl;
        video.load();
      } else {
        video.src = processedUrl;
        video.load();
      }
    } else {
      // Standard MP4 or direct video file
      video.src = processedUrl;
      video.load();
    }

    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);

      if (hls) {
        hls.destroy();
      }
    };
  }, [processedUrl, src, retryKey]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error(err));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setShowUnmuteToast(false);
    }
  };

  const handleUnmuteClick = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setShowUnmuteToast(false);
  };

  const fallbackNativeFullscreen = (video: HTMLVideoElement | null) => {
    if (video) {
      if ((video as any).webkitEnterFullscreen) {
        try {
          (video as any).webkitEnterFullscreen();
        } catch (e) {
          console.error("[HlsVideoPlayer] webkitEnterFullscreen failed:", e);
        }
      } else if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => console.error(err));
      }
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const doc = document as any;
    const isFullscreen = doc.fullscreenElement || 
                         doc.webkitFullscreenElement || 
                         doc.mozFullScreenElement ||
                         doc.msFullscreenElement;

    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      // Try modern fullscreen first
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.warn("[HlsVideoPlayer] requestFullscreen failed, trying webkitEnterFullscreen:", err);
          fallbackNativeFullscreen(video);
        });
      } else if ((container as any).webkitRequestFullscreen) {
        try {
          (container as any).webkitRequestFullscreen();
        } catch (err) {
          console.warn("[HlsVideoPlayer] webkitRequestFullscreen failed, trying webkitEnterFullscreen:", err);
          fallbackNativeFullscreen(video);
        }
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      } else {
        fallbackNativeFullscreen(video);
      }
    }
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden bg-black group ${className}`}
    >
      {/* HTML5 Video Component */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        autoPlay
        muted={isMuted}
        preload="auto"
        className="w-full h-full object-contain absolute inset-0 bg-black cursor-pointer"
        onClick={togglePlay}
      />

      {/* Loading & Buffering Overlay */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-zinc-300">جاري تحميل البث المباشر...</span>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-20 p-6 text-center">
          <div className="p-3.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            <VolumeX className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-sm font-bold text-zinc-200">فشل تحميل البث</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Unmute Guide Overlay (Premium touch for browsers blocking autoplay audio) */}
      {showUnmuteToast && (
        <button
          onClick={handleUnmuteClick}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-xl flex items-center gap-2 text-xs font-black animate-bounce transition-all border border-amber-600/25"
        >
          <VolumeX className="w-4 h-4" />
          <span>انقر لتشغيل الصوت 🔊</span>
        </button>
      )}

      {/* Hover Custom Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-between px-4 pb-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="flex items-center gap-3">
          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Volume Control with Slider */}
          <div className="hidden lg:flex items-center gap-1.5 group/volume">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center cursor-pointer"
              title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                const video = videoRef.current;
                if (video) {
                  video.volume = val;
                  if (val > 0 && isMuted) {
                    video.muted = false;
                    setIsMuted(false);
                  } else if (val === 0) {
                    video.muted = true;
                    setIsMuted(true);
                  }
                }
              }}
              className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all hover:bg-white/35"
              style={{ accentColor: "#f59e0b" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Badge */}
          <div className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider text-white">
            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            title="ملء الشاشة"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
