import React, { useState, useEffect, useRef } from 'react';
import { AIBookingSuggestion, AIResponse } from '../../types';
import { useSearch } from '../../contexts/SearchContext';
import useLocalStorage from '../../hooks/useLocalStorage';

// Re-using this component to display suggestions within the chat
const SuggestionCard: React.FC<{ suggestion: AIBookingSuggestion }> = ({ suggestion }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600 mt-2 first:mt-0">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400">{suggestion.name}</h3>
            <div className="flex items-center text-sm font-bold bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                {suggestion.rating.toFixed(1)}
            </div>
        </div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">{suggestion.type}</p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{suggestion.description}</p>
    </div>
);


// --- NEW CHAT COMPONENTS --- //

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
    </div>
);

const AiIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    </div>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);


interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: AIResponse & { text?: string }; // Combine AIResponse with a simple text property for user messages
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const hasContent = message.content.story || message.content.suggestions || message.content.image || message.content.text;

    if (!hasContent) return null;

    return (
        <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <AiIcon />}
            <div className={`max-w-xl rounded-lg px-4 py-3 shadow-md ${isUser ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800'}`}>
                {message.content.text && <p>{message.content.text}</p>}
                {message.content.story && <div className="prose prose-sm prose-orange dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.story.replace(/\n/g, '<br />') }} />}
                {message.content.suggestions && (
                    <div>
                        <p className="font-bold mb-2">Here are some suggestions for you:</p>
                        {message.content.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
                    </div>
                )}
                {message.content.image && <img src={`data:image/jpeg;base64,${message.content.image}`} alt="AI generated" className="mt-2 rounded-lg max-w-sm" />}
            </div>
            {isUser && <UserIcon />}
        </div>
    );
};

// --- Main Dashboard Component --- //
const Dashboard: React.FC = () => {
    const { searchResults, loading, error, performSearch, clearSearch } = useSearch();
    const initialMessage: Message = { id: 'initial', sender: 'ai', content: { text: "Welcome to Bharat Path! How can I help you explore India today? Ask me for stories, travel tips, or suggestions for hotels and restaurants." } };
    const [messages, setMessages] = useLocalStorage<Message[]>('chatHistory', [initialMessage]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);
    
    useEffect(() => {
        // This effect runs when the AI search results come back.
        if (searchResults) {
            setMessages(prev => [...prev, { id: new Date().toISOString(), sender: 'ai', content: searchResults }]);
            clearSearch(); // Reset search state after processing results
        }
    }, [searchResults, clearSearch, setMessages]);

    useEffect(() => {
        // This effect runs if there's an error from the AI search.
        if (error) {
            setMessages(prev => [...prev, { id: new Date().toISOString(), sender: 'ai', content: { text: `Sorry, an error occurred: ${error}` } }]);
            clearSearch(); // Reset search state after processing error
        }
    }, [error, clearSearch, setMessages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newUserMessage: Message = { id: new Date().toISOString(), sender: 'user', content: { text: input } };
        setMessages(prev => [...prev, newUserMessage]);
        performSearch(input);
        setInput('');
    };
    
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the entire chat history? This action cannot be undone.")) {
            setMessages([initialMessage]);
        }
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-gray-200/50 dark:bg-gray-900/80 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            {/* Message Display Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {loading && (
                    <div className="flex items-start gap-3 my-4">
                        <AiIcon />
                        <div className="max-w-xl rounded-lg px-4 py-3 bg-white dark:bg-gray-800 shadow-md">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">Path Darshak is thinking</span>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleClearChat}
                        className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                        aria-label="Clear chat history"
                        title="Clear Chat History"
                    >
                        <TrashIcon />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                        placeholder="Ask about your next adventure..."
                        className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;