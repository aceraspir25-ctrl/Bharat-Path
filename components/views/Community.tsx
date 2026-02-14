
import React, { useState, useRef, useEffect, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useUser } from '../../contexts/UserContext';
import { Post, ChatRoom, ChatMessage } from '../../types';
import { CommunityIcon, UsersIcon, GlobeIcon, CompassIcon } from '../icons/Icons';
import { getChatTranslation } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

const TrustBadge: React.FC<{ type: string }> = ({ type }) => {
    const styles = {
        'Verified Traveler': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Raipur Local Expert': 'bg-green-500/10 text-green-500 border-green-500/20',
        'Path Pioneer': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'Group Member': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        'Trusted Contributor': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${styles[type as keyof typeof styles] || styles['Group Member']}`}>
            {type}
        </span>
    );
};

const CountryFlag: React.FC<{ code: string }> = ({ code }) => (
    <span className="text-sm shadow-sm" title={code}>
        {code === 'IN' ? '🇮🇳' : code === 'US' ? '🇺🇸' : code === 'JP' ? '🇯🇵' : code === 'GB' ? '🇬🇧' : '🌍'}
    </span>
);

const CHAT_ROOMS: ChatRoom[] = [
    { id: 'global', name: 'Global Wall', icon: '🌍', description: 'Universal travel broadcast for all explorers.' },
    { id: 'cultural', name: 'Cultural Exchange', icon: '🏛️', description: 'Share traditions, history, and sacred paths.' },
    { id: 'solo', name: 'Solo Travelers', icon: '🎒', description: 'Tips and meetups for the independent path.' },
    { id: 'foodies', name: 'Local Foodies', icon: '🥘', description: 'The absolute best bites from around the world.' },
];

const Community: React.FC = () => {
    const { language } = useLanguage();
    const { profile, addExpertiseBadge } = useUser();
    
    const [activeRoomId, setActiveRoomId] = useState('global');
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('communityMessages', []);
    const [inputText, setInputText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    const filteredMessages = useMemo(() => 
        messages.filter(m => m.roomId === activeRoomId).sort((a, b) => a.timestamp - b.timestamp),
    [messages, activeRoomId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // SOCIAL TRUST ENGINE: Expertise Calculation
        const myMessageCount = messages.filter(m => m.senderId === 'current-user').length;
        if (myMessageCount === 2) addExpertiseBadge('Trusted Contributor');
        if (myMessageCount === 5) addExpertiseBadge('Path Authority');

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            roomId: activeRoomId,
            senderId: 'current-user',
            senderName: profile.name,
            senderPic: profile.profilePic,
            senderCountry: profile.country,
            senderBadges: ['Verified Traveler', ...profile.memory.expertiseNodes],
            text: inputText,
            sourceLang: language,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
    };

    const handleTranslateMessage = async (msgId: string) => {
        setIsTranslating(true);
        const msgIndex = messages.findIndex(m => m.id === msgId);
        if (msgIndex === -1) return;

        const msg = messages[msgIndex];
        try {
            const targetLangFull = language === 'hi' ? 'Hindi' : 'English';
            const translation = await getChatTranslation(msg.text, targetLangFull);
            
            const updatedMessages = [...messages];
            updatedMessages[msgIndex] = { ...msg, translatedText: translation };
            setMessages(updatedMessages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 animate-fadeIn">
            {/* Topic Sidebar */}
            <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <UsersIcon className="text-orange-500" /> Topic Hubs
                    </h2>
                    <div className="space-y-3">
                        {CHAT_ROOMS.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoomId(room.id)}
                                className={`w-full text-left p-5 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${
                                    activeRoomId === room.id 
                                    ? 'border-orange-500 bg-orange-500 text-white shadow-xl shadow-orange-500/20' 
                                    : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-gray-300 hover:border-orange-500/30'
                                }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <span className="text-2xl">{room.icon}</span>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">{room.name}</p>
                                        <p className={`text-[8px] font-bold uppercase mt-1 opacity-60 line-clamp-1`}>{room.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a1c2e] to-[#111222] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-4">Registry Info</p>
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400 font-medium italic leading-relaxed">
                            "Share your knowledge. contributing to the pack increases your global trust level and unlocks expertise badges."
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {profile.memory.expertiseNodes.map(node => (
                                <span key={node} className="px-2 py-1 bg-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest border border-white/10">{node}</span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Active Pulse Sync</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3.5rem] shadow-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                {/* Chat Header */}
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">
                            {CHAT_ROOMS.find(r => r.id === activeRoomId)?.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {CHAT_ROOMS.find(r => r.id === activeRoomId)?.name}
                            </h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Live Global Uplink</p>
                        </div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {filteredMessages.map((msg, idx) => {
                        const isMe = msg.senderId === 'current-user';
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                                <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden shadow-md flex-shrink-0">
                                        {msg.senderPic ? <img src={msg.senderPic} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-orange-500/10 text-orange-500 font-black text-xs uppercase">{msg.senderName[0]}</div>}
                                    </div>
                                    <div className={`space-y-2 ${isMe ? 'text-right' : 'text-left'}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{msg.senderName}</span>
                                            <CountryFlag code={msg.senderCountry} />
                                            {msg.senderBadges.map(b => <TrustBadge key={b} type={b} />)}
                                        </div>
                                        <div className={`p-5 rounded-[2rem] shadow-xl relative group/bubble transition-all hover:scale-[1.02] ${
                                            isMe 
                                            ? 'bg-orange-500 text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10 rounded-tl-none'
                                        }`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                            
                                            {msg.translatedText && (
                                                <div className={`mt-4 pt-4 border-t ${isMe ? 'border-white/20' : 'border-gray-100 dark:border-white/5'} animate-fadeIn`}>
                                                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isMe ? 'text-white/60' : 'text-orange-500'}`}>
                                                        AI Path Translation
                                                    </p>
                                                    <p className={`text-xs italic font-medium ${isMe ? 'text-white/90' : 'text-gray-500'}`}>{msg.translatedText}</p>
                                                </div>
                                            )}

                                            {!isMe && !msg.translatedText && (
                                                <button 
                                                    onClick={() => handleTranslateMessage(msg.id)}
                                                    className="absolute -bottom-6 left-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1"
                                                >
                                                    <GlobeIcon className="w-2 h-2" /> One-Tap Translate
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                    <div className="flex gap-4 relative">
                        <input 
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={`Broadcast to ${CHAT_ROOMS.find(r => r.id === activeRoomId)?.name}...`}
                            className="flex-1 bg-white dark:bg-[#111222] border-2 border-transparent rounded-[2.5rem] py-5 px-10 text-gray-800 dark:text-white font-bold shadow-inner focus:border-orange-500 outline-none transition-all text-lg pr-32"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                            <button className="p-3 text-gray-400 hover:text-orange-500 transition-colors">
                                <CompassIcon className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                            >
                                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 px-6">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Memory Sync Protocol Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Community;
