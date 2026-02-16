// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

interface SettingsProps {
    toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme }) => {
    const { profile, updateProfile } = useUser();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- CLOUD SYNC PROTOCOL ---
    const syncProfileToCloud = async () => {
        setIsSyncing(true);
        try {
            const docRef = doc(db, 'profiles', profile.name.replace(/\s/g, '_'));
            await setDoc(docRef, { ...profile, lastSync: Date.now() }, { merge: true });
            alert("Protocol: Cloud Registry Synchronized.");
        } catch (err) { alert("Uplink Failure."); }
        finally { setIsSyncing(false); }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => updateProfile({ profilePic: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const sections = [
        { title: "Explorer Identity", icon: "👤", items: ["Edit Explorer Name", "Synchronize Visual ID", "Cloud Identity Sync"] },
        { title: "Neural Protocol", icon: "🧠", items: ["Manage Premium API Key", "View Billing Documentation"] },
        { title: "System Overrides", icon: "⚙️", items: ["Dark/Light Protocol", "Initialize Wipe"] }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-40 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
            
            {/* --- TOP FOUNDER HUB --- */}
            <div className="bg-[#0a0b14] border-2 border-orange-500/20 rounded-[4rem] p-10 mb-16 relative overflow-hidden shadow-4xl flex flex-col md:flex-row items-center gap-10 group">
                <div className="absolute top-0 right-0 p-10 text-[10rem] font-black text-white/[0.01] pointer-events-none italic uppercase">ADMIN</div>
                
                <div className="relative">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-orange-500/50 shadow-2xl relative group/img">
                        <img src={profile.profilePic || 'https://via.placeholder.com/150'} alt="Founder" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">📸</button>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#0a0b14] animate-pulse"></div>
                </div>

                <div className="text-center md:text-left space-y-2 relative z-10">
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.6em]">System Administrator</p>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{profile.name}</h2>
                    <div className="flex items-center gap-4 justify-center md:justify-start pt-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest">ID: {profile.name.slice(0, 3).toUpperCase()}-9920</span>
                        <span className="text-[8px] font-black text-green-500 uppercase">Registry Verified</span>
                    </div>
                </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />

            {/* --- SETTINGS MATRIX --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {sections.map(sec => (
                    <div key={sec.title} className="space-y-6">
                        <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-[0.4em] px-4 flex items-center gap-3">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span> {sec.title}
                        </h3>
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
                            {sec.items.map((item, idx) => (
                                <button 
                                    key={item} 
                                    onClick={(e) => {
                                        if (item === "Dark/Light Protocol") toggleTheme();
                                        else if (item === "Cloud Identity Sync") syncProfileToCloud();
                                        else if (item === "Synchronize Visual ID") fileInputRef.current?.click();
                                        else if (item === "Initialize Wipe") { if(confirm("Erase all data?")) localStorage.clear(); }
                                        else { setInputValue(profile.name); setActiveModal(item); }
                                    }} 
                                    className={`w-full p-8 flex justify-between items-center transition-all hover:bg-orange-500/10 group ${idx !== sec.items.length - 1 ? 'border-b border-white/5' : ''}`}
                                >
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                                        {item === "Cloud Identity Sync" && isSyncing ? "SYNCING..." : item}
                                    </span>
                                    <span className="text-gray-700 group-hover:text-orange-500 transition-all transform group-hover:translate-x-1">➔</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL HUD --- */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[2000] flex items-center justify-center p-8">
                    <div className="bg-[#111222] w-full max-w-md rounded-[4rem] p-12 border border-orange-500/30 shadow-4xl animate-scaleIn">
                        <h2 className="text-2xl font-black text-white uppercase mb-10 tracking-tighter italic border-l-4 border-orange-500 pl-6">{activeModal}</h2>
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-black/40 p-6 rounded-2xl mb-10 outline-none border border-white/10 focus:border-orange-500 text-white font-bold" />
                        <div className="flex gap-6">
                            <button onClick={() => setActiveModal(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-gray-500">Cancel</button>
                            <button onClick={() => { updateProfile({ name: inputValue }); setActiveModal(null); }} className="flex-1 py-5 bg-orange-600 rounded-[1.5rem] font-black uppercase text-[10px] text-white shadow-2xl active:scale-95 transition-all">Execute Update</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-32 pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em]">Designed in Raipur • Architected for the Planet</p>
            </footer>

            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-4xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7); }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Settings;