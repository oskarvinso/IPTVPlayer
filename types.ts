
export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  tvgId?: string;
  playlistId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
}

export interface StoredPlaylist {
  id: string;
  name: string;
  type: 'url' | 'text';
  content: string; // URL or raw text
  url?: string; // Optional: original URL for re-fetching to save storage
  isActive: boolean;
}

export interface EPGProgram {
  channelId: string; // matches tvg-id
  start: Date;
  end: Date;
  title: string;
  description: string;
}

export interface StoredEPG {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

export enum AppView {
  PLAYER = 'PLAYER',
  EPG = 'EPG',
  SETTINGS = 'SETTINGS'
}

export interface UserSettings {
  parentalPin: string | null; // null means disabled
  lockedGroups: string[];
}
