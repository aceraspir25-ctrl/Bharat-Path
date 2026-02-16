// @ts-nocheck
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, TripDetails } from '../../types';
import { PnrIcon, LiveTrainIcon, TrainScheduleIcon, CoachPositionIcon, SearchIcon } from '../icons/Icons';

const UtilityCard: React.FC<{ name: string; icon: any; link: string; color: string }> = ({ name, icon, link, color }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-red-500/50 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
    >
        <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
        <div className="w-16 h-16 flex items-center justify-center bg-black/40 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-inner">
            {icon}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
            {name}
        </span>
    </a>
);

const Trains: React.FC = () => {
    const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
    const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
    const [departureStation, setDepartureStation] = useState('');
    const [inquiryNumber, setInquiryNumber] = useState('');

    // --- WORLDWIDE ADD-ON: DYNAMIC RAIL RESOLVER ---
    const railNodes = useMemo(() => {
        const loc = departureStation.toLowerCase();
        
        // India Node (Default)
        if (!loc || loc.includes('ndls') || loc.includes('raipur') || loc.includes('india')) {
            return {
                region: "Bharat Terminal",
                partner: "IRCTC Official",
                logo: "https://www.irctc.co.in/nget/assets/images/logo.png",
                utilities: [
                    { name: 'PNR Status', icon: <PnrIcon />, link: 'https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html', color: 'bg-blue-500' },
                    { name: 'Live Status', icon: <LiveTrainIcon />, link: 'https://www.indianrail.gov.in/enquiry/NTES/index.html', color: 'bg-red-500' },
                    { name: 'Order Food', icon: '🍱', link: 'https://www.ecatering.irctc.co.in/', color: 'bg-orange-500' },
                    { name: 'Tourism', icon: '🏛️', link: 'https://www.irctctourism.com/', color: 'bg-teal-500' }
                ]
            };
        }
        
        // Europe Node
        if (loc.includes('paris') || loc.includes('berlin') || loc.includes('london')) {
            return {
                region: "Euro-Rail Mesh",
                partner: "Eurail Global",
                logo: "https://www.eurail.com/etc/clientlibs/eurail/images/logo.png",
                utilities: [
                    { name: 'Train Finder', icon: '🎫', link: 'https://www.eurail.com/en/plan-your-trip', color: 'bg-indigo-500' },
                    { name: 'Live Map', icon: '🗺️', link: 'https://www.interrail.eu/en/plan-your-trip/interrail-railway-map', color: 'bg-emerald-500' },
                    { name: 'Seat Res', icon: '💺', link: 'https://www.eurail.com/en/book-reservations', color: 'bg-amber-500' },
                    { name: 'Help Hub', icon: '🛰️', link: 'https://www.eurail.com/en/help', color: 'bg-blue-600' }
                ]
            };
        }

        return null;
    }, [departureStation]);

    if (!tripDetails) return (
        <div className="h-screen flex items-center justify-center p-10 bg-[#0a0b14] text-center">
            <div className="space-y-6">
                <div className="text-9xl opacity-20">🚂</div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Rail Registry Locked</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">Initialize Itinerary to Unlock National Rails</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-40 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar">
            
            {/* Header HUD */}
            <header className="py-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 mb-16">
                <div>
                    <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Rail <span className="text-red-600">Path</span></h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.6em] mt-4">Universal National Connection Registry</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-2xl transition-all hover:border-red-500/30">
                    <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center text-2xl text-red-500 animate-pulse">🛤️</div>
                    <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Logged Paths</p>
                        <p className="text-3xl font-black text-white">{bookings.filter(b => b.type === 'Train').length}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Registration Terminal */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-4xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/[0.01] pointer-events-none italic uppercase">LOG</div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10 border-b border-white/5 pb-4">Initialize Rail Sync</h3>
                        
                        <form className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-red-500 uppercase ml-4">Train ID / Number</label>
                                    <input className="w-full bg-black/40 border border-white/5 p-5 rounded-[2.5rem] text-white font-black italic outline-none focus:border-red-500" placeholder="12424 RAJDHANI" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase ml-4">Travel Date</label>
                                    <input type="date" className="w-full bg-black/40 border border-white/5 p-5 rounded-[2.5rem] text-white font-black outline-none focus:border-red-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-red-600/5 p-8 rounded-[3rem] border border-red-600/10">
                                <div className="text-center space-y-4">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin Node</label>
                                    <input 
                                        value={departureStation}
                                        onChange={e => setDepartureStation(e.target.value)}
                                        className="w-full bg-transparent text-5xl font-black text-white text-center outline-none italic placeholder:text-gray-800" 
                                        placeholder="NDLS" 
                                    />
                                </div>
                                <div className="text-center space-y-4">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Arrival Node</label>
                                    <input className="w-full bg-transparent text-5xl font-black text-red-500 text-center outline-none italic placeholder:text-gray-800" placeholder="HWH" />
                                </div>
                            </div>

                            <button className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">Log Rail Vector ➔</button>
                        </form>
                    </div>
                </div>

                {/* Intelligent Dynamic Utilities */}
                <div className="lg:col-span-5 space-y-12">
                    {railNodes && (
                        <div className="animate-fadeInUp space-y-8">
                            <div className="flex items-center gap-4 px-4">
                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em]">{railNodes.region} Hub</span>
                                <div className="flex-1 h-px bg-white/5"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {railNodes.utilities.map((util, i) => (
                                    <UtilityCard key={i} {...util} />
                                ))}
                            </div>

                            {/* Official Partner Banner */}
                            <div className="bg-[#111222] p-8 rounded-[3.5rem] border border-white/5 relative overflow-hidden group shadow-inner">
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center p-3">
                                        <img src={railNodes.logo} alt="Partner" className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-xl tracking-tight uppercase italic">{railNodes.partner}</p>
                                        <p className="text-gray-500 text-[8px] font-bold tracking-[0.2em] uppercase mt-1">Authorized Node Interface</p>
                                    </div>
                                </div>
                                <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all">Launch Registry Portal</button>
                                <div className="absolute -bottom-10 -right-10 text-9xl font-black text-white/[0.01] italic">HUB</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 10px; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Trains;