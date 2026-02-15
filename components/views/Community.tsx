import React, { useState, useRef, useEffect, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useUser } from '../../contexts/UserContext';
import { Post, ChatRoom, ChatMessage, View } from '../../types';
import { CommunityIcon, UsersIcon, GlobeIcon, CompassIcon, InfoIcon } from '../icons/Icons';
import { getChatTranslation } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

const GlobalTicker: React.FC = () => (
    <div className="bg-orange-500 overflow-hidden py-1.5 border-y border-orange-400/30">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Live Pulse:</span>
                    <span className="text-[9px] font-bold text-orange-950 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                        Explorer {['Arush', 'Yuki', 'Sarah', 'Priya', 'Hans'][i]} synchronized a new node in {['Varanasi', 'Tokyo', 'London', 'Paris', 'Berlin'][i]}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const PathJournal: React.FC<{ post: any; onLike: () => void }> = ({ post, onLike }) => (
    <div className="bg-white/60 dark:bg-[#1A1C26]/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/20 dark:border-white/5 shadow-2xl group transition-all hover:-translate-y-1">
        <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 p-0.5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                    <img src={post.authorPic} className="w-full h-full object-cover rounded-[14px]" alt="" />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase text-gray-900 dark:text-white tracking-tight leading-none">{post.authorName}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{post.timeAgo} • {post.location}</p>
                </div>
            </div>
            <div className="flex gap-1.5">
                {post.badges.map((b: string) => (
                    <span key={b} className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-orange-500/20">{b}</span>
                ))}
            </div>
        </div>

        <div className="px-8 pb-4">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-tight mb-4 group-hover:text-orange-500 transition-colors italic">{post.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">{post.content}</p>
        </div>

        <div className="h-[400px] bg-[#0d0e15] relative overflow-hidden m-4 rounded-[2.5rem]">
            <img src={post.image} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-[5s] ease-out" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Node Registry</p>
                    <p className="text-white text-xl font-black uppercase tracking-tighter">{post.locationName}</p>
                </div>
                <button className="bg-white text-gray-900 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95">
                    Sync Node ➔
                </button>
            </div>
        </div>

        <div className="p-8 pt-2 flex justify-between items-center">
            <div className="flex gap-8">
                <button onClick={onLike} className="flex items-center gap-2 group/btn">
                    <span className="text-2xl group-hover/btn:scale-125 transition-transform">🙏</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.likes} Namaste</span>
                </button>
                <button className="flex items-center gap-2 group/btn">
                    <span className="text-2xl group-hover/btn:scale-125 transition-transform">🍛</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasty</span>
                </button>
                <button className="flex items-center gap-2 group/btn">
                    <span className="text-2xl group-hover/btn:scale-125 transition-transform">💬</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logs</span>
                </button>
            </div>
            <button className="text-gray-400 hover:text-orange-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </button>
        </div>
    </div>
);

const TrendingNode: React.FC<{ name: string; city: string; img: string }> = ({ name, city, img }) => (
    <div className="flex-shrink-0 w-64 h-80 bg-[#111222] rounded-[2.5rem] overflow-hidden relative shadow-2xl group cursor-pointer border border-white/5">
        <img src={img} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
            <span className="bg-orange-500 text-white text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-2 inline-block">HOT NODE</span>
            <h5 className="text-white font-black uppercase tracking-tighter text-lg leading-none">{name}</h5>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{city}</p>
        </div>
    </div>
);

