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
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Gemini AI Media Analysis (Neural Captioning)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                let aiCaption = "Memory captured on the Path.";
                try {
                    aiCaption = await analyzeMedia(
                        base64Data, 
                        file.type, 
                        "Describe this travel memory in a poetic way for Bharat Path explorer. Keep it under 20 words."
                    );
                } catch (err) {
                    console.error("Neural captioning failed:", err);
                }

                // 3. Save to Firestore
                await addDoc(collection(db, 'gallery'), {
                    url: downloadURL,
                    caption: aiCaption,
                    location: profile.memory.expertiseNodes[0] || 'Global Path',
                    timestamp: Date.now(),
                    storagePath: storageRef.fullPath
                });
                setUploading(false);
            };
        } catch (err) {
            console.error("Gallery Uplink Error:", err);
            setUploading(false);
            alert("Temporal uplink failed. Please try again.");
        }
    };

    const handleDelete = async (image: any) => {
        if (!window.confirm("Permanently erase this memory from the registry?")) return;
        try {
            await deleteDoc(doc(db, 'gallery', image.id));
            if (image.storagePath) {
                const storageRef = ref(storage, image.storagePath);
                await deleteObject(storageRef);
            }
        } catch (err) {
            console.error("Deletion failed:", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Explorer's Vault</h1>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Neural Visual Memory Registry</p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-3xl shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-4 uppercase tracking-widest text-[11px]"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>SYNCING MEMORY...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xl">📤</span>
                            <span>ADD MEMORY</span>
                        </>
                    )}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            </header>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-8">
                    <div className="w-16 h-16 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opening Vault Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map((img) => (
                        <div key={img.id} className="group relative bg-[#1a1c2e] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:-translate-y-2">
                            <img src={img.url} alt="" className="w-full h-72 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111222] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">{img.location}</p>
                                <p className="text-white text-sm font-medium leading-relaxed italic opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    "{img.caption}"
                                </p>
                                <div className="mt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                        {new Date(img.timestamp).toLocaleDateString()}
                                    </span>
                                    <button onClick={() => handleDelete(img)} className="text-red-500/40 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center opacity-20">
                            <span className="text-8xl mb-8">🖼️</span>
                            <h3 className="text-2xl font-black uppercase tracking-widest">Vault Registry Empty</h3>
                            <p className="mt-4 text-sm font-bold">Start logging your journey visuals to the cloud.</p>
                        </div>
                    )}
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5); }
            `}</style>
        </div>
    );
};

export default Gallery;