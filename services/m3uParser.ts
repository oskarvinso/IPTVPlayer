import { Channel } from '../types';

export const parseM3U = (content: string, playlistId: string = 'default'): Channel[] => {
  if (!content || typeof content !== 'string') return [];
  
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      // Robust regex that handles spaces around equals signs and mixed quotes
      const info = line.substring(8);
      const commaIndex = info.lastIndexOf(',');
      
      // If no comma found, just use the whole line as metadata (fallback)
      const metaPart = commaIndex !== -1 ? info.substring(0, commaIndex) : info;
      const name = commaIndex !== -1 ? info.substring(commaIndex + 1).trim() : 'Unknown Channel';

      currentChannel = {
        id: Math.random().toString(36).substring(2, 11),
        name: name || 'Unknown Channel',
        group: 'Uncategorized', // Default
        playlistId: playlistId
      };

      // Extract attributes with regex that allows spaces: key="value" or key = "value"
      // Using safe regex matching
      const logoMatch = metaPart.match(/tvg-logo\s*=\s*"([^"]*)"/i);
      if (logoMatch) currentChannel.logo = logoMatch[1];

      const idMatch = metaPart.match(/tvg-id\s*=\s*"([^"]*)"/i);
      if (idMatch) currentChannel.tvgId = idMatch[1];

      const groupMatch = metaPart.match(/group-title\s*=\s*"([^"]*)"/i);
      if (groupMatch) currentChannel.group = groupMatch[1];

    } else if (!line.startsWith('#')) {
      // It's a URL
      if (currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  }

  return channels;
};

export const fetchM3U = async (url: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for large lists

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    return await response.text();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch M3U:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The playlist is too large or the connection is slow.');
    }
    throw error;
  }
};

// A sample playlist for initial state (Fallback)
export const SAMPLE_PLAYLIST = `#EXTM3U
#EXTINF:-1 group-title="News" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/NASA_TV_logo.svg/1200px-NASA_TV_logo.svg.png",NASA TV
https://ntv1.akamaized.net/hls/live/2013530/NASA-NTV1-HLS/master.m3u8
#EXTINF:-1 group-title="Lifestyle" tvg-logo="https://picsum.photos/200",Nature Stream (Demo)
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
`;