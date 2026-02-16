// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { GroupTrip, GroupMember, GroupSpot, ChatMessage } from '../../types';
import { SearchIcon, GlobeIcon, RouteIcon, UsersIcon } from '../icons/Icons';
import { searchPlacesWithAI } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { useVoice } from '../../hooks/useVoice';

const GroupPlanning: React.FC = () => {
    const { profile } = useUser();
    const { speak } = useVoice();
    
    const [activeGroup, setActiveGroup] = useLocalStorage<GroupTrip | null>('activeGroupPath', null);
    const [budget, setBudget] = useState<number>(5000); 
    const [activeTab, setActiveTab] = useState<'planner' | 'votes' | 'chat' | 'radar'>('planner');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputText, setInputText] = useState('');
    const [showContactSync, setShowContactSync] = useState(false);

    // --- WORLDWIDE ADD-ON: CONTACT SYNC LOGIC ---
    const [mockContacts] = useState([
        { id: '101', name: 'Rahul Sharma', pic: '👤', online: true },
        { id: '102', name: 'Elena Gilbert', pic: '👸', online: false },
        { id: '103', name: 'Aarav (Mumbai)', pic: '🕶️', online: true }
    ]);

    const addMemberFromContacts = (contact: any) => {
        if (!activeGroup) return;
        const newMember = { ...contact, isHost: false, country: 'IN' };
        setActiveGroup({ ...activeGroup, members: [...activeGroup.members, newMember] });
        speak(`${contact.name} linked to the pack.`);
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(activeGroup?.code || "");
        speak("Invite protocol copied to clipboard.");
    };

    // UI Components
    const MemberNode: React.FC<{ member: any }> = ({ member }) => (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 transition-all group-hover:rotate-6 ${member.isHost ? 'bg-orange-500 border-white' : 'bg-white/5 border-white/10'}`}>
                {member.pic || member.name[0]}
            </div>
            <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{member.name.split(' ')[0]}</span>
            {member.isHost && <span className="bg-orange-500 text-[6px] font-black px-1.5 py-0.5 rounded-full text-white">ALPHA</span>}
        </div>
    );

    if (!activeGroup) {
        return (
            <div className="max-w-5xl mx-auto h-[80vh] flex flex-col items-center justify-center animate-fadeIn p-6">
                <div className="text-9xl mb-10 animate-float opacity-30">🛰️</div>
                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter text-center">Establish <span className="text-orange-500">Pack</span> Protocol</h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.6em] text-[10px] mt-4 mb-12">Universal Synchronization for Multi-Node Expeditions</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <button onClick={() => {/* createGroup logic */}} className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-orange-500/20 shadow-4xl hover:scale-105 transition-all text-center group">
                        <div className="text-5xl mb-6 group-hover:scale-125 transition-transform">✨</div>
                        <h3 className="font-black uppercase text-white tracking-tighter text-xl">New Strategic Path</h3>
                        <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-widest">Generate encrypted registry code</p>
                    </button>
                    <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-blue-500/20 shadow-4xl flex flex-col items-center group">
                        <div className="text-5xl mb-6 group-hover:scale-125 transition-transform">🗝️</div>
                        <input className="w-full bg-black/40 border-none rounded-2xl py-4 px-6 text-center font-black tracking-widest text-blue-500 outline-none mb-4" placeholder="REGISTRY CODE" />
                        <button className="text-[10px] font-black uppercase text-gray-500 hover:text-blue-500 transition-colors">Join Active Node ➔</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-32 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar">
            {/* Header Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch">
                <div className="lg:col-span-8 bg-[#0a0b14] border-2 border-white/5 rounded-[4rem] p-10 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 p-10 text-9xl font-black text-white/[0.01] pointer-events-none italic uppercase">PACK</div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-white">{activeGroup.name}</h2>
                        <div className="mt-6 flex items-center gap-6">
                            <div className="px-6 py-2 bg-orange-500 rounded-full text-[10px] font-black tracking-[0.3em] shadow-xl shadow-orange-500/20 cursor-pointer active:scale-95" onClick={copyInviteCode}>
                                INVITE: {activeGroup.code}
                            </div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Version: 4.1.2</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white/5 backdrop-blur-3xl rounded-[4rem] p-10 border border-white/10 flex flex-col justify-center items-center text-center">
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-[0.4em]">Node Budget Consensus</p>
                    <h3 className="text-5xl font-black text-orange-500 tracking-tighter">₹{(budget / (activeGroup.members.length || 1)).toLocaleString()}</h3>
                    <input type="range" min="1000" max="100000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full mt-6 accent-orange-500" />
                </div>
            </div>

            {/* --- ADD MEMBERS HUB --- */}
            <div className="flex gap-8 mb-12 overflow-x-auto pb-4 px-2 no-scrollbar items-center">
                {activeGroup.members.map((m, idx) => <MemberNode key={idx} member={m} />)}
                <button 
                    onClick={() => setShowContactSync(true)}
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-xl text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-xl hover:scale-110 active:rotate-90"
                >
                    ＋
                </button>
            </div>

            {/* --- CONTACT SYNC MODAL --- */}
            {showContactSync && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-[#111222] border border-white/10 w-full max-w-md rounded-[3.5rem] p-10 shadow-4xl animate-slideUp">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Sync Global Pack</h3>
                            <button onClick={() => setShowContactSync(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {mockContacts.map(c => (
                                <div key={c.id} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center">{c.pic}</div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase">{c.name}</p>
                                            <p className={`text-[8px] font-bold uppercase ${c.online ? 'text-green-500' : 'text-gray-600'}`}>{c.online ? 'Online' : 'Node Offline'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { addMemberFromContacts(c); setShowContactSync(false); }}
                                        className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-xl text-[8px] font-black uppercase hover:bg-orange-500 hover:text-white transition-all"
                                    >
                                        Add to Path
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex bg-white/5 p-2 rounded-[2.5rem] gap-2 mb-10 border border-white/5">
                {['planner', 'votes', 'chat', 'radar'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} 
                        className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-orange-500 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab Content Box */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-[4rem] border border-white/10 shadow-4xl p-10 min-h-[500px]">
                {activeTab === 'votes' && (
                    <div className="space-y-10 animate-fadeIn">
                        <div className="relative group">
                            <input 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 p-6 pr-40 rounded-[2.5rem] text-white outline-none focus:border-orange-500 transition-all italic"
                                placeholder="Suggest a new node for the pack (e.g. Cafe Unwind Raipur)..."
                            />
                            <button onClick={handleAddSpot} className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">UPLINK</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeGroup.spots.map(s => (
                                <div key={s.id} className="p-8 bg-black/40 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all duration-700 shadow-inner">
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{s.name}</h4>
                                        <p className="text-[10px] text-gray-500 mt-3 font-medium uppercase leading-relaxed">"{s.description}"</p>
                                        <div className="mt-6 flex items-center gap-3">
                                            <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md uppercase">Suggested by {s.suggestedBy}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={() => handleVote(s.id)} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-xl hover:bg-orange-500 transition-all shadow-2xl active:scale-90">🔥</button>
                                        <span className="text-sm font-black text-orange-500">{s.votes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other tabs follow similar premium patterns... */}
                {activeTab === 'planner' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <div className="text-8xl mb-6">🗓️</div>
                        <p className="text-xs font-black uppercase tracking-[0.5em]">Aggregating Consensus Nodes...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupPlanning;