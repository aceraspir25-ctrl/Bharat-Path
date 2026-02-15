import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { SearchIcon, MoonIcon, SunIcon, MicrophoneIcon, GlobeIcon, BellIcon, LogoutIcon } from './icons/Icons';
import { View, Notification } from '../types';

interface HeaderProps {
    setSidebarOpen: (isOpen: boolean) => void;
    setActiveView: (view: View) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    notifications: Notification[];
    onMarkRead: () => void;
    onLogout: () => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'alert': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    };

    return (
        <div className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${notification.read ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex items-start gap-3">
                <span className="text-xl">{getIcon()}</span>
                <div className="flex-1">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight leading-none mb-1">{notification.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{notification.message}</p>
                    <p className="text-[9px] text-gray-600 font-black uppercase mt-2 tracking-widest">{timeAgo(notification.timestamp)}</p>
                </div>
                {!notification.read && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1"></div>}
            </div>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, setActiveView, theme, toggleTheme, notifications, onMarkRead, onLogout }) => {
    const { searchQuery, setSearchQuery, performSearch, loading } = useSearch();
    const { language } = useLanguage();
    const { profile } = useUser();
    
    const [isListening, setIsListening] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const recognitionRef = useRef<any>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Real-time search action with debouncing
    useEffect(() => {
        if (!searchQuery.trim() || !isFocused) return;

        const timer = setTimeout(() => {
            if (searchQuery.length > 3) {
                performSearch(searchQuery);
                // We stay in current view unless explicit submit, but results sync in background
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery, performSearch, isFocused]);

    const handleExecuteSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery);
            setActiveView(View.Dashboard);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                if (transcript.trim()) {
                    performSearch(transcript);
                    setActiveView(View.Dashboard);
                }
            };
            recognitionRef.current = recognition;
        }
    }, [language, setSearchQuery, performSearch, setActiveView]);

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
            return;
        }
        if (isListening) recognitionRef.current.stop();
        else recognitionRef.current.start();
    };

    return (
        <header className="flex items-center justify-between p-4 bg-[#FF9933] border-b border-orange-600/20 shadow-lg sticky top-0 z-20">
            <div className="flex items-center">
                <button 
                    type="button"
                    onClick={() => setSidebarOpen(true)} 
                    className="text-[#111222] focus:outline-none md:hidden mr-4 hover:opacity-70 transition-opacity"
                    aria-label="Open sidebar"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <form 
                onSubmit={handleExecuteSearch}
                className="flex-1 flex items-center justify-center px-4 max-w-2xl mx-auto gap-3"
            >
                <div className={`flex-1 relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(e)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={isListening ? "Listening to your path..." : "Search places, stories, hotels..."}
                        className={`w-full pl-12 pr-12 py-2.5 bg-white border-none text-[#111222] rounded-2xl focus:ring-4 focus:ring-white/40 placeholder-gray-400 transition-all font-bold shadow-inner ${
                            isListening || loading ? 'ring-2 ring-white/50' : ''
                        }`}
                    />
                    <button 
                        type="submit"
                        className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors z-10 ${isFocused ? 'text-orange-500' : 'text-gray-400'}`}
                        title="Start Search"
                    >
                      <SearchIcon className="w-5 h-5" />
                    </button>
                    {loading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <button 
                    type="button"
                    onClick={handleVoiceInput} 
                    title={isListening ? "Stop listening" : "Search with voice"}
                    className={`p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center ${
                        isListening 
                        ? 'bg-[#111222] text-white animate-pulse' 
                        : 'bg-white text-[#FF9933] hover:bg-[#111222] hover:text-white'
                    }`}
                >
                    < MicrophoneIcon className="w-5 h-5" />
                </button>
            </form>
            
            <div className="flex items-center space-x-6 pr-4">
                 <div className="hidden lg:flex items-center gap-2 text-[#111222]">
                    <GlobeIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'Hindi' : 'English'}</span>
                </div>

                <div className="relative" ref={notificationRef}>
                    <button 
                        type="button"
                        onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) onMarkRead(); }}
                        className={`text-[#111222] hover:opacity-70 transition-all relative p-2 rounded-xl ${showNotifications ? 'bg-white/20' : ''}`} 
                        aria-label="Notifications"
                    >
                        <BellIcon className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#111222] text-[#FF9933] text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#FF9933]">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#1a1c2e] rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Path Registry</h4>
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{notifications.length} alerts</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(n => <NotificationItem key={n.id} notification={n} />)
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">No Active Alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                 <button type="button" onClick={toggleTheme} className="text-[#111222] hover:opacity-70 transition-colors" aria-label="Toggle theme">
                    {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>

                <div className="relative" ref={profileRef}>
                    <div 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-10 h-10 rounded-2xl border-2 border-[#111222] p-0.5 shadow-lg cursor-pointer overflow-hidden transform hover:scale-105 transition-transform bg-white"
                        title="User Profile"
                    >
                        <img 
                            src={profile.profilePic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80"} 
                            alt="User Profile" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-3 w-56 bg-[#1a1c2e] rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn p-2 z-50">
                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                <p className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{profile.name}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Global Explorer</p>
                            </div>
                            
                            <button 
                                type="button"
                                onClick={() => { setActiveView(View.Community); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all uppercase tracking-widest"
                            >
                                <span className="text-base">👤</span> My Account
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => { setActiveView(View.Settings); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all uppercase tracking-widest"
                            >
                                <span className="text-base">⚙️</span> Settings
                            </button>
                            
                            <div className="h-px bg-white/5 my-2 mx-2"></div>
                            
                            <button 
                                type="button"
                                onClick={() => { onLogout(); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-orange-500 hover:text-white hover:bg-orange-500 transition-all rounded-2xl uppercase tracking-widest"
                            >
                                <LogoutIcon className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </header>
    );
};

export default Header;