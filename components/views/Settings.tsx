
import React, { useState, useEffect } from 'react';
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

    // Initial check for premium API key status
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

    const settingsOptions = [
      { group: "Profile Registry", icon: "👤", items: ["Edit Explorer Name", "Global Travel Bio", "Trust Badges & Expertise"] },
      { group: "Neural Intelligence", icon: "🧠", items: ["Memory Sync Protocol", "Vegetarian Diversity Mode", "Translation Engine Settings", "Thinking Budget Control"] },
      { group: "API & Intelligence Protocol", icon: "🔑", items: ["Manage Premium API Key", "Check Neural Uplink Status", "View Billing Documentation"] },
      { group: "Path Safety", icon: "🛡️", items: ["Trusted Contact Registry", "Local Emergency Hub Sync", "Encryption Protocol"] },
      { group: "Subscription & Tiers", icon: "⭐", items: ["Manage Plan", "Registry Invoices", "Redeem Path Vouchers"] },
      { group: "Interface Aesthetics", icon: "🎨", items: ["Dark/Light Protocol", "Master Map Style", "Typography Scale"] }
    ];

    const handleManageKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success per race condition protocol
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

        if (item === "View Billing Documentation") {
            window.open("https://ai.google.dev/gemini-api/docs/billing", "_blank");
            return;
        }

        if (item === "Check Neural Uplink Status") {
            setActiveModal("Uplink Status");
            return;
        }

        if (item === "Initialize Wipe") {
            const confirmWipe = window.confirm("Bhai, kya aap sach mein apna saara travel data erase karna chahte hain? This action cannot be undone.");
            if (confirmWipe) {
                localStorage.clear();
                window.location.reload();
            }
            return;
        }

        if (item === "Edit Explorer Name") {
            setInputValue(profile.name);
        } else {
            setInputValue("");
        }

        setActiveModal(item);
    };

    const handleSave = () => {
        if (activeModal === "Edit Explorer Name") {
            updateProfile({ name: inputValue });
        }
        
        alert(`${activeModal} successfully synced with Bharat Path nodes!`);
        setActiveModal(null);
        setInputValue("");
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fadeIn px-4 relative min-h-screen">
            
            {/* --- SYSTEMATIC MODAL --- */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-[#1A1C26] w-full max-w-md rounded-[3rem] p-10 border border-orange-500/30 shadow-2xl animate-scaleIn">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-4 tracking-tighter italic">{activeModal}</h2>
                        
                        {activeModal === "Uplink Status" ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Core Intelligence</span>
                                    <span className="text-green-500 font-black text-xs uppercase tracking-widest">Connected</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Premium Protocol</span>
                                    {hasPremiumKey ? (
                                        <span className="text-blue-500 font-black text-xs uppercase tracking-widest">Active (High Performance)</span>
                                    ) : (
                                        <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Basic Access</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                    {hasPremiumKey 
                                        ? "Neural Uplink is operating at maximum capacity. Veo Video and 4K Imagery are currently synchronized."
                                        : "Premium features require a paid API key. Basic path exploration and translation are still active."}
                                </p>
                                <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest">Dismiss</button>
                            </div>
                        ) : (
                            <>
                                <input 
                                    autoFocus
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    placeholder="Interrogate Parameter..."
                                    className="w-full bg-gray-100 dark:bg-black/40 p-5 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-orange-500/50 text-gray-800 dark:text-white font-bold"
                                />
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveModal(null)} className="flex-1 py-4 font-black uppercase text-[10px] text-gray-400 tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
                                    <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 rounded-2xl font-black uppercase text-[10px] text-white tracking-widest shadow-xl shadow-orange-600/20 active:scale-95 transition-all">Sync Change</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <header className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">COMMAND CENTER</h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Neural Identity Interface</p>
            </header>

            {/* API Status Quick View */}
            <div className="mb-10 bg-gradient-to-br from-[#1a1c2e] to-[#0d0e1a] rounded-[3rem] p-10 border border-white/10 shadow-3xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Premium Neural Uplink</h3>
                            {hasPremiumKey ? (
                                <div className="bg-blue-500/10 text-blue-500 border border-blue-500/30 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
                                    Linked
                                </div>
                            ) : (
                                <div className="bg-orange-500/10 text-orange-500 border border-orange-500/30 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                    Limited
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-xs font-medium max-w-xl leading-relaxed">
                            A paid API key is required to access advanced spatial synthesis nodes including <span className="text-white">Veo Cinematic Motion</span> and <span className="text-white">4K Neural Photography</span>.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                             {['Veo Video', '4K Images', 'Grounding 2.5', 'High Budget Thinking'].map(tag => (
                                 <span key={tag} className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${hasPremiumKey ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>{tag}</span>
                             ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleManageKey}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black py-5 px-10 rounded-[2rem] shadow-xl shadow-orange-500/20 transition-all transform active:scale-95 uppercase tracking-widest text-[10px] whitespace-nowrap"
                    >
                        {hasPremiumKey ? 'Switch API Key' : 'Authorize Premium Uplink'}
                    </button>
                </div>
                <div className="absolute -right-20 -bottom-20 text-[18rem] opacity-[0.02] font-black text-white pointer-events-none select-none">API</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settingsOptions.map((group) => (
                    <div key={group.group} className="animate-fadeInUp">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <span className="text-xl">{group.icon}</span>
                            <h3 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.2em]">
                                {group.group}
                            </h3>
                        </div>
                        <div className="bg-white dark:bg-[#1A1C26] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
                            {group.items.map((item, idx) => (
                                <button 
                                    key={item} 
                                    onClick={(e) => handleAction(e, item)}
                                    className={`w-full group p-6 flex justify-between items-center cursor-pointer transition-all hover:bg-orange-500/10 text-left ${idx !== group.items.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-800 dark:text-gray-200 text-sm font-bold tracking-tight group-hover:text-orange-500 transition-colors">
                                            {item}
                                        </p>
                                        {item === "Manage Premium API Key" && hasPremiumKey && (
                                            <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-md font-black uppercase">Active</span>
                                        )}
                                    </div>
                                    <span className="text-gray-400 group-hover:translate-x-2 transition-transform">
                                        {item === "View Billing Documentation" ? (
                                            <ExternalLinkIcon className="w-4 h-4" />
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Danger Zone Section */}
            <div className="mt-16 bg-red-500/5 rounded-[2.5rem] border border-red-500/20 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h4 className="text-red-500 font-black text-sm uppercase tracking-tight">Irreversible Protocol</h4>
                    <p className="text-gray-500 text-xs font-medium mt-1">Permanently erase your travel memory and Expertise Nodes.</p>
                </div>
                <button 
                    onClick={(e) => handleAction(e, "Initialize Wipe")}
                    className="px-10 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95"
                >
                    Initialize Wipe
                </button>
            </div>

            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Settings;
