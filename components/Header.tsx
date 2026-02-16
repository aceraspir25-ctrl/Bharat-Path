import React, { useState, useRef, useEffect } from 'react';
import { useSearch, SearchFilters } from '../contexts/SearchContext';
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

const FilterPopover: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { filters, setFilters, performSearch, searchQuery } = useSearch();
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleFilterChange = (updates: Partial<SearchFilters>) => {
        const newFilters = { ...filters, ...updates };
        setFilters(newFilters);
    };

    const handleClear = () => {
        setFilters({ category: 'All', minRating: 0, date: '' });
    };

    const applyFilters = () => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        }
        onClose();
    };

    return (
        <div ref={popoverRef} className="absolute top-full right-0 md:left-0 mt-4 w-80 bg-white/95 dark:bg-[#1a1c2e]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-4xl border border-orange-500/20 p-8 z-[100] animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Search Protocols</h4>
                <button onClick={handleClear} className="text-[9px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear Protocol</button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-1 flex items-center gap-2">
                        <span>🏷️</span> Category Cluster
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['All', 'Hotel', 'Restaurant'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => handleFilterChange({ category: cat as any })}
                                className={`py-3 rounded-2xl text-[9px] font-black uppercase transition-all border-2 ${filters.category === cat ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-1 flex items-center gap-2">
                        <span>⭐</span> Minimum Rating
                    </label>
                    <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button 
                                key={star}
                                onClick={() => handleFilterChange({ minRating: star })}
                                className={`flex-1 py-2.5 rounded-xl transition-all text-sm ${filters.minRating >= star ? 'text-orange-500 scale-110' : 'text-gray-300 dark:text-gray-700 opacity-40 hover:opacity-100'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3 px-1 flex items-center gap-2">
                        <span>📅</span> Temporal Focus (Date)
                    </label>
                    <input 
                        type="date" 
                        value={filters.date}
                        onChange={(e) => handleFilterChange({ date: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-white outline-none border-2 border-transparent focus:border-orange-500/50 shadow-inner"
                    />
                </div>

                <div className="pt-2">
                    <button 
                        onClick={applyFilters}
                        className="w-full py-5 bg-[#111222] dark:bg-white text-white dark:text-[#111222] rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                    >
                        Apply AI Refinement
                    </button>
                    <p className="text-[8px] text-gray-400 font-bold uppercase text-center mt-4 tracking-widest opacity-60">Filters apply immediately to current results</p>
                </div>
            </div>
        </div>
    );
};

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
    const { searchQuery, setSearchQuery, performSearch, loading, filters } = useSearch();
    const { language } = useLanguage();
    const { profile } = useUser();
    
    const [isListening, setIsListening] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const recognitionRef = useRef<any>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

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

    const handleVoiceInput = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!recognitionRef.current) {
            alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
            return;
        }
        if (isListening) recognitionRef.current.stop();
        else recognitionRef.current.start();
    };

    const hasActiveFilters = filters.category !== 'All' || filters.minRating > 0 || filters.date !== '';

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

            <div className="flex-1 flex items-center justify-center px-4 max-w-3xl mx-auto gap-3">
                <div className="flex-1 relative flex items-center gap-2 group">
                    <div className="relative flex-1">
                        <form 
                            onSubmit={handleExecuteSearch}
                            className="relative transition-all duration-300"
                        >
                            <div className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors z-10 ${isFocused ? 'text-orange-500' : 'text-gray-400'}`}>
                              <SearchIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(e)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={isListening ? "Listening..." : "Search your global path..."}
                                className={`w-full pl-12 pr-12 py-3.5 bg-white border-none text-[#111222] rounded-[1.5rem] focus:ring-4 focus:ring-white/40 placeholder-gray-400 transition-all font-bold shadow-inner ${
                                    isListening || loading ? 'ring-2 ring-white/50' : ''
                                }`}
                            />
                            {loading && (
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3.5 rounded-[1.5rem] transition-all flex items-center justify-center shadow-xl active:scale-90 relative group/btn ${
                                hasActiveFilters ? 'bg-[#111222] text-orange-500' : 'bg-white text-gray-400 hover:text-orange-500'
                            }`}
                            title="Filter Protocols"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#FF9933] shadow-sm animate-pulse"></span>
                            )}
                        </button>
                        {showFilters && <FilterPopover onClose={() => setShowFilters(false)} />}
                    </div>
                </div>
                
                <button 
                    type="button"
                    onClick={handleVoiceInput} 
                    title={isListening ? "Stop listening" : "Search with voice"}
                    className={`p-3.5 rounded-[1.5rem] transition-all flex items-center justify-center shadow-xl flex-shrink-0 ${
                        isListening 
                        ? 'bg-red-500 text-white animate-pulse scale-110 ring-4 ring-red-500/20' 
                        : 'bg-white text-orange-500 hover:bg-[#111222] hover:text-white active:scale-90'
                    }`}
                >
                    <MicrophoneIcon className={`w-6 h-6 ${isListening ? 'scale-110' : ''}`} />
                </button>
                
                <button 
                    type="button"
                    onClick={() => handleExecuteSearch()}
                    className="hidden sm:block bg-[#111222] text-white px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex-shrink-0"
                >
                    Explore
                </button>
            </div>
            
            <div className="flex items-center space-x-6 pr-4">
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
                    >
                        <img 
                            src={profile.profilePic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80"} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-3 w-64 bg-[#1a1c2e] rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn p-2 z-50">
                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                <p className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{profile.name}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Global Explorer</p>
                            </div>
                            
                            <div className="space-y-1">
                                <button 
                                    type="button"
                                    onClick={() => { setActiveView(View.Settings); setShowProfileMenu(false); }}
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
                            </div>
                            
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