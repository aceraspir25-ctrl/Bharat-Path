// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, TripDetails, GroundingChunk } from '../../types';
import { SearchIcon, MicrophoneIcon, ExternalLinkIcon } from '../icons/Icons';
import { getFlightStatus } from '../../services/geminiService';

// --- WORLDWIDE ADD-ON: PREMIUM DATE PICKER ---
const CustomDatePicker: React.FC<{ value: string; onChange: (date: string) => void; label: string }> = ({ value, onChange, label }) => {
  return (
    <div className="relative group">
      <label className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 block ml-2">{label}</label>
      <input 
        type="date" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] text-white outline-none focus:border-blue-500 transition-all italic uppercase text-[11px] font-black tracking-widest cursor-pointer"
      />
    </div>
  );
};

// --- FLIGHT PREVIEW: THE WORLDWIDE TICKET LOOK ---
const FlightPreview: React.FC<any> = ({ flightNumber, from, to, date, time }) => (
  <div className="relative bg-[#0a0b14] border-2 border-blue-500/20 rounded-[3.5rem] p-10 text-white shadow-4xl overflow-hidden group">
    <div className="absolute top-0 right-0 p-10 text-8xl font-black text-white/[0.02] select-none italic">SKY-NET</div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-12">
        <div className="px-5 py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
          Boarding Pass: {flightNumber || 'LOGGING...'}
        </div>
        <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Link</span>
        </div>
      </div>

      <div className="flex justify-between items-center gap-6">
        <div className="text-center">
            <h4 className="text-6xl font-black tracking-tighter italic">{from || 'ORG'}</h4>
            <p className="text-[9px] font-black text-gray-500 uppercase mt-2 tracking-widest">Origin Node</p>
        </div>
        <div className="flex-1 border-t-2 border-dashed border-white/10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0b14] p-3 text-3xl animate-float">✈️</div>
        </div>
        <div className="text-center">
            <h4 className="text-6xl font-black tracking-tighter italic text-blue-500">{to || 'DST'}</h4>
            <p className="text-[9px] font-black text-gray-500 uppercase mt-2 tracking-widest">Target Node</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-10">
        <div>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Departure Vector</p>
            <p className="text-lg font-black italic">{date || 'YYYY-MM-DD'} @ {time || '--:--'}</p>
        </div>
        <div className="text-right">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Log Status</p>
            <p className="text-lg font-black text-green-500 uppercase italic">Ready to Sync</p>
        </div>
      </div>
    </div>
  </div>
);

const Flights: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
  
  // State
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightTime, setFlightTime] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [statusResultText, setStatusResultText] = useState<string | null>(null);

  const handleAddFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber || !departureAirport || !arrivalAirport) return;
    
    const newBooking: BookingType = {
      id: `FL-${Date.now()}`,
      type: 'Flight',
      details: `${flightNumber}: ${departureAirport} ➔ ${arrivalAirport}`,
      date: flightDate,
      time: flightTime,
      reminderSet: false,
    };
    setBookings([...bookings, newBooking]);
    // Reset Logic
  };

  const handleLookupStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLookingUp(true);
    try {
      const { text } = await getFlightStatus(flightNumber, flightDate);
      setStatusResultText(text);
    } catch (err) { console.error(err); }
    finally { setIsLookingUp(false); }
  };

  if (!tripDetails) {
    return (
        <div className="flex h-screen items-center justify-center text-center p-10 bg-[#0a0b14]">
            <div className="space-y-6">
                <div className="text-9xl opacity-20">🛫</div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sky Registry Locked</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">Initialize Itinerary to Unlock Vectors</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar">
      
      {/* Header HUD */}
      <header className="py-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Sky <span className="text-blue-600">Path</span></h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.6em] mt-4">Universal Aerial Logistics Node</p>
        </div>
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-2xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-2xl text-blue-500 animate-pulse">📡</div>
            <div>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Vectors</p>
                <p className="text-3xl font-black text-white">{bookings.filter(b => b.type === 'Flight').length}</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input Node */}
        <div className="lg:col-span-7 space-y-10">
            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-3xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10 border-b border-white/5 pb-4">Initialize Flight Log</h3>
                <form onSubmit={handleAddFlight} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-blue-500 uppercase ml-4">Flight Callsign</label>
                            <input value={flightNumber} onChange={e => setFlightNumber(e.target.value.toUpperCase())} className="w-full bg-black/40 p-5 rounded-[2rem] border border-white/5 text-white font-black tracking-widest outline-none focus:border-blue-500" placeholder="AI 101" />
                        </div>
                        <CustomDatePicker label="Departure Date" value={flightDate} onChange={setFlightDate} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-600/5 p-8 rounded-[3rem] border border-blue-600/10">
                        <div className="text-center space-y-4">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin Port (IATA)</label>
                            <input maxLength={3} value={departureAirport} onChange={e => setDepartureAirport(e.target.value.toUpperCase())} className="w-full bg-transparent text-5xl font-black text-white text-center outline-none italic placeholder:text-gray-800" placeholder="DEL" />
                        </div>
                        <div className="text-center space-y-4">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Port (IATA)</label>
                            <input maxLength={3} value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value.toUpperCase())} className="w-full bg-transparent text-5xl font-black text-blue-500 text-center outline-none italic placeholder:text-gray-800" placeholder="BOM" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-4 tracking-widest">Temporal Log (Time)</label>
                        <input type="time" value={flightTime} onChange={e => setFlightTime(e.target.value)} className="w-full bg-black/40 p-5 rounded-[2rem] border border-white/5 text-white font-black text-2xl outline-none" />
                    </div>

                    <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">
                        Log Aerial Vector ➔
                    </button>
                </form>
            </div>
        </div>

        {/* Right: Intelligence Hub */}
        <div className="lg:col-span-5 space-y-10">
            <FlightPreview flightNumber={flightNumber} from={departureAirport} to={arrivalAirport} date={flightDate} time={flightTime} />
            
            <div className="bg-[#1a1c2e] p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group shadow-inner">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">Live ATC Interrogator</h3>
                <form onSubmit={handleLookupStatus} className="space-y-6">
                    <input value={flightNumber} onChange={e => setLookupNumber(e.target.value.toUpperCase())} className="w-full bg-[#0a0b14] p-5 rounded-[2rem] text-white font-black border border-white/5 outline-none focus:border-blue-500" placeholder="ENTER FLIGHT ID" />
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase text-[9px] tracking-widest shadow-2xl active:scale-95 transition-all">
                        {isLookingUp ? '📡 Interrogating...' : 'Query ATC Database'}
                    </button>
                </form>

                {statusResultText && (
                    <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5 animate-fadeIn">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Neural Data Analysis</p>
                        <p className="text-sm text-gray-300 italic leading-relaxed">"{statusResultText}"</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0% { transform: translate(-50%, -60%); } 50% { transform: translate(-50%, -40%); } 100% { transform: translate(-50%, -60%); } }
        .animate-float { animation: float 3s infinite ease-in-out; }
        .shadow-4xl { box-shadow: 0 60px 150px -30px rgba(59, 130, 246, 0.4); }
      `}</style>
    </div>
  );
};

export default Flights;