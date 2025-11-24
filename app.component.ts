import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelListComponent } from './components/channel-list.component';
import { VideoPlayerComponent } from './components/video-player.component';
import { GeminiPanelComponent } from './components/gemini-panel.component';
import { PlaylistService } from './services/playlist.service';
import { Channel } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelListComponent, VideoPlayerComponent, GeminiPanelComponent],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      <!-- Sidebar Mobile Toggle -->
      <button 
        class="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-md"
        (click)="isSidebarOpen = !isSidebarOpen"
      >
        <svg *ngIf="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        <svg *ngIf="isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <!-- Channel Sidebar -->
      <div class="fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out shadow-xl md:shadow-none"
           [ngClass]="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
          <app-channel-list 
            [channels]="channels" 
            [currentChannel]="currentChannel" 
            [isLoading]="isLoading"
            (selectChannel)="onSelectChannel($event)"
          ></app-channel-list>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col h-full relative">
        
        <!-- Top Bar -->
        <div class="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
            <h1 class="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ml-10 md:ml-0">
                Nebula Stream
            </h1>
            
            <form (submit)="handleUrlSubmit($event)" class="hidden md:flex flex-1 max-w-lg mx-6 gap-2">
                <input 
                    type="text" 
                    name="playlistUrl"
                    [(ngModel)]="playlistUrl"
                    class="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter M3U Playlist URL..."
                />
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm font-medium transition-colors">
                    Load
                </button>
            </form>

            <button 
                (click)="isGeminiOpen = !isGeminiOpen"
                class="p-2 rounded-lg transition-colors"
                [ngClass]="isGeminiOpen ? 'bg-purple-900/50 text-purple-300' : 'hover:bg-gray-800 text-gray-400'"
                title="Toggle AI Assistant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
        </div>

        <!-- Video Area -->
        <div class="flex-1 relative bg-black flex overflow-hidden">
            <div class="flex-1 flex items-center justify-center bg-black relative">
                
                <div *ngIf="error" class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 z-10 text-sm backdrop-blur-sm border border-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {{error}}
                </div>
                
                <app-video-player 
                    *ngIf="currentChannel" 
                    [url]="currentChannel.url" 
                    (error)="onError($event)"
                ></app-video-player>

                <div *ngIf="!currentChannel" class="text-center p-8">
                    <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-700 mb-2">Ready to Watch</h2>
                    <p class="text-gray-500 max-w-md mx-auto">
                        Select a channel from the sidebar or load a custom playlist to begin streaming.
                    </p>
                </div>
            </div>

            <!-- Gemini Right Panel -->
            <div *ngIf="isGeminiOpen" class="w-80 bg-gray-800 border-l border-gray-700 hidden lg:block">
                <app-gemini-panel [currentChannel]="currentChannel"></app-gemini-panel>
            </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  channels: Channel[] = [];
  currentChannel: Channel | null = null;
  playlistUrl = '';
  isLoading = false;
  error: string | null = null;
  isSidebarOpen = true;
  isGeminiOpen = true;

  constructor(private playlistService: PlaylistService) {
    this.playlistUrl = this.playlistService.SAMPLE_PLAYLIST_URL;
  }

  ngOnInit() {
    this.loadPlaylist();
  }

  async loadPlaylist() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await fetch(this.playlistUrl);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      const text = await response.text();
      this.channels = this.playlistService.parseM3U(text);
    } catch (err) {
      this.error = "Failed to load playlist. Ensure CORS is enabled on the server or use a CORS proxy.";
    } finally {
      this.isLoading = false;
    }
  }

  handleUrlSubmit(e: Event) {
    e.preventDefault();
    this.loadPlaylist();
  }

  onSelectChannel(channel: Channel) {
    this.currentChannel = channel;
    this.error = null; // Clear previous errors
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  onError(msg: string) {
    this.error = msg;
  }
}
