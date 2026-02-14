
import React, { useState } from 'react';
import { getUnifiedTransitStatus } from '../../services/geminiService';
import { TransitStatus } from '../../types';
import { SearchIcon, RouteIcon, MapIcon, CompassIcon } from '../icons/Icons';
// Added useUser import
import { useUser } from '../../contexts/UserContext';

const StatusBadge: React.FC<{ status: TransitStatus['status'] }> = ({ status }) => {
    const styles = {
        'On-time': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Delayed': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        'Cancelled': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        'Arrived': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Scheduled': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return (
        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
            {status}
        </span>
    );
};

const Tracking: React.FC = () => {
    // Added profile from context
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
        setResult(null);

        try {
            // Fixed: Pass profile to getUnifiedTransitStatus
            const status = await getUnifiedTransitStatus(query, profile);
            setResult(status);
        } catch (err: any) {
            setError(err.message || "Uplink failed. Verify ID and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-fadeIn">
            <header className="mb-12 px-4">
                <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Path Tracker</h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.5em] mt-3 text-xs">Global Logistics & Transit Node</p>
            </header>

            <div className="bg-white dark:bg-[#1a1c2e] p-10 md:p-14 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-4">
                        <span className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner">📡</span>
                        <span>INTERROGATE TRANSIT ID</span>
                    </h3>
                    
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-12">
                        <div className="flex-grow relative group">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Flight ID (AI101) or Train No (12001)..."
                                className="w-full pl-14 pr-6 py-6 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[2.5rem] focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1c2e] text-gray-800 dark:text-white font-bold transition-all outline-none text-lg shadow-inner"
                                required
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <SearchIcon />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !query.trim()} 
                            className="bg-blue-600 text-white font-black py-6 px-12 rounded-[2.5rem] hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-[0.2em] text-sm"
                        >
                            {loading ? (
                                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'SYNC STATUS'}
                        </button>
                    </form>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-8 rounded-[3rem] border border-rose-100 dark:border-rose-900/30 mb-8 text-center font-bold animate-fadeIn">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-12 animate-fadeIn">
                            {/* Live Progress Bar */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Global Path Progress</p>
                                    <p className="text-3xl font-black text-blue-600 tracking-tighter">{result.progress_percent}%</p>
                                </div>
                                <div className="h-4 w-full bg-gray-100 dark:bg-[#111222] rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                                        style={{ width: `${result.progress_percent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Core Status Block */}
                            <div className="bg-gradient-to-br from-[#1a1c2e] to-[#111222] p-10 rounded-[3rem] text-white shadow-3xl border border-white/5 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-3">Live Interrogator Result</p>
                                        <h4 className="text-4xl font-black uppercase tracking-tighter">{result.id}</h4>
                                        <div className="flex items-center gap-4 mt-6">
                                            <StatusBadge status={result.status} />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Zone: {result.timezone_info}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[200px]">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Estimated Arrival</p>
                                        <p className="text-4xl font-black text-blue-400 tracking-tighter">{result.estimated_arrival.split(' ')[0]}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{result.estimated_arrival.split(' ').slice(1).join(' ')}</p>
                                    </div>
                                </div>
                                <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Current Vector</h5>
                                        <p className="text-xl font-bold flex items-center gap-3">
                                            <CompassIcon className="text-blue-500" /> {result.current_location}
                                        </p>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Arrival Node</h5>
                                        <div className="flex flex-wrap gap-4">
                                            {result.arrival_node.terminal && <span className="bg-blue-600 px-4 py-1.5 rounded-xl text-[10px] font-black">TER: {result.arrival_node.terminal}</span>}
                                            {result.arrival_node.gate && <span className="bg-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black">GATE: {result.arrival_node.gate}</span>}
                                            {result.arrival_node.platform && <span className="bg-rose-600 px-4 py-1.5 rounded-xl text-[10px] font-black">PF: {result.arrival_node.platform}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-12 -bottom-12 text-[15rem] font-black opacity-5 pointer-events-none rotate-12">LIVE</div>
                            </div>

                            {/* Amenities Logic */}
                            <div className="space-y-6">
                                <h5 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] px-4 flex items-center gap-4">
                                    DESTINATION CONCIERGE
                                    <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {result.amenities.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-[#111222] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-inner group/amenity hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-2xl">{item.type === 'Cafe' ? '☕' : item.type === 'Lounge' ? '🛋️' : '🍴'}</span>
                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.type}</p>
                                            </div>
                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 leading-tight">{item.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .border-3 { border-width: 3px; }
                .shadow-3xl { box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.5); }
            `}</style>
        </div>
    );
};

export default Tracking;