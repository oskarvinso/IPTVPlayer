import { Channel } from '../types';

export const parseM3U = (content: string, playlistId: string = 'default'): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      // Example: #EXTINF:-1 tvg-id="CNN.us" tvg-logo="http://logo.png" group-title="News",CNN
      const info = line.substring(8);
      const commaIndex = info.lastIndexOf(',');
      const metaPart = info.substring(0, commaIndex);
      const name = info.substring(commaIndex + 1).trim();

      currentChannel = {
        id: Math.random().toString(36).substring(2, 11),
        name: name || 'Unknown Channel',
        group: 'Uncategorized', // Default
        playlistId: playlistId
      };

      // Extract attributes
      const logoMatch = metaPart.match(/tvg-logo="([^"]*)"/);
      if (logoMatch) currentChannel.logo = logoMatch[1];

      const idMatch = metaPart.match(/tvg-id="([^"]*)"/);
      if (idMatch) currentChannel.tvgId = idMatch[1];

      const groupMatch = metaPart.match(/group-title="([^"]*)"/);
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
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch M3U:', error);
    throw error;
  }
};

// A sample playlist for initial state
export const SAMPLE_PLAYLIST = `#EXTM3U
#EXTINF:-1 group-title="News" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/NASA_TV_logo.svg/1200px-NASA_TV_logo.svg.png",NASA TV
https://ntv1.akamaized.net/hls/live/2013530/NASA-NTV1-HLS/master.m3u8
#EXTINF:-1 group-title="Movies" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_Buck_Bunny_poster_big.jpg/800px-Big_Buck_Bunny_poster_big.jpg",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
#EXTINF:-1 group-title="Lifestyle" tvg-logo="https://picsum.photos/200",Nature Stream (Demo)
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
#EXTINF:-1 group-title="Adult" tvg-logo="https://picsum.photos/201",Restricted Channel (Test PIN)
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
`;