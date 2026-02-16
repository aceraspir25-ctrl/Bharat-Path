// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';

const AIChatbot: React.FC = () => {
    const { profile } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: `Namaste ${profile?.name?.split(' ')[0] || 'Shashank'} bhai! I am your Bharat Path companion. How can I help you explore today?` }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const aiText = await getAIResponse(input, profile);
            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Node connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-orange-500 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-[#111222] border border-white/10 rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="p-6 bg-white/5 border-b border-white/5">
                        <h4 className="font-black text-white uppercase italic tracking-tighter">Bharat Path AI</h4>
                        <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Neural Link Active</p>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${
                                    m.role === 'user' 
                                    ? 'bg-orange-500 text-white rounded-tr-none' 
                                    : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-orange-500 text-[10px] font-black animate-pulse">AI IS THINKING...</div>}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-2 text-white text-xs outline-none focus:border-orange-500"
                        />
                        <button 
                            onClick={handleSend}
                            className="bg-orange-500 px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;