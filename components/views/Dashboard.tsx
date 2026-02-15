import React, { useMemo, useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useUser } from '../../contexts/UserContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { View, Expense, GlobalIntelligence, SearchSuggestion, TripDetails } from '../../types';
import { SearchIcon, CompassIcon, RouteIcon, MapIcon } from '../icons/Icons';
import { generateSpeech, playRawPcm, getAIResponse, getGlobalIntelligence, getSmartSuggestions } from '../../services/geminiService';

const AmbientMandala: React.FC<{ className?: string; rotationSpeed?: string; scale?: number; reverse?: boolean }> = ({ className, rotationSpeed = '120s', scale = 1, reverse = false }) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={`${className} absolute inset-0 m-auto pointer-events-none transition-all duration-1000`} style={{ animation: `rotate-bg ${rotationSpeed} linear infinite ${reverse ? 'reverse' : 'normal'}`, transform: `scale(${scale})` }}>
        <g stroke="currentColor" strokeWidth="0.3" fill="none">
            <circle cx="100" cy="100" r="90" className="opacity-20" strokeDasharray="2 4" />
            {[...Array(12)].map((_, i) => (
                <path key={`petal-${i}`} className="opacity-30" d="M100 20 C 110 45, 110 65, 100 80 C 90 65, 90 45, 100 20 Z" transform={`rotate(${i * 30}, 100, 100)`} />
            ))}
        </g>
    </svg>
);

const IntelligenceCard: React.FC<{ title: string; items: any[]; icon: string; color: string; delay: number }> = ({ title, items, icon, color, delay }) => (
    <div className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 group hover:border-orange-500/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 animate-fadeInUp`} style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${color} group-hover:rotate-12 transition-transform`}>{icon}</div>
            <div>
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">{title}</h4>
                <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Active Hub</p>
            </div>
        </div>
        <div className="space-y-4">
            {items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="group/item cursor-default border-l-2 border-transparent hover:border-orange-500 pl-3 transition-all">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover/item:text-orange-500 transition-colors">{item.name}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60 line-clamp-1">{item.type || item.rating || item.services || 'Registry Node'}</p>
                </div>
            ))}
            {items.length === 0 && <p className="text-[9px] text-gray-400 italic">Establishing nodes...</p>}
        </div>
    </div>
);

