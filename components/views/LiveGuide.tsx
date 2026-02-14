import React, { useState, useEffect, useRef } from 'react';
import { connectLiveGuide, encodePCM, decodePCM, decodeAudioData } from '../../services/geminiService';
import { MicrophoneIcon } from '../icons/Icons';

const LiveGuide: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [transcription, setTranscription] = useState<string[]>([]);
    const [status, setStatus] = useState('Uplink Offline');
    
    const sessionRef = useRef<any>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const nextStartTime = useRef(0);
    const sources = useRef(new Set<AudioBufferSourceNode>());
    const streamRef = useRef<MediaStream | null>(null);

    const userName = localStorage.getItem('userName') || 'Yatri';

    const startSession = async () => {
        try {
            setStatus('Establishing Neural Link...');
            inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const sessionPromise = connectLiveGuide({
                onopen: () => {
                    setIsActive(true);
                    setStatus('Live Companion Active');
                    const source = inputAudioContext.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                        const pcmBlob = { 
                            data: encodePCM(new Uint8Array(int16.buffer)), 
                            mimeType: 'audio/pcm;rate=16000' 
                        };
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.current!.destination);
                },
                onmessage: async (message: any) => {
                    // Process model audio turn
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContext.current) {
                        nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
                        const buffer = await decodeAudioData(decodePCM(base64Audio), outputAudioContext.current, 24000, 1);
                        const source = outputAudioContext.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputAudioContext.current.destination);
                        source.addEventListener('ended', () => sources.current.delete(source));
                        source.start(nextStartTime.current);
                        nextStartTime.current += buffer.duration;
                        sources.current.add(source);
                    }

                    // Handle interruptions
                    if (message.serverContent?.interrupted) {
                        sources.current.forEach(s => s.stop());
                        sources.current.clear();
                        nextStartTime.current = 0;
                    }

                    // Handle transcriptions
                    if (message.serverContent?.outputTranscription) {
                        setTranscription(prev => [...prev, message.serverContent.outputTranscription.text].slice(-10));
                    } else if (message.serverContent?.inputTranscription) {
                        setTranscription(prev => [...prev, `[You]: ${message.serverContent.inputTranscription.text}`].slice(-10));
                    }
                },
                onclose: () => stopSession(),
                onerror: (e: any) => {
                    console.error("Live Guide Error:", e);
                    stopSession();
                }
            });

            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setStatus('Uplink Synchrony Failure');
        }
    };

    const stopSession = () => {
        setIsActive(false);
        setStatus('Uplink Offline');
        sessionRef.current?.close();
        inputAudioContext.current?.close();
        outputAudioContext.current?.close();
        streamRef.current?.getTracks().forEach(t => t.stop());
        sources.current.forEach(s => s.stop());
        sources.current.clear();
        nextStartTime.current = 0;
    };

    return (
        <div className="max-w-4xl mx-auto h-[75vh] flex flex-col items-center justify-center animate-fadeIn relative">
            <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-[150px] animate-pulse"></div>
            
            <div className={`relative z-10 w-64 h-64 rounded-full border-8 transition-all duration-700 flex items-center justify-center group ${isActive ? 'border-orange-500 shadow-[0_0_100px_rgba(249,115,22,0.4)] scale-110' : 'border-white/10 shadow-2xl'}`}>
                <div className={`absolute inset-4 rounded-full border-2 border-dashed transition-all duration-1000 ${isActive ? 'animate-spin border-orange-500/50' : 'border-white/5'}`}></div>
                <button 
                    onClick={isActive ? stopSession : startSession}
                    className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 transition-all ${isActive ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    <MicrophoneIcon className={`w-12 h-12 transition-transform ${isActive ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isActive ? 'Synchronizing...' : 'Start Guide'}</span>
                </button>
            </div>

            <div className="mt-12 text-center space-y-6 relative z-10 w-full px-4">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em]">{status}</p>
                <div className="max-w-xl mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 h-48 overflow-y-auto flex flex-col justify-end gap-3 custom-scrollbar shadow-3xl">
                    {transcription.length === 0 ? (
                        <p className="text-xs text-gray-500 italic font-medium">"Namaste {userName}, I am Bharat, your live guide. Start speaking to begin the path interrogation..."</p>
                    ) : (
                        transcription.map((t, i) => (
                            <p key={i} className={`text-sm font-medium animate-fadeInUp ${t.startsWith('[You]') ? 'text-orange-400' : 'text-white'}`}>
                                {t}
                            </p>
                        ))
                    )}
                </div>
            </div>
            <div className="absolute top-10 right-0 p-8 text-[15rem] font-black text-white/[0.01] select-none pointer-events-none uppercase">VOICE</div>
        </div>
    );
};

export default LiveGuide;
