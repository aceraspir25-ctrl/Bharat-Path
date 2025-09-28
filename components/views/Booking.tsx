import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Booking as BookingType, AIBookingSuggestion } from '../../types';
import { parseTravelDetails, getHotelSuggestions, parseDate } from '../../services/geminiService';
import { ExternalLinkIcon, TrainIconSimple, IrctcPartnerIcon, PnrIcon, LiveTrainIcon, TrainScheduleIcon, CoachPositionIcon, OrderFoodIcon, RailMadadIcon, AadhaarIcon } from '../icons/Icons';

const AIDateInput: React.FC<{
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}> = ({ label, id, value, onChange, placeholder, className }) => {
    const [isParsingDate, setIsParsingDate] = useState(false);
    const [dateParseError, setDateParseError] = useState('');

    const handleParseDate = async () => {
        // Don't parse if empty or already in YYYY-MM-DD format
        if (!value.trim() || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return;
        }

        setIsParsingDate(true);
        setDateParseError('');
        try {
            const parsedDate = await parseDate(value);
            if (parsedDate) {
                onChange(parsedDate);
            } else {
                setDateParseError('Could not understand date.');
            }
        } catch (error: any) {
            setDateParseError(error.message);
        } finally {
            setIsParsingDate(false);
        }
    };
    
    // Clear error message after a while
    useEffect(() => {
        if (dateParseError) {
            const timer = setTimeout(() => setDateParseError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [dateParseError]);

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onBlur={handleParseDate} // Parse on blur for convenience
                    placeholder={placeholder || "YYYY-MM-DD or 'tomorrow'"}
                    className="input-field pr-10 w-full"
                />
                <button
                    type="button"
                    onClick={handleParseDate}
                    disabled={isParsingDate}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-orange-500 disabled:cursor-not-allowed"
                    aria-label="Parse date with AI"
                >
                    {isParsingDate ? (
                        <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <span title="Parse date with AI">✨</span>
                    )}
                </button>
            </div>
            {dateParseError && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{dateParseError}</p>}
        </div>
    );
};

const Booking: React.FC = () => {
  const [bookings, setBookings] = useLocalStorage<BookingType[]>('bookings', []);
  const [type, setType] = useState<'Hotel' | 'Flight' | 'Train' | 'Activity'>('Hotel');
  
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
  
  // Activity State
  const [activityDetails, setActivityDetails] = useState('');
  const [activityDate, setActivityDate] = useState('');

  // AI Parser State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

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
            const suggestions = await getHotelSuggestions(loc);
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
  }, [location, type]);

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
      setActivityDetails(''); setActivityDate('');
      setAiInput('');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
  }

  const resetForms = () => {
    clearFormFields();
    setParseError('');
  };

  const handleSuggestionClick = (name: string) => {
    setHotelName(name);
    setShowSuggestions(false);
  };

  const handleParseDetails = async () => {
      if (!aiInput.trim() || (type !== 'Flight' && type !== 'Train')) return;
      
      setIsParsing(true);
      setParseError('');
      try {
          const result = await parseTravelDetails(aiInput, 'Flight'); // Only flight has this now
          
          const hasEnoughData = Object.values(result).filter(val => !!val).length >= 2;
          if (!hasEnoughData) {
              setParseError("Could not extract enough information. Please be more specific or fill out the form manually.");
              setIsParsing(false);
              return;
          }

          setFlightNumber(result.number || '');
          setDepartureAirport(result.departureAirport || '');
          setArrivalAirport(result.arrivalAirport || '');
          setFlightDate(result.date || '');

      } catch (error: any) {
          setParseError(error.message);
      } finally {
          setIsParsing(false);
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    setIsError(false);
    setParseError('');

    if (isRecurring && (type === 'Hotel' || type === 'Activity')) {
        const startDateString = type === 'Hotel' ? checkInDate : activityDate;
        const details = type === 'Hotel' ? `${hotelName}, ${location}` : activityDetails;

        if ((type === 'Hotel' && (!hotelName || !location)) || (type === 'Activity' && !activityDetails)) {
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
      const dateForDisplay = new Date(newBooking.date + 'T00:00:00');
      setConfirmation({
        message: 'Booking Added Successfully!',
        details: `${newBooking.type}: ${newBooking.details} on ${dateForDisplay.toLocaleDateString()}`
      });
      setTimeout(() => setConfirmation(null), 5000);
      resetForms();
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

  const AITravelParser: React.FC<{placeholder: string}> = ({ placeholder }) => (
      <div className="space-y-3 p-4 bg-orange-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <label htmlFor="aiInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Describe your booking details</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
                id="aiInput"
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isParsing && handleParseDetails()}
                placeholder={placeholder}
                className="input-field flex-grow"
                disabled={isParsing}
            />
            <button 
                type="button" 
                onClick={handleParseDetails}
                disabled={isParsing || !aiInput.trim()}
                className="w-full sm:w-auto bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isParsing ? (
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <span className="mr-2">✨</span>}
                Analyze with AI
            </button>
          </div>
          {parseError && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{parseError}</p>}
      </div>
  );

  const renderHotelForm = () => (
    <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative" ref={locationInputRef}>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., New Delhi" className="input-field" />
                {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                       {isFetchingHotels ? (
                           <div className="p-3 text-sm text-gray-500">Fetching hotels...</div>
                       ) : hotelFetchError ? (
                           <div className="p-3 text-sm text-red-500">{hotelFetchError}</div>
                       ) : (
                        hotelSuggestions.map((s, i) => (
                            <button key={i} type="button" onClick={() => handleSuggestionClick(s.name)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                {s.name}
                            </button>
                        ))
                       )}
                    </div>
                )}
            </div>
            <div>
                <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hotel Name</label>
                <input type="text" id="hotelName" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="e.g., The Taj Mahal Palace" className="input-field" />
            </div>
            <AIDateInput label="Check-in Date" id="checkInDate" value={checkInDate} onChange={setCheckInDate} className="w-full" />
            <AIDateInput label="Check-out Date (Optional)" id="checkOutDate" value={checkOutDate} onChange={setCheckOutDate} className="w-full" />
        </div>
        <a 
            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location + " " + hotelName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center"
        >
            Book on Booking.com <ExternalLinkIcon className="w-5 h-5 ml-2"/>
        </a>
    </div>
  );

  const renderFlightForm = () => (
    <>
      <AITravelParser placeholder="e.g., Indigo flight 6E-204 from Delhi to Mumbai tomorrow"/>
      <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Flight Number</label>
                  <input type="text" id="flightNumber" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g., 6E-204" className="input-field" />
              </div>
              <div/>
              <div>
                  <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departure Airport</label>
                  <input type="text" id="departureAirport" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} placeholder="e.g., DEL" className="input-field" />
              </div>
              <div>
                  <label htmlFor="arrivalAirport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arrival Airport</label>
                  <input type="text" id="arrivalAirport" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} placeholder="e.g., BOM" className="input-field" />
              </div>
              <AIDateInput label="Date" id="flightDate" value={flightDate} onChange={setFlightDate} className="w-full" />
              <div>
                  <label htmlFor="flightTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                  <input type="time" id="flightTime" value={flightTime} onChange={e => setFlightTime(e.target.value)} className="input-field" />
              </div>
          </div>
           <a 
                href={departureAirport && arrivalAirport && flightDate ? `https://www.goindigo.in/booking/flight-select.html?or=${encodeURIComponent(departureAirport)}&dn=${encodeURIComponent(arrivalAirport)}&pax=1&pt=one-way&d1=${encodeURIComponent(flightDate)}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (!departureAirport || !arrivalAirport || !flightDate) e.preventDefault(); }}
                className={`mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center ${(!departureAirport || !arrivalAirport || !flightDate) && 'opacity-50 cursor-not-allowed'}`}
            >
                Book on Indigo <ExternalLinkIcon className="w-5 h-5 ml-2"/>
            </a>
      </div>
    </>
  );

  const renderTrainForm = () => {
    const getFormattedDate = (offset: number) => {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split('T')[0];
    };

    const handleSetDate = (offset: number) => {
        setTrainDate(getFormattedDate(offset));
    };

    const trainUtilities = [
      { icon: <PnrIcon />, title: 'Check PNR Status', action: () => alert('PNR Status check functionality is in development. Stay tuned!') },
      { icon: <LiveTrainIcon />, title: 'Live Train Status', action: () => alert('This feature is coming soon!') },
      { icon: <TrainScheduleIcon />, title: 'Train Schedule', action: () => alert('This feature is coming soon!') },
      { icon: <CoachPositionIcon />, title: 'Coach Position', action: () => alert('This feature is coming soon!') },
      { icon: <OrderFoodIcon />, title: 'Order Food', action: () => alert('This feature is coming soon!') },
      { icon: <RailMadadIcon />, title: 'Rail Madad', action: () => alert('This feature is coming soon!') },
      { icon: <AadhaarIcon />, title: 'Link Aadhaar', action: () => alert('This feature is coming soon!') },
    ];

    const HorizontalUtilityButton: React.FC<{icon: React.ReactNode, title: string, onClick: () => void}> = ({ icon, title, onClick }) => (
      <button type="button" onClick={onClick} className="flex flex-col items-center justify-start space-y-2 p-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex-shrink-0 w-24 h-28">
          {icon}
          <span className="h-10 flex items-center text-center">{title}</span>
      </button>
    );

    return (
        <div className="p-4 space-y-5 bg-gray-50 dark:bg-gray-900/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 space-y-2">
                    <div className="flex items-center space-x-3">
                        <TrainIconSimple />
                        <input type="text" value={departureStation} onChange={e => setDepartureStation(e.target.value)} placeholder="From" className="flex-1 bg-transparent focus:outline-none dark:text-white" />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                    <div className="flex items-center space-x-3">
                        <TrainIconSimple />
                        <input type="text" value={arrivalStation} onChange={e => setArrivalStation(e.target.value)} placeholder="To" className="flex-1 bg-transparent focus:outline-none dark:text-white" />
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Date of Journey</label>
                            <AIDateInput label="Date" id="trainDate" value={trainDate} onChange={setTrainDate} className="w-full sm:w-48" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button type="button" onClick={() => handleSetDate(1)} className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-500 hover:border-red-400 transition-colors">Tomorrow</button>
                            <button type="button" onClick={() => handleSetDate(2)} className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-500 hover:border-red-400 transition-colors">Day After</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                        {trainUtilities.map((util) => (
                            <HorizontalUtilityButton key={util.title} icon={util.icon} title={util.title} onClick={util.action} />
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <input type="text" id="trainNumber" value={trainNumber} onChange={e => setTrainNumber(e.target.value)} placeholder="Train Number or Name (Optional)" className="w-full bg-transparent focus:outline-none dark:text-white" />
                </div>
            </div>
            <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center"
            >
                Book on IRCTC <ExternalLinkIcon className="w-5 h-5 ml-2"/>
            </a>
        </div>
    );
  };


  const renderActivityForm = () => (
    <div className="p-6 space-y-4">
      <div>
        <label htmlFor="activityDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Details</label>
        <textarea id="activityDetails" value={activityDetails} onChange={e => setActivityDetails(e.target.value)} rows={3} placeholder="e.g., Taj Mahal guided tour" className="input-field"></textarea>
      </div>
      <AIDateInput label="Date" id="activityDate" value={activityDate} onChange={setActivityDate} className="w-full" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
        <style>{`
        .input-field {
            margin-top: 0.25rem;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .dark .input-field {
            background-color: #374151;
            border-color: #4B5563;
            color: #F3F4F6;
        }
        .input-field:focus {
            outline: none;
            border-color: #F97316;
            box-shadow: 0 0 0 2px #FDBA74;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Plan & Book Your Journey</h1>
      
      {confirmation && (
        <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-md mb-6 shadow-md animate-fadeIn" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
                </div>
                <div>
                    <p className="font-bold">{confirmation.message}</p>
                    {confirmation.details && <p className="text-sm">{confirmation.details}</p>}
                </div>
            </div>
        </div>
      )}

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Organize your travel details here. All saved bookings will be available offline in your Itinerary.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton label="Hotel" value="Hotel" icon="🏨" />
          <TabButton label="Flight" value="Flight" icon="✈️" />
          <TabButton label="Train" value="Train" icon="🚂" />
          <TabButton label="Activity" value="Activity" icon="🎟️" />
        </div>
        
        <form onSubmit={handleSubmit}>
            
              {type === 'Hotel' && renderHotelForm()}
              {type === 'Flight' && renderFlightForm()}
              {type === 'Train' && renderTrainForm()}
              {type === 'Activity' && renderActivityForm()}

            {(type === 'Hotel' || type === 'Activity') && (
                <div className="p-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label htmlFor="isRecurring" className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">
                                Make this a recurring booking
                            </label>
                        </div>
                        {isRecurring && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                            <div>
                                <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repeats</label>
                                <select
                                    id="recurrencePattern"
                                    value={recurrencePattern}
                                    onChange={(e) => setRecurrencePattern(e.target.value as any)}
                                    className="input-field"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <AIDateInput
                                label="Until"
                                id="recurrenceEndDate"
                                value={recurrenceEndDate}
                                onChange={setRecurrenceEndDate}
                                placeholder="e.g., end of next month"
                                className="w-full"
                            />
                        </div>
                        )}
                    </div>
                </div>
            )}
            
            {feedback && (
                <div className="px-6 pb-2 text-center text-sm font-medium">
                    <p className={isError ? 'text-red-500' : 'text-green-600'}>{feedback}</p>
                </div>
            )}
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                 <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors ${type === 'Train' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                    Add to Itinerary
                </button>
                 {type === 'Train' && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center space-x-2">
                        <IrctcPartnerIcon />
                        <span>IRCTC Authorised Partner</span>
                    </div>
                 )}
            </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;