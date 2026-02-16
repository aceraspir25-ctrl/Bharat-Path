import React, { useState, useMemo } from 'react';
import { PlaceInfo, RouteDetails, RouteStrategies } from '../../types';
import { CompassIcon, RouteIcon, InfoIcon, GlobeIcon } from '../icons/Icons';
import { getPlaceInformation, getRouteStrategies } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';

type RoutePreference = 'fastest' | 'scenic' | 'cultural';

interface PathAnalysis {
    title: string;
    description: string;
    highlights: string[];
    icon: string;
    accent: string;
}

const RoutePlanner: React.FC = () => {
    const { profile } = useUser();
    const [startPoint, setStartPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [result, setResult] = useState<PlaceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedPreference, setSelectedPreference] = useState<RoutePreference>('fastest');
    const [avoidTolls, setAvoidTolls] = useState(false);
    const [historicalFocus, setHistoricalFocus] = useState(false);

    const [strategies, setStrategies] = useState<RouteStrategies | null>(null);
    const [isFetchingStrategies, setIsFetchingStrategies] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination.trim()) return;

        setLoading(true);
        setIsFetchingStrategies(true);
        setError(null);
        setResult(null);
        setStrategies(null);

        try {
            // Concurrently fetch destination wisdom and multi-route strategies
            const [info, routeData] = await Promise.all([
                getPlaceInformation(destination, profile).catch(() => null),
                getRouteStrategies(startPoint || 'Current Location', destination, profile, { avoidTolls, historicalFocus })
            ]);

            setResult(info);
            setStrategies(routeData);
        } catch (err: any) {
            setError(err.message || 'The neural path uplink was interrupted. Retrying temporal sync...');
        } finally {
            setLoading(false);
            setIsFetchingStrategies(false);
        }
    };

    const pathAnalyses: Record<RoutePreference, PathAnalysis> = {
        fastest: {
            title: "Velocity Protocol",
            description: "High-velocity corridor prioritization for minimum transit duration.",
            highlights: ["Expressways", "Direct Arcs", "Speed Priority"],
            icon: "⚡",
            accent: "blue"
        },
        scenic: {
            title: "Aesthetic Protocol",
            description: "Immersion through river paths, mountain vistas, and coastal trails.",
            highlights: ["Scenic Bluffs", "Riverfronts", "Vista Nodes"],
            icon: "🏔️",
            accent: "emerald"
        },
        cultural: {
            title: "Heritage Protocol",
            description: "Spiritual hubs and local bazaar integration for deep learning.",
            highlights: ["UNESCO Nodes", "Spiritual Hubs", "Heritage Path"],
            icon: "⛪",
            accent: "rose"
        }
    };

    const StrategyCard: React.FC<{ pref: RoutePreference, route: RouteDetails }> = ({ pref, route }) => (
        <button
            type="button"
            onClick={() => setSelectedPreference(pref)}
            className={`group relative flex-1 text-left p-8 rounded-[3rem] border-2 transition-all overflow-hidden ${
                selectedPreference === pref 
                ? 'border-orange-500 bg-white dark:bg-[#1a1c2e] shadow-4xl scale-[1.03] z-10' 
                : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 hover:border-orange-500/30'
            }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    pref === 'fastest' ? 'bg-blue-500/10 text-blue-500' :
                    pref === 'scenic' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-rose-500/10 text-rose-500'
                }`}>
                    {pathAnalyses[pref].icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ETA</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white mt-1 uppercase tracking-tighter">{route.totalDuration}</p>
                </div>
            </div>
            
            <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-tight leading-none">{pathAnalyses[pref].title}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{route.totalDistance} total span</p>
            
            <div className={`mt-8 pt-6 border-t border-gray-100 dark:border-white/5 ${selectedPreference === pref ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-opacity`}>
                <p className="text-[11px] font-medium leading-relaxed italic text-gray-500 dark:text-gray-400 line-clamp-2">"{route.summary}"</p>
            </div>

            {selectedPreference === pref && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_12px_#f97316]"></div>
            )}
        </button>
    );

    const RouteDisplay: React.FC<{ route: RouteDetails; pref: RoutePreference }> = ({ route, pref }) => (
        <div className="mt-16 space-y-12 animate-fadeInUp">
            <div className="bg-[#111222] p-10 rounded-[4rem] text-white shadow-3xl relative overflow-hidden border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-3">Tactical Strategy Selection Locked</p>
                        <h5 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{pathAnalyses[pref].title}</h5>
                        <p className="mt-6 text-gray-400 text-sm italic font-medium max-w-xl leading-relaxed">"{route.summary}"</p>
                    </div>
                    <div className="flex gap-6">
                        {route.culturalNodesCount && (
                             <div className="bg-white/5 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-white/10 text-center shadow-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60 mb-2">Heritage Syncs</p>
                                <p className="text-4xl font-black tracking-tighter">{route.culturalNodesCount}</p>
                             </div>
                        )}
                        <div className="bg-white/5 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-white/10 text-center shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-2">Metric Span</p>
                            <p className="text-4xl font-black tracking-tighter">{route.totalDistance}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -top-10 -right-10 p-4 opacity-5 text-[20rem] font-black pointer-events-none rotate-12 select-none uppercase tracking-tighter">NODE</div>
            </div>

            <div className="space-y-8 pl-4">
                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] flex items-center gap-6 px-4 mb-10">
                    STEP-BY-STEP PATH EXECUTION
                    <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                </h3>
                <ol className="relative border-l-4 border-orange-500/20 space-y-10 pl-16 ml-10">
                    {route.steps.map((step, index) => (
                        <li key={index} className="relative group/step">
                            <div className="absolute w-14 h-14 bg-white dark:bg-[#1a1c2e] border-4 border-orange-500 rounded-[1.5rem] -left-[95px] shadow-4xl flex items-center justify-center transition-all group-hover/step:rotate-12 group-hover/step:scale-110">
                                <span className="text-sm text-orange-600 dark:text-orange-400 font-black">{index + 1}</span>
                            </div>
                            <div className="bg-white/40 dark:bg-[#111222]/80 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 group-hover/step:border-orange-500/30 transition-all">
                                <p className="font-black text-gray-800 dark:text-white text-2xl tracking-tighter leading-tight italic uppercase">{step.instruction}</p>
                                <div className="mt-8 flex flex-wrap items-center gap-8 border-t border-gray-100 dark:border-white/5 pt-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Section Delta:</span>
                                        <div className="flex items-center gap-3">
                                            <span className="px-5 py-2 bg-gray-100 dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 shadow-inner">📏 {step.distance}</span>
                                            <span className="px-5 py-2 bg-gray-100 dark:bg-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 shadow-inner">⏱️ {step.duration}</span>
                                        </div>
                                    </div>
                                    <button className="ml-auto text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 opacity-0 group-hover/step:opacity-100 transition-opacity flex items-center gap-2">INTERROGATE SEGMENT <span className="text-lg">➔</span></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-40 animate-fadeIn px-4">
            <div className="text-center mb-24 relative">
                <div className="inline-flex items-center justify-center w-28 h-28 bg-orange-500/10 rounded-[3rem] mb-10 text-orange-600 shadow-inner group relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-500/5 animate-pulse scale-150"></div>
                    <RouteIcon className="w-12 h-12 group-hover:rotate-12 transition-transform duration-700 relative z-10" />
                </div>
                <h1 className="text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">Path Architect</h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.6em] mt-6 text-[11px] opacity-60">Universal Strategic Multi-Strategy Synthesis v4.2</p>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none -z-10 blur-[100px]"></div>
            </div>

            <div className="bg-white/60 dark:bg-[#1a1c2e]/90 backdrop-blur-3xl p-10 md:p-16 rounded-[4.5rem] shadow-4xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-6 italic uppercase">
                        <CompassIcon className="w-10 h-10 text-orange-500 animate-spin-slow" /> <span>Launch Synthesis Protocol</span>
                    </h3>
                    <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-6 py-2 rounded-full border border-black/5 dark:border-white/5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aura Spatial Uplink Active</span>
                    </div>
                </div>
                
                <form onSubmit={handleSearch} className="space-y-12 mb-20 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <input
                                type="text"
                                value={startPoint}
                                onChange={(e) => setStartPoint(e.target.value)}
                                placeholder="Origin Node (e.g. Mumbai Int Airport)"
                                className="w-full pl-16 pr-8 py-8 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[3rem] focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1c2e] text-gray-800 dark:text-white font-black transition-all outline-none text-2xl shadow-inner uppercase tracking-tighter placeholder:text-gray-400/50"
                            />
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-125 group-focus-within:text-blue-500 transition-all opacity-40 group-focus-within:opacity-100">📍</div>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Target Destination (e.g. Hampi Ruins)"
                                className="w-full pl-16 pr-8 py-8 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[3rem] focus:border-orange-500 focus:bg-white dark:focus:bg-[#1a1c2e] text-gray-800 dark:text-white font-black transition-all outline-none text-2xl shadow-inner uppercase tracking-tighter placeholder:text-gray-400/50"
                                required
                            />
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:scale-125 group-focus-within:text-orange-500 transition-all opacity-40 group-focus-within:opacity-100"><GlobeIcon className="w-7 h-7" /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <button 
                            type="button"
                            onClick={() => setAvoidTolls(!avoidTolls)}
                            className={`flex items-center justify-between p-7 rounded-[2.5rem] border-2 transition-all group/opt ${avoidTolls ? 'border-orange-500 bg-orange-500/10 text-orange-600' : 'border-gray-100 dark:border-white/5 text-gray-400 hover:border-orange-500/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl opacity-60 group-hover/opt:scale-110 transition-transform">🚫</span>
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">No Toll Protocol</span>
                            </div>
                            <div className={`w-6 h-6 rounded-xl border-2 transition-all ${avoidTolls ? 'bg-orange-500 border-orange-500 scale-110' : 'border-gray-300'}`}></div>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setHistoricalFocus(!historicalFocus)}
                            className={`flex items-center justify-between p-7 rounded-[2.5rem] border-2 transition-all group/opt ${historicalFocus ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-100 dark:border-white/5 text-gray-400 hover:border-blue-500/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl opacity-60 group-hover/opt:scale-110 transition-transform">🏛️</span>
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Heritage Density Synthesis</span>
                            </div>
                            <div className={`w-6 h-6 rounded-xl border-2 transition-all ${historicalFocus ? 'bg-blue-500 border-blue-500 scale-110' : 'border-gray-300'}`}></div>
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !destination.trim()} 
                        className="w-full bg-[#111222] dark:bg-white text-white dark:text-[#111222] font-black py-8 rounded-[3.5rem] transition-all shadow-4xl hover:scale-[1.01] active:scale-[0.98] uppercase tracking-[0.5em] text-xl flex items-center justify-center gap-6 group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {loading ? (
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                 <span className="animate-pulse">Analyzing Universal Arcs...</span>
                             </div>
                        ) : (
                            <>
                                <RouteIcon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500" />
                                <span>Generate Strategy Matrix</span>
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-12 rounded-[3.5rem] border border-rose-100 dark:border-rose-900/30 mb-12 text-center font-black uppercase tracking-[0.4em] text-xs animate-fadeIn shadow-inner">
                        ⚠️ Registry Alert: {error}
                    </div>
                )}

                {isFetchingStrategies && !error && (
                    <div className="py-40 flex flex-col items-center justify-center space-y-10 animate-fadeIn">
                        <div className="relative">
                            <div className="w-32 h-32 border-8 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">🧠</div>
                        </div>
                        <div className="text-center space-y-3">
                            <p className="text-lg font-black text-orange-500 uppercase tracking-[0.6em]">Synthesizing Strategy Protocols</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] opacity-60">Computing velocity, aesthetic, and heritage variants...</p>
                        </div>
                    </div>
                )}

                {strategies && !isFetchingStrategies && (
                    <div className="animate-fadeIn space-y-24">
                        <div className="space-y-10">
                            <h5 className="text-[12px] font-black text-gray-500 uppercase tracking-[0.6em] px-8 flex items-center gap-10">
                                STRATEGY MATRIX SELECTION
                                <span className="flex-1 h-px bg-gray-100 dark:bg-white/10"></span>
                            </h5>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <StrategyCard pref="fastest" route={strategies.fastest} />
                                <StrategyCard pref="scenic" route={strategies.scenic} />
                                <StrategyCard pref="cultural" route={strategies.cultural} />
                            </div>
                        </div>

                        <RouteDisplay route={strategies[selectedPreference]} pref={selectedPreference} />
                    </div>
                )}

                {result && !isFetchingStrategies && (
                    <div className="mt-24 pt-24 border-t border-gray-100 dark:border-white/5 space-y-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8 bg-gradient-to-br from-[#111222] to-[#0d0e1a] p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="px-4 py-1.5 bg-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">Knowledge Core</span>
                                    </div>
                                    <h5 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none italic">{destination} Registry History</h5>
                                    <p className="text-gray-400 leading-relaxed font-medium italic border-l-4 border-orange-500/40 pl-10 text-lg opacity-90">{result.history}</p>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[25rem] font-black group-hover:scale-110 transition-transform pointer-events-none uppercase">CORE</div>
                            </div>
                            
                            <div className="lg:col-span-4 bg-gray-50 dark:bg-[#111222] p-12 rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-inner flex flex-col justify-center">
                                <h5 className="font-black text-xl text-gray-900 dark:text-white mb-10 uppercase tracking-tighter flex items-center gap-4">
                                    <span className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-sm">💡</span> LOCAL PATH ETHICS
                                </h5>
                                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed font-medium italic border-l-2 border-orange-500/40 pl-8 opacity-80">"{result.customs}"</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-4xl { box-shadow: 0 60px 140px -40px rgba(0,0,0,0.7); }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RoutePlanner;