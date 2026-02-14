
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../contexts/UserContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { View, Booking, Expense, GlobalIntelligence } from '../../types';
import { SearchIcon } from '../icons/Icons';
import { generateSpeech, playRawPcm, getAIResponse, getGlobalIntelligence, getSuggestions } from '../../services/geminiService';

const AmbientMandala: React.FC<{ className?: string; rotationSpeed?: string; scale?: number; reverse?: boolean }> = ({ className, rotationSpeed = '120s', scale = 1, reverse = false }) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={`${className} absolute inset-0 m-auto pointer-events-none`} style={{ animation: `rotate-bg ${rotationSpeed} linear infinite ${reverse ? 'reverse' : 'normal'}`, transform: `scale(${scale})` }}>
        <g stroke="currentColor" strokeWidth="0.3" fill="none">
            <circle cx="100" cy="100" r="90" className="opacity-20" strokeDasharray="2 4" />
            {[...Array(12)].map((_, i) => (
                <path key={`petal-${i}`} className="opacity-30" d="M100 20 C 110 45, 110 65, 100 80 C 90 65, 90 45, 100 20 Z" transform={`rotate(${i * 30}, 100, 100)`} />
            ))}
        </g>
    </svg>
);

const IntelligenceCard: React.FC<{ title: string; items: any[]; icon: string; color: string }> = ({ title, items, icon, color }) => (
    <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 group hover:border-orange-500/30 transition-all shadow-xl`}>
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${color}`}>{icon}</div>
            <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{title}</h4>
        </div>
        <div className="space-y-4">
            {items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="group/item">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover/item:text-orange-500 transition-colors">{item.name}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">{item.type || item.rating || item.services || 'Registry Node'}</p>
                </div>
            ))}
        </div>
    </div>
);

