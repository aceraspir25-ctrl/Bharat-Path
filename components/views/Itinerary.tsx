
import React, { useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking } from '../../types';
import { ItineraryIcon, BellIcon, BellIconSolid } from '../icons/Icons';

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
                    {new Date(booking.date).toLocaleDateString()}
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
        Here's a timeline of your planned journey. All items are available offline. Click the bell to set a reminder for the day before.
      </p>

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
    </div>
  );
};

export default Itinerary;