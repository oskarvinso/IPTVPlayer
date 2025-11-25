import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset error on source change
    setError(null);

    let hls: any = null;

    if (src) {
      if ((window as any).Hls && (window as any).Hls.isSupported()) {
        hls = new (window as any).Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Autoplay blocked", e));
          }
        });
        hls.on((window as any).Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
             setError("Stream error. Trying to recover...");
             switch (data.type) {
                case (window as any).Hls.ErrorTypes.NETWORK_ERROR:
                   hls.startLoad();
                   break;
                case (window as any).Hls.ErrorTypes.MEDIA_ERROR:
                   hls.recoverMediaError();
                   break;
                default:
                   hls.destroy();
                   break;
             }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        if (autoPlay) {
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(e => console.log("Autoplay blocked", e));
          });
        }
      } else {
        setError("Your browser does not support HLS playback.");
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      {error && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-red-400">
           {error}
         </div>
      )}
      <video
        ref={videoRef}
        poster={poster}
        controls
        className="w-full h-full object-contain"
      />
      
      {/* Custom overlay gradient for controls visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default VideoPlayer;
