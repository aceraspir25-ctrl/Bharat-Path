// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { connectLiveGuide, encodePCM, decodePCM, decodeAudioData } from '../../services/geminiService';
import { MicrophoneIcon } from '../icons/Icons';

const LiveGuide: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [transcription, setTranscription] = useState<string[]>([]);
    const [status, setStatus] = useState('Uplink Offline');
    const [isThinking, setIsThinking] = useState(false);
    
    const sessionRef = useRef<any>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const nextStartTime = useRef(0);
    const sources = useRef(new Set<AudioBufferSourceNode>());
    const streamRef = useRef<MediaStream | null>(null);

    const userName = localStorage.getItem('userName') || 'Shashank';

    // --- WORLDWIDE ADD-ON: AUDIO VISUALIZER LOGIC ---
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const requestRef = useRef<number>();
    const [vol, setVol] = useState(0);

    const startSession = async () => {
        try {
            setStatus('Establishing Neural Link...');
            inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Visualizer setup
            const source = inputAudioContext.current.createMediaStreamSource(stream);
            analyzerRef.current = inputAudioContext.current.createAnalyser();
            source.connect(analyzerRef.current);
            
            const sessionPromise = connectLiveGuide({
                onopen: () => {
                    setIsActive(true);
                    setStatus('Live Companion Active');
                    const scriptProcessor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                        const pcmBlob = { 
                            data: encodePCM(new Uint8Array(int16.buffer)), 
                            mimeType: 'audio/pcm;rate=16000' 
                        };
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    scriptProcessor.connect(inputAudioContext.current!.destination);
                },
                onmessage: async (message: any) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContext.current) {
                        setIsThinking(false);
                        const buffer = await decodeAudioData(decodePCM(base64Audio), outputAudioContext.current, 24000, 1);
                        const source = outputAudioContext.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputAudioContext.current.destination);
                        source.start(Math.max(nextStartTime.current, outputAudioContext.current.currentTime));
                        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime) + buffer.duration;
                        sources.current.add(source);
                    }
                    if (message.serverContent?.interrupted) {
                        sources.current.forEach(s => s.stop());
                        sources.current.clear();
                        nextStartTime.current = 0;
                    }
                    if (message.serverContent?.outputTranscription) {
                        setTranscription(prev => [...prev, message.serverContent.outputTranscription.text].slice(-5));
                    }
                }
            });
            sessionRef.current = await sessionPromise;
            animateVolume();
        } catch (err) { setStatus('Synchrony Failure'); }
    };

    const animateVolume = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVol(average);
        requestRef.current = requestAnimationFrame(animateVolume);
    };

    const stopSession = () => {
        setIsActive(false);
        setStatus('Uplink Offline');
        cancelAnimationFrame(requestRef.current!);
        sessionRef.current?.close();
        streamRef.current?.getTracks().forEach(t => t.stop());
        inputAudioContext.current?.close();
    };

    return (
        <div className="max-w-6xl mx-auto h-[80vh] flex flex-col items-center justify-center animate-fadeIn relative selection:bg-orange-500/30">
            {/* Background Neural Glow */}
            <div className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${isActive ? 'bg-orange-500/10' : 'bg-blue-500/5'}`}></div>
            
            {/* Main Interactive Node */}
            <div className="relative z-10 flex flex-col items-center">
                <div className={`w-80 h-80 rounded-full border-2 flex items-center justify-center relative transition-all duration-700 ${isActive ? 'border-orange-500/50 shadow-[0_0_80px_rgba(249,115,22,0.2)]' : 'border-white/5'}`}>
                    
                    {/* Pulsing Ripples */}
                    {isActive && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-orange-500 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-[-20px] rounded-full border border-orange-500/10 animate-pulse"></div>
                        </>
                    )}

                    {/* Microphone Core */}
                    <button 
                        onClick={isActive ? stopSession : startSession}
                        className={`w-64 h-64 rounded-full flex flex-col items-center justify-center gap-6 transition-all duration-500 group overflow-hidden ${isActive ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                    >
                        <div className={`transition-transform duration-500 ${isActive ? 'scale-125' : 'group-hover:scale-110'}`}>
                            <MicrophoneIcon className="w-16 h-16" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">{isActive ? 'Broadcasting' : 'Initialize Guide'}</span>
                        
                        {/* Dynamic Waveform Overlay */}
                        {isActive && (
                            <div className="absolute bottom-10 flex gap-1 items-end h-8">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-1 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.random() * vol + 10}%` }}></div>
                                ))}
                            </div>
                        )}
                    </button>
                </div>

                <div className="mt-16 text-center space-y-6 w-full max-w-2xl px-6">
                    <div className="inline-block px-6 py-2 bg-white/5 rounded-full border border-white/10">
                         <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] animate-pulse">{status}</p>
                    </div>

                    <div className="bg-[#0a0b14]/60 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-4xl h-56 flex flex-col justify-end overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-6 text-6xl font-black text-white/[0.02] italic uppercase">Uplink</div>
                        
                        <div className="space-y-4 relative z-10 overflow-y-auto no-scrollbar">
                            {transcription.length === 0 ? (
                                <p className="text-gray-500 italic text-lg leading-relaxed">
                                    "Namaste {userName} bhai. Bharat Path Live Companion is ready. Ask me anything about Raipur's heritage or global routes..."
                                </p>
                            ) : (
                                transcription.map((t, i) => (
                                    <p key={i} className="text-white font-medium text-lg animate-slideInLeft tracking-tight">
                                        <span className="text-orange-500 mr-2">●</span> {t}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Founder Branding Overlay */}
            <div className="absolute bottom-10 right-10 flex items-center gap-4 opacity-30 group">
                <div className="text-right">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Protocol Architect</p>
                    <p className="text-[10px] font-black text-white uppercase italic">Shashank Mishra</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center font-black">S</div>
            </div>
            
            <style>{`
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slideInLeft { animation: slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-4xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
            `}</style>
        </div>
    );
};

export default LiveGuide;