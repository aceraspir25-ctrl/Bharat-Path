
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponseStream } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';

const AIChatbot: React.FC = () => {
    const { profile } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: `Namaste ${profile?.name?.split(' ')[0] || 'Yatri'} bhai! I am your Bharat Path companion. How can I help you explore today?` }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const aiMsgIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'ai', text: '' }]);

        try {
            let fullAiText = '';
            for await (const chunk of getAIResponseStream(input, profile)) {
                fullAiText += chunk;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[aiMsgIndex] = { role: 'ai', text: fullAiText };
                    return newMessages;
                });
            }
        } catch (err) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[aiMsgIndex] = { role: 'ai', text: "Neural link interrupted. Please try again." };
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-orange-500 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95 border-4 border-white/20"
            >
                {isOpen ? '✕' : '🤖'}
                {/* Visual indicator of activity */}
                {!isOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111222] animate-pulse"></div>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] md:w-[420px] h-[550px] bg-[#0a0b14]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-4xl flex flex-col overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h4 className="font-black text-white uppercase italic tracking-tighter">Bharat Path Live</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                                <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest">Neural Uplink Active</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                                <div className={`max-w-[85%] p-5 rounded-[2rem] text-xs font-medium leading-relaxed shadow-xl ${
                                    m.role === 'user' 
                                    ? 'bg-orange-600 text-white rounded-tr-none border border-orange-400/30' 
                                    : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none italic'
                                }`}>
                                    {m.text || (i === messages.length - 1 && loading ? '...' : '')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white/5 border-t border-white/5">
                        <div className="relative">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-black/40 border border-white/10 rounded-full px-8 py-4 text-white text-[11px] font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-gray-700"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 active:scale-90 transition-all disabled:opacity-30"
                            >
                                ➔
                            </button>
                        </div>
                        <p className="text-center text-[8px] font-black text-gray-700 uppercase tracking-widest mt-4">Powered by Gemini 3 Flash</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
