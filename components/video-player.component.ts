import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full bg-black group">
      <video
        #videoRef
        class="w-full h-full object-contain"
        controls
        poster="https://picsum.photos/1920/1080"
      ></video>
      <div *ngIf="!isPlaying" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="bg-black/50 p-4 rounded-full backdrop-blur-sm">
          <svg class="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class VideoPlayerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() url: string = '';
  @Output() error = new EventEmitter<string>();
  
  @ViewChild('videoRef') videoElement!: ElementRef<HTMLVideoElement>;
  
  private hls: Hls | null = null;
  isPlaying = false;
  private videoListenersAttached = false;

  ngAfterViewInit() {
    this.setupPlayer();
    this.attachListeners();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['url'] && !changes['url'].firstChange) {
      this.setupPlayer();
    }
  }

  private attachListeners() {
    const video = this.videoElement?.nativeElement;
    if (!video || this.videoListenersAttached) return;

    video.addEventListener('play', () => this.isPlaying = true);
    video.addEventListener('pause', () => this.isPlaying = false);
    this.videoListenersAttached = true;
  }

  private setupPlayer() {
    const video = this.videoElement?.nativeElement;
    if (!video || !this.url) return;

    // Reset HLS
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      this.hls.loadSource(this.url);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay blocked', e));
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error", data);
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error", data);
              this.hls?.recoverMediaError();
              break;
            default:
              this.error.emit("Stream error. This channel may be offline.");
              this.hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.log('Autoplay blocked', e));
      });
    } else {
      this.error.emit("HLS not supported in this browser.");
    }
  }

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
