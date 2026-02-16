// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { generateAIImage, editAIImage, generateAIVideo, analyzeMedia, transcribeAudioFromBase64 } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { CameraIcon, MagicIcon, VideoIcon, SparklesIcon } from '../icons/StudioIcons';

// Adding interface for IDX AI Studio Environment
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
                } catch (err) {
                    setHasApiKey(false);
                }
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
            alert("Microphone access required for transcription.");
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
                const res = await generateAIVideo(prompt, media, fileMime, aspectRatio);
                setOutput(res);
            } else if (mode === 'analyze' && media) {
                const res = await analyzeMedia(media.split(',')[1], fileMime, prompt || "Analyze this media.");
                setOutput(res);
            }
        } catch (err: any) {
            alert(err.message || "Synthesis failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24 px-4 h-screen overflow-y-auto custom-scrollbar">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">AI Path Studio</h1>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Powered by Gemini & Veo</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'generate', label: 'Generate', icon: <SparklesIcon /> },
                                { id: 'edit', label: 'Magic Edit', icon: <MagicIcon /> },
                                { id: 'animate', label: 'Veo Animate', icon: <VideoIcon /> },
                                { id: 'analyze', label: 'Lens Scan', icon: <CameraIcon /> },
                                { id: 'transcribe', label: 'Voice', icon: <span>🎙️</span> }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setMode(m.id as any); setOutput(null); setMedia(null); }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 ${mode === m.id ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/20 border-transparent text-gray-500 hover:border-white/10'}`}
                                >
                                    {m.icon}
                                    <span className="text-[9px] font-black uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Media Upload / Mic */}
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10">
                        {mode === 'transcribe' ? (
                            <div className="flex flex-col items-center py-8">
                                <button onClick={isRecording ? stopRecording : startRecording} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/5 text-gray-400'}`}>
                                    {isRecording ? '⏹️' : '🎙️'}
                                </button>
                                <p className="text-[10px] uppercase font-black mt-4 text-gray-500">
                                    {isRecording ? 'Listening...' : 'Start Transcribe'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-black/40 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                                    {media ? (
                                        fileMime.startsWith('video') ? <video src={media} className="w-full h-full object-cover" /> : <img src={media} className="w-full h-full object-cover" />
                                    ) : <span className="text-[10px] font-black text-gray-500 uppercase">Upload Media</span>}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                                
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="Enter AI prompt..."
                                    className="w-full h-24 bg-black/40 p-4 rounded-2xl text-xs text-white outline-none resize-none"
                                />
                                <button onClick={runStudio} disabled={loading} className="w-full py-4 bg-orange-500 text-white rounded-full font-black uppercase text-[10px]">
                                    {loading ? 'Processing...' : 'Execute Path'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Output Canvas */}
                <div className="lg:col-span-8">
                    <div className="bg-[#111222] h-[550px] rounded-[3.5rem] border-4 border-white/5 flex items-center justify-center relative overflow-hidden">
                        {output ? (
                            mode === 'animate' ? <video src={output} controls className="max-w-full max-h-full rounded-2xl" /> :
                            (mode === 'analyze' || mode === 'transcribe') ? <p className="p-10 text-white italic text-lg">"{output}"</p> :
                            <img src={output} className="max-w-full max-h-full rounded-2xl" />
                        ) : <p className="text-gray-600 font-black uppercase text-xs tracking-widest">Awaiting Neural Output</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudio;