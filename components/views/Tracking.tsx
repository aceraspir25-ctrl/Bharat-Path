// @ts-nocheck
import React, { useState } from 'react';
import { getUnifiedTransitStatus } from '../../services/geminiService';
import { TransitStatus } from '../../types';
import { SearchIcon, CompassIcon } from '../icons/Icons';
import { useUser } from '../../contexts/UserContext';

const StatusBadge: React.FC<{ status: TransitStatus['status'] }> = ({ status }) => {
    const styles = {
        'On-time': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
        'Delayed': 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
        'Cancelled': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        'Arrived': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Scheduled': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return (
        <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}>
            {status}
        </span>
    );
};

const Tracking: React.FC = () => {
    const { profile } = useUser();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<TransitStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            // Neural Uplink to Gemini Transit Service
            const status = await getUnifiedTransitStatus(query, profile);
            setResult(status);
        } catch (err: any) {
            setError("ID Protocol Mismatch. Please verify your Flight/Train ID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-32 animate-fadeIn h-screen overflow-y-auto custom-scrollbar px-6 selection:bg-blue-500/30">
            {/* Header Hub */}
            <header className="py-12">
                <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Path <span className="text-blue-500">Tracker</span></h1>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.6em] mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span> Global Transit Interrogation Active
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Search Console */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-4xl">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-8">Interrogate Node ID</h3>
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="relative group">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                                    placeholder="E.G. AI101 OR 12001"
                                    className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl text-white font-black italic outline-none focus:border-blue-500 transition-all uppercase"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><SearchIcon /></div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-6 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-full shadow-2xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE UPLINK ➔'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-shake">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Tracking Data Stream */}
                <div className="lg:col-span-8">
                    {result ? (
                        <div className="space-y-10 animate-fadeInUp">
                            {/* Live Progress HUD */}
                            <div className="bg-[#0a0b14] p-10 rounded-[4rem] border-2 border-blue-500/20 relative overflow-hidden shadow-4xl">
                                <div className="absolute top-0 right-0 p-10 text-9xl font-black text-white/[0.01] pointer-events-none italic uppercase leading-none">LIVE</div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                                    <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Transit Manifest</p>
                                        <h4 className="text-5xl font-black text-white tracking-tighter">{result.id}</h4>
                                        <div className="mt-6 flex items-center gap-4">
                                            <StatusBadge status={result.status} />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{result.timezone_info}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 px-10 py-6 rounded-[2.5rem] border border-white/10 text-center">
                                        <p className="text-[8px] font-black text-gray-500 uppercase mb-2 tracking-widest">ETA (Next Node)</p>
                                        <p className="text-5xl font-black text-blue-500 tracking-tighter italic">{result.estimated_arrival.split(' ')[0]}</p>
                                    </div>
                                </div>

                                {/* Neural Path Bar */}
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                                        <span>Origin</span>
                                        <span className="text-blue-500 font-black">{result.progress_percent}% Path Complete</span>
                                        <span>Target</span>
                                    </div>
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 rounded-full shadow-[0_0_20px_#3b82f6] transition-all duration-[2s]"
                                            style={{ width: `${result.progress_percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Node Analytics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Current Coordinates</h5>
                                    <p className="text-xl font-black text-white italic flex items-center gap-4 uppercase">
                                        <CompassIcon className="text-blue-500" /> {result.current_location}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Arrival Protocol</h5>
                                    <div className="flex gap-4">
                                        {result.arrival_node.terminal && <div className="bg-blue-600/20 px-5 py-2 rounded-xl text-[10px] font-black text-blue-500 border border-blue-500/20">TERM: {result.arrival_node.terminal}</div>}
                                        {result.arrival_node.platform && <div className="bg-orange-500/20 px-5 py-2 rounded-xl text-[10px] font-black text-orange-500 border border-orange-500/20">PLAT: {result.arrival_node.platform}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-20">
                            <div className="text-9xl mb-8">🛸</div>
                            <p className="text-xs font-black uppercase tracking-[0.8em]">Awaiting Data Feed</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-32 pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic italic">Tracking Infrastructure by Shashank Mishra • Bharat Path Live</p>
            </footer>

            <style>{`
                .shadow-4xl { box-shadow: 0 60px 120px -30px rgba(0, 0, 0, 0.7); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .animate-shake { animation: shake 0.5s linear; }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            `}</style>
        </div>
    );
};

export default Tracking;