
import React, { useEffect, useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking, AIActivitySuggestion, TripDetails, Notification } from '../../types';
import { ItineraryIcon, BellIcon, BellIconSolid } from '../icons/Icons';
import { getItinerarySuggestions } from '../../services/geminiService';
import { useUser } from '../../contexts/UserContext';

interface ItineraryItemProps {
    booking: Booking;
    onRemove: (id: string) => void;
    onToggleReminder: (id: string) => void;
}

const ItineraryItem: React.FC<ItineraryItemProps> = ({ booking, onRemove, onToggleReminder }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Hotel': return '🏨';
      case 'Flight': return '✈️';
      case 'Train': return '🚂';
      case 'Activity': return '🎟️';
      default: return '📌';
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-start space-x-4 transition-all hover:shadow-md group">
        <div className="text-3xl bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl group-hover:scale-110 transition-transform">{getIcon(booking.type)}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-sm uppercase tracking-tight text-gray-800 dark:text-white">{booking.type}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 px-2 py-1 bg-orange-500/10 rounded-lg">
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                    {booking.type === 'Flight' && booking.time && ` @ ${booking.time}`}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{booking.details}</p>
        </div>
        <div className="flex items-center space-x-1">
            <button 
                onClick={() => onToggleReminder(booking.id)} 
                className={`p-2 rounded-xl transition-colors ${booking.reminderSet ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label={booking.reminderSet ? "Cancel reminder" : "Set reminder"}
            >
                {booking.reminderSet ? <BellIconSolid /> : <BellIcon />}
            </button>
            <button onClick={() => onRemove(booking.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    </div>
  )
}

const SuggestionCard: React.FC<{
    suggestion: AIActivitySuggestion;
    onAdd: (suggestion: AIActivitySuggestion) => void;
}> = ({ suggestion, onAdd }) => (
    <div className="bg-orange-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-orange-100 dark:border-white/5 flex items-center justify-between gap-4 transition-all hover:border-orange-500/30">
        <div className="flex-1">
            <h4 className="font-black text-sm uppercase tracking-tight text-gray-800 dark:text-white">{suggestion.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed italic">"{suggestion.description}"</p>
        </div>
        <button
            onClick={() => onAdd(suggestion)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 px-5 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-[10px] uppercase tracking-widest flex-shrink-0"
        >
            + ADD TO PATH
        </button>
    </div>
);

const AISuggestions: React.FC<{ 
    bookings: Booking[]; 
    onAddSuggestion: (booking: Booking) => void; 
}> = ({ bookings, onAddSuggestion }) => {
    const { profile } = useUser();
    const [suggestions, setSuggestions] = useState<AIActivitySuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getItinerarySuggestions(bookings, profile);
            setSuggestions(result);
        } catch (err: any) {
            setError(err.message || "Could not fetch suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSuggestion = (suggestion: AIActivitySuggestion) => {
        const firstBookingDate = bookings.length > 0 
            ? bookings[0].date 
            : new Date().toISOString().split('T')[0];

        const newBooking: Booking = {
            id: `SUGG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'Activity',
            details: `${suggestion.name}`,
            date: firstBookingDate,
            reminderSet: false
        };
        onAddSuggestion(newBooking);
        setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
    };

    if (bookings.length === 0) return null;

    return (
        <div className="mt-12 bg-white dark:bg-[#1a1c2e] p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
                    <span className="text-2xl">✨</span> AI Path Expander
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                    Unlocking hidden nodes based on your current itinerary registry.
                </p>

                {suggestions.length === 0 && !isLoading && !error && (
                    <button
                        onClick={handleFetchSuggestions}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/20 transition-all uppercase tracking-widest text-xs"
                    >
                        Analyze & Generate Suggestions
                    </button>
                )}

                {isLoading && (
                    <div className="flex flex-col justify-center items-center py-8">
                        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Querying Path Intelligence...</span>
                    </div>
                )}
                
                {error && <p className="text-red-500 dark:text-red-400 text-center font-bold text-xs">{error}</p>}

                {suggestions.length > 0 && (
                    <div className="space-y-4">
                        {suggestions.map((s, index) => (
                            <SuggestionCard key={index} suggestion={s} onAdd={handleAddSuggestion} />
                        ))}
                    </div>
                )}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black rotate-12 select-none pointer-events-none">AI</div>
        </div>
    );
};

