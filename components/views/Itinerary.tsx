// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking, AIActivitySuggestion, TripDetails } from '../../types';
import { BellIcon, BellIconSolid, ExternalLinkIcon } from '../icons/Icons';
import { getItinerarySuggestions } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';

// --- NEW ADD-ON: PREMIUM TIMELINE ITEM ---
const ItineraryNode: React.FC<any> = ({ booking, onRemove, onToggleReminder }) => {
  const icons: Record<string, string> = { Hotel: '🏨', Flight: '✈️', Train: '🚂', Activity: '🎟️' };
  
  return (
    <div className="group relative flex gap-10 pb-12 last:pb-0 animate-slideIn">
      {/* Dynamic Path Thread */}
      <div className="absolute left-[29px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500 via-orange-500/20 to-transparent group-last:hidden"></div>
      
      {/* Glowing Node Point */}
      <div className="relative z-10 w-16 h-16 bg-[#0a0b14] border-2 border-orange-500/40 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:border-orange-500 group-hover:scale-110 transition-all duration-500">
        <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {icons[booking.type] || '📍'}
      </div>

      {/* Modern Information Card */}
      <div className="flex-1 bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all shadow-2xl relative overflow-hidden group/card">
        {/* Background Typography */}
        <div className="absolute -top-4 -right-4 text-7xl font-black italic text-white/[0.02] pointer-events-none uppercase select-none group-hover/card:text-orange-500/[0.03] transition-colors">{booking.type}</div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">{booking.type} NODE</span>
            <h3 className="text-xl font-black text-white tracking-tighter leading-tight italic uppercase">{booking.details}</h3>
          </div>
          <div className="text-right bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{booking.date}</p>
            <p className="text-sm font-black text-orange-500">{booking.time || 'TBD'}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center relative z-10">
            <div className="flex gap-3">
                <button onClick={() => onToggleReminder(booking.id)} className={`p-3 rounded-2xl transition-all ${booking.reminderSet ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                    {booking.reminderSet ? <BellIconSolid className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                </button>
                <button className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20">🌍</button>
            </div>
            <button onClick={() => onRemove(booking.id)} className="text-gray-600 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2">
                ERASE FROM PATH <span className="text-lg">×</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const Itinerary: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
  const { profile } = useUser();
  const [suggestions, setSuggestions] = useState<AIActivitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings]);

  const runExpander = async () => {
    setIsLoading(true);
    try {
      const res = await getItinerarySuggestions(bookings, profile);
      setSuggestions(res);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-40 animate-fadeIn h-screen overflow-y-auto custom-scrollbar px-6 selection:bg-orange-500/30">
      
      {/* --- GLOBAL COMMAND HEADER --- */}
      <header className="py-16 flex flex-col lg:flex-row justify-between items-center gap-10 border-b border-white/5 mb-16">
        <div className="text-center lg:text-left">
            <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Journey <span className="text-orange-500">Nodes</span></h1>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.6em] mt-4">Sequential Path Synchronization Protocol</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-full border border-white/10 shadow-2xl">
            <button className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">Export Path PDF</button>
            <button className="p-4 bg-orange-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform">📅</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* --- LEFT: THE TIMELINE --- */}
        <div className="lg:col-span-8">
            <div className="mb-12 flex items-center gap-8 px-2">
                <span className="text-[12px] font-black text-gray-500 uppercase tracking-[0.5em]">Active Temporal Flow</span>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>

            {sortedBookings.length > 0 ? (
                <div className="pl-6">
                    {sortedBookings.map(b => (
                        <ItineraryNode key={b.id} booking={b} onRemove={(id) => setBookings(bookings.filter(x => x.id !== id))} onToggleReminder={() => {}} />
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/5 group">
                    <div className="text-9xl mb-8 opacity-10 group-hover:opacity-30 transition-opacity">🗺️</div>
                    <h3 className="text-xl font-black text-gray-600 uppercase tracking-[0.4em]">Registry Empty</h3>
                    <p className="mt-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest italic">Awaiting node synchronization from booking terminal</p>
                </div>
            )}
        </div>

        {/* --- RIGHT: INTELLIGENCE PANEL --- */}
        <div className="lg:col-span-4 space-y-12">
            {/* Temporal Registry HUD */}
            <div className="bg-[#111222] p-10 rounded-[3.5rem] border border-white/5 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.03] font-black italic pointer-events-none">SYNC</div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span> Global Timeline
                </h3>
                <div className="space-y-4">
                    <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Registry Start</p>
                        <p className="text-lg font-black text-white uppercase italic tracking-widest">{tripDetails?.startDate || 'PENDING'}</p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Registry End</p>
                        <p className="text-lg font-black text-white uppercase italic tracking-widest">{tripDetails?.endDate || 'PENDING'}</p>
                    </div>
                    <button className="w-full py-5 bg-white/5 hover:bg-white/10 text-orange-500 border border-orange-500/30 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all mt-6">Configure Chronology</button>
                </div>
            </div>

            {/* AI EXPANDER: PRE-LINKED CARDS */}
            <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 p-10 rounded-[4rem] border border-orange-500/20 shadow-4xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white text-[9px] font-black px-5 py-2 rounded-full shadow-2xl animate-bounce z-20">NEURAL AI</div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Node Expander</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-12 leading-loose">Gemini is analyzing path density to suggest heritage nodes.</p>

                {suggestions.length > 0 ? (
                    <div className="space-y-6">
                        {suggestions.map((s, i) => (
                            <div key={i} className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex justify-between items-center group/item hover:border-orange-500/50 transition-all shadow-inner">
                                <div>
                                    <h4 className="text-md font-black text-white uppercase tracking-tight italic">{s.name}</h4>
                                    <p className="text-[9px] text-gray-600 uppercase mt-1 tracking-widest">Confidence: 98%</p>
                                </div>
                                <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:bg-orange-500 hover:text-white transition-all transform active:scale-75">＋</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <button onClick={runExpander} className={`w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-full shadow-3xl hover:bg-orange-500 hover:text-white transition-all ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? 'ANALYZING PATH...' : 'Synthesize Suggestions'}
                    </button>
                )}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Itinerary;