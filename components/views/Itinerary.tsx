
import React, { useEffect, useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking, AIActivitySuggestion, TripDetails } from '../../types';
import { ItineraryIcon, BellIcon, BellIconSolid } from '../icons/Icons';
import { getItinerarySuggestions } from '../../services/geminiService';

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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-start space-x-4">
        <div className="text-3xl">{getIcon(booking.type)}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{booking.type}</h3>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    {booking.type === 'Flight' && booking.time && ` at ${booking.time}`}
                </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{booking.details}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => onToggleReminder(booking.id)} 
                className={`p-1 rounded-full ${booking.reminderSet ? 'text-orange-500' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                aria-label={booking.reminderSet ? "Cancel reminder" : "Set reminder"}
            >
                {booking.reminderSet ? <BellIconSolid /> : <BellIcon />}
            </button>
            <button onClick={() => onRemove(booking.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    </div>
  )
}

const SuggestionCard: React.FC<{
    suggestion: AIActivitySuggestion;
    onAdd: (suggestion: AIActivitySuggestion) => void;
}> = ({ suggestion, onAdd }) => (
    <div className="bg-orange-50 dark:bg-gray-700/50 p-4 rounded-lg border border-orange-200 dark:border-gray-600 flex items-center justify-between gap-4">
        <div className="flex-1">
            <h4 className="font-bold text-gray-800 dark:text-white">{suggestion.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{suggestion.description}</p>
        </div>
        <button
            onClick={() => onAdd(suggestion)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm flex-shrink-0"
        >
            + Add
        </button>
    </div>
);

const AISuggestions: React.FC<{ 
    bookings: Booking[]; 
    onAddSuggestion: (booking: Booking) => void; 
}> = ({ bookings, onAddSuggestion }) => {
    const [suggestions, setSuggestions] = useState<AIActivitySuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getItinerarySuggestions(bookings);
            setSuggestions(result);
        } catch (err: any) {
            setError(err.message || "Could not fetch suggestions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSuggestion = (suggestion: AIActivitySuggestion) => {
        const firstBookingDate = bookings.length > 0 
            ? bookings[0].date // bookings are pre-sorted in parent
            : new Date().toISOString().split('T')[0];

        const newBooking: Booking = {
            id: new Date().toISOString() + Math.random(),
            type: 'Activity',
            details: `${suggestion.name} - AI Suggestion`,
            date: firstBookingDate,
            reminderSet: false
        };
        onAddSuggestion(newBooking);
        // Remove the added suggestion from the list
        setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
    };

    if (bookings.length === 0) {
        return null; // Don't show if no bookings
    }

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                ✨ AI-Powered Suggestions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Based on your itinerary, here are a few things you might enjoy.
            </p>

            {suggestions.length === 0 && !isLoading && !error && (
                <button
                    onClick={handleFetchSuggestions}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors"
                >
                    Find things to do
                </button>
            )}

            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Thinking...</span>
                </div>
            )}
            
            {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}

            {suggestions.length > 0 && (
                <div className="space-y-3">
                    {suggestions.map((s, index) => (
                        <SuggestionCard key={index} suggestion={s} onAdd={handleAddSuggestion} />
                    ))}
                </div>
            )}
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
            setError('Please select both a start and end date.');
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setError('End date cannot be before the start date.');
            return;
        }
        setTripDetails({ startDate, endDate });
        setSuccess('Trip duration saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Trip Duration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="md:col-span-1">
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="md:col-span-1">
                    <button
                        onClick={handleSave}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Save Duration
                    </button>
                </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {success && <p className="text-sm text-green-500 mt-2">{success}</p>}
        </div>
    );
};

const Itinerary: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', []);

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
  };

  useEffect(() => {
    // User-set reminders for any booking type
    const checkReminders = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

      bookings.forEach(booking => {
        if (booking.reminderSet && booking.date) {
          const bookingDate = new Date(booking.date);
          bookingDate.setHours(0, 0, 0, 0); // Normalize booking date
          
          const timeDiff = bookingDate.getTime() - today.getTime();
          const oneDay = 1000 * 60 * 60 * 24;
          const daysUntil = Math.round(timeDiff / oneDay);

          if (daysUntil === 1) {
            console.log(`%c[BHARAT PATH REMINDER]`, 'color: orange; font-weight: bold;', `Your ${booking.type} booking for "${booking.details}" is tomorrow!`);
          }
        }
      });
    };
    
    // Automatic 24-hour alert system for flights
    const checkFlightAlerts = () => {
        const now = new Date();
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        bookings.forEach(booking => {
            if (booking.type === 'Flight' && booking.date && booking.time) {
                try {
                    const flightDateTime = new Date(`${booking.date}T${booking.time}`);
                    const timeUntilFlight = flightDateTime.getTime() - now.getTime();

                    // Check if the flight is within the next 24 hours but not in the past
                    if (timeUntilFlight > 0 && timeUntilFlight <= twentyFourHoursInMs) {
                        console.log(
                            `%c[BHARAT PATH FLIGHT ALERT]`, 
                            'color: #0d6efd; font-weight: bold;', 
                            `Upcoming Flight: Your flight "${booking.details}" is scheduled for departure in less than 24 hours, at ${booking.time}.`
                        );
                    }
                } catch(e) {
                    console.error("Error parsing flight date/time for alert:", e);
                }
            }
        });
    };

    checkReminders();
    checkFlightAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const sortedBookings = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Your Travel Itinerary</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Set your travel dates below. All your bookings will be organized within this duration.
      </p>

      <TripDurationManager />

      {sortedBookings.length > 0 ? (
        <div className="space-y-4">
          {sortedBookings.map(booking => (
            <ItineraryItem key={booking.id} booking={booking} onRemove={handleRemoveBooking} onToggleReminder={handleToggleReminder} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex justify-center text-orange-500 mb-4">
            <ItineraryIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your itinerary is empty.</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Go to the 'Booking' section to add your first trip detail!</p>
        </div>
      )}

      <AISuggestions bookings={sortedBookings} onAddSuggestion={handleAddSuggestionToItinerary} />
    </div>
  );
};

export default Itinerary;