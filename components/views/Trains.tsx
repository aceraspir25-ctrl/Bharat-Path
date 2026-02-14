import React, { useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, TripDetails } from '../../types';
import { 
    PnrIcon, LiveTrainIcon, TrainScheduleIcon, CoachPositionIcon, 
    OrderFoodIcon, RailMadadIcon, AadhaarIcon, IrctcPartnerIcon, SearchIcon
} from '../icons/Icons';

type InquiryMode = 'live' | 'pnr' | 'schedule';

const UtilityCard: React.FC<{ name: string; icon: React.ReactNode; link: string; color: string }> = ({ name, icon, link, color }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-white dark:bg-[#1a1c2e] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
    >
        <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
        <div className="w-14 h-14 flex items-center justify-center bg-gray-50 dark:bg-[#111222] rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {icon}
        </div>
        <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest group-hover:text-red-500 transition-colors">
            {name}
        </span>
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-red-400">OPEN PORTAL ➔</div>
    </a>
);

const FormSection: React.FC<{ title: string; icon?: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl transition-all hover:shadow-2xl group/section">
    <div className="flex items-center gap-3 mb-8">
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] flex items-center gap-4 w-full">
        {title}
        <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {children}
    </div>
  </div>
);

const TrainPreview: React.FC<{
  trainNo: string;
  from: string;
  to: string;
  date: string;
  time: string;
}> = ({ trainNo, from, to, date, time }) => (
  <div className="relative bg-gradient-to-br from-red-600 to-rose-700 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group">
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Train ID / Name</p>
          <h3 className="text-2xl font-black tracking-tighter">{trainNo || '---'}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Status</p>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
            Planning Phase
          </span>
        </div>
      </div>

      <div className="my-10 flex items-center justify-between">
        <div className="text-center">
          <h4 className="text-4xl font-black tracking-tighter">{from || 'ORG'}</h4>
          <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-widest">Origin Station</p>
        </div>
        <div className="flex-1 flex flex-col items-center px-6">
          <div className="w-full h-px bg-white/30 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-700 p-2 rounded-full text-xl shadow-lg">
              🚂
            </div>
          </div>
        </div>
        <div className="text-center">
          <h4 className="text-4xl font-black tracking-tighter">{to || 'DST'}</h4>
          <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-widest">Arrival Node</p>
        </div>
      </div>

      <div className="flex justify-between items-end border-t border-white/10 pt-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Travel Date</p>
          <p className="font-bold text-lg">{date || 'YYYY-MM-DD'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Departure Time</p>
          <p className="font-bold text-lg">{time || '--:--'}</p>
        </div>
      </div>
    </div>
    
    <div className="absolute top-0 right-0 p-4 opacity-5 text-[12rem] font-black pointer-events-none translate-x-12 translate-y-12 group-hover:rotate-3 transition-transform duration-1000">
      RAIL
    </div>
  </div>
);

const Trains: React.FC = () => {
    const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
    const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);

    // Journey Logging State
    const [trainNumber, setTrainNumber] = useState('');
    const [departureStation, setDepartureStation] = useState('');
    const [arrivalStation, setArrivalStation] = useState('');
    const [trainDate, setTrainDate] = useState('');
    const [trainTime, setTrainTime] = useState('');

    // Inquiry Suite State
    const [inquiryMode, setInquiryMode] = useState<InquiryMode>('live');
    const [inquiryNumber, setInquiryNumber] = useState('');
    const [inquiryDate, setInquiryDate] = useState(new Date().toISOString().split('T')[0]);

    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const mainUtilities = [
      { name: 'PNR Status', icon: <PnrIcon />, link: 'https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en', color: 'bg-blue-500' },
      { name: 'Live Status', icon: <LiveTrainIcon />, link: 'https://www.indianrail.gov.in/enquiry/NTES/index.html', color: 'bg-red-500' },
      { name: 'Seat Avail', icon: <TrainScheduleIcon />, link: 'https://www.indianrail.gov.in/enquiry/SEAT/SeatAvailability.html?locale=en', color: 'bg-green-500' },
      { name: 'Fare Enq', icon: <CoachPositionIcon />, link: 'https://www.indianrail.gov.in/enquiry/FARE/FareEnquiry.html?locale=en', color: 'bg-purple-500' },
    ];

    const partnerLinks = [
        { name: 'IRCTC Food', icon: <OrderFoodIcon />, link: 'https://www.ecatering.irctc.co.in/', color: 'bg-orange-500' },
        { name: 'Rail Madad', icon: <RailMadadIcon />, link: 'https://railmadad.indianrailways.gov.in/madad/final/home.jsp', color: 'bg-amber-500' },
        { name: 'IRCTC Tourism', icon: <IrctcPartnerIcon />, link: 'https://www.irctctourism.com/', color: 'bg-teal-500' },
        { name: 'Aadhaar Link', icon: <AadhaarIcon />, link: 'https://www.irctc.co.in/nget/user-registration/signup?aadhaar_ver=Y', color: 'bg-blue-600' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trainNumber || !departureStation || !arrivalStation || !trainDate || !trainTime) {
            setFeedback({ message: 'Parameters incomplete. Please define the full Rail Path.', type: 'error' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        const newBooking: BookingType = {
            id: `TRAIN-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'Train',
            details: `Train ${trainNumber}: ${departureStation} to ${arrivalStation}`,
            date: trainDate,
            time: trainTime,
            reminderSet: false,
        };

        setBookings([...bookings, newBooking]);
        setFeedback({ message: 'Rail journey mapped to Path successfully!', type: 'success' });
        
        // Clear fields
        setTrainNumber('');
        setDepartureStation('');
        setArrivalStation('');
        setTrainDate('');
        setTrainTime('');
        
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleInquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inquiryNumber.trim()) return;

        let url = '';
        switch(inquiryMode) {
            case 'live':
                url = `https://www.google.com/search?q=live+train+status+of+${inquiryNumber}+on+${inquiryDate}`;
                break;
            case 'pnr':
                url = `https://www.google.com/search?q=PNR+status+${inquiryNumber}`;
                break;
            case 'schedule':
                url = `https://www.google.com/search?q=train+schedule+${inquiryNumber}`;
                break;
        }
        window.open(url, '_blank');
    };

    if (!tripDetails) {
        return (
            <div className="text-center bg-white dark:bg-[#1a1c2e] p-16 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/5 max-w-2xl mx-auto shadow-2xl animate-fadeIn">
                <div className="text-8xl mb-6 text-red-500/20">🚂</div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Initialize Rail Registry</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-4 leading-relaxed font-medium">
                    To coordinate your Rail Path, please define your journey dates in the <span className="text-orange-500 font-bold">My Itinerary</span> section.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-fadeIn pb-24">
             <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Rail Path</h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] mt-2">National Connection Registry</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-[#1a1c2e] px-6 py-4 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 text-2xl">🛤️</div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Paths</p>
                        <p className="text-2xl font-black text-gray-800 dark:text-white leading-none">
                            {bookings.filter(b => b.type === 'Train').length}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start px-4">
                {/* Form Section */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center gap-6 mb-4 px-2">
                        <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/40 text-3xl">🚂</div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">Book Registry</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Log your train journey details into the Path</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormSection title="IDENTIFICATION" icon="🎫">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Train No. / Name</label>
                                <input 
                                    type="text" 
                                    value={trainNumber} 
                                    onChange={e => setTrainNumber(e.target.value)} 
                                    placeholder="e.g. 12424 Rajdhani" 
                                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-4 px-6 text-lg font-bold text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-red-500 transition-all outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Journey Date</label>
                                <input 
                                    type="date" 
                                    value={trainDate} 
                                    onChange={e => setTrainDate(e.target.value)} 
                                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-4 px-6 text-lg font-bold text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-red-500 transition-all outline-none shadow-inner"
                                    min={tripDetails.startDate}
                                    max={tripDetails.endDate}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="STATION NODES" icon="📍">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Departure Station</label>
                                <input 
                                    type="text" 
                                    value={departureStation} 
                                    onChange={e => setDepartureStation(e.target.value.toUpperCase())} 
                                    placeholder="e.g. NDLS" 
                                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-4 px-6 text-center text-3xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-red-500 transition-all outline-none tracking-[0.3em] shadow-inner uppercase"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Arrival Station</label>
                                <input 
                                    type="text" 
                                    value={arrivalStation} 
                                    onChange={e => setArrivalStation(e.target.value.toUpperCase())} 
                                    placeholder="e.g. HWH" 
                                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-4 px-6 text-center text-3xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-red-500 transition-all outline-none tracking-[0.3em] shadow-inner uppercase"
                                />
                            </div>
                        </FormSection>

                        <FormSection title="TEMPORAL REGISTRY" icon="⏰">
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Scheduled Departure Time</label>
                                <input 
                                    type="time" 
                                    value={trainTime} 
                                    onChange={e => setTrainTime(e.target.value)} 
                                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-4 px-6 text-lg font-bold text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-red-500 transition-all outline-none shadow-inner"
                                />
                            </div>
                        </FormSection>

                        <div className="pt-6">
                            {feedback && (
                                <div className={`p-4 rounded-2xl mb-6 text-center font-bold text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {feedback.message}
                                </div>
                            )}
                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-lg py-5 px-8 rounded-2xl shadow-xl shadow-red-500/20 transition-all transform active:scale-[0.98] uppercase tracking-widest"
                            >
                                Log Journey into Path
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview & Inquiry Section */}
                <div className="lg:col-span-5 space-y-12">
                    <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] px-2 flex items-center gap-4">
                            PATH PREVIEW
                            <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
                        </h3>
                        <TrainPreview 
                            trainNo={trainNumber}
                            from={departureStation}
                            to={arrivalStation}
                            date={trainDate}
                            time={trainTime}
                        />
                    </div>

                    <div className="bg-[#1a1c2e] p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
                                <span className="p-2 bg-red-500/10 rounded-xl text-red-400">📡</span> Live Inquiry
                            </h3>
                            
                            <div className="flex bg-[#111222] p-1 rounded-2xl mb-6">
                                {(['live', 'pnr', 'schedule'] as InquiryMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => { setInquiryMode(mode); setInquiryNumber(''); }}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                            inquiryMode === mode 
                                            ? 'bg-red-600 text-white shadow-lg' 
                                            : 'text-gray-500 hover:text-white'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleInquirySubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                                        {inquiryMode === 'pnr' ? '10-Digit PNR Number' : 'Train Number'}
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={inquiryNumber}
                                            onChange={(e) => setInquiryNumber(e.target.value)}
                                            placeholder={inquiryMode === 'pnr' ? 'e.g. 2401234567' : 'e.g. 12001'}
                                            className="w-full bg-[#111222] border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-red-500 transition-all"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            <SearchIcon />
                                        </div>
                                    </div>
                                </div>
                                {inquiryMode === 'live' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Running Date</label>
                                        <input 
                                            type="date" 
                                            value={inquiryDate}
                                            onChange={(e) => setInquiryDate(e.target.value)}
                                            className="w-full bg-[#111222] border border-white/5 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-red-500 transition-all"
                                        />
                                    </div>
                                )}
                                <button 
                                    type="submit"
                                    className="w-full bg-white/5 hover:bg-red-600 text-gray-300 hover:text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs border border-white/5"
                                >
                                    Inquiry Live Path
                                </button>
                            </form>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black rotate-12 select-none group-hover:rotate-0 transition-transform duration-700 uppercase">NTES</div>
                    </div>
                </div>
            </div>

            {/* Comprehensive Utilities Section */}
            <div className="space-y-8 px-4">
                <div className="flex items-center gap-4 px-2">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Digital Rail Services</h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {mainUtilities.map(util => (
                        <UtilityCard key={util.name} {...util} />
                    ))}
                </div>

                <div className="flex items-center gap-4 px-2 pt-4">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Official Partner Portals</h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {partnerLinks.map(util => (
                        <UtilityCard key={util.name} {...util} />
                    ))}
                </div>
            </div>

            {/* IRCTC Banner */}
            <div className="bg-[#111222] mx-4 p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl group-hover:rotate-6 transition-transform duration-500">
                        <img src="https://www.irctc.co.in/nget/assets/images/logo.png" alt="IRCTC" className="w-full h-auto object-contain" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-xl tracking-tight uppercase">IRCTC DIGITAL ECOSYSTEM</h4>
                        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1">Official Integration via Bharat Path Partner Protocol</p>
                    </div>
                </div>
                <button className="relative z-10 px-8 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest text-xs">
                    Access Main Portal
                </button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -mr-32 -mt-32"></div>
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Trains;