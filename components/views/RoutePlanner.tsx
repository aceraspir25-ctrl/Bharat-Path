// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { PlaceInfo, RouteDetails, RouteStrategies } from '../../types';
import { CompassIcon, RouteIcon, GlobeIcon } from '../icons/Icons';
import { getPlaceInformation, getRouteStrategies } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';

const RoutePlanner: React.FC = () => {
    const { profile } = useUser();
    const [startPoint, setStartPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [result, setResult] = useState<PlaceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [strategies, setStrategies] = useState<RouteStrategies | null>(null);
    const [selectedPreference, setSelectedPreference] = useState<'fastest' | 'scenic' | 'cultural'>('fastest');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination.trim()) return;
        setLoading(true);
        try {
            const [info, routeData] = await Promise.all([
                getPlaceInformation(destination, profile).catch(() => null),
                getRouteStrategies(startPoint || 'Current Location', destination, profile, { avoidTolls: false, historicalFocus: true })
            ]);
            setResult(info);
            setStrategies(routeData);
        } catch (err) { console.error("Neural Uplink Failure", err); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-7xl mx-auto pb-40 animate-fadeIn h-screen overflow-y-auto custom-scrollbar px-6 selection:bg-orange-500/30">
            {/* --- FOUNDER'S HEADER --- */}
            <header className="text-center py-16 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-[2rem] text-orange-500 border border-orange-500/20 shadow-2xl">
                        <RouteIcon className="w-10 h-10 animate-pulse" />
                    </div>
                    <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Path <span className="text-orange-500">Architect</span></h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.6em]">Universal Strategy Synthesis v4.2</p>
                </div>
            </header>

            {/* --- INPUT HUB --- */}
            <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-4xl mb-16">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-6 block">Origin Node</label>
                        <input value={startPoint} onChange={e => setStartPoint(e.target.value)} placeholder="SOURCE (E.G. RAIPUR HUB)" className="w-full bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-white font-black italic text-xl outline-none focus:border-orange-500/50 transition-all uppercase placeholder:text-gray-800" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-6 block">Target Destination</label>
                        <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="TARGET (E.G. HAMPI RUINS)" className="w-full bg-black/40 border border-white/5 p-8 rounded-[2.5rem] text-white font-black italic text-xl outline-none focus:border-orange-500/50 transition-all uppercase placeholder:text-gray-800" />
                    </div>
                    <button type="submit" className="md:col-span-2 py-8 bg-white text-black font-black uppercase tracking-[0.5em] rounded-[3rem] hover:bg-orange-500 hover:text-white transition-all shadow-4xl text-lg flex items-center justify-center gap-6 group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative z-10 flex items-center gap-4">
                            <CompassIcon className="w-6 h-6 animate-spin-slow" />
                            {loading ? 'SYNTHESIZING...' : 'GENERATE STRATEGY MATRIX'}
                        </span>
                    </button>
                </form>
            </div>

            {/* --- STRATEGY MATRIX SELECTION --- */}
            {strategies && (
                <div className="space-y-20 animate-fadeInUp">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                        {['fastest', 'scenic', 'cultural'].map((pref) => (
                            <button 
                                key={pref}
                                onClick={() => setSelectedPreference(pref as any)}
                                className={`group p-10 rounded-[3rem] border-2 text-left transition-all duration-700 relative overflow-hidden ${selectedPreference === pref ? 'bg-orange-500 border-orange-500 shadow-[0_20px_60px_rgba(249,115,22,0.4)] scale-105' : 'bg-white/5 border-white/10 hover:border-orange-500/30'}`}
                            >
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-2xl ${selectedPreference === pref ? 'bg-white text-orange-500' : 'bg-white/5 text-gray-500'}`}>
                                        {pref === 'fastest' ? '⚡' : pref === 'scenic' ? '🏔️' : '⛩️'}
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{pref} Protocol</h4>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-4 ${selectedPreference === pref ? 'text-white/80' : 'text-gray-500'}`}>
                                        {strategies[pref].totalDistance} Total Span
                                    </p>
                                </div>
                                <div className="absolute -bottom-4 -right-4 text-7xl font-black italic text-white/[0.02] pointer-events-none uppercase">{pref}</div>
                            </button>
                        ))}
                    </div>

                    {/* Step-by-Step Path Execution */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-8 px-6">
                            <h5 className="text-[12px] font-black text-orange-500 uppercase tracking-[0.5em]">Tactical Step Execution</h5>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>
                        
                        <div className="space-y-6 pl-4">
                            {strategies[selectedPreference].steps.map((step, idx) => (
                                <div key={idx} className="group flex gap-10 pb-8 last:pb-0 relative">
                                    <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-white/5 group-last:hidden"></div>
                                    <div className="relative z-10 w-16 h-16 bg-[#111222] border border-white/10 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:border-orange-500 group-hover:scale-110">
                                        <span className="text-[9px] font-black text-gray-600">NODE</span>
                                        <span className="text-lg font-black text-white">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all shadow-xl group-hover:shadow-orange-500/5">
                                        <p className="text-xl font-black text-white uppercase italic tracking-tight">{step.instruction}</p>
                                        <div className="mt-6 flex items-center gap-8">
                                            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/5">
                                                <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Delta: {step.distance}</p>
                                            </div>
                                            <div className="px-4 py-1.5 bg-black/40 rounded-full border border-white/5">
                                                <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase">Time: {step.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- KNOWLEDGE CORE --- */}
            {result && (
                <div className="mt-32 pt-20 border-t border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="bg-[#0a0b14] border-2 border-orange-500/20 p-12 rounded-[4rem] shadow-4xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 text-9xl font-black text-white/[0.01] italic uppercase">WISDOM</div>
                            <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-8">Registry Insight Hub</h5>
                            <p className="text-gray-300 text-lg font-medium leading-relaxed italic border-l-4 border-orange-500/50 pl-10">"{result.history}"</p>
                        </div>
                        <div className="bg-white/5 p-12 rounded-[4rem] border border-white/5 flex flex-col justify-center">
                            <h5 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-6">Regional Customs Node</h5>
                            <p className="text-gray-500 italic text-base">"{result.customs}"</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FOUNDER FOOTER */}
            <footer className="pt-24 pb-12 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic">System Architecture: Shashank Mishra • Path Architect Pro</p>
            </footer>

            <style>{`
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RoutePlanner;