import { Channel } from '../types';

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      const info = line.substring(8);
      // Simple regex to extract common attributes
      const logoMatch = info.match(/tvg-logo="([^"]*)"/);
      const groupMatch = info.match(/group-title="([^"]*)"/);
      const nameMatch = info.match(/,(.*)$/);

      currentChannel = {
        id: crypto.randomUUID(),
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
      };
    } else if (line.length > 0 && !line.startsWith('#')) {
      if (currentChannel.id) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  });

  return channels;
};

// A sample playlist for demonstration
export const SAMPLE_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';