const Community: React.FC = () => {
    const { profile } = useUser();
    const [activeTab, setActiveTab] = useState('Chronicles');
    const [postText, setPostText] = useState('');

    const mockPosts = [
        {
            id: 1,
            authorName: 'Yuki Tanaka',
            authorPic: 'https://i.pravatar.cc/150?u=yuki',
            timeAgo: '42m ago',
            location: 'Kyoto Node',
            title: 'Spiritual Resonance in Arashiyama',
            content: 'The morning mist over the bamboo grove was synthesized perfectly today. Highly recommend walking the path at exactly 05:45 AM local time for peak immersion.',
            image: 'https://images.unsplash.com/photo-1590065582372-df568297a941?auto=format&fit=crop&w=800&q=80',
            locationName: 'Arashiyama Grove',
            badges: ['Global Gold', 'Kyoto Expert'],
            likes: 128
        },
        {
            id: 2,
            authorName: 'Arush Sharma',
            authorPic: 'https://i.pravatar.cc/150?u=arush',
            timeAgo: '2h ago',
            location: 'Varanasi Registry',
            title: 'Ancient Knowledge Synthesis',
            content: 'Decoded the evening Aarti rituals at Dashashwamedh Ghat. The neural impact of the collective chanting is unlike anything logged in the Western nodes.',
            image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80',
            locationName: 'Ganga Ghats',
            badges: ['Master Path-Finder'],
            likes: 854
        }
    ];

    const trendingNodes = [
        { name: 'Lotus Temple', city: 'Delhi', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80' },
        { name: 'Mount Fuji', city: 'Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80' },
        { name: 'Colosseum', city: 'Rome', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
        { name: 'Eiffel Tower', city: 'Paris', img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80' }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0F111A] text-white -m-4 md:-m-8">
            <GlobalTicker />
            
            <div className="flex justify-center border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#111222] p-6 sticky top-0 z-20 backdrop-blur-xl">
                <div className="flex gap-2">
                    {['Chronicles', 'Visions', 'Tribes', 'Leaderboard'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`font-black uppercase tracking-[0.2em] text-[10px] transition-all relative px-8 py-3 rounded-full ${activeTab === tab ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: TRENDING & STATS */}
                    <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
                        <section className="space-y-6">
                            <h3 className="text-[12px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.5em] flex items-center gap-4">
                                🔥 TRENDING NODES
                                <span className="flex-1 h-px bg-gray-200 dark:bg-white/10"></span>
                            </h3>
                            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar-hide">
                                {trendingNodes.map((n, i) => <TrendingNode key={i} {...n} />)}
                            </div>
                        </section>

                        <section className="bg-gradient-to-br from-[#1a1c2e] to-[#0d0e1a] p-10 rounded-[3.5rem] border border-white/10 shadow-3xl group relative overflow-hidden">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8">Path Master Board</h3>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between group/user cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 15}`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase text-gray-300 group-hover/user:text-orange-500 transition-colors">Explorer {i}</p>
                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">4.2k Synced Nodes</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-orange-500">🏆 TOP {i}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black rotate-12 group-hover:rotate-0 transition-transform pointer-events-none">CORE</div>
                        </section>

                        <div className="bg-orange-500/5 border border-orange-500/20 p-8 rounded-[3rem] text-center space-y-4">
                             <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500 text-3xl shadow-inner">🛰️</div>
                             <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Global Hub Active</h4>
                             <p className="text-xs text-gray-500 font-bold leading-relaxed">Intelligence protocol currently tracking 14,842 simultaneous global path sessions.</p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: MAIN FEED */}
                    <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
                        {/* JOURNAL CREATION */}
                        <div className="bg-white/60 dark:bg-[#1A1C26]/90 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/40 dark:border-white/5 shadow-4xl group">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-white/5 rounded-3xl overflow-hidden shadow-inner">
                                    <img src={profile.profilePic || "https://i.pravatar.cc/150?u=me"} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Log Your Journey, {profile.name.split(' ')[0]}</h4>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Append to Universal Memory Registry</p>
                                </div>
                            </div>
                            <textarea 
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder="Sync your latest coordinates and stories with the world..." 
                                className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-orange-500/30 rounded-[2rem] py-6 px-8 text-lg font-bold text-gray-800 dark:text-white outline-none resize-none min-h-[150px] transition-all shadow-inner placeholder:text-gray-400"
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-orange-500 transition-all text-gray-500 hover:text-orange-500 shadow-sm">
                                        <span>📷</span> PHOTO LOG
                                    </button>
                                    <button className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-orange-500 transition-all text-gray-500 hover:text-orange-500 shadow-sm">
                                        <span>📍</span> NODE TAG
                                    </button>
                                </div>
                                <button className="w-full sm:w-auto px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-3xl shadow-orange-500/30 transition-all active:scale-95 uppercase tracking-widest text-[11px]">
                                    BROADCAST PATH
                                </button>
                            </div>
                        </div>

                        {/* FEED LIST */}
                        <div className="space-y-12 animate-fadeInUp">
                            {activeTab === 'Chronicles' ? mockPosts.map(p => (
                                <PathJournal key={p.id} post={p} onLike={() => {}} />
                            )) : (
                                <div className="py-32 flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-6xl shadow-inner animate-pulse">🛰️</div>
                                    <div>
                                        <p className="text-xl font-black uppercase tracking-tighter">{activeTab} Registry Pending</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-50">Intelligence synthesis in progress for this cluster</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
                .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-4xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.5); }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.4); }
            `}</style>
        </div>
    );
};

export default Community;