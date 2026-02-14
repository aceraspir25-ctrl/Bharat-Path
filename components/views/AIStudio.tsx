import React, { useState, useRef, useEffect } from 'react';
import { generateAIImage, editAIImage, generateAIVideo, analyzeMedia, transcribeAudioFromBase64 } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { CameraIcon, MagicIcon, VideoIcon, SparklesIcon } from '../icons/StudioIcons';

const AIStudio: React.FC = () => {
    const { profile } = useUser();
    const [mode, setMode] = useState<'generate' | 'edit' | 'animate' | 'analyze' | 'transcribe'>('generate');
    const [prompt, setPrompt] = useState('');
    const [media, setMedia] = useState<string | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    // Config states
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
                const has = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(has);
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

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    setLoading(true);
                    try {
                        const text = await transcribeAudioFromBase64(base64, 'audio/webm');
                        setOutput(text);
                    } catch (err: any) {
                        alert(err.message);
                    } finally {
                        setLoading(false);
                    }
                };
                reader.readAsDataURL(audioBlob);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access required.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const runStudio = async () => {
        if ((mode === 'generate' || mode === 'animate') && !hasApiKey) {
            await handleSelectKey();
            return;
        }

        setLoading(true);
        try {
            if (mode === 'generate') {
                const res = await generateAIImage(prompt, aspectRatio, imageSize);
                setOutput(res);
            } else if (mode === 'edit' && media) {
                const res = await editAIImage(prompt, media, fileMime);
                setOutput(res);
            } else if (mode === 'animate' && media) {
                const res = await generateAIVideo(prompt, media, fileMime, aspectRatio as any);
                setOutput(res);
            } else if (mode === 'analyze' && media) {
                const res = await analyzeMedia(media.split(',')[1], fileMime, prompt || "Analyze this travel media for key highlights and information.");
                setOutput(res);
            }
        } catch (err: any) {
            if (err.message.includes("Requested entity was not found")) {
                setHasApiKey(false);
                alert("Please select a valid API key again.");
            } else {
                alert(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">AI Path Studio</h1>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Gemini 3 Pro, Nano Banana & Veo</p>
                </div>
                {!hasApiKey && (mode === 'generate' || mode === 'animate') && (
                    <button 
                        onClick={handleSelectKey}
                        className="bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse"
                    >
                        Action Required: Select API Key
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'generate', label: 'Generate', icon: <SparklesIcon /> },
                                { id: 'edit', label: 'Magic Edit', icon: <MagicIcon /> },
                                { id: 'animate', label: 'Veo Animate', icon: <VideoIcon /> },
                                { id: 'analyze', label: 'Lens Scan', icon: <CameraIcon /> },
                                { id: 'transcribe', label: 'Transcribe', icon: <div className="text-xl">🎙️</div> }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setMode(m.id as any); setOutput(null); setMedia(null); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 ${mode === m.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/20 border-transparent text-gray-500 hover:border-white/10'}`}
                                >
                                    {m.icon}
                                    <span className="text-[10px] font-black uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                        {(mode === 'edit' || mode === 'animate' || mode === 'analyze') && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Material</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-video bg-black/40 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-orange-500/50 transition-all overflow-hidden"
                                >
                                    {media ? (
                                        fileMime.startsWith('video') ? <video src={media} className="w-full h-full object-cover" /> : <img src={media} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <span className="text-3xl">📤</span>
                                            <span className="text-[10px] font-black uppercase text-gray-500">Upload Media</span>
                                        </>
                                    )}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                            </div>
                        )}

                        {mode === 'transcribe' ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center py-10 bg-black/40 rounded-3xl border border-white/5">
                                    <button 
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {isRecording ? '⏹️' : '🎙️'}
                                    </button>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-6 text-gray-500">
                                        {isRecording ? 'Listening for Path Voice...' : 'Click to Transcribe'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creative Parameters</p>
                                    <div className="space-y-3">
                                        <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-black/40 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none border border-white/5">
                                            {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ar => <option key={ar} value={ar}>{ar} Aspect</option>)}
                                        </select>
                                        {mode === 'generate' && (
                                            <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full bg-black/40 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none border border-white/5">
                                                {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s} Resolution</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder={
                                            mode === 'generate' ? "A neon hologram of a tiger jumping through a portal in a futuristic Raipur temple..." :
                                            mode === 'edit' ? "Remove the background objects and add a retro Bollywood filter..." :
                                            mode === 'animate' ? "Make the water move and clouds drift slowly..." :
                                            "Describe what is happening in this travel clip..."
                                        }
                                        className="w-full h-32 bg-black/40 p-6 rounded-[2rem] text-sm text-white font-medium outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                                    />
                                    <button 
                                        onClick={runStudio}
                                        disabled={loading || (!media && mode !== 'generate')}
                                        className="w-full py-6 rounded-[2.5rem] bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Initialize Protocol'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-[#111222] h-[650px] rounded-[4rem] border-4 border-white/5 shadow-3xl relative overflow-hidden flex items-center justify-center p-8 group">
                        {!output ? (
                            <div className="text-center space-y-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                <div className="text-9xl">✨</div>
                                <p className="text-sm font-black uppercase tracking-[0.5em]">Waiting for Protocol Synthesis</p>
                            </div>
                        ) : mode === 'animate' ? (
                            <video src={output} controls autoPlay loop className="max-w-full max-h-full rounded-3xl shadow-4xl animate-fadeIn" />
                        ) : (mode === 'analyze' || mode === 'transcribe') ? (
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 max-w-2xl animate-fadeIn max-h-[80%] overflow-y-auto custom-scrollbar">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Neural Result</p>
                                <p className="text-lg text-white font-medium leading-relaxed italic whitespace-pre-wrap">"{output}"</p>
                            </div>
                        ) : (
                            <img src={output} className="max-w-full max-h-full rounded-3xl shadow-4xl animate-fadeIn" alt="AI Output" />
                        )}
                        <div className="absolute top-0 right-0 p-8 text-[20rem] font-black text-white/[0.02] select-none pointer-events-none uppercase">STUDIO</div>
                        
                        {loading && mode === 'animate' && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-30 text-center p-8">
                                <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-8"></div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Cinematic Synthesis Active</h3>
                                <p className="text-gray-400 text-sm max-w-xs font-medium">Veo is generating your high-fidelity video. This process can take a few minutes as our neural engines map the global path motion.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudio;