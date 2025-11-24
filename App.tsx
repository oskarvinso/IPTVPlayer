import React, { useState, useEffect } from 'react';
import ChannelList from './components/ChannelList';
import VideoPlayer from './components/VideoPlayer';
import GeminiPanel from './components/GeminiPanel';
import { Channel } from './types';
import { parseM3U, SAMPLE_PLAYLIST_URL } from './services/playlistService';
import { Settings, AlertCircle, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState(SAMPLE_PLAYLIST_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeminiOpen, setIsGeminiOpen] = useState(true);

  useEffect(() => {
    loadPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlaylist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(playlistUrl);
      if (!response.ok) throw new Error('Failed to fetch playlist');
      const text = await response.text();
      const parsedChannels = parseM3U(text);
      setChannels(parsedChannels);
      if (parsedChannels.length > 0) {
        // Do not auto play to save data, let user select
        // setCurrentChannel(parsedChannels[0]);
      }
    } catch (err) {
      setError("Failed to load playlist. Ensure CORS is enabled on the server or use a CORS proxy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylist();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Sidebar Mobile Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {/* Channel Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out shadow-xl md:shadow-none`}>
          <ChannelList 
            channels={channels} 
            currentChannel={currentChannel} 
            onSelectChannel={(c) => {
                setCurrentChannel(c);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
            }} 
            isLoading={isLoading}
          />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ml-10 md:ml-0">
                Nebula Stream
            </h1>
            
            <form onSubmit={handleUrlSubmit} className="hidden md:flex flex-1 max-w-lg mx-6 gap-2">
                <input 
                    type="text" 
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter M3U Playlist URL..."
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm font-medium transition-colors">
                    Load
                </button>
            </form>

            <button 
                onClick={() => setIsGeminiOpen(!isGeminiOpen)}
                className={`p-2 rounded-lg transition-colors ${isGeminiOpen ? 'bg-purple-900/50 text-purple-300' : 'hover:bg-gray-800 text-gray-400'}`}
                title="Toggle AI Assistant"
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex overflow-hidden">
            <div className="flex-1 flex items-center justify-center bg-black relative">
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 z-10 text-sm backdrop-blur-sm border border-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                
                {currentChannel ? (
                    <VideoPlayer url={currentChannel.url} onError={(msg) => setError(msg)} />
                ) : (
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Menu className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Ready to Watch</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Select a channel from the sidebar or load a custom playlist to begin streaming.
                        </p>
                    </div>
                )}
            </div>

            {/* Gemini Right Panel */}
            {isGeminiOpen && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 hidden lg:block">
                    <GeminiPanel currentChannel={currentChannel} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;