const TripDurationManager: React.FC = () => {
    const [tripDetails, setTripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
    const [startDate, setStartDate] = useState(tripDetails?.startDate || '');
    const [endDate, setEndDate] = useState(tripDetails?.endDate || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSave = () => {
        setError('');
        setSuccess('');
        if (!startDate || !endDate) {
            setError('Parameters incomplete.');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setError('Temporal anomaly: End date precedes Start date.');
            return;
        }
        setTripDetails({ startDate, endDate });
        setSuccess('Journey duration synchronized.');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 mb-10 relative overflow-hidden">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                <span className="text-2xl">⏳</span> Temporal Registry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
                <div className="space-y-2">
                    <label htmlFor="start-date" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Date</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-6 py-3.5 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-bold dark:text-white shadow-inner"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="end-date" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Date</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-6 py-3.5 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-bold dark:text-white shadow-inner"
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 px-6 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                >
                    Sync Timeline
                </button>
            </div>
            {error && <p className="text-[10px] text-red-500 mt-4 font-black uppercase tracking-widest text-center">{error}</p>}
            {success && <p className="text-[10px] text-green-500 mt-4 font-black uppercase tracking-widest text-center">{success}</p>}
            <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] text-9xl font-black rotate-12 select-none pointer-events-none">TIME</div>
        </div>
    );
};

const Itinerary: React.FC<{ onNotify?: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void }> = ({ onNotify }) => {
  const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', []);
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);

  const handleRemoveBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };
  
  const handleToggleReminder = (id: string) => {
    setBookings(bookings.map(b => 
      b.id === id ? { ...b, reminderSet: !b.reminderSet } : b
    ));
  };

  const handleAddSuggestionToItinerary = (newBooking: Booking) => {
    setBookings(prev => [...prev, newBooking]);
    if (onNotify) {
        onNotify({
            title: 'Path Updated',
            message: `"${newBooking.details}" has been added to your journey.`,
            type: 'success'
        });
    }
  };

  const { filteredBookings, otherBookings } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (!tripDetails || !tripDetails.startDate || !tripDetails.endDate) {
        return { filteredBookings: sorted, otherBookings: [] };
    }

    const start = new Date(tripDetails.startDate + 'T00:00:00');
    const end = new Date(tripDetails.endDate + 'T23:59:59');

    return {
        filteredBookings: sorted.filter(b => {
            const d = new Date(b.date + 'T00:00:00');
            return d >= start && d <= end;
        }),
        otherBookings: sorted.filter(b => {
            const d = new Date(b.date + 'T00:00:00');
            return d < start || d > end;
        })
    };
  }, [bookings, tripDetails]);

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
      <header className="mb-10 px-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Personal Journey Path</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Master Itinerary & Booking Registry</p>
      </header>

      <TripDurationManager />

      <div className="space-y-12">
          <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Active Journey Nodes</h2>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
              </div>
              
              {filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map(booking => (
                    <ItineraryItem key={booking.id} booking={booking} onRemove={handleRemoveBooking} onToggleReminder={handleToggleReminder} />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white dark:bg-[#1a1c2e] p-12 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 shadow-inner">
                  <div className="flex justify-center text-gray-200 dark:text-gray-700 mb-6 text-6xl">
                    🗺️
                  </div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Registry Empty for this Timeline</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Add bookings in the 'Booking' section to populate your journey nodes.</p>
                </div>
              )}
          </section>

          {otherBookings.length > 0 && (
              <section className="space-y-6 pt-6">
                  <div className="flex items-center gap-4 px-2">
                      <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Path Vault (Other Dates)</h2>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                      {otherBookings.map(booking => (
                        <ItineraryItem key={booking.id} booking={booking} onRemove={handleRemoveBooking} onToggleReminder={handleToggleReminder} />
                      ))}
                  </div>
              </section>
          )}

          <AISuggestions bookings={filteredBookings} onAddSuggestion={handleAddSuggestionToItinerary} />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Itinerary;