const Dashboard: React.FC<{ setActiveView: (view: View) => void; onAIService: (fn: () => Promise<any>) => Promise<any> }> = ({ setActiveView, onAIService }) => {
  const { searchQuery, setSearchQuery, searchResults, setSearchResults, loading, setLoading, error, setError } = useSearch();
  const { profile } = useUser();
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [localIntel, setLocalIntel] = useState<GlobalIntelligence | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Suggestion state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  useEffect(() => {
    const fetchLocalIntelligence = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const intel = await onAIService(() => getGlobalIntelligence(pos.coords.latitude, pos.coords.longitude, profile));
                    setLocalIntel(intel);
                } catch (err) {}
            });
        }
    };
    fetchLocalIntelligence();
  }, [profile, onAIService]);

  // Debounced Suggestions Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearchingSuggestions(true);
        try {
          const res = await getSuggestions(searchQuery, 'city');
          setSuggestions(res);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsSearchingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAction = async (query: string) => {
    setSearchQuery(query);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
        const response = await onAIService(() => getAIResponse(query, profile, { useThinking: useThinkingMode }));
        setSearchResults(response);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSpeakResults = async () => {
    if (!searchResults?.story || isSpeaking) return;
    setIsSpeaking(true);
    try {
        const audioBase64 = await generateSpeech(searchResults.story.substring(0, 500));
        await playRawPcm(audioBase64);
    } catch (err) {} finally { setIsSpeaking(false); }
  };

  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

  return (
    <div className="relative min-h-full -m-4 md:-m-8 p-4 md:p-8 overflow-hidden">
      <div className="absolute inset-0 -z-20 opacity-[0.06] grayscale pointer-events-none">
         <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" alt="" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">{localIntel ? `Linked Path: ${localIntel.location}` : 'Establishing Global Link...'}</p>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                </div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Namaste, {profile.name}!</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60">Master Explorer Registry • Level 1</p>
            </div>
            <AmbientMandala className="text-orange-500 opacity-5 -right-32 -top-32" scale={3} rotationSpeed="400s" />
        </div>

        <div className="space-y-6">
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-4 w-full">🛰️ Personalized Nodes <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span></h3>
            {localIntel && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                    <IntelligenceCard title="Local Bites" icon="🥘" items={localIntel.essentials.cafes} color="bg-orange-500/10 text-orange-500" />
                    <IntelligenceCard title="Smart Stays" icon="🏨" items={localIntel.essentials.hotels} color="bg-blue-500/10 text-blue-500" />
                    <IntelligenceCard title="Cultural Landmarks" icon="🏛️" items={localIntel.essentials.culture} color="bg-purple-500/10 text-purple-500" />
                    <IntelligenceCard title="Finance Nodes" icon="🏧" items={localIntel.essentials.banks} color="bg-green-500/10 text-green-500" />
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 shadow-2xl border border-gray-100 dark:border-white/5 group relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 relative z-10">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Universal AI Planner</h3>
                <button onClick={() => setUseThinkingMode(!useThinkingMode)} className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${useThinkingMode ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                    {useThinkingMode ? '✨ Profound Insight' : '⚡ Rapid Scan'}
                </button>
            </div>
            
            <div className="relative mb-12 z-10">
              <form onSubmit={(e) => { e.preventDefault(); handleAction(searchQuery); }} className="relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={useThinkingMode ? "Interrogating registry for deep history and local patterns..." : "Kahan jana hai? (e.g. Raipur, Paris) 🥟"} 
                  className="w-full bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[2rem] py-6 px-10 text-gray-900 dark:text-white font-bold shadow-inner focus:border-orange-500 outline-none transition-all text-lg" 
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {isSearchingSuggestions && <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>}
                  <button type="submit" className="bg-orange-500 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform"><SearchIcon /></button>
                </div>
              </form>
              
              {/* Suggestion List UI */}
              {suggestions.length > 0 && (
                <ul className="absolute z-[100] w-full bg-white dark:bg-[#1A1C26] border border-white/10 rounded-[2rem] mt-2 shadow-2xl overflow-hidden animate-fadeInUp">
                  {suggestions.map((item, index) => (
                    <li 
                      key={index}
                      onClick={() => { handleAction(item); }}
                      className="p-5 hover:bg-orange-500/10 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0 text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-3"
                    >
                      <span className="text-orange-500">📍</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(loading || searchResults || error) && (
              <div className="mb-12 bg-gray-50 dark:bg-[#111222] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 animate-fadeIn shadow-2xl relative overflow-hidden z-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full border-t-orange-500 animate-spin"></div>
                     <span className="mt-6 text-orange-500 font-black uppercase tracking-[0.4em] text-[11px]">Interrogating Memory Protocol...</span>
                  </div>
                ) : error ? (
                   <div className="py-12 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-red-500 font-black uppercase tracking-widest leading-relaxed max-w-xs mx-auto">{error}</p>
                   </div>
                ) : (
                  <div className="space-y-10">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] px-4 py-1.5 bg-orange-500/10 rounded-full">Personalized Response</span>
                        <button onClick={handleSpeakResults} disabled={isSpeaking} className={`flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/10 text-orange-500 hover:scale-105 transition-all shadow-md ${isSpeaking ? 'animate-pulse' : ''}`}>
                            <span className="text-xl">🔊</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{isSpeaking ? 'Voicing Path...' : 'Listen to AI'}</span>
                        </button>
                     </div>
                     {searchResults?.story && <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic border-l-4 border-orange-500/40 pl-8 text-lg">{searchResults.story}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#1a1c2e] p-10 rounded-[3rem] shadow-2xl border border-white/5 group relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500 rounded-2xl shadow-xl shadow-purple-500/20"><span className="text-xl">🧠</span></div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Interest Registry</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {profile.memory.interests.map(interest => (
                        <span key={interest} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-orange-400 uppercase tracking-widest">{interest}</span>
                    ))}
                </div>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">Intelligence protocol is learning from your path. Every query refines your profile.</p>
            </div>

            <div className="bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-white/5 group relative overflow-hidden">
               <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">Trip Expense Log</h3>
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Logged</span>
                     <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                     <div className="h-full bg-orange-500 w-1/3 rounded-full shadow-[0_0_15px_#f97316]"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Dashboard;
