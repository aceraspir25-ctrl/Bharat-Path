
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, AIBookingSuggestion, TripDetails } from '../../types';
import { getHotelSuggestions } from '../../services/geminiService';
import { ExternalLinkIcon, TrainIconSimple, IrctcPartnerIcon, PnrIcon, LiveTrainIcon, TrainScheduleIcon, CoachPositionIcon, OrderFoodIcon, RailMadadIcon, AadhaarIcon } from '../icons/Icons';
// Added useUser import
import { useUser } from '../../contexts/UserContext';

const Booking: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
  const [type, setType] = useState<'Hotel' | 'Flight' | 'Train' | 'Activity'>('Hotel');
  const [tripDetails] = useLocalStorage<TripDetails | null>('tripDetails', null);
  // Added profile from useUser context
  const { profile } = useUser();
  
  // Hotel State
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [hotelSuggestions, setHotelSuggestions] = useState<AIBookingSuggestion[]>([]);
  const [isFetchingHotels, setIsFetchingHotels] = useState(false);
  const [hotelFetchError, setHotelFetchError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);

  // Flight State
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightTime, setFlightTime] = useState('');

  // Train State
  const [trainNumber, setTrainNumber] = useState('');
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [trainDate, setTrainDate] = useState('');
  
  // Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);
  const [confirmation, setConfirmation] = useState<{ message: string; details?: string } | null>(null);


  // Effect for fetching hotel suggestions with debouncing
  useEffect(() => {
    const fetchHotelSuggestions = async (loc: string) => {
        setIsFetchingHotels(true);
        setHotelFetchError('');
        try {
            // Fixed: Pass profile to getHotelSuggestions
            const suggestions = await getHotelSuggestions(loc, profile);
            setHotelSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
        } catch (error: any) {
            setHotelFetchError('Could not fetch hotel suggestions.');
            setShowSuggestions(false);
        } finally {
            setIsFetchingHotels(false);
        }
    };

    if (type === 'Hotel' && location.trim().length > 2) {
        const handler = setTimeout(() => {
            fetchHotelSuggestions(location);
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    } else {
        setHotelSuggestions([]);
        setShowSuggestions(false);
    }
    // Added profile to dependencies
  }, [location, type, profile]);

  // Effect to handle clicks outside the suggestion box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearFormFields = () => {
      setHotelName(''); setLocation(''); setCheckInDate(''); setCheckOutDate('');
      setHotelSuggestions([]); setShowSuggestions(false); setHotelFetchError('');
      setFlightNumber(''); setDepartureAirport(''); setArrivalAirport(''); setFlightDate(''); setFlightTime('');
      setTrainNumber(''); setDepartureStation(''); setArrivalStation(''); setTrainDate('');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
  }

  const resetForms = () => {
    clearFormFields();
  };

  const handleSuggestionClick = (name: string) => {
    setHotelName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    setIsError(false);

    if (isRecurring && type === 'Hotel') {
        const startDateString = checkInDate;
        const details = `${hotelName}, ${location}`;

        if (!hotelName || !location) {
             setFeedback('Please fill in the main booking details first.');
             setIsError(true);
             setTimeout(() => setFeedback(''), 3000);
             return;
        }

        if (!startDateString || !recurrenceEndDate) {
            setFeedback('Please provide both a start date and a recurrence end date.');
            setIsError(true);
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        
        const newBookings: BookingType[] = [];
        const startDate = new Date(startDateString + 'T00:00:00');
        const endDate = new Date(recurrenceEndDate + 'T00:00:00');

        if (startDate > endDate) {
            setFeedback('Recurrence end date cannot be before the start date.');
            setIsError(true);
            setTimeout(() => setFeedback(''), 3000);
            return;
        }

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            newBookings.push({
                id: new Date(currentDate).toISOString() + Math.random(),
                type: type,
                details: details,
                date: currentDate.toISOString().split('T')[0],
                reminderSet: false,
            });

            switch (recurrencePattern) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
        }
        
        if (newBookings.length > 0) {
            setBookings([...bookings, ...newBookings]);
            setConfirmation({
                message: `${newBookings.length} recurring bookings added!`,
                details: `${type} for "${details}" - repeating ${recurrencePattern}.`
            });
            setTimeout(() => setConfirmation(null), 5000);
            resetForms();
        } else {
            setFeedback('No recurring bookings were created. Please check your dates.');
            setIsError(true);
            setTimeout(() => setFeedback(''), 3000);
        }
        return;
    }

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
        if (!flightNumber || !departureAirport || !arrivalAirport || !flightDate || !flightTime) {
          setFeedback('Please fill in all flight fields, including time.');
          setIsError(true);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
        newBooking = { ...commonProps, type, details: `Flight ${flightNumber}: ${departureAirport} to ${arrivalAirport}`, date: flightDate, time: flightTime };
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
    }

    if (newBooking) {
      setBookings([...bookings, newBooking]);
      const dateForDisplay = new Date(newBooking.date + 'T00:00:00');
      setConfirmation({
        message: 'Booking Added Successfully!',
        details: `${newBooking.type}: ${newBooking.details} on ${dateForDisplay.toLocaleDateString()}`
      });
      setTimeout(() => setConfirmation(null), 5000);
      resetForms();
    }
  };
  
  const handleCheckInChange = (date: string) => {
    setCheckInDate(date);
    // If checkout is before new checkin, clear it
    if (checkOutDate && new Date(checkOutDate) < new Date(date)) {
        setCheckOutDate('');
    }
  };

  const TabButton: React.FC<{ label: string, value: typeof type, icon: string }> = ({ label, value, icon }) => (
    <button
      type="button"
      onClick={() => { setType(value); resetForms(); }}
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

  const TrainUtilities: React.FC = () => {
    const utilities = [
      { name: 'PNR Status', icon: <PnrIcon />, link: 'https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en' },
      { name: 'Live Train Status', icon: <LiveTrainIcon />, link: 'https://www.indianrail.gov.in/enquiry/NTES/index.html' },
      { name: 'Train Schedule', icon: <TrainScheduleIcon />, link: 'https://www.indianrail.gov.in/enquiry/SCHEDULE/TrainSchedule.html?locale=en' },
      { name: 'Coach Position', icon: <CoachPositionIcon />, link: 'https://www.railmitra.com/coach-position' },
      { name: 'Order Food', icon: <OrderFoodIcon />, link: 'https://www.ecatering.irctc.co.in/' },
      { name: 'Rail Madad', icon: <RailMadadIcon />, link: 'https://railmadad.indianrailways.gov.in/madad/final/home.jsp' },
      { name: 'Link Aadhaar', icon: <AadhaarIcon />, link: 'https://www.irctc.co.in/nget/user-registration/signup?aadhaar_ver=Y' },
    ];

    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 text-center">Train Utilities</h3>
        <p className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <IrctcPartnerIcon /> Authorized IRCTC Partner
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {utilities.map(util => (
            <a
              key={util.name}
              href={util.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {util.icon}
              <span className="mt-2 text-xs font-semibold text-center text-gray-700 dark:text-gray-300">{util.name}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };
  
  if (!tripDetails) {
    return (
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 max-w-2xl mx-auto">
          <div className="flex justify-center text-orange-500 mb-4 text-5xl">
            📅
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Set Your Trip Duration First</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
              Please go to the 'Itinerary' section to set the start and end dates for your trip. This will unlock the booking forms.
          </p>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton label="Hotel" value="Hotel" icon="🏨" />
          <TabButton label="Flight" value="Flight" icon="✈️" />
          <TabButton label="Train" value="Train" icon="🚂" />
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'Hotel' && (
            <div className="p-6 space-y-4">
                <div ref={locationInputRef} className="relative">
                    <label htmlFor="location" className="label-style">Location</label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Mumbai" className="input-field" autoComplete="off"/>
                    {isFetchingHotels && <p className="text-xs text-gray-500 mt-1">Searching for hotels...</p>}
                    {hotelFetchError && <p className="text-xs text-red-500 mt-1">{hotelFetchError}</p>}
                    {showSuggestions && hotelSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            <ul>
                                {hotelSuggestions.map((s, i) => (
                                    <li key={i} onClick={() => handleSuggestionClick(s.name)} className="px-4 py-2 hover:bg-orange-100 dark:hover:bg-gray-800 cursor-pointer">
                                        <p className="font-semibold text-gray-800 dark:text-white">{s.name}</p>
                                        <p className="text-sm text-gray-500">{s.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              <div>
                <label htmlFor="hotelName" className="label-style">Hotel Name</label>
                <input type="text" id="hotelName" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="e.g., The Taj Palace" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkInDate" className="label-style">Check-in Date</label>
                  <input type="date" id="checkInDate" value={checkInDate} onChange={e => handleCheckInChange(e.target.value)} className="input-field" min={tripDetails?.startDate} max={tripDetails?.endDate}/>
                </div>
                <div>
                  <label htmlFor="checkOutDate" className="label-style">Check-out Date</label>
                  <input type="date" id="checkOutDate" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="input-field" min={checkInDate || tripDetails?.startDate} max={tripDetails?.endDate}/>
                </div>
              </div>
            </div>
          )}

          {type === 'Flight' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="flightNumber" className="label-style">Flight Number</label>
                  <input type="text" id="flightNumber" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g., 6E 204" className="input-field" />
                </div>
                <div>
                  <label htmlFor="flightDate" className="label-style">Date</label>
                  <input type="date" id="flightDate" value={flightDate} onChange={e => setFlightDate(e.target.value)} className="input-field" min={tripDetails?.startDate} max={tripDetails?.endDate}/>
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="departureAirport" className="label-style">Departure Airport (IATA)</label>
                  <input type="text" id="departureAirport" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} placeholder="e.g., DEL" className="input-field" />
                </div>
                <div>
                  <label htmlFor="arrivalAirport" className="label-style">Arrival Airport (IATA)</label>
                  <input type="text" id="arrivalAirport" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} placeholder="e.g., BOM" className="input-field" />
                </div>
              </div>
               <div>
                  <label htmlFor="flightTime" className="label-style">Departure Time</label>
                  <input type="time" id="flightTime" value={flightTime} onChange={e => setFlightTime(e.target.value)} className="input-field"/>
                </div>
            </div>
          )}

          {type === 'Train' && (
            <div className="p-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="trainNumber" className="label-style">Train No. or Name</label>
                            <input type="text" id="trainNumber" value={trainNumber} onChange={e => setTrainNumber(e.target.value)} placeholder="e.g., 12001 Shatabdi" className="input-field" />
                        </div>
                        <div>
                            <label htmlFor="trainDate" className="label-style">Date of Journey</label>
                            <input type="date" id="trainDate" value={trainDate} onChange={e => setTrainDate(e.target.value)} className="input-field" min={tripDetails?.startDate} max={tripDetails?.endDate}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="departureStation" className="label-style">Departure Station</label>
                            <input type="text" id="departureStation" value={departureStation} onChange={e => setDepartureStation(e.target.value.toUpperCase())} placeholder="e.g., NDLS" className="input-field" />
                        </div>
                        <div>
                            <label htmlFor="arrivalStation" className="label-style">Arrival Station</label>
                            <input type="text" id="arrivalStation" value={arrivalStation} onChange={e => setArrivalStation(e.target.value.toUpperCase())} placeholder="e.g., BCT" className="input-field" />
                        </div>
                    </div>
                </div>
                <TrainUtilities />
            </div>
          )}

          {type === 'Hotel' && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make this a recurring booking</span>
                </label>
                {isRecurring && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recurrencePattern" className="label-style">Repeats</label>
                            <select id="recurrencePattern" value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as any)} className="input-field w-full">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recurrenceEndDate" className="label-style">Until</label>
                            <input type="date" id="recurrenceEndDate" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} className="input-field w-full" 
                                min={checkInDate || tripDetails?.startDate}
                                max={tripDetails?.endDate}
                            />
                        </div>
                    </div>
                )}
            </div>
          )}
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {feedback && <p className={`text-center text-sm mb-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{feedback}</p>}
            {confirmation && (
                <div className="text-center mb-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="font-bold text-green-700 dark:text-green-300">{confirmation.message}</p>
                    {confirmation.details && <p className="text-sm text-green-600 dark:text-green-400">{confirmation.details}</p>}
                </div>
            )}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
            >
              Add to Itinerary
            </button>
          </div>
        </form>
      </div>
       <style>{`
        .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
        .dark .label-style { color: #D1D5DB; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; transition: border-color 0.2s, box-shadow 0.2s; }
        .dark .input-field { background-color: #374151; border-color: #4B5563; color: #F3F4F6; }
        .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 2px #FDBA74; }
      `}</style>
    </div>
  );
};

export default Booking;