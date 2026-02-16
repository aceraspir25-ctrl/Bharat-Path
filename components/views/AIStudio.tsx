// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { generateAIImage, editAIImage, generateAIVideo, analyzeMedia, transcribeAudioFromBase64 } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { CameraIcon, MagicIcon, VideoIcon, SparklesIcon } from '../icons/StudioIcons';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const AIStudio: React.FC = () => {
    const { profile } = useUser();
    const [mode, setMode] = useState<'generate' | 'edit' | 'animate' | 'analyze' | 'transcribe'>('generate');
    const [prompt, setPrompt] = useState('');
    const [media, setMedia] = useState<string | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [progressStatus, setProgressStatus] = useState('');
    
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageSize, setImageSize] = useState('1K');
    const [fileMime, setFileMime] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                try {
                    const has = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(has);
                } catch (err) { setHasApiKey(false); }
            }
        };
        checkKey();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileMime(file.type);
            const reader = new FileReader();
            reader.onloadend = () => setMedia(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const runStudio = async () => {
        if ((mode === 'generate' || mode === 'animate') && !hasApiKey) {
            if (window.aistudio) await window.aistudio.openSelectKey();
            setHasApiKey(true);
            return;
        }

        setLoading(true);
        setProgressStatus('Initializing Neural Link...');
        
        try {
            setTimeout(() => setProgressStatus('Synthesizing Pixels...'), 2000);
            
            let res;
            if (mode === 'generate') res = await generateAIImage(prompt, aspectRatio, imageSize);
            else if (mode === 'edit' && media) res = await editAIImage(prompt, media, fileMime);
            else if (mode === 'animate' && media) res = await generateAIVideo(prompt, media, fileMime, aspectRatio);
            else if (mode === 'analyze' && media) res = await analyzeMedia(media.split(',')[1], fileMime, prompt || "Analyze this.");
            
            setOutput(res);
            setProgressStatus('');
        } catch (err: any) {
            alert(err.message || "Synthesis failed.");
        } finally {
            setLoading(false);
        }
    };

    // Global Add-on: Download Feature
    const downloadOutput = () => {
        if (!output) return;
        const link = document.createElement('a');
        link.href = output;
        link.download = `BharatPath_AI_${Date.now()}`;
        link.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-24 px-6 h-screen overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
            {/* Header with Worldwide Branding */}
            <header className="flex justify-between items-center pt-6 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">AI Studio <span className="text-orange-500 text-sm align-top">PRO</span></h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-1">Global Media Synthesis Hub</p>
                </div>
                {output && (
                    <button onClick={downloadOutput} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                        ⬇️ Save to Device
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Control Panel: Futuristic Glassmorphism */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'generate', label: 'Create', icon: <SparklesIcon /> },
                                { id: 'edit', label: 'Re-Imagine', icon: <MagicIcon /> },
                                { id: 'animate', label: 'Veo Video', icon: <VideoIcon /> },
                                { id: 'analyze', label: 'Scan Node', icon: <CameraIcon /> },
                                { id: 'transcribe', label: 'Voice Sync', icon: <span className="text-xl">🎙️</span> }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setMode(m.id as any); setOutput(null); }}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] transition-all duration-500 border-2 ${mode === m.id ? 'bg-orange-500 border-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)]' : 'bg-black/40 border-transparent text-gray-500 hover:border-white/10'}`}
                                >
                                    {m.icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input/Upload Area */}
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/10 space-y-6">
                        <div className="space-y-4">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-black/40 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center overflow-hidden hover:border-orange-500/50 transition-all group">
                                {media ? (
                                    fileMime.startsWith('video') ? <video src={media} className="w-full h-full object-cover" /> : <img src={media} className="w-full h-full object-cover" />
                                ) : <div className="text-center group-hover:scale-110 transition-transform"><span className="text-3xl block mb-2">📤</span><span className="text-[9px] font-black text-gray-600 uppercase">Uplink Media</span></div>}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                            
                            <textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="Describe your vision..."
                                className="w-full h-32 bg-black/40 p-6 rounded-[2rem] text-sm text-white outline-none border border-white/5 focus:border-orange-500/50 transition-all resize-none italic"
                            />
                            <button 
                                onClick={runStudio} 
                                disabled={loading} 
                                className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Synthesizing...' : 'Initialize Path'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Canvas: The Big Screen */}
                <div className="lg:col-span-8">
                    <div className="bg-[#0a0b14] h-[700px] rounded-[5rem] border-8 border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
                        
                        {loading && (
                            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
                                <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-6"></div>
                                <p className="text-white font-black uppercase italic tracking-tighter text-xl animate-pulse">{progressStatus}</p>
                            </div>
                        )}

                        {output ? (
                            <div className="relative w-full h-full p-10 flex items-center justify-center animate-fadeIn">
                                {mode === 'animate' ? <video src={output} autoPlay loop controls className="max-w-full max-h-full rounded-3xl shadow-4xl" /> :
                                (mode === 'analyze' || mode === 'transcribe') ? <div className="max-w-xl text-center"><span className="text-orange-500 text-[10px] font-black uppercase mb-4 block tracking-[0.4em]">Neural Result</span><p className="text-2xl text-white italic leading-relaxed">"{output}"</p></div> :
                                <img src={output} className="max-w-full max-h-full rounded-3xl shadow-4xl" alt="AI Creation" />}
                            </div>
                        ) : (
                            <div className="text-center space-y-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-9xl">⚡</div>
                                <p className="text-xs font-black uppercase tracking-[0.8em] text-white">Awaiting Uplink</p>
                            </div>
                        )}
                        
                        <div className="absolute bottom-10 right-10 text-[12rem] font-black text-white/[0.01] pointer-events-none select-none uppercase italic">STUDIO</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudio;