
import React, { useState } from 'react';
import { UsersIcon, InfoIcon, SearchIcon, CopyIcon, MicrophoneIcon } from '../icons/Icons';
import { translateText, generateSpeech, playRawPcm } from '../../services/geminiService';

const PhraseCard: React.FC<{ eng: string; hin: string; onSpeak: (t: string) => void }> = ({ eng, hin, onSpeak }) => (
    <div 
        onClick={() => onSpeak(hin)}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer transition-all hover:shadow-md group"
    >
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{eng}</p>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">🔊</span>
      </div>
      <p className="text-sm font-black text-[#000080] dark:text-blue-300 mt-1">{hin}</p>
    </div>
);

const BhashaSangam: React.FC<{ onAIService?: (fn: () => Promise<any>) => Promise<any> }> = ({ onAIService }) => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [targetLang, setTargetLang] = useState('Hindi');
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        
        setIsTranslating(true);
        setError(null);
        setTranslatedText(""); 
        
        try {
            const result = onAIService 
                ? await onAIService(() => translateText(inputText, targetLang))
                : await translateText(inputText, targetLang);
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || "Uplink Error: Translation failed.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSpeak = async (text: string) => {
        if (!text || isSpeaking) return;
        setIsSpeaking(true);
        try {
            const audioData = await generateSpeech(text);
            await playRawPcm(audioData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSpeaking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
            <div className="bg-[#000080] rounded-3xl p-8 text-white shadow-xl mb-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
                        <UsersIcon /> Bhasha Sangam
                    </h2>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Universal Bharat Voice & Text</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border-b-8 border-[#FF9933]">
                    <div className="flex justify-between items-center mb-4">
                        <select className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold outline-none border-none dark:text-white">
                            <option>Auto-Detect</option>
                            <option>English</option>
                        </select>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-[#FF9933]">
                            <InfoIcon />
                        </div>
                    </div>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type anything to translate to local Bhasha..." 
                        className="w-full h-40 bg-slate-50 dark:bg-gray-900 p-4 rounded-2xl outline-none text-gray-700 dark:text-gray-200 font-medium resize-none"
                    ></textarea>
                    <div className="flex justify-between items-center mt-4">
                        <button 
                            onClick={handleTranslate}
                            disabled={isTranslating || !inputText.trim()}
                            className="bg-blue-600 text-white font-black px-8 py-2.5 rounded-full hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-600/20 transition-all uppercase tracking-widest text-[10px]"
                        >
                            {isTranslating ? 'Linking Path...' : 'Translate'}
                        </button>
                        <button className="bg-[#FF9933] p-4 rounded-full text-white shadow-lg shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all"><MicrophoneIcon /></button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border-b-8 border-[#000080] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4 text-[#000080] dark:text-blue-300">
                            <select 
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl text-xs font-bold outline-none border-none dark:text-white"
                            >
                                <option value="Hindi">Hindi</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Telugu">Telugu</option>
                                <option value="Marathi">Marathi</option>
                            </select>
                            <button 
                                onClick={() => { if(translatedText) navigator.clipboard.writeText(translatedText) }} 
                                disabled={!translatedText}
                                className="hover:text-orange-500 transition-colors disabled:opacity-30"
                            >
                                <CopyIcon />
                            </button>
                        </div>
                        <div className={`w-full h-40 p-4 rounded-2xl text-[#000080] dark:text-blue-200 font-bold overflow-y-auto transition-all ${isTranslating ? 'bg-blue-100/50 dark:bg-blue-900/20 animate-pulse' : 'bg-blue-50/50 dark:bg-gray-900/50'}`}>
                            {isTranslating ? (
                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Querying AI Hub...</p>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-rose-500 text-xs font-black uppercase mb-1">Path Interrupted</p>
                                    <p className="text-gray-400 text-[10px] italic">{error}</p>
                                </div>
                            ) : translatedText ? (
                                <p className="text-lg leading-relaxed">{translatedText}</p>
                            ) : (
                                <p className="text-gray-400 font-normal italic">Path translation will appear here...</p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSpeak(translatedText)}
                        disabled={!translatedText || isSpeaking || isTranslating}
                        className={`w-full mt-4 bg-[#000080] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all ${isSpeaking ? 'opacity-50 animate-pulse' : 'hover:scale-[1.02] active:scale-[0.98]'} disabled:bg-gray-200 disabled:text-gray-400`}
                    >
                        🔊 {isSpeaking ? 'Voicing Path...' : 'Listen Translation'}
                    </button>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <span className="w-8 h-px bg-gray-300"></span>
                    Interactive Phrases
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <PhraseCard eng="How much is this?" hin="Ye kitne ka hai?" onSpeak={handleSpeak} />
                    <PhraseCard eng="Where is the station?" hin="Station kahan hai?" onSpeak={handleSpeak} />
                    <PhraseCard eng="I need help!" hin="Mujhe madad chahiye!" onSpeak={handleSpeak} />
                    <PhraseCard eng="Is it vegetarian?" hin="Kya ye shakahari hai?" onSpeak={handleSpeak} />
                </div>
            </div>
        </div>
    );
};

export default BhashaSangam;