const Dashboard: React.FC<{ setActiveView: (view: View) => void; onAIService: (fn: () => Promise<any>) => Promise<any> }> = ({ setActiveView, onAIService }) => {
  const { searchQuery, setSearchQuery, searchResults, performSearch, loading, error } = useSearch();
  const { profile } = useUser();
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
  const [localIntel, setLocalIntel] = useState<GlobalIntelligence | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Suggestion Engine States
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Suprabhat";
    if (hour < 17) return "Namaste";
    return "Shubh Sandhya";
  }, [currentTime]);

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

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearchingSuggestions(true);
        try {
          const res = await getSmartSuggestions(searchQuery);
          setSuggestions(res);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsSearchingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAction = async (query: string) => {
    setSearchQuery(query);
    setSuggestions([]);
    performSearch(query);
  };

  const handleSpeakResults = async () => {
    const contentToSpeak = searchResults?.story || (searchResults?.suggestions?.map(s => s.name).join(', '));
    if (!contentToSpeak || isSpeaking) return;
    setIsSpeaking(true);
    try {
        const audioBase64 = await generateSpeech(contentToSpeak.substring(0, 500));
        await playRawPcm(audioBase64);
    } catch (err) {} finally { setIsSpeaking(false); }
  };

  const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const budgetProgress = Math.min((totalSpent / 50000) * 100, 100); // Simulated budget limit

  return (
    <div className="relative min-h-full -m-4 md:-m-8 p-4 md:p-8 overflow-x-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 -z-20 opacity-[0.03] dark:opacity-[0.08] pointer-events-none">
         <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover scale-110" alt="" />
      </div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn relative z-10 pb-20">
        
        {/* --- TRIP INITIALIZATION PROMPT --- */}
        {!tripDetails && (
            <div className="bg-gradient-to-r from-[#FF9933] to-[#FF4500] p-8 rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-3xl animate-pulseScale border-b-8 border-orange-700/30">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border border-white/20">📅</div>
                    <div className="space-y-1 text-center lg:text-left">
                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Initialize Your Path</h4>
                        <p className="text-orange-100 text-sm font-bold tracking-widest opacity-90 uppercase">Temporal coordinates missing from registry.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setActiveView(View.Itinerary)}
                    className="w-full lg:w-auto px-12 py-6 bg-white text-orange-600 font-black rounded-[2.5rem] uppercase tracking-widest text-xs hover:bg-orange-50 transition-all shadow-4xl active:scale-95 group flex items-center justify-center gap-3"
                >
                    CONFIGURE TIMELINE <span className="text-xl group-hover:translate-x-2 transition-transform">➔</span>
                </button>
            </div>
        )}

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col justify-between bg-white/40 dark:bg-[#1a1c2e]/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl border border-white/30 dark:border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="px-4 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20">
                            <p className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[0.4em]">{localIntel ? `Linked Path: ${localIntel.location}` : 'Establishing Global Link...'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]"></span>
                             <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Neural Link Active</span>
                        </div>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        {greeting}, <br/>
                        <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{profile.name.split(' ')[0].toUpperCase()}</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.5em] text-[11px] mt-6 opacity-60">Bharat Path Core Intelligence Protocol v3.1</p>
                </div>
                
                <div className="mt-12 flex gap-10 relative z-10">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Local Time</p>
                        <p className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Registry Nodes</p>
                        <p className="text-3xl font-black text-gray-800 dark:text-white tracking-tighter">842 <span className="text-orange-500 text-sm">Syncing</span></p>
                    </div>
                </div>

                <AmbientMandala className="text-orange-500 opacity-5 -right-32 -top-32" scale={3} rotationSpeed="400s" />
                <div className="absolute -bottom-10 -right-10 text-[20rem] font-black text-gray-900/5 dark:text-white/[0.02] pointer-events-none uppercase tracking-tighter select-none">BHP</div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#111222] p-10 rounded-[3.5rem] shadow-2xl border border-white/5 relative overflow-hidden group flex-1 flex flex-col justify-center">
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-orange-500 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-4xl shadow-3xl shadow-orange-500/30 group-hover:rotate-12 transition-transform">🧭</div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Explore Your Path</h4>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-relaxed">Map universal coordinates and sync history.</p>
                        <button onClick={() => setActiveView(View.Map)} className="mt-8 px-8 py-3 bg-white/5 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/30 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">Launch Registry ➔</button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/[0.03] to-transparent pointer-events-none"></div>
                </div>
            </div>
        </div>

        {/* INTELLIGENCE GRID */}
        <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-[12px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.5em] flex items-center gap-4 w-full">
                    🛰️ LOCAL INTELLIGENCE CLUSTERS
                    <span className="flex-1 h-px bg-gray-200 dark:bg-white/10"></span>
                </h3>
            </div>
            
            {localIntel ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                    <IntelligenceCard title="Gastronomy" icon="🥘" items={localIntel.essentials.cafes} color="bg-orange-500/10 text-orange-500" delay={0} />
                    <IntelligenceCard title="Sanctuaries" icon="🏨" items={localIntel.essentials.hotels} color="bg-blue-500/10 text-blue-500" delay={100} />
                    <IntelligenceCard title="Culture" icon="🏛️" items={localIntel.essentials.culture} color="bg-purple-500/10 text-purple-500" delay={200} />
                    <IntelligenceCard title="Logistics" icon="🏧" items={localIntel.essentials.banks} color="bg-green-500/10 text-green-500" delay={300} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            )}
        </div>

        {/* AI PLANNER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white/60 dark:bg-[#1a1c2e]/90 backdrop-blur-3xl rounded-[4rem] p-10 md:p-14 shadow-3xl border border-white/40 dark:border-white/5 group relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
                <div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Universal Planner</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Interrogate Path Intelligence</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setUseThinkingMode(!useThinkingMode)} className={`group relative flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${useThinkingMode ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                      <span className={`${useThinkingMode ? 'animate-spin' : ''}`}>✨</span>
                      {useThinkingMode ? 'Profound Insight' : 'Rapid Scan'}
                  </button>
                </div>
            </div>
            
            <div className="relative mb-14 z-10">
              <form onSubmit={(e) => { e.preventDefault(); handleAction(searchQuery); }} className="relative group/input">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={useThinkingMode ? "Querying historical registry for deep patterns..." : "Where shall we walk today? 🍛"} 
                  className="w-full bg-white dark:bg-[#111222] border-4 border-transparent dark:border-white/5 rounded-[2.5rem] py-8 px-12 text-gray-900 dark:text-white font-bold shadow-inner focus:border-orange-500 outline-none transition-all text-xl" 
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-6">
                  {isSearchingSuggestions && <div className="w-6 h-6 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>}
                  <button type="submit" className="bg-orange-500 text-white p-5 rounded-3xl shadow-4xl hover:scale-110 active:scale-90 transition-transform"><SearchIcon className="w-6 h-6" /></button>
                </div>
              </form>
              
              {/* Suggestion Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute z-[100] w-full bg-white dark:bg-[#1A1C26] border border-gray-100 dark:border-white/10 rounded-[3rem] mt-6 shadow-4xl overflow-hidden animate-fadeInUp backdrop-blur-3xl p-4 space-y-2">
                  {suggestions.map((item, index) => (
                    <li 
                      key={index}
                      onClick={() => { handleAction(item.name); }}
                      className="p-6 bg-gray-50 dark:bg-[#111222]/50 hover:bg-orange-500/10 rounded-3xl cursor-pointer flex justify-between items-center transition-all border border-transparent hover:border-orange-500/30"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1c2e] flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-white/5">📍</div>
                        <div>
                            <h4 className="font-black text-xl text-gray-900 dark:text-white tracking-tight leading-tight">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-black uppercase tracking-widest border border-green-500/20">
                            {item.local_veg_specialty}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(loading || searchResults || error) && (
              <div className="mb-12 bg-white/40 dark:bg-[#111222]/50 p-10 rounded-[3.5rem] border border-white/50 dark:border-white/5 animate-fadeIn shadow-inner relative overflow-hidden z-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-8">
                     <div className="relative">
                        <div className="w-20 h-20 border-4 border-orange-500/20 rounded-full border-t-orange-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">🧠</div>
                     </div>
                     <div className="text-center">
                        <span className="text-orange-500 font-black uppercase tracking-[0.5em] text-xs">Interrogating Universal Memory</span>
                        <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase">Please remain synchronized</p>
                     </div>
                  </div>
                ) : error ? (
                   <div className="py-16 text-center">
                        <div className="text-6xl mb-6">⚠️</div>
                        <p className="text-red-500 font-black uppercase tracking-widest leading-relaxed max-w-sm mx-auto">{error}</p>
                        <button onClick={() => handleAction(searchQuery)} className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-orange-500 underline underline-offset-8">Retry Uplink</button>
                   </div>
                ) : (
                  <div className="space-y-12 animate-fadeIn">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">✨</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] px-5 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">Synthesized Path Response</span>
                        </div>
                        <button onClick={handleSpeakResults} disabled={isSpeaking} className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 text-orange-500 border border-orange-500/20 hover:border-orange-500 hover:scale-105 transition-all shadow-xl ${isSpeaking ? 'animate-pulse' : ''}`}>
                            <span className="text-xl">🔊</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{isSpeaking ? 'Voicing Path...' : 'Listen to AI'}</span>
                        </button>
                     </div>
                     
                     {/* Story Rendering */}
                     {searchResults?.story && <p className="text-gray-800 dark:text-gray-300 leading-relaxed font-medium text-xl border-l-8 border-orange-500/40 pl-10 italic drop-shadow-sm">{searchResults.story}</p>}
                     
                     {/* Structured Suggestions Rendering */}
                     {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                            {searchResults.suggestions.map((s, idx) => (
                                <div key={idx} className="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl group/card hover:border-orange-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg group-hover/card:text-orange-500 transition-colors">{s.name}</h4>
                                        <span className="text-[10px] font-black text-orange-500 px-3 py-1 bg-orange-500/10 rounded-xl border border-orange-500/20">{s.rating} ★</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic line-clamp-3">"{s.description}"</p>
                                    <button className="mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover/card:text-orange-500 transition-all flex items-center gap-2">INTERROGATE NODE <span className="text-sm">➔</span></button>
                                </div>
                            ))}
                        </div>
                     )}
                  </div>
                )}
              </div>
            )}
            <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.02] font-black select-none pointer-events-none">BRAIN</div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-gradient-to-br from-[#1a1c2e] to-[#0d0e1a] p-10 rounded-[4rem] shadow-4xl border border-white/10 group relative overflow-hidden hover:scale-[1.02] transition-all cursor-default">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl shadow-3xl shadow-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform"><span className="text-3xl">🧠</span></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Interest Hub</h3>
                </div>
                <div className="flex flex-wrap gap-2.5 mb-8">
                    {profile.memory.interests.map(interest => (
                        <span key={interest} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-orange-400 uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all cursor-pointer">{interest}</span>
                    ))}
                </div>
                <p className="text-gray-400 text-xs font-bold leading-relaxed italic border-t border-white/5 pt-6">Intelligence protocol is learning from your path. Neural signatures are updated with every query.</p>
                <div className="absolute -bottom-10 -right-10 text-9xl opacity-[0.03] font-black rotate-12 uppercase pointer-events-none">CORE</div>
            </div>

            <div className="bg-white/60 dark:bg-[#1a1c2e]/90 backdrop-blur-3xl rounded-[4rem] p-10 shadow-4xl border border-white/30 dark:border-white/5 group relative overflow-hidden">
               <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-10">Path Fuel Ledger</h3>
               <div className="space-y-10">
                  <div className="flex items-center justify-between">
                     <div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">TOTAL LOGGED</span>
                        <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mt-1">₹{totalSpent.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">BUDGET SYNC</span>
                        <p className="text-xl font-black text-orange-500 tracking-tighter mt-1">{Math.round(budgetProgress)}%</p>
                     </div>
                  </div>
                  <div className="relative h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                     <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-[0_0_15px_#f97316] transition-all duration-[2000ms] ease-out"
                        style={{ width: `${budgetProgress}%` }}
                     ></div>
                  </div>
                  <button onClick={() => setActiveView(View.Budget)} className="w-full py-4 bg-gray-100 dark:bg-white/5 hover:bg-orange-500/10 text-gray-500 dark:text-gray-400 hover:text-orange-500 font-black text-[9px] uppercase tracking-[0.3em] rounded-2xl transition-all border border-transparent hover:border-orange-500/30">Registry Ledger ➔</button>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseScale { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-pulseScale { animation: pulseScale 4s ease-in-out infinite; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.3); }
        .shadow-4xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.5); }
        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
};

export default Dashboard;