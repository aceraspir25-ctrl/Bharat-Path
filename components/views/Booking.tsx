import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType } from '../../types';

const Booking: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
  const [type, setType] = useState<'Hotel' | 'Flight' | 'Train' | 'Activity'>('Hotel');
  
  // Hotel State
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Flight State
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightDate, setFlightDate] = useState('');

  // Train State
  const [trainNumber, setTrainNumber] = useState('');
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [trainDate, setTrainDate] = useState('');
  
  // Activity State
  const [activityDetails, setActivityDetails] = useState('');
  const [activityDate, setActivityDate] = useState('');

  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);

  const resetForms = () => {
    setHotelName(''); setLocation(''); setCheckInDate(''); setCheckOutDate('');
    setFlightNumber(''); setDepartureAirport(''); setArrivalAirport(''); setFlightDate('');
    setTrainNumber(''); setDepartureStation(''); setArrivalStation(''); setTrainDate('');
    setActivityDetails(''); setActivityDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newBooking: BookingType | null = null;
    const commonProps = { id: new Date().toISOString(), reminderSet: false };

    switch(type) {
      case 'Hotel':
        if (!hotelName || !location || !checkInDate) {
          setFeedback('Please fill in Hotel Name, Location, and Check-in Date.');
          setIsError(true);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
        newBooking = { ...commonProps, type, details: `${hotelName}, ${location}`, date: checkInDate };
        break;
      case 'Flight':
        if (!flightNumber || !departureAirport || !arrivalAirport || !flightDate) {
          setFeedback('Please fill in all flight fields.');
          setIsError(true);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
        newBooking = { ...commonProps, type, details: `Flight ${flightNumber}: ${departureAirport} to ${arrivalAirport}`, date: flightDate };
        break;
      case 'Train':
        if (!trainNumber || !departureStation || !arrivalStation || !trainDate) {
          setFeedback('Please fill in all train fields.');
          setIsError(true);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
        newBooking = { ...commonProps, type, details: `Train ${trainNumber}: ${departureStation} to ${arrivalStation}`, date: trainDate };
        break;
      case 'Activity':
        if (!activityDetails || !activityDate) {
          setFeedback('Please fill in all activity fields.');
          setIsError(true);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
        newBooking = { ...commonProps, type, details: activityDetails, date: activityDate };
        break;
    }

    if (newBooking) {
      setBookings([...bookings, newBooking]);
      resetForms();
      setFeedback('Booking added successfully!');
      setIsError(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const TabButton: React.FC<{ label: string, value: typeof type, icon: string }> = ({ label, value, icon }) => (
    <button
      type="button"
      onClick={() => setType(value)}
      className={`flex-1 flex items-center justify-center py-3 px-2 sm:px-4 text-sm font-medium border-b-2 transition-colors ${
        type === value 
        ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      <span className="mr-2 text-xl">{icon}</span>
      {label}
    </button>
  );

  const renderFormContent = () => {
    switch(type) {
      case 'Hotel':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hotel Name</label>
                <input type="text" id="hotelName" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="e.g., The Taj Palace" className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., New Delhi" className="mt-1 input-field" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-in Date</label>
                <input type="date" id="checkInDate" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-out Date</label>
                <input type="date" id="checkOutDate" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="mt-1 input-field" />
              </div>
            </div>
          </div>
        );
      case 'Flight':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Flight Number</label>
                <input type="text" id="flightNumber" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g., 6E-204" className="mt-1 input-field" />
              </div>
               <div>
                <label htmlFor="flightDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" id="flightDate" value={flightDate} onChange={e => setFlightDate(e.target.value)} className="mt-1 input-field" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Airport</label>
                <input type="text" id="departureAirport" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} placeholder="e.g., DEL" className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="arrivalAirport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arrival Airport</label>
                <input type="text" id="arrivalAirport" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} placeholder="e.g., BOM" className="mt-1 input-field" />
              </div>
            </div>
          </div>
        );
      case 'Train':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Train Number / Name</label>
                <input type="text" id="trainNumber" value={trainNumber} onChange={e => setTrainNumber(e.target.value)} placeholder="e.g., 12001 Shatabdi Exp" className="mt-1 input-field" />
              </div>
               <div>
                <label htmlFor="trainDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" id="trainDate" value={trainDate} onChange={e => setTrainDate(e.target.value)} className="mt-1 input-field" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="departureStation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Station</label>
                <input type="text" id="departureStation" value={departureStation} onChange={e => setDepartureStation(e.target.value)} placeholder="e.g., NDLS" className="mt-1 input-field" />
              </div>
              <div>
                <label htmlFor="arrivalStation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arrival Station</label>
                <input type="text" id="arrivalStation" value={arrivalStation} onChange={e => setArrivalStation(e.target.value)} placeholder="e.g., BCT" className="mt-1 input-field" />
              </div>
            </div>
          </div>
        );
      case 'Activity':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="activityDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Details</label>
              <textarea
                id="activityDetails"
                rows={3}
                value={activityDetails}
                onChange={(e) => setActivityDetails(e.target.value)}
                className="mt-1 input-field p-2"
                placeholder="e.g., Taj Mahal guided tour"
              />
            </div>
            <div>
              <label htmlFor="activityDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" id="activityDate" value={activityDate} onChange={e => setActivityDate(e.target.value)} className="mt-1 input-field" />
            </div>
          </div>
        );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`.input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 1rem; border-width: 1px; border-color: #D1D5DB; border-radius: 0.375rem; } .dark .input-field { background-color: #374151; border-color: #4B5563; } .input-field:focus { outline: none; --tw-ring-color: #F97316; box-shadow: 0 0 0 2px var(--tw-ring-color); border-color: #F97316; }`}</style>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Add a New Booking</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Keep track of your journey. All bookings are saved locally on your device for offline access.
      </p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton label="Hotel" value="Hotel" icon="🏨" />
          <TabButton label="Flight" value="Flight" icon="✈️" />
          <TabButton label="Train" value="Train" icon="🚂" />
          <TabButton label="Activity" value="Activity" icon="🎟️" />
        </div>
        
        <div className="p-6">
          {renderFormContent()}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors"
            >
              Add to Itinerary
            </button>
          </div>
          {feedback && (
              <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {feedback}
              </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Booking;
