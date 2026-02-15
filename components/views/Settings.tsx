import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { ExternalLinkIcon } from '../icons/Icons';

interface SettingsProps {
    toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme }) => {
    const { profile, updateProfile } = useUser();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [hasPremiumKey, setHasPremiumKey] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                try {
                    const has = await window.aistudio.hasSelectedApiKey();
                    setHasPremiumKey(has);
                } catch (err) {
                    setHasPremiumKey(false);
                }
            }
        };
        checkKey();
    }, []);

    // Identity Synchronization Protocol
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateProfile({ profilePic: base64String });
                // Persistent Storage Logic
                localStorage.setItem('userProfilePic', base64String);
                alert("Profile Identity Updated!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleManageKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasPremiumKey(true);
        }
    };

    const handleAction = (e: React.MouseEvent, item: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (item === "Dark/Light Protocol") {
            toggleTheme();
            return;
        }
        if (item === "Manage Premium API Key") {
            handleManageKey();
            return;
        }
        if (item === "Edit Explorer Name") {
            setInputValue(profile.name);
            setActiveModal(item);
            return;
        }
        if (item === "Synchronize Visual ID") {
            fileInputRef.current?.click();
            return;
        }
        if (item === "View Billing Documentation") {
            window.open("https://ai.google.dev/gemini-api/docs/billing", "_blank");
            return;
        }
        if (item === "Check Neural Uplink Status") {
            setActiveModal("Uplink Status");
            return;
        }
        if (item === "Initialize Wipe") {
            if (window.confirm("Permanently erase your global travel history and expertise nodes? This action is irreversible.")) {
                localStorage.clear();
                window.location.reload();
            }
            return;
        }
    };

    const handleSave = () => {
        if (activeModal === "Edit Explorer Name") {
            updateProfile({ name: inputValue });
        }
        setActiveModal(null);
        setInputValue("");
    };

    const sections = [
        { title: "Explorer Identity", icon: "👤", items: ["Edit Explorer Name", "Synchronize Visual ID"] },
        { title: "Neural Protocol", icon: "🧠", items: ["Manage Premium API Key", "Check Neural Uplink Status", "View Billing Documentation"] },
        { title: "System Configuration", icon: "⚙️", items: ["Dark/Light Protocol", "Initialize Wipe"] }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fadeIn px-4">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">COMMAND CENTER</h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Core Registry Configuration</p>
            </header>

            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />

            {activeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#1A1C26] w-full max-w-md rounded-[3rem] p-10 border border-orange-500/30 shadow-2xl animate-scaleIn">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6 tracking-tighter italic">{activeModal}</h2>
                        {activeModal === "Uplink Status" ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Premium Link</span>
                                    <span className={hasPremiumKey ? 'text-green-500 font-black text-xs uppercase' : 'text-orange-500 font-black text-xs uppercase'}>
                                        {hasPremiumKey ? 'Synchronized' : 'Limited Access'}
                                    </span>
                                </div>
                                <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-[10px]">Dismiss</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <input value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-gray-100 dark:bg-black/40 p-5 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-orange-500/50 text-gray-800 dark:text-white font-bold" />
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveModal(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-gray-400">Cancel</button>
                                    <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 rounded-2xl font-black uppercase text-[10px] text-white">Save Changes</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map(sec => (
                    <div key={sec.title} className="space-y-4">
                        <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.3em] px-4 flex items-center gap-3">
                            <span>{sec.icon}</span> {sec.title}
                        </h3>
                        <div className="bg-white dark:bg-[#1A1C26] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
                            {sec.items.map((item, idx) => (
                                <button key={item} onClick={e => handleAction(e, item)} className={`w-full p-6 flex justify-between items-center transition-all hover:bg-orange-500/10 text-left ${idx !== sec.items.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item}</span>
                                    <span className="text-gray-400">➔</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Settings;