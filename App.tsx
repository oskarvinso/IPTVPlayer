import React, { useState, useMemo, useEffect } from 'react';
import { Channel, AppView, UserSettings, StoredPlaylist } from './types';
import { parseM3U, fetchM3U, SAMPLE_PLAYLIST } from './services/m3uParser';
import VideoPlayer from './components/VideoPlayer';
import { GlassCard, GlassButton, GlassInput } from './components/GlassUI';
import { getChannelInsight } from './services/geminiService';

// Icons
const Icons = {
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>,
  List: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm32-84H96V56a32,32,0,0,1,64,0Z"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path><path d="M229.61,154.55l-21.73-10.87a64.55,64.55,0,0,0,0-31.36l21.73-10.87a15.86,15.86,0,0,0,6.72-20.94l-14.7-27.42a16,16,0,0,0-20.67-6.52l-22.3,10.29a64.12,64.12,0,0,0-27.15-15.68l-3.3-24.12A16,16,0,0,0,132.32,16H101.12a16,16,0,0,0-15.88,13.8l-3.32,24.13a64,64,0,0,0-27.13,15.68L32.49,59.21a16,16,0,0,0-20.67,6.52l-14.7,27.42a15.87,15.87,0,0,0,6.72,20.94l21.73,10.87a64.55,64.55,0,0,0,0,31.36L23.84,167.23a15.88,15.88,0,0,0-6.72,20.94l14.7,27.42a16,16,0,0,0,20.67,6.52l22.3-10.29a64.12,64.12,0,0,0,27.15,15.68l3.3,24.12A16,16,0,0,0,123.68,264h31.2a16,16,0,0,0,15.88-13.8l3.32-24.13a64,64,0,0,0,27.13-15.68l22.3,10.29a16,16,0,0,0,20.67-6.52l14.7-27.42A15.86,15.86,0,0,0,229.61,154.55ZM128,216a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"></path></svg>,
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72a64,64,0,1,0-123.1,26.64A88,88,0,1,0,48,168a8,8,0,0,0,16,0,72,72,0,1,1,96.38-46.66,8,8,0,0,0,14.65,6.32A88,88,0,1,0,208,72Z"></path></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,202.87,128,215.89,116,202.87,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48Zm-5.69-48H40.11a88,88,0,0,1,17.15-26.68A104.57,104.57,0,0,0,92.31,104Zm0,48a104.57,104.57,0,0,0-35.05,26.68A88,88,0,0,1,40.11,152Zm5.63,26.68A146.51,146.51,0,0,1,128,247.6a146.51,146.51,0,0,1,29.94-20.92,88.42,88.42,0,0,1-59.88,0ZM154.37,88c5.38,18.34,14.37,34.87,19.63,48H121.26c-5.26-13.13-14.25-29.66-19.63-48Zm8.32-10.32A146.51,146.51,0,0,1,128,56.4,146.51,146.51,0,0,1,93.31,77.68,88.42,88.42,0,0,1,153.15,77.68ZM163.69,104a104.57,104.57,0,0,0,35.05-26.68A88,88,0,0,1,215.89,104Zm0,48h52.2a88,88,0,0,1-17.15,26.68A104.57,104.57,0,0,0,163.69,152Z"></path></svg>
};

const DEFAULT_SETTINGS: UserSettings = {
  parentalPin: '1234', // Default PIN
  lockedGroups: ['Adult', 'XXX', 'Gore']
};

const STORAGE_KEY_PLAYLISTS = 'glassstream_playlists_v1';
const STORAGE_KEY_SETTINGS = 'glassstream_settings_v1';

