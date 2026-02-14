
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GroupTrip, GroupMember, GroupSpot, ChatMessage, View } from '../../types';
import { UsersIcon, SearchIcon, GlobeIcon, CompassIcon, RouteIcon, MapIcon } from '../icons/Icons';
import { getChatTranslation, searchPlacesWithAI } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';
// Added useUser import
import { useUser } from '../../contexts/UserContext';

const GroupPlanning: React.FC = () => {
    const { language } = useLanguage();
    // Added profile from context
    const { profile } = useUser();
    const [userName] = useLocalStorage('userProfileName', 'Explorer');
    const [userCountry] = useLocalStorage('userCountry', 'IN');
    const [activeGroup, setActiveGroup] = useLocalStorage<GroupTrip | null>('activeGroupPath', null);
    
    // UI State
    const [joinCode, setJoinCode] = useState('');
    const [activeTab, setActiveTab] = useState<'planner' | 'votes' | 'chat' | 'radar'>('planner');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputText, setInputText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, activeGroup?.messages]);

    const createGroup = () => {
        const newCode = `PATH-${Math.floor(1000 + Math.random() * 9000)}`;
        const host: GroupMember = {
            id: 'current-user',
            name: userName,
            pic: null,
            country: userCountry,
            currentLat: 28.6139, // Simulated Delhi
            currentLng: 77.2090,
            isHost: true
        };
        const newGroup: GroupTrip = {
            id: crypto.randomUUID(),
            code: newCode,
            name: `${userName}'s Global Path`,
            members: [host],
            spots: [],
            messages: []
        };
        setActiveGroup(newGroup);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation: Accept any 9-char code starting with PATH
        if (joinCode.startsWith('PATH-')) {
            const newUser: GroupMember = {
                id: 'current-user',
                name: userName,
                pic: null,
                country: userCountry,
                currentLat: 40.7128, // Simulated NY
                currentLng: -74.0060,
                isHost: false
            };
            // Mocking a group fetch
            const mockGroup: GroupTrip = {
                id: 'shared-123',
                code: joinCode,
                name: 'Himalayan Expedition Group',
                members: [
                    { id: '1', name: 'Yuki', pic: null, country: 'JP', currentLat: 35.6762, currentLng: 139.6503, isHost: true },
                    { id: '2', name: 'Alex', pic: null, country: 'US', currentLat: 34.0522, currentLng: -118.2437, isHost: false },
                    newUser
                ],
                spots: [
                    { id: 's1', name: 'Vashistha Gufa', votes: 1, suggestedBy: 'Yuki', description: 'Ancient cave by the Ganges' }
                ],
                messages: []
            };
            setActiveGroup(mockGroup);
        }
    };

    const handleAddSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || !activeGroup) return;
        setIsSearching(true);
        try {
            // Fixed: Pass profile to searchPlacesWithAI
            const result = await searchPlacesWithAI(searchQuery, profile);
            const newSpot: GroupSpot = {
                id: Math.random().toString(),
                name: searchQuery,
                votes: 0,
                suggestedBy: userName,
                description: result.story?.substring(0, 100) || 'Verified path node.'
            };
            const updated = { ...activeGroup, spots: [...activeGroup.spots, newSpot] };
            setActiveGroup(updated);
            setSearchQuery('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVote = (spotId: string) => {
        if (!activeGroup) return;
        const updatedSpots = activeGroup.spots.map(s => 
            s.id === spotId ? { ...s, votes: s.votes + 1 } : s
        );
        setActiveGroup({ ...activeGroup, spots: updatedSpots });
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeGroup) return;
        const msg: ChatMessage = {
            id: Date.now().toString(),
            roomId: activeGroup.id,
            senderId: 'current-user',
            senderName: userName,
            senderPic: null,
            senderCountry: userCountry,
            senderBadges: ['Group Member'],
            text: inputText,
            sourceLang: language,
            timestamp: Date.now()
        };
        const updated = { ...activeGroup, messages: [...activeGroup.messages, msg] };
        setActiveGroup(updated);
        setInputText('');
    };

    const translateMsg = async (msgId: string) => {
        if (!activeGroup) return;
        setIsTranslating(true);
        const idx = activeGroup.messages.findIndex(m => m.id === msgId);
        if (idx === -1) return;
        const msg = activeGroup.messages[idx];
        const target = language === 'hi' ? 'Hindi' : 'English';
        const result = await getChatTranslation(msg.text, target);
        const newMessages = [...activeGroup.messages];
        newMessages[idx] = { ...msg, translatedText: result };
        setActiveGroup({ ...activeGroup, messages: newMessages });
        setIsTranslating(false);
    };

    if (!activeGroup) {
        return (
            <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-24 h-24 bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner">
                    🤝
                </div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center">Group Path Planning</h2>
                <p className="text-gray-500 font-medium mt-4 text-center max-w-md">Connect with explorers world-wide to plan a synchronized journey. Vote for spots and track your pack in real-time.</p>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
                    <button onClick={createGroup} className="p-8 bg-white dark:bg-[#1a1c2e] rounded-[3rem] border-2 border-transparent hover:border-orange-500 transition-all shadow-xl group text-center">
                        <div className="text-3xl mb-3">✨</div>
                        <h4 className="font-black uppercase tracking-widest text-sm text-gray-800 dark:text-white">Create New Group</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-2">Generate a unique Path code</p>
                    </button>
                    <form onSubmit={handleJoin} className="p-8 bg-white dark:bg-[#1a1c2e] rounded-[3rem] border-2 border-transparent hover:border-blue-500 transition-all shadow-xl group flex flex-col items-center">
                        <div className="text-3xl mb-3">🗝️</div>
                        <input 
                            type="text" 
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="ENTER CODE" 
                            className="w-full bg-gray-50 dark:bg-[#111222] border-none rounded-xl py-2 px-4 text-center font-black tracking-[0.3em] text-orange-500 mb-3 outline-none"
                        />
                        <button type="submit" className="text-[10px] font-black uppercase text-blue-500 group-hover:underline">Join Group Path ➔</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn">
            {/* Group Header */}
            <div className="bg-[#1a1c2e] p-8 rounded-[3.5rem] text-white shadow-3xl mb-8 relative overflow-hidden border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest">Active Group Path</span>
                             <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest">{activeGroup.code}</span>
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">{activeGroup.name}</h2>
                    </div>
                    <div className="flex -space-x-3">
                        {activeGroup.members.map(m => (
                            <div key={m.id} className="w-12 h-12 rounded-2xl border-4 border-[#1a1c2e] bg-gray-800 flex items-center justify-center text-xl shadow-xl overflow-hidden group/member relative" title={`${m.name} (${m.country})`}>
                                <img src={`https://i.pravatar.cc/100?img=${m.id}`} className="w-full h-full object-cover" alt="" />
                                <span className="absolute -bottom-1 -right-1 text-sm">{m.country === 'IN' ? '🇮🇳' : m.country === 'JP' ? '🇯🇵' : '🇺🇸'}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 text-[12rem] font-black opacity-5 pointer-events-none rotate-12 select-none">PATH</div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 custom-scrollbar px-2">
                {[
                    { id: 'planner', label: 'Strategy', icon: '🎯' },
                    { id: 'votes', label: 'Voting Board', icon: '🗳️' },
                    { id: 'chat', label: 'Protocol Chat', icon: '💬' },
                    { id: 'radar', label: 'Live Radar', icon: '🛰️' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' 
                            : 'bg-white dark:bg-[#1a1c2e] text-gray-500 border border-gray-100 dark:border-white/5 hover:border-orange-500/20'
                        }`}
                    >
                        <span className="text-xl">{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-12 shadow-3xl border border-gray-100 dark:border-white/5 min-h-[550px]">
                
                {activeTab === 'planner' && (
                    <div className="animate-fadeIn space-y-10">
                        <div>
                             <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Consensus Master Itinerary</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nodes that reach group consensus are automatically integrated into the primary Path Protocol.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="bg-orange-500/5 dark:bg-orange-500/10 p-8 rounded-[2.5rem] border border-orange-500/10 relative overflow-hidden group">
                                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-6">AI Group Insight</h4>
                                <p className="text-lg text-gray-800 dark:text-gray-200 font-black italic leading-relaxed relative z-10">
                                    "The group show high synergy for spiritual nodes in North India. Recommended action: Synchronize transit for the Vashistha Gufa morning window."
                                </p>
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black group-hover:rotate-6 transition-transform">✨</div>
                             </div>
                             <div className="space-y-4">
                                {activeGroup.spots.filter(s => s.votes >= 1).map(s => (
                                    <div key={s.id} className="p-6 bg-white dark:bg-white/5 rounded-3xl flex justify-between items-center border border-gray-100 dark:border-white/10 shadow-sm hover:scale-[1.02] transition-all">
                                        <div>
                                            <p className="text-sm font-black uppercase text-gray-800 dark:text-white tracking-tight">{s.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Locked by {s.votes} consensus votes</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">✅</div>
                                    </div>
                                ))}
                                {activeGroup.spots.filter(s => s.votes >= 1).length === 0 && (
                                    <div className="p-12 text-center opacity-30 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                                        <p className="text-xs font-black uppercase tracking-widest">Awaiting Consensus</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'votes' && (
                    <div className="animate-fadeIn space-y-10">
                        <form onSubmit={handleAddSpot} className="flex gap-4 bg-gray-50 dark:bg-[#111222] p-2 rounded-[2.5rem] shadow-inner">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="SUGGEST A NEW NODE TO THE PACK..." 
                                className="flex-1 bg-transparent border-none py-5 px-8 text-gray-800 dark:text-white font-black uppercase tracking-tight outline-none text-sm placeholder:text-gray-400"
                            />
                            <button disabled={isSearching || !searchQuery} className="bg-orange-500 text-white font-black px-10 rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] disabled:opacity-30">
                                {isSearching ? '...' : 'SUGGEST'}
                            </button>
                        </form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeGroup.spots.map(spot => (
                                <div key={spot.id} className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-gray-100 dark:border-white/10 group hover:border-orange-500/40 transition-all shadow-lg">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="max-w-[70%]">
                                            <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none line-clamp-2">{spot.name}</h4>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Proposed by {spot.suggestedBy}</p>
                                        </div>
                                        <button onClick={() => handleVote(spot.id)} className="bg-white dark:bg-[#1a1c2e] p-5 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 hover:bg-orange-500 hover:text-white transition-all transform active:scale-90 group/vote">
                                            <div className="text-center">
                                                <p className="text-2xl leading-none group-hover/vote:scale-125 transition-transform">👍</p>
                                                <p className="text-xs font-black mt-2">{spot.votes}</p>
                                            </div>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-orange-500/30 pl-4">"{spot.description}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[500px] animate-fadeIn">
                        <div className="flex-1 overflow-y-auto space-y-6 p-4 custom-scrollbar bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] shadow-inner border border-black/5 dark:border-white/5">
                            {activeGroup.messages.map((msg) => {
                                const isMe = msg.senderId === 'current-user';
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                        <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1a1c2e] border border-gray-100 dark:border-white/10 flex items-center justify-center font-black text-[10px] text-orange-500 shadow-md flex-shrink-0">
                                                {msg.senderName[0]}
                                            </div>
                                            <div className={`space-y-1.5 ${isMe ? 'text-right' : 'text-left'}`}>
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[8px] font-black uppercase text-gray-400">{msg.senderName}</span>
                                                    <span className="text-[8px] opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`p-5 rounded-[2.2rem] shadow-xl relative group/bubble ${
                                                    isMe ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white dark:bg-[#1a1c2e] text-gray-800 dark:text-gray-200 rounded-tl-none border border-black/5 dark:border-white/10'
                                                }`}>
                                                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                                    {msg.translatedText && (
                                                        <div className={`mt-4 pt-4 border-t ${isMe ? 'border-white/20' : 'border-gray-100 dark:border-white/5'} text-xs italic font-bold animate-fadeIn`}>
                                                            <p className={`text-[8px] uppercase tracking-widest mb-1 ${isMe ? 'text-white/60' : 'text-orange-500'}`}>Synchronized Bhasha</p>
                                                            {msg.translatedText}
                                                        </div>
                                                    )}
                                                    {!isMe && !msg.translatedText && (
                                                        <button onClick={() => translateMsg(msg.id)} className="absolute -bottom-7 left-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                                            <GlobeIcon className="w-2.5 h-2.5" /> TRANSLATE PROTOCOL
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {activeGroup.messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <p className="text-4xl mb-4">🛰️</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Uplink Active. Waiting for broadcast.</p>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-8 flex gap-4 p-3 bg-white dark:bg-[#111222] rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-2xl">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="BROADCAST TO THE PACK..." 
                                className="flex-1 bg-transparent border-none py-4 px-6 text-sm font-bold text-gray-800 dark:text-white outline-none placeholder:text-gray-400"
                            />
                            <button onClick={handleSendMessage} disabled={!inputText.trim()} className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 active:scale-90 transition-all disabled:opacity-20">
                                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'radar' && (
                    <div className="animate-fadeIn h-[500px] relative rounded-[3rem] overflow-hidden bg-[#050510] border-4 border-white/5 shadow-2xl">
                         <div className="absolute inset-0 opacity-20 pointer-events-none">
                             <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover grayscale" alt="" />
                         </div>
                         
                         {/* Radar Rings */}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[450px] h-[450px] border border-orange-500/10 rounded-full animate-[ping_8s_infinite] absolute"></div>
                            <div className="w-[300px] h-[300px] border border-orange-500/20 rounded-full animate-[ping_6s_infinite] absolute"></div>
                            <div className="w-[150px] h-[150px] border border-orange-500/30 rounded-full animate-pulse absolute"></div>
                            
                            {/* Scanning Sweep */}
                            <div className="absolute w-[250px] h-[250px] bg-gradient-to-tr from-orange-500/20 to-transparent rounded-full origin-center animate-[spin_4s_linear_infinite] pointer-events-none"></div>
                         </div>

                         {activeGroup.members.map((m, i) => (
                             <div 
                                key={m.id}
                                className="absolute transition-all duration-[5000ms] ease-in-out flex flex-col items-center group/member z-10"
                                style={{ top: `${20 + (i * 20)}%`, left: `${30 + (i * 25)}%` }}
                             >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-[20px] opacity-0 group-hover/member:opacity-40 transition-opacity"></div>
                                    <div className="w-14 h-14 rounded-2xl border-4 border-[#050510] bg-orange-500 shadow-2xl relative overflow-hidden group-hover/member:scale-125 transition-transform cursor-pointer">
                                        <img src={`https://i.pravatar.cc/100?img=${m.id + 10}`} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#050510] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="mt-4 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-center shadow-2xl transform group-hover/member:translate-y-2 transition-transform">
                                    <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{m.name}</p>
                                    <p className="text-[7px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1.5 flex items-center justify-center gap-1">
                                        <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
                                        {m.country} NODE
                                    </p>
                                </div>
                             </div>
                         ))}
                         
                         <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Registry Sync</h5>
                            <div className="space-y-3">
                                {activeGroup.members.map(m => (
                                    <div key={m.id} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#10b981]"></div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{m.name}</span>
                                        <span className="text-[8px] text-gray-500 font-mono">LAT: {m.currentLat.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                         </div>

                         <div className="absolute bottom-8 right-8 bg-black/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 shadow-2xl">
                            <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] mb-1">Spatial Integrity</p>
                            <div className="text-[11px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> HIGH FREQUENCY UPLINK
                            </div>
                         </div>
                    </div>
                )}

            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.3); border-radius: 10px; }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default GroupPlanning;