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
  isActive: boolean;
}

export interface EPGProgram {
  start: string;
  end: string;
  title: string;
  description: string;
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