// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../contexts/UserContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { View, Expense, GlobalIntelligence, SearchSuggestion, TripDetails } from '../../types';
import { SearchIcon, ExternalLinkIcon } from '../icons/Icons';
import { generateSpeech, playRawPcm, getGlobalIntelligence, getSmartSuggestions } from '../../services/geminiService';

// Add-on: Ambient Background Mandala for Premium Vibe
const AmbientMandala: React.FC<{ className?: string; rotationSpeed?: string }> = ({ className, rotationSpeed = '120s' }) => (
    <svg viewBox="0 0 200 200" className={`${className} absolute pointer-events-none opacity-10`} style={{ animation: `rotate-bg ${rotationSpeed} linear infinite` }}>
        <g stroke="currentColor" strokeWidth="0.5" fill="none">
            <circle cx="100" cy="100" r="80" strokeDasharray="4 8" />
            {[...Array(8)].map((_, i) => (
                <ellipse key={i} cx="100" cy="100" rx="30" ry="90" transform={`rotate(${i * 45}, 100, 100)`} />
            ))}
        </g>
    </svg>
);

const IntelligenceCard: React.FC<{ title: string; items: any[]; icon: string; color: string; delay: number }> = ({ title, items, icon, color, delay }) => (
    <div className={`bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 group hover:border-orange-500/50 transition-all duration-700 animate-fadeInUp`} style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color} shadow-lg shadow-black/20 group-hover:rotate-12 transition-transform`}>{icon}</div>
            <div>
                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">{title}</h4>
                <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Linked Node</p>
            </div>
        </div>
        <div className="space-y-4">
            {items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="group/item border-l-2 border-transparent hover:border-orange-500 pl-3 transition-all">
                    <p className="text-xs font-black text-white uppercase tracking-tight group-hover/item:text-orange-500 transition-colors">{item.name}</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 line-clamp-1">{item.type || 'Standard Node'}</p>
                </div>
            ))}
        </div>
    </div>
);

const Dashboard: React.FC<{ setActiveView: (view: View) => void; onAIService: (fn: () => Promise<any>) => Promise<any> }> = ({ setActiveView, onAIService }) => {
  const { searchQuery, setSearchQuery, searchResults, performSearch, loading, filters } = useSearch();
  const { profile } = useUser();
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
  const [localIntel, setLocalIntel] = useState<GlobalIntelligence | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Local Node Data (Raipur Centric)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const intel = await onAIService(() => getGlobalIntelligence(pos.coords.latitude, pos.coords.longitude, profile));
            setLocalIntel(intel);
        } catch (err) {}
    });
  }, [profile, onAIService]);

  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const budgetProgress = Math.min((totalSpent / 50000) * 100, 100);

  return (
    <div className="relative min-h-screen bg-[#0a0b14] p-4 md:p-8 overflow-hidden font-sans">
      {/* Visual Background Uplink */}
      <div className="absolute inset-0 -z-10 opacity-[0.05]">
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b14] via-transparent to-[#0a0b14]"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        
        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/10 shadow-3xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="px-4 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-[9px] font-black text-orange-500 uppercase tracking-[0.4em]">
                           NODE: {localIntel?.location || 'SYNCING...'}
                        </span>
                        <span className="flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Neural Active
                        </span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
                        NAMASTE,<br/>
                        <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                            {profile.name.split(' ')[0]}
                        </span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.6em] text-[10px] opacity-60 italic">Bharat Path Core Intelligence Protocol v4.0</p>
                </div>
                <AmbientMandala className="top-0 right-0 text-orange-500" />
                <div className="absolute -bottom-10 -right-10 text-[25rem] font-black text-white/[0.01] pointer-events-none select-none italic rotate-12">BHP</div>
            </div>

            {/* Quick Action Node */}
            <div className="lg:col-span-4 bg-[#111222] rounded-[4rem] p-10 border border-white/5 flex flex-col justify-between shadow-2xl relative group overflow-hidden">
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-orange-500/20 mb-8 group-hover:scale-110 transition-transform duration-500">🧭</div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Uplink Map</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-widest">Launch interactive spatial registry to track global nodes.</p>
                </div>
                <button onClick={() => setActiveView(View.Map)} className="w-full py-5 bg-white/5 hover:bg-orange-500 border border-orange-500/30 text-orange-500 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-all active:scale-95 z-10 shadow-2xl">Initialize Map ➔</button>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/[0.03] to-transparent"></div>
            </div>
        </div>

        {/* Intelligence Grid */}
        <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em]">Global Intelligence Clusters</span>
                <div className="flex-1 h-px bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {localIntel ? (
                    <>
                        <IntelligenceCard title="Gastronomy" icon="🥘" items={localIntel.essentials.cafes} color="bg-orange-500/10 text-orange-500" delay={0} />
                        <IntelligenceCard title="Sanctuaries" icon="🏨" items={localIntel.essentials.hotels} color="bg-blue-500/10 text-blue-500" delay={100} />
                        <IntelligenceCard title="Heritage" icon="🏛️" items={localIntel.essentials.culture} color="bg-purple-500/10 text-purple-500" delay={200} />
                        <IntelligenceCard title="Logistics" icon="🏧" items={localIntel.essentials.banks} color="bg-green-500/10 text-green-500" delay={300} />
                    </>
                ) : (
                    [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse"></div>)
                )}
            </div>
        </div>

        {/* Universal Search Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/10 shadow-4xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Universal Terminal</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Direct Path Interrogation</p>
                    </div>
                    <button 
                        onClick={() => setUseThinkingMode(!useThinkingMode)}
                        className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${useThinkingMode ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}
                    >
                        {useThinkingMode ? '🧠 PROMPT SYNC ACTIVE' : '⚡ RAPID SCAN MODE'}
                    </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }} className="relative z-10">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={useThinkingMode ? "SYNCHRONIZING WITH GLOBAL HISTORY..." : "QUERY THE PATH... (e.g. Best Street Food in Raipur)"}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-8 px-10 text-xl font-bold text-white outline-none focus:border-orange-500 transition-all placeholder:text-gray-700 italic"
                    />
                    <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-5 rounded-3xl shadow-2xl hover:scale-110 active:scale-90 transition-transform">
                        <SearchIcon className="w-6 h-6" />
                    </button>
                </form>

                {/* Search Results Display with Verification */}
                {searchResults && (
                    <div className="mt-10 animate-fadeIn space-y-6">
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 italic text-lg text-gray-300 leading-relaxed border-l-8 border-l-orange-500">
                            "{searchResults.story}"
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {searchResults.groundingChunks?.map((chunk, i) => (
                                <a key={i} href={chunk.web?.uri} target="_blank" className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black text-gray-500 uppercase hover:text-orange-500 transition-all flex items-center gap-2">
                                    <ExternalLinkIcon className="w-3 h-3" /> {chunk.web?.title || 'Registry Node'}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Path Fuel (Budget) HUD */}
            <div className="lg:col-span-4 bg-white/5 p-10 rounded-[4rem] border border-white/10 shadow-3xl flex flex-col justify-between group overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">Path Fuel Status</h3>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase">Registry Total</p>
                            <p className="text-4xl font-black text-white italic">₹{totalSpent.toLocaleString()}</p>
                        </div>
                        <p className="text-xl font-black text-orange-500">{Math.round(budgetProgress)}%</p>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-[0_0_20px_#f97316] transition-all duration-1000" style={{ width: `${budgetProgress}%` }}></div>
                    </div>
                </div>
                <button onClick={() => setActiveView(View.Budget)} className="mt-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl">Audit Ledger ➔</button>
                <div className="absolute -bottom-10 -right-10 text-9xl font-black text-white/[0.01] pointer-events-none italic uppercase">FUEL</div>
            </div>
        </div>

        {/* Founder Footer */}
        <footer className="pt-20 border-t border-white/5 text-center">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter opacity-50">Shashank Mishra</h2>
            <div className="mt-4 inline-block px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <span className="text-orange-500 text-[9px] font-black uppercase tracking-widest italic">Global Path Architect</span>
            </div>
        </footer>
      </div>

      <style>{`
        @keyframes rotate-bg { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;