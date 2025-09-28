
import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { SearchIcon, MoonIcon, SunIcon, MicrophoneIcon } from './icons/Icons';
import { View } from '../types';

interface HeaderProps {
    setSidebarOpen: (isOpen: boolean) => void;
    setActiveView: (view: View) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, setActiveView, theme, toggleTheme }) => {
    const { searchQuery, setSearchQuery, performSearch, loading } = useSearch();
    const [isListening, setIsListening] = useState(false);
    // Using `any` as SpeechRecognition types are not standard across browsers
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // @ts-ignore - webkitSpeechRecognition is a vendor-prefixed API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert("Voice input is blocked. Please allow microphone access in your browser settings.");
                }
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [setSearchQuery]);

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("Sorry, your browser doesn't support voice recognition.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setSearchQuery('');
            recognitionRef.current.start();
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
            setActiveView(View.Dashboard);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
            {/* Mobile Menu & App Title */}
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden mr-4">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <div className="text-2xl font-bold text-orange-500 hidden md:block">Bharat Path</div>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-lg relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Listening..." : "Search for places, stories, hotels..."}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        disabled={loading}
                    />
                     <button
                        onClick={handleVoiceInput}
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 focus:outline-none transition-colors duration-200 ${isListening ? 'text-orange-500 animate-pulse' : 'text-gray-500 hover:text-orange-500'}`}
                        aria-label={isListening ? "Stop listening" : "Search with voice"}
                        title={isListening ? "Stop listening" : "Search with voice"}
                    >
                        <MicrophoneIcon />
                    </button>
                </div>
            </div>
            
            {/* Controls: Theme Toggle & Search Button */}
            <div className="flex items-center space-x-2">
                 <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                 <button
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="bg-orange-500 text-white font-bold py-2 px-5 rounded-full hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center transition"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Search'}
                </button>
            </div>
        </header>
    );
};

export default Header;
