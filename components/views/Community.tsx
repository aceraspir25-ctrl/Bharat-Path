// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUser } from '../../contexts/UserContext';

// Standard Leaflet Icon Fix
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const CommunityHub: React.FC = () => {
    const { profile } = useUser();
    const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'live-map'>('feed');
    const [posts, setPosts] = useState([
        { id: 1, user: "Shashank", type: 'video', content: "Raipur Marine Drive vibes!", music: "Arjan Vailly", likes: 1240, loc: "Raipur" },
        { id: 2, user: "Elena", type: 'image', content: "Exploring ancient temples.", music: "Om Namah Shivay", likes: 850, loc: "Berlin" }
    ]);
    const [newPostText, setNewPostText] = useState('');
    const [selectedMusic, setSelectedMusic] = useState('No Music');

    // Navigation and Logic for Worldwide Connectivity
    const userNodes = [
        { id: 1, name: "Shashank (Founder)", pos: [21.2514, 81.6296], loc: "Raipur" },
        { id: 3, name: "Elena", pos: [52.5200, 13.4050], loc: "Berlin" },
        { id: 4, name: "Aarav", pos: [19.0760, 72.8777], loc: "Mumbai" }
    ];

    return (
        <div className="max-w-7xl mx-auto h-screen flex flex-col bg-[#0a0b14] text-white overflow-hidden selection:bg-orange-500/30">
            {/* --- TOP GLOBAL NAVIGATION --- */}
            <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0b14]/80 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-full animate-pulse"></div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Path <span className="text-orange-500">Live</span></h2>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.5em]">Global Connectivity Protocol</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    {['feed', 'messages', 'live-map'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all duration-500 ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}>
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* 1. INSTAGRAM STYLE FEED */}
                {activeTab === 'feed' && (
                    <div className="max-w-xl mx-auto py-10 space-y-10 animate-fadeIn">
                        {/* Story Circles */}
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {userNodes.map(node => (
                                <div key={node.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-500 via-red-500 to-purple-500">
                                        <div className="w-full h-full rounded-full bg-black border-2 border-black overflow-hidden flex items-center justify-center font-black">
                                            {node.name[0]}
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{node.loc}</span>
                                </div>
                            ))}
                        </div>

                        {/* Post Creator Terminal */}
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <textarea 
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm italic resize-none h-20 placeholder:text-gray-600"
                                placeholder="Uplink your path story..."
                            />
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                <div className="flex gap-4 items-center">
                                    <button className="text-lg hover:scale-125 transition-transform" title="Add Music">🎵</button>
                                    <select onChange={(e) => setSelectedMusic(e.target.value)} className="bg-black/40 text-[8px] font-black p-1 rounded-full text-orange-500 outline-none border border-white/5">
                                        <option>Choose Sound</option>
                                        <option>Bharat Path Theme</option>
                                        <option>Raipur Nights</option>
                                    </select>
                                    <button className="text-lg hover:scale-125 transition-transform">🎥</button>
                                </div>
                                <button className="bg-white text-black px-8 py-2 rounded-full font-black text-[9px] uppercase hover:bg-orange-500 hover:text-white transition-all">Broadcast</button>
                            </div>
                        </div>

                        {/* Posts List */}
                        {posts.map(post => (
                            <div key={post.id} className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden group hover:border-orange-500/20 transition-all">
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center font-black">{post.user[0]}</div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase">{post.user}</h4>
                                            <p className="text-[8px] text-orange-500 font-bold uppercase tracking-widest">{post.loc} Node</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-600">•••</button>
                                </div>
                                <div className="aspect-square bg-black/40 flex items-center justify-center relative">
                                    <div className="text-5xl opacity-20">{post.type === 'video' ? '📽️' : '🖼️'}</div>
                                    <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                        <span className="text-[10px] animate-spin">💿</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest">{post.music}</span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex gap-6 mb-4">
                                        <button className="text-xl">❤️</button>
                                        <button className="text-xl">💬</button>
                                        <button className="text-xl">✈️</button>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed italic"><span className="font-black mr-2 uppercase">{post.user}</span>"{post.content}"</p>
                                    <p className="mt-4 text-[8px] font-black text-gray-600 uppercase tracking-widest">Linked 2 hours ago from Raipur Central Hub</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. LIVE MAP PROTOCOL */}
                {activeTab === 'live-map' && (
                    <div className="h-full w-full animate-fadeIn relative">
                        <MapContainer center={[21.2514, 81.6296]} zoom={3} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {userNodes.map(node => (
                                <React.Fragment key={node.id}>
                                    <Marker position={node.pos} icon={customIcon}>
                                        <Popup>
                                            <div className="text-black p-2 text-center">
                                                <p className="font-black uppercase text-[10px]">{node.name}</p>
                                                <button className="mt-2 bg-orange-500 text-white px-4 py-1 rounded-full text-[8px] font-black">CHAT NOW</button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    <Circle center={node.pos} radius={200000} pathOptions={{ color: '#f97316', fillOpacity: 0.1 }} />
                                </React.Fragment>
                            ))}
                        </MapContainer>
                        <div className="absolute bottom-10 right-10 z-[1000] bg-orange-500 p-6 rounded-[2.5rem] shadow-2xl animate-bounce">
                             <p className="text-[10px] font-black uppercase text-white">Live Explorers: 2,401</p>
                        </div>
                    </div>
                )}

                {/* 3. MESSAGING HUB */}
                {activeTab === 'messages' && (
                    <div className="max-w-4xl mx-auto h-full flex bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden animate-fadeIn my-10">
                        <div className="w-1/3 border-r border-white/5 p-6 space-y-4 overflow-y-auto">
                            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Active Encryptions</h3>
                            {userNodes.map(u => (
                                <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-all group">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-black group-hover:bg-orange-500 transition-colors">{u.name[0]}</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase">{u.name.split(' ')[0]}</p>
                                        <p className="text-[8px] text-green-500 uppercase tracking-tighter">Connected</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-30">
                            <div className="text-7xl mb-6">🛰️</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Establishing Secure Neural Uplink...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* FOUNDER BRANDING FOOTER */}
            <footer className="p-4 text-center border-t border-white/5 bg-[#0a0b14]">
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest italic">Global Mesh Architecture Designed by Shashank Mishra</p>
            </footer>
        </div>
    );
};

export default CommunityHub;