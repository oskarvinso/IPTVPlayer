import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  onError?: (msg: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset HLS instance on URL change
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay blocked', e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
           switch (data.type) {
             case Hls.ErrorTypes.NETWORK_ERROR:
               console.error("Network error encountered", data);
               hls.startLoad();
               break;
             case Hls.ErrorTypes.MEDIA_ERROR:
               console.error("Media error encountered", data);
               hls.recoverMediaError();
               break;
             default:
               if(onError) onError("Stream error. This channel may be offline.");
               hls.destroy();
               break;
           }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay blocked', e));
      });
    } else {
        if(onError) onError("HLS not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [url, onError]);

  return (
    <div className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        poster="https://picsum.photos/1920/1080"
      />
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm">
                <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
         </div>
      )}
    </div>
  );
};

export default VideoPlayer;