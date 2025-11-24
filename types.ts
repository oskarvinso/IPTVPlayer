export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
}

export interface PlaylistItem {
  name: string;
  url: string;
  group: string;
  logo: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Minimal HLS.js type definition for the window object if needed, 
// though we usually import Hls from the library if installed. 
// Since we don't have npm install access, we might use a CDN link or assume standard HLS handling.
// For this environment, we will implement a custom VideoPlayer component using a standard hook pattern.
