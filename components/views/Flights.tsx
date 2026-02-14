
import React, { useState, useMemo, useRef, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, TripDetails, GroundingChunk } from '../../types';
import { SearchIcon, MicrophoneIcon, RouteIcon, ExternalLinkIcon } from '../icons/Icons';
import { getFlightStatus } from '../../services/geminiService';

// --- ENHANCED CUSTOM DATE PICKER COMPONENT --- //

const CustomDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  label: string;
}> = ({ value, onChange, min, max, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  const [viewDate, setViewDate] = useState(value ? new Date(value) : today);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days: Date[] = [];
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);

    // Prev month days
    for (let i = 0; i < startOffset; i++) {
      days.push(new Date(year, month, i - startOffset + 1));
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  const isDateDisabled = (d: Date) => {
    const dateStr = formatDate(d);
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  const handleMonthChange = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) {
      list.push(i);
    }
    return list;
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 block mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/50 dark:bg-[#111222] border-2 rounded-2xl py-4 px-6 text-left font-bold text-gray-800 dark:text-white transition-all outline-none shadow-inner flex justify-between items-center ${
            isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <span>{value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}</span>
        </div>
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'opacity-40'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-3 w-[20rem] bg-white dark:bg-[#1a1c2e] border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-4xl p-5 animate-datepickerEnter overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-1">
            <button 
                type="button" 
                onClick={() => handleMonthChange(-1)} 
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all text-blue-500 active:scale-90"
                aria-label="Previous Month"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="flex items-center gap-2">
                <button 
                    type="button"
                    onClick={() => setShowYearPicker(!showYearPicker)}
                    className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-white hover:text-blue-500 transition-colors flex items-center gap-1"
                >
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    <span className="text-[10px] opacity-40">▼</span>
                </button>
            </div>

            <button 
                type="button" 
                onClick={() => handleMonthChange(1)} 
                className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all text-blue-500 active:scale-90"
                aria-label="Next Month"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          {showYearPicker ? (
              <div className="grid grid-cols-3 gap-2 h-56 overflow-y-auto custom-scrollbar p-2 animate-fadeIn">
                  {years.map(y => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => handleYearSelect(y)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            viewDate.getFullYear() === y 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                          {y}
                      </button>
                  ))}
              </div>
          ) : (
            <>
                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((date, i) => {
                    const disabled = isDateDisabled(date);
                    const isSelected = value === formatDate(date);
                    const isToday = formatDate(today) === formatDate(date);
                    const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                    
                    return (
                        <button
                        key={i}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            onChange(formatDate(date));
                            setIsOpen(false);
                        }}
                        className={`aspect-square rounded-2xl text-[11px] font-black transition-all flex items-center justify-center relative group/day
                            ${isSelected ? 'bg-blue-600 text-white shadow-xl scale-110 z-10' : ''}
                            ${!isSelected && isCurrentMonth ? 'text-gray-800 dark:text-white hover:bg-blue-500/10 hover:text-blue-500' : ''}
                            ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-700 opacity-40' : ''}
                            ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-90'}
                        `}
                        >
                        {date.getDate()}
                        {isToday && !isSelected && (
                            <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                        )}
                        </button>
                    );
                    })}
                </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center px-1">
              <button 
                type="button"
                onClick={() => { onChange(formatDate(today)); setIsOpen(false); }}
                className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:underline"
              >
                  Select Today
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
              >
                  Close
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickDatePicks: React.FC<{ 
  onSelect: (date: string) => void;
  min?: string;
  max?: string;
  activeDate?: string;
}> = ({ onSelect, min, max, activeDate }) => {
  const options = useMemo(() => {
    const d = new Date();
    const today = new Date(d);
    const tomorrow = new Date(d);
    tomorrow.setDate(d.getDate() + 1);
    
    const fmt = (date: Date) => date.toISOString().split('T')[0];
    
    const list = [
      { label: 'Today', date: fmt(today) },
      { label: 'Tomorrow', date: fmt(tomorrow) },
    ];
    
    return list.filter(opt => {
      if (min && opt.date < min) return false;
      if (max && opt.date > max) return false;
      return true;
    });
  }, [min, max]);

  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 px-1">
      {options.map(opt => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onSelect(opt.date)}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
            activeDate === opt.date 
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105' 
            : 'bg-white dark:bg-white/5 text-blue-500 border-blue-500/10 hover:border-blue-500/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const FlightPreview: React.FC<{
  flightNumber: string;
  from: string;
  to: string;
  date: string;
  time: string;
}> = ({ flightNumber, from, to, date, time }) => (
  <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-3xl overflow-hidden group">
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Path Registry ID</p>
          <h3 className="text-3xl font-black tracking-tighter mt-1">{flightNumber || '---'}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Status</p>
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 mt-1">
            Verified Node
          </span>
        </div>
      </div>

      <div className="my-12 flex items-center justify-between">
        <div className="text-center group/node cursor-default">
          <h4 className="text-6xl font-black tracking-tighter group-hover:scale-110 transition-transform">{from || 'ORG'}</h4>
          <p className="text-[10px] font-black opacity-60 uppercase mt-2 tracking-[0.2em]">Origin Node</p>
        </div>
        <div className="flex-1 flex flex-col items-center px-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-700 p-3 rounded-full text-2xl shadow-2xl border-4 border-indigo-600 animate-pulse">
              ✈️
            </div>
          </div>
        </div>
        <div className="text-center group/node cursor-default">
          <h4 className="text-6xl font-black tracking-tighter group-hover:scale-110 transition-transform">{to || 'DST'}</h4>
          <p className="text-[10px] font-black opacity-60 uppercase mt-2 tracking-[0.2em]">Target Node</p>
        </div>
      </div>

      <div className="flex justify-between items-end border-t border-white/10 pt-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Vector Date</p>
          <p className="font-black text-xl tracking-tight">{date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'YYYY-MM-DD'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Departure T-Minus</p>
          <p className="font-black text-xl tracking-tight">{time || '--:--'}</p>
        </div>
      </div>
    </div>
    
    <div className="absolute top-0 right-0 p-4 opacity-5 text-[15rem] font-black pointer-events-none translate-x-20 translate-y-20 group-hover:rotate-6 transition-transform duration-1000 select-none">
      SKY
    </div>
    <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
  </div>
);

const FormSection: React.FC<{ title: string; icon?: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-[#1a1c2e] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl transition-all hover:shadow-3xl group/section relative overflow-hidden">
    <div className="flex items-center gap-4 mb-10 relative z-10">
      {icon && <span className="text-3xl p-3 bg-gray-50 dark:bg-[#111222] rounded-2xl shadow-inner">{icon}</span>}
      <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.5em] flex items-center gap-6 w-full">
        {title}
        <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
      {children}
    </div>
    <div className="absolute bottom-0 right-0 p-4 opacity-[0.02] text-8xl font-black pointer-events-none translate-x-1/4 translate-y-1/4 uppercase tracking-tighter">NODE</div>
  </div>
);

const Flights: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);

  // Form State
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightTime, setFlightTime] = useState('');

  // Status Lookup State
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupDate, setLookupDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusCitations, setStatusCitations] = useState<GroundingChunk[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [isListening, setIsListening] = useState<'departure' | 'arrival' | null>(null);
  const recognitionRef = useRef<any>(null);

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const startVoiceInput = (field: 'departure' | 'arrival') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback({ message: 'Voice recognition not supported in this browser.', type: 'error' });
      return;
    }

    if (isListening === field) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(field);
    recognition.onend = () => setIsListening(null);
    recognition.onerror = () => {
      setIsListening(null);
      setFeedback({ message: 'Error capturing voice. Please try again.', type: 'error' });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toUpperCase().replace(/\s/g, '').slice(0, 3);
      if (field === 'departure') setDepartureAirport(transcript);
      else setArrivalAirport(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleLookupStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupNumber || !lookupDate) return;

    setIsLookingUp(true);
    setStatusResult(null);
    setStatusCitations([]);
    try {
      const { data, groundingChunks } = await getFlightStatus(lookupNumber, lookupDate);
      setStatusResult(data);
      setStatusCitations(groundingChunks);
    } catch (err: any) {
      setFeedback({ message: err.message || 'Lookup failed.', type: 'error' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddFlight = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flightNumber || !departureAirport || !arrivalAirport || !flightDate || !flightTime) {
      setFeedback({ message: 'Missing parameters. Please complete the flight log.', type: 'error' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const newBooking: BookingType = {
      id: `FLIGHT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'Flight',
      details: `Flight ${flightNumber}: ${departureAirport} ➔ ${arrivalAirport}`,
      date: flightDate,
      time: flightTime,
      reminderSet: false,
    };

    setBookings([...bookings, newBooking]);
    
    setFlightNumber('');
    setDepartureAirport('');
    setArrivalAirport('');
    setFlightDate('');
    setFlightTime('');
    
    setFeedback({ message: 'Sky Path Locked! Your flight is safely recorded.', type: 'success' });
    setTimeout(() => setFeedback(null), 5000);
  };

  if (!tripDetails) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center space-y-10 animate-fadeIn">
        <div className="w-40 h-40 bg-blue-500/10 rounded-[4rem] mx-auto flex items-center justify-center text-8xl shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
            <span className="relative z-10 group-hover:scale-110 transition-transform">✈️</span>
        </div>
        <div>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Registry Locked</h2>
          <p className="text-gray-500 font-bold mt-4 text-xl tracking-tight max-w-md mx-auto">Establish your temporal coordinates in <span className="text-blue-600">My Itinerary</span> to unlock air traffic logistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-fadeIn space-y-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
        <div>
          <h1 className="text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Sky Path Logistics</h1>
          <p className="text-gray-500 text-sm font-black uppercase tracking-[0.5em] mt-4">Universal Aerial Connection Registry</p>
        </div>
        <div className="flex items-center gap-6 bg-white dark:bg-[#1a1c2e] px-8 py-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-3xl shadow-inner animate-pulse">
            📡
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Vectors</p>
            <p className="text-3xl font-black text-gray-800 dark:text-white leading-none mt-1">
              {bookings.filter(b => b.type === 'Flight').length}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start px-6">
        <div className="lg:col-span-7 space-y-12">
          <div className="flex items-center gap-8 mb-4 px-2">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-3xl shadow-blue-500/40 text-4xl transform rotate-3">
              🛫
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Initialize Registry</h2>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-3">Append new connection data to your itinerary</p>
            </div>
          </div>

          <form onSubmit={handleAddFlight} className="space-y-8">
            <FormSection title="IDENTIFICATION PROTOCOL" icon="📄">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Flight Number / Callsign</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AI 101, 6E 2304"
                  className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-5 px-8 text-xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-blue-500 transition-all outline-none shadow-inner uppercase tracking-tighter"
                />
              </div>
              <div className="space-y-4">
                <CustomDatePicker
                  label="Departure Vector Date"
                  value={flightDate}
                  onChange={setFlightDate}
                  min={tripDetails.startDate}
                  max={tripDetails.endDate}
                />
                <QuickDatePicks 
                  onSelect={setFlightDate} 
                  min={tripDetails.startDate} 
                  max={tripDetails.endDate}
                  activeDate={flightDate}
                />
              </div>
            </FormSection>

            <FormSection title="SPATIAL VECTOR PATH" icon="🌐">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Origin Port (IATA)</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={departureAirport}
                    onChange={(e) => setDepartureAirport(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="DEL"
                    maxLength={3}
                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-6 px-8 text-center text-4xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-blue-500 transition-all outline-none tracking-[0.4em] pr-16 shadow-inner uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('departure')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-xl ${
                      isListening === 'departure' ? 'bg-orange-500 text-white animate-pulse' : 'bg-white dark:bg-white/10 text-gray-400 hover:text-blue-500'
                    }`}
                    title="Voice Input"
                  >
                    <MicrophoneIcon />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Target Port (IATA)</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={arrivalAirport}
                    onChange={(e) => setArrivalAirport(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="BOM"
                    maxLength={3}
                    className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-6 px-8 text-center text-4xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-blue-500 transition-all outline-none tracking-[0.4em] pr-16 shadow-inner uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('arrival')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-xl ${
                      isListening === 'arrival' ? 'bg-orange-500 text-white animate-pulse' : 'bg-white dark:bg-white/10 text-gray-400 hover:text-blue-500'
                    }`}
                    title="Voice Input"
                  >
                    <MicrophoneIcon />
                  </button>
                </div>
              </div>
            </FormSection>

            <FormSection title="TEMPORAL LOG" icon="⏰">
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">Scheduled Departure Time</label>
                <input
                  type="time"
                  value={flightTime}
                  onChange={(e) => setFlightTime(e.target.value)}
                  className="w-full bg-gray-50/50 dark:bg-[#111222] border-2 border-transparent rounded-2xl py-5 px-8 text-2xl font-black text-gray-800 dark:text-white focus:bg-white dark:focus:bg-[#111222] focus:border-blue-500 transition-all outline-none shadow-inner"
                />
              </div>
            </FormSection>

            <div className="pt-10">
              {feedback && (
                <div className={`p-6 rounded-3xl mb-8 text-center font-black text-sm animate-fadeIn ${feedback.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {feedback.message}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-3xl shadow-3xl shadow-blue-500/30 transition-all transform active:scale-[0.98] uppercase tracking-[0.3em] text-lg"
              >
                Log Vector Data
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-16">
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] px-4 flex items-center gap-6">
              VIRTUAL PREVIEW
              <span className="flex-1 h-px bg-gray-100 dark:bg-white/5"></span>
            </h3>
            <FlightPreview 
              flightNumber={flightNumber} 
              from={departureAirport} 
              to={arrivalAirport} 
              date={flightDate} 
              time={flightTime} 
            />
          </div>

          <div className="bg-[#1a1c2e] p-10 rounded-[3.5rem] border border-white/5 shadow-4xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <span className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner">🔍</span> 
                <span>Live ATC Interrogator</span>
              </h3>
              <form onSubmit={handleLookupStatus} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-3">Master Flight ID</label>
                  <input
                    type="text"
                    value={lookupNumber}
                    onChange={(e) => setLookupNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 6E 2304, EK 515"
                    className="w-full bg-[#111222] border border-white/5 rounded-2xl py-5 px-8 text-white font-black outline-none focus:border-blue-500 transition-all uppercase tracking-tighter"
                  />
                </div>
                <div className="space-y-2">
                  <CustomDatePicker
                    label="Query Vector Date"
                    value={lookupDate}
                    onChange={setLookupDate}
                  />
                  <QuickDatePicks 
                    onSelect={setLookupDate}
                    activeDate={lookupDate}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl uppercase tracking-[0.2em] text-xs disabled:bg-gray-700 mt-4 active:scale-95"
                >
                  {isLookingUp ? (
                    <div className="flex items-center justify-center gap-3">
                       <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>SYNCING ATC...</span>
                    </div>
                  ) : 'Query ATC Database'}
                </button>
              </form>

              {statusResult && (
                <div className="mt-10 space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uplink Status</span>
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      statusResult.status?.toLowerCase().includes('delayed') || statusResult.status?.toLowerCase().includes('cancelled') 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {statusResult.status || 'Active Path'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group/info transition-all hover:bg-white/10 shadow-lg">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-2 tracking-widest">Terminal</p>
                      <p className="text-white font-black text-2xl tracking-tighter">{statusResult.terminal || '---'}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group/info transition-all hover:bg-white/10 shadow-lg">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-2 tracking-widest">Gate</p>
                      <p className="text-white font-black text-2xl tracking-tighter">{statusResult.gate || '---'}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group/info transition-all hover:bg-white/10 shadow-lg">
                      <p className="text-[9px] text-blue-400 font-black uppercase mb-2 tracking-widest">Est. Dept</p>
                      <p className="text-white font-black text-2xl tracking-tighter">{statusResult.estimatedDeparture || '---'}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group/info transition-all hover:bg-white/10 shadow-lg">
                      <p className="text-[9px] text-orange-400 font-black uppercase mb-2 tracking-widest">Est. Arrv</p>
                      <p className="text-white font-black text-2xl tracking-tighter">{statusResult.estimatedArrival || '---'}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 backdrop-blur-sm">
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <RouteIcon className="w-3 h-3" /> Sector Path
                     </p>
                     <p className="text-sm text-blue-100 font-black uppercase tracking-widest">
                        {statusResult.origin || 'ORG'} <span className="text-orange-500 mx-2">➔</span> {statusResult.destination || 'DST'}
                     </p>
                  </div>

                  {statusCitations.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Sources & Grounding</p>
                      <div className="flex flex-wrap gap-2">
                        {statusCitations.map((chunk, idx) => chunk.web && (
                          <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[9px] font-bold text-gray-400 hover:text-white transition-all group/link"
                          >
                            <span className="truncate max-w-[120px]">{chunk.web.title || 'Source'}</span>
                            <ExternalLinkIcon className="w-2 h-2 opacity-40 group-hover/link:opacity-100" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black rotate-12 select-none group-hover:rotate-0 transition-transform duration-700 uppercase pointer-events-none">FLIGHT</div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes datepickerEnter { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-datepickerEnter { animation: datepickerEnter 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(59, 130, 246, 0.3); }
        .shadow-4xl { box-shadow: 0 60px 120px -30px rgba(0, 0, 0, 0.5); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
};

export default Flights;
