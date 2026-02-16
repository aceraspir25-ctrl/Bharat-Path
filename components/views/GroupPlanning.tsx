import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GroupTrip, GroupMember, GroupSpot, ChatMessage } from '../../types';
import { SearchIcon, GlobeIcon, RouteIcon } from '../icons/Icons';
import { getChatTranslation, searchPlacesWithAI } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { useVoice } from '../../hooks/useVoice';
import { useLanguage } from '../../contexts/LanguageContext';

const GroupPlanning: React.FC = () => {
    const { profile } = useUser();
    const { language } = useLanguage();
    const { speak } = useVoice();
    
    const [activeGroup, setActiveGroup] = useLocalStorage<GroupTrip | null>('activeGroupPath', null);
    
    // Simulation state for the demo/registry
    const [budget, setBudget] = useState<number>(5000); 
    const [transitMode, setTransitMode] = useState<'bike' | 'car' | 'walk'>('bike');
    const [joinCode, setJoinCode] = useState('');
    const [activeTab, setActiveTab] = useState<'planner' | 'votes' | 'chat' | 'radar'>('planner');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputText, setInputText] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, activeGroup?.messages]);

    const checkWeather = () => {
        // Simulated Raipur node weather for path synchronization
        const temp = Math.floor(Math.random() * (35 - 20) + 20);
        speak(`Current Raipur node temperature is ${temp} degrees. Ideal for ${transitMode} expedition.`);
    };

    const createGroup = () => {
        const newCode = `PATH-${Math.floor(1000 + Math.random() * 9000)}`;
        const host: GroupMember = { 
            id: 'current-user', 
            name: profile.name, 
            pic: profile.profilePic,
            country: 'IN',
            currentLat: 21.25, 
            currentLng: 81.6, 
            isHost: true 
        };
        const newGroup: GroupTrip = {
            id: crypto.randomUUID(),
            code: newCode,
            name: `${profile.name}'s Strategic Path`,
            members: [host],
            spots: [],
            messages: []
        };
        setActiveGroup(newGroup);
        speak("Strategic Group Path Initialized. Awaiting pack members.");
    };

    const handleAddSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || !activeGroup) return;
        setIsSearching(true);
        try {
            const result = await searchPlacesWithAI(searchQuery, profile);
            const spot: GroupSpot = {
                id: Math.random().toString(),
                name: searchQuery,
                votes: 0,
                suggestedBy: profile.name,
                description: `Global node verified. Potential cost: ₹${Math.floor(Math.random() * 1000)} per head.`
            };
            setActiveGroup({ ...activeGroup, spots: [...activeGroup.spots, spot] });
            setSearchQuery('');
            speak(`${searchQuery} added to voting radar.`);
        } catch (err) { 
            speak("Satellite uplink failed."); 
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
        speak("Vote logged in regional consensus registry.");
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !activeGroup) return;
        const msg: ChatMessage = {
            id: Date.now().toString(),
            roomId: activeGroup.id,
            senderId: 'current-user',
            senderName: profile.name,
            senderPic: profile.profilePic,
            senderCountry: 'IN',
            senderBadges: ['Explorer'],
            text: inputText,
            sourceLang: language,
            timestamp: Date.now()
        };
        setActiveGroup({ ...activeGroup, messages: [...activeGroup.messages, msg] });
        setInputText('');
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.startsWith('PATH-')) {
            // Simulated join logic for demonstration
            createGroup(); // In a real app, this would fetch from a database
        }
    };

    if (!activeGroup) {
        return (
            <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-24 h-24 bg-orange-500 text-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl animate-bounce">🌍</div>
                <h2 className="text-4xl font-black mt-8 dark:text-white italic uppercase tracking-tighter">Pack Protocol</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60">Initialize your synchronized group path</p>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                    <button onClick={createGroup} className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] border border-orange-500/20 shadow-xl hover:scale-105 transition-all text-center group">
                        <span className="text-3xl block mb-4">✨</span>
                        <h3 className="font-black uppercase tracking-tight text-gray-800 dark:text-white">Start New Path</h3>
                        <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Generate unique registry code</p>
                    </button>
                    <form onSubmit={handleJoin} className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] border border-blue-500/20 shadow-xl flex flex-col items-center group">
                        <span className="text-3xl block mb-4">🗝️</span>
                        <input 
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="CODE (e.g. PATH-1234)"
                            className="w-full bg-gray-50 dark:bg-black/20 border-none rounded-xl py-2 px-4 text-center font-black tracking-[0.2em] text-blue-500 outline-none mb-3"
                        />
                        <button type="submit" className="text-[10px] font-black uppercase text-gray-400 group-hover:text-blue-500 transition-colors">Join Existing Pack ➔</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-2 bg-[#1a1c2e] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">{activeGroup.name}</h2>
                        <p className="text-orange-500 font-mono mt-2 tracking-widest">REGISTRY: {activeGroup.code}</p>
                    </div>
                    <div className="absolute -right-5 -bottom-5 text-8xl opacity-[0.03] font-black italic select-none group-hover:opacity-10 transition-opacity">NODE</div>
                </div>
                
                <div className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] shadow-xl border border-orange-500/20 flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Per Head Consensus Budget</p>
                    <h3 className="text-4xl font-black text-orange-500 tracking-tighter">₹{Math.floor(budget / (activeGroup.members.length || 1))}</h3>
                    <input type="range" min="1000" max="50000" step="500" value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} className="w-full mt-6 accent-orange-500 h-1 bg-gray-100 rounded-full" />
                </div>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                <button onClick={checkWeather} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 hover:scale-105 transition-all whitespace-nowrap">☁️ Weather Sync</button>
                <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-md border border-gray-100 dark:border-white/5">
                    {(['bike', 'car', 'walk'] as const).map(mode => (
                        <button key={mode} onClick={() => {setTransitMode(mode); speak(`Transit mode set to ${mode}`)}} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${transitMode === mode ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{mode}</button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                {['planner', 'votes', 'chat', 'radar'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm ${activeTab === t ? 'bg-orange-500 text-white shadow-xl scale-105 z-10' : 'bg-white dark:bg-[#1a1c2e] dark:text-gray-400 hover:bg-orange-50/50'}`}>{t}</button>
                ))}
            </div>

            <div className="bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-12 shadow-3xl min-h-[500px] border border-white/40 dark:border-white/5">
                {activeTab === 'votes' && (
                    <div className="space-y-10 animate-fadeIn">
                        <form onSubmit={handleAddSpot} className="relative group">
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Suggest a new node for the pack to analyze..." className="w-full bg-gray-50 dark:bg-black/20 p-6 pr-40 rounded-[2rem] outline-none font-bold dark:text-white border-2 border-transparent focus:border-orange-500 transition-all shadow-inner" />
                            <button disabled={isSearching} className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95">
                                {isSearching ? 'SYNCING...' : 'UPLINK'}
                            </button>
                        </form>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeGroup.spots.map(s => (
                                <div key={s.id} className="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-transparent hover:border-orange-500/30 transition-all flex justify-between items-center group shadow-xl">
                                    <div className="max-w-[70%]">
                                        <h4 className="text-2xl font-black uppercase dark:text-white tracking-tight">{s.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold mt-3 italic leading-relaxed opacity-80">"{s.description}"</p>
                                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-4">Proposed by {s.suggestedBy}</p>
                                    </div>
                                    <button onClick={() => handleVote(s.id)} className="w-20 h-20 bg-gray-50 dark:bg-black/40 rounded-3xl flex flex-col items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner active:scale-90">
                                        <span className="text-2xl">👍</span>
                                        <span className="text-sm font-black mt-1">{s.votes}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[500px] animate-fadeIn">
                        <div className="flex-1 overflow-y-auto space-y-6 p-6 bg-gray-50/50 dark:bg-black/30 rounded-[2.5rem] mb-6 shadow-inner custom-scrollbar">
                            {activeGroup.messages.map(m => (
                                <div key={m.id} className={`flex ${m.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-5 rounded-[2rem] max-w-[80%] shadow-xl relative group/msg ${m.senderId === 'current-user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none'}`}>
                                        <div className="flex items-center gap-2 mb-2 opacity-60">
                                            <p className="text-[9px] font-black uppercase tracking-widest">{m.senderName}</p>
                                            <span className="text-[8px]">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed tracking-tight">{m.text}</p>
                                        {m.senderId !== 'current-user' && (
                                            <button className="absolute -bottom-6 left-0 text-[8px] font-black uppercase text-orange-500 opacity-0 group-hover/msg:opacity-100 transition-opacity">Synchronize Translation</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {activeGroup.messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <span className="text-5xl mb-4">📡</span>
                                    <p className="text-xs font-black uppercase tracking-widest">Protocol Uplink Active. Start broadcasting.</p>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="flex gap-4 p-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5">
                            <input 
                                value={inputText} 
                                onChange={e => setInputText(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                                className="flex-1 bg-transparent p-5 rounded-2xl outline-none font-bold dark:text-white text-sm" 
                                placeholder="Broadcast to pack..." 
                            />
                            <button onClick={handleSendMessage} disabled={!inputText.trim()} className="bg-orange-500 text-white px-8 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'planner' && (
                    <div className="animate-fadeIn py-10 text-center space-y-8">
                        <div className="w-24 h-24 bg-orange-500/10 rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl shadow-inner group">
                            <RouteIcon className="text-orange-500 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter italic">Strategic Itinerary</h3>
                            <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto mt-4 leading-relaxed">
                                Consensus-locked nodes from the voting board are aggregated here to form your group's master path.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
                            {activeGroup.spots.filter(s => s.votes > 0).map(s => (
                                <div key={s.id} className="p-6 bg-green-500/5 rounded-3xl border border-green-500/20 text-left relative overflow-hidden group">
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Locked Node</span>
                                    <h5 className="font-black text-gray-800 dark:text-white uppercase mt-2">{s.name}</h5>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-3xl">✅</div>
                                </div>
                            ))}
                            {activeGroup.spots.filter(s => s.votes > 0).length === 0 && (
                                <div className="col-span-full py-20 opacity-20 italic font-bold">No nodes have reached consensus yet.</div>
                            )}
                        </div>
                    </div>
                )}
                
                {activeTab === 'radar' && (
                    <div className="animate-fadeIn py-20 text-center space-y-6">
                        <div className="text-8xl animate-pulse">🛰️</div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Pack Tracking Pulse</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] opacity-60">Synchronizing spatial coordinates for all pack members...</p>
                        <div className="flex justify-center gap-1.5 mt-8">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default GroupPlanning;