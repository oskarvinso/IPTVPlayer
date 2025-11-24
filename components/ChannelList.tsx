import React, { useMemo, useState } from 'react';
import { Channel } from '../types';
import { Search, Tv } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isLoading: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, currentChannel, onSelectChannel, isLoading }) => {
  const [filter, setFilter] = useState('');

  const filteredChannels = useMemo(() => {
    return channels.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
  }, [channels, filter]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-80">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Tv className="text-blue-500" />
            Channels
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400 animate-pulse">Loading channels...</div>
        ) : filteredChannels.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No channels found</div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  currentChannel?.id === channel.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {channel.logo ? (
                  <img src={channel.logo} alt={channel.name} className="w-8 h-8 rounded object-contain bg-black/20" onError={(e) => e.currentTarget.style.display='none'} />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                    {channel.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                    <div className="font-medium truncate">{channel.name}</div>
                    <div className={`text-xs truncate ${currentChannel?.id === channel.id ? 'text-blue-200' : 'text-gray-500'}`}>
                        {channel.group}
                    </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;