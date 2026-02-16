// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useSearch } from '../../contexts/SearchContext';

const CommunityHub: React.FC = () => {
    const { profile } = useUser();
    const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'live-map'>('feed');
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState('');
    const [searchUser, setSearchUser] = useState('');

    // Connectivity Logic: Simulation of Global Nodes
    useEffect(() => {
        setPosts([
            { id: 1, user: "Rahul", loc: "Delhi", content: "Marine Drive Raipur is amazing! Just visited.", type: "text", time: "2h ago" },
            { id: 2, user: "Elena", loc: "Berlin", content: "Hey Shashank, love the app concept from Germany!", type: "text", time: "5h ago" },
            { id: 3, user: "Aarav", loc: "Mumbai", content: "Anyone up for a trek near Raipur this weekend?", type: "text", time: "10m ago" }
        ]);
    }, []);

    const handleSharePost = () => {
        if(!newPost) return;
        const post = {
            id: Date.now(),
            user: profile?.name?.split(' ')[0] || "Explorer",
            loc: "Raipur", // Auto-synced from user profile
            content: newPost,
            type: "text",
            time: "Just now"
        };
        setPosts([post, ...posts]);
        setNewPost('');
    };

    return (
        <div className="max-w-7xl mx-auto h-screen flex flex-col bg-[#0a0b14] text-white overflow-hidden relative">
            {/* --- GLOBAL HUB NAVIGATION --- */}
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0a0b14]/80 backdrop-blur-xl z-20">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Bharat Path Hub</h2>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Social Mesh Online</p>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-white/5 p-1 rounded-3xl border border-white/10">
                    {['feed', 'messages', 'live-map'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN INTERFACE --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                
                {/* 1. GLOBAL FEED TAB */}
                {activeTab === 'feed' && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                        {/* Search Bars for Global Discovery */}
                        <div className="relative mb-10">
                            <input 
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Search Global Nodes (Users, Cities, Countries)..."
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] outline-none font-bold text-sm focus:border-orange-500/50 transition-all"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-2xl">🔍</button>
                        </div>

                        {/* Broadcast Creator */}
                        <div className="bg-white/5 p-8 rounded-[3.5rem] border border-white/10 shadow-2xl group transition-all hover:bg-white/10">
                            <textarea 
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Broadcast to the world..."
                                className="w-full bg-transparent border-none outline-none text-lg font-medium italic resize-none h-24 placeholder:text-gray-600"
                            />
                            <div className="flex justify-between items-center mt-6 border-t border-white/5 pt-6">
                                <div className="flex gap-6">
                                    <button className="text-2xl hover:scale-125 transition-transform" title="Add Location">📍</button>
                                    <button className="text-2xl hover:scale-125 transition-transform" title="Share Media">🎥</button>
                                </div>
                                <button onClick={handleSharePost} className="bg-orange-500 text-white px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95">UPLINK POST</button>
                            </div>
                        </div>

                        {/* Global Feed Stream */}
                        <div className="space-y-6">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:border-orange-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                                                {post.user[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-md uppercase tracking-tight">{post.user}</h4>
                                                <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    {post.loc} NODE
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{post.time}</span>
                                    </div>
                                    <p className="text-gray-300 text-lg leading-relaxed font-medium italic mb-6">"{post.content}"</p>
                                    <div className="flex gap-8 border-t border-white/5 pt-6">
                                        <button className="text-[10px] font-black uppercase text-gray-500 hover:text-orange-500 transition-colors">⚡ Like</button>
                                        <button onClick={() => setActiveTab('messages')} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">💬 Reply</button>
                                        <button className="text-[10px] font-black uppercase text-gray-500 hover:text-blue-400 transition-colors">🔗 Share</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. MESSAGES TAB (Simplified Chat Layout) */}
                {activeTab === 'messages' && (
                    <div className="max-w-5xl mx-auto h-full flex bg-white/5 rounded-[4rem] border border-white/5 overflow-hidden animate-fadeIn">
                        {/* Chat Sidebar */}
                        <div className="w-1/3 border-r border-white/5 p-6 space-y-4">
                            <h3 className="text-xs font-black uppercase text-gray-500 mb-6 tracking-widest">Active Links</h3>
                            {posts.slice(0, 3).map(p => (
                                <div key={p.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white/10 cursor-pointer transition-all">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold">{p.user[0]}</div>
                                    <div className="hidden md:block">
                                        <p className="text-xs font-black uppercase">{p.user}</p>
                                        <p className="text-[8px] text-green-500 uppercase">Online</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Active Chat Window */}
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">💬</div>
                            <h3 className="text-xl font-black uppercase italic">Neural Messaging Protocol</h3>
                            <p className="text-gray-500 text-xs mt-2 max-w-xs">Select a user to initialize end-to-end encrypted spatial chat.</p>
                        </div>
                    </div>
                )}

                {/* 3. LIVE MAP (Global Connectivity View) */}
                {activeTab === 'live-map' && (
                    <div className="h-full w-full bg-white/5 rounded-[4rem] border border-white/5 flex flex-col items-center justify-center animate-fadeIn relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            {/* Decorative element to simulate map/nodes */}
                            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent"></div>
                        </div>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter z-10">Global Node Registry</h3>
                        <p className="text-orange-500 font-black uppercase text-[10px] tracking-[0.5em] mt-4 z-10">Visualizing users in 24 Countries</p>
                        <button className="mt-8 bg-white text-black px-10 py-3 rounded-full font-black text-[10px] uppercase shadow-2xl z-10 hover:bg-orange-500 hover:text-white transition-all">Initialize Map View</button>
                    </div>
                )}
            </div>

            {/* --- FOUNDER FOOTER --- */}
            <div className="p-4 text-center bg-[#0a0b14] border-t border-white/5">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking