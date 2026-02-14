
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';

const AIChatbot: React.FC = () => {
    const { profile } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: 'Namaste! I am your Bharat Path companion. How can I help you explore today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await getAIResponse(userMsg, profile, { useThinking: true });
            setMessages(prev => [...prev, { role: 'ai', text: res.story || "I encountered an error synthesizing the path data." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Uplink failure. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="bg-[#1a1c2e] w-80 md:w-96 h-[500px] rounded-[2.5rem] shadow-4xl border border-white/10 flex flex-col overflow-hidden mb-4 animate-fadeInUp">
                    <div className="p-6 bg-orange-500 text-white flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Master Companion</p>
                            <h4 className="text-xl font-black uppercase tracking-tighter">AI Thinking Hub</h4>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-2xl font-black">&times;</button>
                    </div>
                    
                    <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-4 rounded-3xl animate-pulse flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-white/5 flex gap-2">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask the Path Guide..."
                            className="flex-1 bg-black/20 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:ring-1 focus:ring-orange-500/50"
                        />
                        <button onClick={handleSend} className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </div>
                </div>
            )}
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-orange-500 rounded-full shadow-4xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all relative group"
            >
                <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                <span className="text-3xl transition-transform group-hover:rotate-12">💬</span>
            </button>
        </div>
    );
};

export default AIChatbot;