export default function App() {
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [view, setView] = useState<AppView>(AppView.PLAYER);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Gemini Insight State
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Modals
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingChannel, setPendingChannel] = useState<Channel | null>(null);
  const [pinInput, setPinInput] = useState('');
  
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistSource, setPlaylistSource] = useState<'url' | 'text'>('url');
  const [playlistContent, setPlaylistContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Load Persistence
  useEffect(() => {
    try {
      const storedPl = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      if (storedPl) {
        setPlaylists(JSON.parse(storedPl));
      } else {
        // Init with sample
        const sample: StoredPlaylist = {
          id: 'sample',
          name: 'Demo Playlist',
          type: 'text',
          content: SAMPLE_PLAYLIST,
          isActive: true
        };
        setPlaylists([sample]);
      }
    } catch (e) {
      console.error("Failed to load storage", e);
    }
  }, []);

  // Save Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Aggregate Channels
  useEffect(() => {
    let allChannels: Channel[] = [];
    playlists.forEach(pl => {
      if (pl.isActive) {
        const parsed = parseM3U(pl.content, pl.id);
        allChannels = [...allChannels, ...parsed];
      }
    });
    setChannels(allChannels);
    // If current channel is no longer available (e.g. playlist disabled), reset it
    if (currentChannel && !allChannels.find(c => c.id === currentChannel.id)) {
      setCurrentChannel(null);
    }
    // Auto select first channel if nothing selected and channels exist
    if (!currentChannel && allChannels.length > 0) {
      setCurrentChannel(allChannels[0]);
    }
  }, [playlists]);

  // Filtering
  const groups = useMemo(() => {
    const all = new Set(channels.map(c => c.group || 'Uncategorized'));
    return ['All', ...Array.from(all).sort()];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'All' || c.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [channels, searchTerm, selectedGroup]);

  // Handlers
  const handleChannelSelect = (channel: Channel) => {
    if (settings.lockedGroups.includes(channel.group || '')) {
      setPendingChannel(channel);
      setShowPinModal(true);
      setPinInput('');
    } else {
      setCurrentChannel(channel);
      setInsight(null); // Reset insight
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === settings.parentalPin) {
      if (pendingChannel) setCurrentChannel(pendingChannel);
      setShowPinModal(false);
      setPendingChannel(null);
      setInsight(null);
    } else {
      alert('Incorrect PIN');
    }
  };

  const handleAddPlaylist = async () => {
    if (!playlistName || !playlistContent) return;
    setIsImporting(true);
    
    try {
      let contentToSave = playlistContent;
      
      if (playlistSource === 'url') {
        contentToSave = await fetchM3U(playlistContent);
      }

      // Validate parse
      const testParse = parseM3U(contentToSave);
      if (testParse.length === 0) {
        throw new Error("No channels found in playlist.");
      }

      const newPlaylist: StoredPlaylist = {
        id: Math.random().toString(36).substring(2, 9),
        name: playlistName,
        type: playlistSource,
        content: contentToSave, // For URL we save the fetched content to keep it offline/fast, or we could save URL and refetch. Here we save content for simplicity and speed.
        isActive: true
      };

      setPlaylists(prev => [...prev, newPlaylist]);
      setShowAddPlaylist(false);
      setPlaylistName('');
      setPlaylistContent('');
    } catch (e: any) {
      alert(`Failed to import: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const deletePlaylist = (id: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      setPlaylists(prev => prev.filter(p => p.id !== id));
    }
  };

  const togglePlaylist = (id: string) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const fetchInsight = async () => {
    if (!currentChannel) return;
    setLoadingInsight(true);
    const text = await getChannelInsight(currentChannel.name, currentChannel.group);
    setInsight(text || "No insight available.");
    setLoadingInsight(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-white font-sans selection:bg-blue-500/30">
      
      {/* Sidebar - Channel List */}
      <div className={`${isSidebarOpen ? 'w-full md:w-80' : 'w-0'} bg-glass-900/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 flex flex-col z-20 absolute md:relative h-full shrink-0 shadow-2xl`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-transparent">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            GlassStream
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-white/70 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <GlassInput 
            placeholder="Search channels..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/30 border-white/5 focus:border-blue-500/50"
          />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {groups.map(g => (
              <button 
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${selectedGroup === g ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredChannels.length === 0 ? (
             <div className="text-center text-gray-500 py-10 text-sm">No channels found</div>
          ) : (
            filteredChannels.map(channel => (
              <button
                key={`${channel.playlistId}-${channel.id}`}
                onClick={() => handleChannelSelect(channel)}
                className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${currentChannel?.id === channel.id ? 'bg-blue-600/20 border border-blue-500/30 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-inner ${currentChannel?.id === channel.id ? 'bg-black/40' : 'bg-white/5'}`}>
                  {channel.logo ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/40')} />
                  ) : (
                    <span className="text-xs text-gray-500 font-bold">TV</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm ${currentChannel?.id === channel.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{channel.name}</p>
                  <div className="flex items-center gap-2">
                     <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">{channel.group}</p>
                  </div>
                </div>
                {settings.lockedGroups.includes(channel.group) && <Icons.Lock />}
              </button>
            ))
          )}
        </div>
        <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
             <GlassButton variant="ghost" className="w-full text-sm bg-white/5 hover:bg-white/10" onClick={() => setShowAddPlaylist(true)}>
              <Icons.Plus /> Add Playlist
            </GlassButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full bg-black">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 hover:opacity-100">
          <div className="pointer-events-auto">
             {!isSidebarOpen && (
               <GlassButton variant="ghost" onClick={() => setSidebarOpen(true)} className="mr-4 bg-black/40 hover:bg-black/60">
                 <Icons.List />
               </GlassButton>
             )}
          </div>
          
          <div className="pointer-events-auto flex gap-2 bg-black/30 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button 
                onClick={() => setView(AppView.PLAYER)} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === AppView.PLAYER ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Player
            </button>
            <button 
                onClick={() => setView(AppView.EPG)} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === AppView.EPG ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Guide
            </button>
            <button 
                onClick={() => setView(AppView.SETTINGS)} 
                className={`p-2 rounded-xl transition-all ${view === AppView.SETTINGS ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Icons.Settings />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {view === AppView.PLAYER && (
          <div className="flex-1 bg-black relative flex flex-col justify-center">
            {currentChannel ? (
              <VideoPlayer src={currentChannel.url} poster={currentChannel.logo} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                      <Icons.Play />
                  </div>
                  <p>Select a channel to start watching</p>
              </div>
            )}
            
            {/* AI Insight Overlay */}
            <div className="absolute bottom-8 right-8 z-20 max-w-sm pointer-events-auto">
                {!insight ? (
                    <button 
                        onClick={fetchInsight}
                        disabled={!currentChannel}
                        className="bg-black/50 hover:bg-purple-600/90 text-white p-3 rounded-full shadow-lg border border-white/10 hover:border-purple-500/50 backdrop-blur-md transition-all flex items-center gap-2 group"
                    >
                        <Icons.Brain />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">Channel Insight</span>
                    </button>
                ) : (
                    <GlassCard className="p-4 animate-in slide-in-from-bottom-4 duration-300 border-purple-500/30 bg-black/80">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2"><Icons.Brain /> AI Insight</h3>
                            <button onClick={() => setInsight(null)} className="text-xs text-gray-400 hover:text-white bg-white/10 rounded-full w-5 h-5 flex items-center justify-center">✕</button>
                        </div>
                        {loadingInsight ? (
                            <div className="text-sm text-gray-400 animate-pulse flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                                Analyzing channel content...
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed text-gray-200">{insight}</p>
                        )}
                    </GlassCard>
                )}
            </div>
          </div>
        )}

        {view === AppView.EPG && (
            <div className="flex-1 bg-glass-900/90 backdrop-blur-3xl overflow-auto p-4 md:p-8 pt-20">
                <div className="flex items-center justify-between mb-8">
                     <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Program Guide</h2>
                     <div className="text-sm text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                
                <div className="grid gap-1">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-3">Channel</div>
                        <div className="col-span-9 flex justify-between">
                            <span>Now</span>
                            <span>+30m</span>
                            <span>+1h</span>
                            <span>+1.5h</span>
                        </div>
                    </div>

                    {/* Channel Rows */}
                    {filteredChannels.slice(0, 20).map(ch => (
                        <div key={ch.id} className="grid grid-cols-12 gap-4 items-center bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-colors group">
                            <div className="col-span-3 flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center shrink-0">
                                    <img src={ch.logo || ''} alt="" className="w-full h-full object-contain p-1" onError={e => e.currentTarget.style.display = 'none'} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm truncate text-gray-200 group-hover:text-white">{ch.name}</h3>
                                    <GlassButton 
                                        variant="ghost" 
                                        className="h-6 px-2 text-[10px] mt-1 bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-white border-blue-500/20" 
                                        onClick={() => { setCurrentChannel(ch); setView(AppView.PLAYER); }}
                                    >
                                        Watch
                                    </GlassButton>
                                </div>
                            </div>
                            
                            {/* Simulated Timeline */}
                            <div className="col-span-9 flex gap-1 h-12">
                                <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 relative overflow-hidden group/prog hover:bg-white/10 cursor-pointer">
                                    <div className="text-xs font-medium text-gray-300 group-hover/prog:text-white truncate">Live Program</div>
                                    <div className="text-[10px] text-gray-500">10:00 - 11:00</div>
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 w-1/3"></div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 opacity-60">
                                    <div className="text-xs font-medium text-gray-400 truncate">Upcoming Show</div>
                                    <div className="text-[10px] text-gray-600">11:00 - 12:00</div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/5 opacity-40 hidden md:block">
                                    <div className="text-xs font-medium text-gray-500 truncate">News Update</div>
                                    <div className="text-[10px] text-gray-600">12:00 - 12:30</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {view === AppView.SETTINGS && (
             <div className="flex-1 bg-glass-900/90 backdrop-blur-3xl overflow-auto p-4 md:p-8 pt-20 flex justify-center">
                 <div className="w-full max-w-3xl space-y-6">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20"><Icons.Settings /></div> 
                        Settings
                    </h2>
                    
                    {/* Playlist Management */}
                    <GlassCard className="p-6">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-xl font-bold">Playlists</h3>
                             <GlassButton onClick={() => setShowAddPlaylist(true)} className="text-sm">
                                <Icons.Plus /> Add New
                             </GlassButton>
                         </div>
                         <div className="space-y-3">
                             {playlists.map(pl => (
                                 <div key={pl.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                     <div className="flex items-center gap-3">
                                         <div className={`w-3 h-3 rounded-full ${pl.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                                         <div>
                                             <p className="font-bold text-sm">{pl.name}</p>
                                             <p className="text-xs text-gray-500 uppercase">{pl.type} • {pl.content.length > 50 ? 'Valid Source' : 'Custom'}</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <button 
                                            onClick={() => togglePlaylist(pl.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium border ${pl.isActive ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}
                                         >
                                            {pl.isActive ? 'Active' : 'Disabled'}
                                         </button>
                                         <button onClick={() => deletePlaylist(pl.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                            <Icons.Trash />
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </GlassCard>

                    {/* Parental Control */}
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-bold mb-4">Parental Control</h3>
                        <div className="bg-red-500/5 p-5 rounded-xl border border-red-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-300 mb-1">Protected Categories</p>
                                    <p className="text-xs text-gray-500">Channels in these groups require a PIN.</p>
                                </div>
                                <div className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-gray-400">PIN: {settings.parentalPin}</div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {settings.lockedGroups.map(g => (
                                    <span key={g} className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 flex items-center gap-2">
                                        <Icons.Lock /> {g}
                                        <button className="hover:text-white" onClick={() => {
                                            const newGroups = settings.lockedGroups.filter(lg => lg !== g);
                                            setSettings({...settings, lockedGroups: newGroups});
                                        }}>×</button>
                                    </span>
                                ))}
                                <button 
                                    onClick={() => {
                                        const g = prompt("Enter group name to lock:");
                                        if (g && !settings.lockedGroups.includes(g)) {
                                            setSettings({...settings, lockedGroups: [...settings.lockedGroups, g]});
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 flex items-center gap-1"
                                >
                                    + Add Group
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                    
                    <div className="text-center">
                         <GlassButton variant="ghost" onClick={() => setView(AppView.PLAYER)}>Back to Player</GlassButton>
                    </div>
                 </div>
             </div>
        )}

      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <GlassCard className="w-80 p-8 text-center border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <div className="scale-150"><Icons.Lock /></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">Restricted</h3>
            <p className="text-sm text-gray-400 mb-8">Enter parental PIN to unlock.</p>
            <GlassInput 
                type="password" 
                maxLength={4} 
                className="text-center text-3xl tracking-[1em] mb-8 font-mono bg-black/50 border-red-500/20 focus:border-red-500 focus:ring-red-500/20 h-16" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                placeholder="••••"
            />
            <div className="flex gap-3">
                <GlassButton variant="ghost" className="flex-1" onClick={() => setShowPinModal(false)}>Cancel</GlassButton>
                <GlassButton className="flex-1 bg-red-600 hover:bg-red-500 text-white border-red-400" onClick={handlePinSubmit}>Unlock</GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add Playlist Modal */}
      {showAddPlaylist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-lg p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Icons.Plus /></div>
                    Add Playlist
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold ml-1 mb-1 block">Playlist Name</label>
                        <GlassInput 
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="e.g. My Sports Channels"
                        />
                    </div>

                    <div>
                        <div className="flex gap-4 mb-2">
                            <button 
                                onClick={() => setPlaylistSource('url')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${playlistSource === 'url' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Icons.Globe /> URL Import
                            </button>
                            <button 
                                onClick={() => setPlaylistSource('text')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${playlistSource === 'text' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Icons.List /> Paste Text
                            </button>
                        </div>
                        
                        {playlistSource === 'url' ? (
                             <GlassInput 
                                placeholder="https://example.com/playlist.m3u"
                                value={playlistContent}
                                onChange={(e) => setPlaylistContent(e.target.value)}
                            />
                        ) : (
                            <textarea 
                                className="w-full h-32 bg-glass-100 border border-glass-200 rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="#EXTM3U..."
                                value={playlistContent}
                                onChange={(e) => setPlaylistContent(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <GlassButton variant="ghost" onClick={() => setShowAddPlaylist(false)}>Cancel</GlassButton>
                    <GlassButton onClick={handleAddPlaylist} disabled={isImporting || !playlistName || !playlistContent}>
                        {isImporting ? 'Importing...' : 'Add Playlist'}
                    </GlassButton>
                </div>
            </GlassCard>
          </div>
      )}
    </div>
  );
}