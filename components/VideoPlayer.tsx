import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const initPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setError(null);
    setIsLoading(true);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Determine playback method
    const Hls = (window as any).Hls;
    const isHlsSupported = Hls && Hls.isSupported();
    
    // Config for better compatibility
    const hlsConfig = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      manifestLoadingTimeOut: 20000,
      manifestLoadingMaxRetry: 4,
      levelLoadingTimeOut: 20000,
      levelLoadingMaxRetry: 4,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
    };

    if (isHlsSupported) {
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((e: any) => console.debug("Autoplay blocked", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS Network Error, recovering...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media Error, recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.error("HLS Fatal Error", data);
              hls.destroy();
              // Try falling back to native if HLS.js fails catastrophically
              console.log("Falling back to native playback...");
              video.src = src;
              video.load();
              break;
          }
        }
      });
    } 
    // Safari / Native HLS Support
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) video.play().catch(e => console.debug("Autoplay blocked", e));
      });
    } 
    // Direct Play (MP4, etc.)
    else {
      video.src = src;
      video.load();
    }

    // Native Event Listeners for UI state
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => { setIsLoading(false); setIsPlaying(true); setError(null); };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: any) => {
       const err = video.error;
       // Only show error if HLS isn't handling it or if it's a native error
       if (!hlsRef.current || !isHlsSupported) {
           let msg = "An unknown error occurred.";
           if (err) {
               if (err.code === 1) msg = "Playback aborted by user.";
               if (err.code === 2) msg = "Network error while downloading.";
               if (err.code === 3) msg = "Decoding error.";
               if (err.code === 4) msg = "Source format not supported.";
           }
           // Use a generic message for CORS/Network issues which are common
           if (!err && !video.networkState) msg = "Stream unreachable (CORS or Offline).";
           
           setIsLoading(false);
           setError(msg);
       }
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  };

  useEffect(() => {
    const cleanup = initPlayer();
    return () => {
        cleanup?.();
        if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [src]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className="w-full h-full object-contain"
        crossOrigin="anonymous" // Attempt to handle CORS if server supports it
      />
      
      {/* Overlay: Loading Spinner */}
      {isLoading && !error && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      )}

      {/* Overlay: Error & Retry */}
      {error && (
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center">
           <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-red-500" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.35,7.35,0,0,1,0-7.42L120.52,44.59a8.75,8.75,0,0,1,15,0l87.45,151.79A7.35,7.35,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path></svg>
           </div>
           <p className="text-lg font-bold mb-2">Stream Unavailable</p>
           <p className="text-sm text-gray-400 mb-6 max-w-md">{error}</p>
           <button 
             onClick={initPlayer}
             className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,48v40a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h26.51L178.6,56.1a96,96,0,1,0-23,156.49,8,8,0,0,1,6.86,14.47A112,112,0,1,1,190.58,45.39l25.42,25V48a8,8,0,0,1,16,0Z"></path></svg>
             Retry Connection
           </button>
         </div>
      )}
      
      {/* Decorative gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default VideoPlayer;