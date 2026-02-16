// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { analyzeMedia } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';
import { GalleryImage } from '../../types';

const Gallery: React.FC = () => {
    const { profile } = useUser();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- REAL-TIME REGISTRY SYNC ---
    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedImages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as GalleryImage));
            setImages(fetchedImages);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Firebase Storage Uplink
            const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Gemini Neural Captioning
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                let aiCaption = "A path-defining moment.";
                try {
                    aiCaption = await analyzeMedia(
                        base64Data, 
                        file.type, 
                        "Write a 1-sentence poetic travel caption for this photo. Mention the vibe (peaceful, energetic, etc.)"
                    );
                } catch (err) { console.error("Neural Error:", err); }

                // 3. Registry Entry
                await addDoc(collection(db, 'gallery'), {
                    url: downloadURL,
                    caption: aiCaption,
                    location: profile.memory?.expertiseNodes?.[0] || 'Uncharted Territory',
                    timestamp: Date.now(),
                    storagePath: storageRef.fullPath,
                    founderNode: "Shashank Mishra"
                });
                setUploading(false);
            };
        } catch (err) {
            setUploading(false);
            alert("Registry Uplink Failed.");
        }
    };

    const handleDelete = async (image: any) => {
        if (!window.confirm("Erase this memory from the Global Vault?")) return;
        try {
            await deleteDoc(doc(db, 'gallery', image.id));
            if (image.storagePath) await deleteObject(ref(storage, image.storagePath));
        } catch (err) { console.error("Deletion Error:", err); }
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar">
            
            {/* --- PREMIUM VAULT HEADER --- */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 py-12 border-b border-white/5 mb-16">
                <div className="text-center md:text-left">
                    <div className="inline-block px-4 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
                        <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.5em]">Secure Storage Active</span>
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter">Explorer's <span className="text-orange-500">Vault</span></h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Neural Visual Memory Registry by Bharat Path</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="group relative bg-white text-black font-black px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center gap-4 uppercase tracking-widest text-[11px] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <span className="relative z-10 group-hover:text-white transition-colors">{uploading ? 'SYNCING...' : 'UPLINK MEMORY'}</span>
                        <span className="relative z-10 group-hover:rotate-12 transition-transform">💎</span>
                    </button>
                    <p className="text-[8px] font-black text-gray-600 uppercase">Cloud Capacity: Unlimited for Founders</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </header>

            {/* --- MASONRY GRID SYSTEM --- */}
            {loading ? (
                <div className="py-40 flex flex-col items-center">
                    <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] animate-pulse">Decrypting Vault...</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                    {images.map((img) => (
                        <div key={img.id} className="break-inside-avoid group relative bg-[#0a0b14] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-orange-500/10 hover:border-orange-500/30">
                            
                            {/* Cinematic Image Container */}
                            <div className="relative overflow-hidden">
                                <img src={img.url} alt="" className="w-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b14] via-transparent to-transparent opacity-80"></div>
                                
                                {/* Location Badge */}
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span> {img.location}
                                    </p>
                                </div>
                            </div>
                            
                            {/* AI Content Overlay */}
                            <div className="p-8">
                                <p className="text-gray-300 text-sm font-medium leading-relaxed italic mb-6">
                                    "{img.caption}"
                                </p>
                                
                                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Temporal Stamp</p>
                                        <p className="text-[10px] font-black text-white">{new Date(img.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(img)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/5 text-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-inner"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-60 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center group">
                            <div className="text-8xl mb-8 group-hover:scale-125 transition-transform duration-700">📽️</div>
                            <h3 className="text-xl font-black text-gray-700 uppercase tracking-[0.6em]">No Memories Logged</h3>
                            <p className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uplink your first visual to the Global Path</p>
                        </div>
                    )}
                </div>
            )}

            {/* FOUNDER BRANDING */}
            <footer className="mt-32 pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic">Architecture by Shashank Mishra • Bharat Path v4.0</p>
            </footer>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Gallery;