// @ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { SearchIcon, MoonIcon, SunIcon, MicrophoneIcon, BellIcon, LogoutIcon } from './icons/Icons';
import { View } from '../types';

// Global types for Speech API in IDX
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface HeaderProps {
    setSidebarOpen: (isOpen: boolean) => void;
    setActiveView: (view: any) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    notifications: any[];
    onMarkRead: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, setActiveView, theme, toggleTheme, notifications, onMarkRead, onLogout }) => {
    const { searchQuery, setSearchQuery, performSearch, loading, filters, setFilters } = useSearch();
    const { language } = useLanguage();
    const { profile } = useUser();
    
    const [isListening, setIsListening] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const recognitionRef = useRef<any>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Execute Global Search
    const handleExecuteSearch = (e?: any) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery);
            setActiveView(View.Dashboard);
        }
    };

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize Voice Engine
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                performSearch(transcript);
                setActiveView(View.Dashboard);
            };
            recognitionRef.current = recognition;
        }
    }, [language]);

    const toggleVoice = () => {
        if (!recognitionRef.current) return alert("Browser not supported");
        isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    };

    return (
        <header className="flex items-center justify-between p-4 bg-[#FF9933] sticky top-0 z-[100] shadow-2xl border-b border-white/10">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[#111222]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Central Neural Search Hub */}
            <div className="flex-1 max-w-3xl mx-auto flex items-center gap-3 px-4">
                <div className="relative flex-1 group">
                    <form onSubmit={handleExecuteSearch} className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isListening ? "Listening to Path..." : "Explore Raipur & Beyond..."}
                            className="w-full pl-12 pr-12 py-3.5 bg-white text-[#111222] rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest outline-none shadow-inner focus:ring-4 focus:ring-white/30 transition-all"
                        />
                        {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
                    </form>
                </div>

                {/* Voice & Action Buttons */}
                <button 
                    onClick={toggleVoice} 
                    className={`p-3.5 rounded-2xl transition-all shadow-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-orange-500 hover:bg-[#111222] hover:text-white'}`}
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Right Side Protocols (Notifications, Theme, Profile) */}
            <div className="flex items-center gap-4 md:gap-6">
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => { setShowNotifications(!showNotifications); onMarkRead(); }} className="relative p-2 text-[#111222]">
                        <BellIcon className="w-6 h-6" />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-[#111222] text-[#FF9933] text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-[#FF9933]">{unreadCount}</span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-80 bg-[#111222] border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Registry</div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all">
                                        <p className="text-[10px] font-black text-white uppercase">{n.title}</p>
                                        <p className="text-[9px] text-gray-500 font-medium mt-1 uppercase line-clamp-2">{n.message}</p>
                                    </div>
                                )) : <p className="p-8 text-center text-[10px] font-black text-gray-700 uppercase">No Alerts</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={toggleTheme} className="p-2 text-[#111222] hover:scale-110 transition-transform">
                    {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>

                <div className="relative" ref={profileRef}>
                    <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-2xl border-2 border-[#111222] overflow-hidden cursor-pointer hover:rotate-6 transition-all shadow-lg">
                        <img src={profile?.profilePic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80"} className="w-full h-full object-cover" />
                    </div>
                    {showProfileMenu && (
                        <div className="absolute right-0 mt-4 w-56 bg-[#111222] border border-white/10 rounded-[2rem] p-2 shadow-3xl animate-fadeIn">
                            <button onClick={() => { setActiveView(View.Settings); setShowProfileMenu(false); }} className="w-full p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/5 rounded-2xl text-left">⚙️ Settings</button>
                            <button onClick={() => { onLogout(); setShowProfileMenu(false); }} className="w-full p-4 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500 hover:text-white rounded-2xl text-left transition-all">🚪 Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;