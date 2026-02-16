// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { UsersIcon, InfoIcon, CopyIcon, MicrophoneIcon } from '../icons/Icons';
import { translateText, generateSpeech, playRawPcm } from '../../services/geminiService';

const PhraseCard: React.FC<{ eng: string; hin: string; onSpeak: (t: string) => void }> = ({ eng, hin, onSpeak }) => (
    <div 
        onClick={() => onSpeak(hin)}
        className="group relative bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all duration-500 hover:shadow-[0_10px_40px_rgba(249,115,22,0.1)] overflow-hidden"
    >
      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{eng}</p>
        <span className="text-xs grayscale group-hover:grayscale-0 transition-all">🔊</span>
      </div>
      <p className="relative z-10 text-md font-black text-white mt-2 group-hover:text-orange-500 transition-colors">{hin}</p>
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
        try {
            const result = onAIService 
                ? await onAIService(() => translateText(inputText, targetLang))
                : await translateText(inputText, targetLang);
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || "Uplink Error");
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
        } catch (err) { console.error(err); }
        finally { setIsSpeaking(false); }
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 animate-fadeIn px-4 custom-scrollbar overflow-y-auto h-screen">
            {/* Neural Header */}
            <div className="bg-gradient-to-br from-[#000080] to-blue-900 rounded-[3rem] p-10 text-white shadow-2xl mb-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 text-center">
                    <div className="inline-block p-4 bg-white/10 rounded-3xl mb-4 border border-white/10 animate-pulse">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Bhasha <span className="text-orange-500">Sangam</span></h2>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.5em] mt-2">Universal Path Communication Protocol</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Terminal */}
                <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 shadow-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Source Material</span>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                             <span className="text-[10px] font-black text-green-500 uppercase">Neural Live</span>
                        </div>
                    </div>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Speak or type your path's query..." 
                        className="w-full h-48 bg-black/20 p-6 rounded-[2.5rem] outline-none text-white font-medium resize-none border border-white/5 focus:border-orange-500/50 transition-all text-lg italic"
                    />
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={handleTranslate}
                            disabled={isTranslating || !inputText.trim()}
                            className="flex-1 bg-white text-black font-black py-4 rounded-full hover:bg-orange-500 hover:text-white transition-all uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-20"
                        >
                            {isTranslating ? 'Linking...' : 'Sync Translation'}
                        </button>
                        <button className="bg-orange-500 p-5 rounded-full text-white shadow-xl hover:scale-110 active:rotate-12 transition-all"><MicrophoneIcon /></button>
                    </div>
                </div>

                {/* Output Node */}
                <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 shadow-3xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/[0.02] pointer-events-none uppercase">VOX</div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <select 
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-black/40 p-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-500 outline-none border border-white/5 cursor-pointer"
                            >
                                <option value="Hindi">Hindi (Standard)</option>
                                <option value="Chhattisgarhi">Chhattisgarhi (Raipur Hub)</option>
                                <option value="Sanskrit">Sanskrit (Heritage)</option>
                                <option value="Japanese">Japanese (Global)</option>
                            </select>
                            <button onClick={() => navigator.clipboard.writeText(translatedText)} className="text-gray-500 hover:text-white transition-all"><CopyIcon /></button>
                        </div>
                        
                        <div className={`w-full h-48 p-8 rounded-[2.5rem] transition-all flex items-center justify-center text-center ${isTranslating ? 'bg-orange-500/5 animate-pulse' : 'bg-black/20'}`}>
                            {translatedText ? (
                                <p className="text-2xl text-white font-black italic tracking-tight">"{translatedText}"</p>
                            ) : (
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Neural Synthesis</p>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => handleSpeak(translatedText)}
                        disabled={!translatedText || isSpeaking}
                        className={`w-full mt-6 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4 ${isSpeaking ? 'bg-orange-500 text-white animate-bounce' : 'bg-white/5 text-orange-500 border border-orange-500/20 hover:bg-orange-500 hover:text-white shadow-2xl'}`}
                    >
                        {isSpeaking ? '🔊 Playing Audio' : '🔊 Voice Output'}
                    </button>
                </div>
            </div>

            {/* Quick Access Phrases */}
            <div className="mt-20">
                <div className="flex items-center gap-4 mb-10">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Interactive Path Phrases</h3>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <PhraseCard eng="Traditional Food?" hin="Yahan ka prasiddh bhojan kya hai?" onSpeak={handleSpeak} />
                    <PhraseCard eng="Directions to Hub?" hin="Path darshak kahan hai?" onSpeak={handleSpeak} />
                    <PhraseCard eng="Safe for Travel?" hin="Kya ye rasta surakshit hai?" onSpeak={handleSpeak} />
                    <PhraseCard eng="Translate to English" hin="Kya aap angrezi bolte hain?" onSpeak={handleSpeak} />
                </div>
            </div>
        </div>
    );
};

export default BhashaSangam;