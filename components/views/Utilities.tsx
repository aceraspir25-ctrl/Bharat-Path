import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Transaction, PlaceInfo, RouteDetails } from '../../types';
import { PaymentIcon, MobileRechargeIcon, HistoryIcon, QRIcon, CompassIcon, RouteIcon } from '../icons/Icons';
import { getPlaceInformation, getRouteDetails } from '../../services/geminiService';


// --- PLACE FINDER COMPONENT --- //
const PlaceFinder: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<PlaceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New state for routing
    const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [startLocation, setStartLocation] = useState<{ lat: number; lon: number } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        // Reset route info on new search
        setRouteDetails(null);
        setRouteError(null);

        try {
            const info = await getPlaceInformation(query);
            setResult(info);
        } catch (err: any) {
            setError(err.message || 'Could not find information for this place.');
        } finally {
            setLoading(false);
        }
    };

     // New handler for getting directions
    const handleGetDirections = () => {
        if (!result) return;
        
        setIsFetchingRoute(true);
        setRouteError(null);
        setRouteDetails(null);

        const fetchRoute = (location: { lat: number; lon: number }) => {
            getRouteDetails(location, query)
                .then(details => {
                    setRouteDetails(details);
                })
                .catch(err => {
                    setRouteError(err.message || "Could not fetch route.");
                })
                .finally(() => {
                    setIsFetchingRoute(false);
                });
        };

        if (startLocation) {
            fetchRoute(startLocation);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        setStartLocation(location);
                        fetchRoute(location);
                    },
                    (geoError) => {
                        setRouteError(`Geolocation error: ${geoError.message}. Please enable location services.`);
                        setIsFetchingRoute(false);
                    }
                );
            } else {
                setRouteError("Geolocation is not supported by your browser.");
                setIsFetchingRoute(false);
            }
        }
    };

    // New component for displaying route details
    const RouteDisplay: React.FC<{ route: RouteDetails }> = ({ route }) => (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <RouteIcon /> <span className="ml-2">Directions to {query}</span>
            </h5>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4 pl-6">
                {route.map((step, index) => (
                    <li key={index} className="ml-4">
                        <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{step.instruction}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {step.distance && <span>{step.distance}</span>}
                            {step.distance && step.duration && <span className="mx-1">·</span>}
                            {step.duration && <span>{step.duration}</span>}
                        </p>
                    </li>
                ))}
            </ol>
        </div>
    );

    return (
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center">
                <CompassIcon /> <span className="ml-2">Place Finder</span>
            </h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Varanasi, Hampi, etc."
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <button type="submit" disabled={loading || !query.trim()} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-orange-300">
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            {loading && <p className="text-center text-gray-500 dark:text-gray-400 py-4">Finding place details...</p>}
            {error && <p className="text-center text-red-500 dark:text-red-400 py-4">{error}</p>}

            {result && (
                <div className="space-y-4 animate-fadeIn">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white border-b-2 border-orange-500 pb-2">About {query}</h4>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">History</h5>
                        <p className="text-gray-600 dark:text-gray-400">{result.history}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Attractions</h5>
                        <ul className="space-y-2">
                            {result.attractions.map(attraction => (
                                <li key={attraction.name} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <strong className="text-gray-800 dark:text-gray-200">{attraction.name}:</strong>
                                    <span className="text-gray-600 dark:text-gray-400 ml-1">{attraction.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Local Tip</h5>
                        <p className="text-gray-600 dark:text-gray-400">{result.customs}</p>
                    </div>

                    {/* New Directions Button */}
                    <div className="mt-4">
                        <button 
                            onClick={handleGetDirections} 
                            disabled={isFetchingRoute}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center disabled:bg-blue-300 transition-colors"
                        >
                            {isFetchingRoute ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Getting Directions...
                                </>
                            ) : (
                                <>
                                  <RouteIcon /> <span className="ml-2">Get Directions</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* New Route Display Area */}
                    {routeError && <p className="text-center text-sm text-red-500 dark:text-red-400 mt-2">{routeError}</p>}
                    {routeDetails && <RouteDisplay route={routeDetails} />}

                </div>
            )}
        </div>
    );
};


// --- CURRENCY CONVERTER COMPONENT --- //

const popularCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

const CurrencyConverter: React.FC = () => {
    const [amount, setAmount] = useState<number | string>(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('INR');
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) {
            setError("You are offline. Please connect to the internet to get live rates.");
            setIsLoading(false);
            return;
        }

        const fetchRates = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Using a free, no-key-required API for exchange rates
                const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch exchange rates.');
                }
                const data = await response.json();
                setRates(data.rates);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, [fromCurrency, isOnline]);

    useEffect(() => {
        if (rates[toCurrency]) {
            const rate = rates[toCurrency];
            const result = (Number(amount) * rate).toFixed(2);
            setConvertedAmount(result);
        } else {
            setConvertedAmount(null);
        }
    }, [amount, toCurrency, rates]);
    
    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const currencyOptions = rates ? Object.keys(rates).concat(fromCurrency).sort() : popularCurrencies;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4">Currency Converter</h3>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <p className="text-gray-500 dark:text-gray-400">Fetching live rates...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-1">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                                min="0"
                            />
                        </div>
                         <div className="sm:col-span-2 grid grid-cols-3 gap-2 items-center">
                            <div className="col-span-1">
                                <label htmlFor="from" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                                <select id="from" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="mt-1 w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600">
                                    {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button onClick={handleSwapCurrencies} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors self-end mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                            <div className="col-span-1">
                                <label htmlFor="to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                                <select id="to" value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="mt-1 w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600">
                                     {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    {convertedAmount && (
                         <div className="text-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <p className="text-gray-600 dark:text-gray-400">{amount} {fromCurrency} =</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{convertedAmount} {toCurrency}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- WEATHER FORECAST COMPONENT --- //

interface WeatherData {
    current: {
        temp_C: string;
        weatherDesc: string;
        weatherCode: string;
        feelsLikeC: string;
        humidity: string;
        windspeedKmph: string;
    };
    location: {
        areaName: string;
        region: string;
    };
    forecast: Array<{
        date: string;
        maxtempC: string;
        mintempC: string;
        weatherCode: string;
    }>;
}

const getWeatherIcon = (code: string) => {
    const weatherCode = parseInt(code, 10);
    if (weatherCode === 113) return '☀️'; // Sunny/Clear
    if ([116, 119, 122].includes(weatherCode)) return '☁️'; // Partly cloudy, Cloudy, Overcast
    if (weatherCode === 143) return '🌫️'; // Mist/Fog
    if ([176, 263, 266, 293, 296, 302, 308, 353, 356, 359].includes(weatherCode)) return '🌧️'; // Rain
    if ([200, 386, 389].includes(weatherCode)) return '⛈️'; // Thunder
    if ([179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371].includes(weatherCode)) return '❄️'; // Snow
    if ([248, 260].includes(weatherCode)) return '🌫️'; // Fog
    return '🌡️'; // Default
};

const WeatherForecast: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchWeather = async (location: string) => {
        setLoading(true);
        setError(null);
        setWeather(null);
        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
            if (!response.ok) {
                throw new Error('Location not found. Please try another city.');
            }
            const data = await response.json();
            
            if (!data.current_condition || !data.nearest_area) {
                throw new Error('Could not retrieve weather for this location.');
            }

            const formattedData: WeatherData = {
                current: {
                    temp_C: data.current_condition[0].temp_C,
                    weatherDesc: data.current_condition[0].weatherDesc[0].value,
                    weatherCode: data.current_condition[0].weatherCode,
                    feelsLikeC: data.current_condition[0].FeelsLikeC,
                    humidity: data.current_condition[0].humidity,
                    windspeedKmph: data.current_condition[0].windspeedKmph,
                },
                location: {
                    areaName: data.nearest_area[0].areaName[0].value,
                    region: data.nearest_area[0].region[0].value,
                },
                forecast: data.weather.map((day: any) => ({
                    date: day.date,
                    maxtempC: day.maxtempC,
                    mintempC: day.mintempC,
                    weatherCode: day.hourly[4].weatherCode, // Noon weather
                })),
            };
            setWeather(formattedData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGeolocate = () => {
        if (navigator.geolocation) {
            setLoading(true);
            setError("Getting your location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(`${latitude},${longitude}`);
                },
                () => {
                    setError('Location access denied. Searching for Delhi instead.');
                    fetchWeather('Delhi');
                }
            );
        } else {
             setError('Geolocation not supported. Searching for Delhi instead.');
             fetchWeather('Delhi');
        }
    };

    useEffect(() => {
        handleGeolocate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchWeather(searchQuery);
        }
    };

    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4">Weather Forecast</h3>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter a city..."
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <button type="button" onClick={handleGeolocate} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Use my location">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </button>
            </form>

            {loading && <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading weather...</p>}
            {error && !weather && <p className="text-center text-yellow-600 dark:text-yellow-400 py-8">{error}</p>}

            {weather && (
                <div>
                    {/* Current Weather */}
                    <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white">{weather.location.areaName}, {weather.location.region}</h4>
                        <div className="flex items-center justify-center gap-4 my-2">
                            <span className="text-6xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                            <div>
                                <p className="text-5xl font-bold text-gray-900 dark:text-white">{weather.current.temp_C}°C</p>
                                <p className="text-gray-500 dark:text-gray-400">{weather.current.weatherDesc}</p>
                            </div>
                        </div>
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                             Feels like {weather.current.feelsLikeC}°C · Humidity {weather.current.humidity}% · Wind {weather.current.windspeedKmph} km/h
                         </p>
                    </div>

                    {/* Forecast */}
                    <div className="grid grid-cols-3 gap-4 text-center pt-4">
                        {weather.forecast.map((day, index) => (
                            <div key={day.date}>
                                <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">
                                    {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className="text-3xl my-1">{getWeatherIcon(day.weatherCode)}</p>
                                <p className="text-sm text-gray-800 dark:text-white font-semibold">{day.maxtempC}° / {day.mintempC}°</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- LANGUAGE TRANSLATOR COMPONENT --- //
const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' }, { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' }, { code: 'mr', name: 'Marathi' },
    { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }, { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' }, { code: 'ar', name: 'Arabic' }
];

const Translator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('hi');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    const translate = async (text: string) => {
        if (!text.trim()) {
            setTranslatedText('');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const langPair = `${sourceLang}|${targetLang}`;
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`);
            const data = await response.json();
            if (data.responseStatus === 200) {
                setTranslatedText(data.responseData.translatedText);
            } else {
                throw new Error('Translation failed.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            translate(inputText);
        }, 500); // Debounce translation
        return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputText, sourceLang, targetLang]);
    
    const handleSwap = () => {
        if (sourceLang === 'auto') return; // Cannot swap 'auto'
        const temp = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(temp);
        setInputText(translatedText);
    };

    const handleSpeak = () => {
        if (translatedText && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            utterance.lang = targetLang;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleListen = () => {
        if (!SpeechRecognition) {
            setError("Voice recognition is not supported by your browser.");
            return;
        }
        
        if (isRecording) {
            return; // Already recording
        }

        const recognition = new SpeechRecognition();
        recognition.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
            setError(`Voice recognition error: ${event.error}`);
            setIsRecording(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
        };
        
        recognition.start();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4">Language Translator</h3>
            <div className="flex items-center space-x-2 mb-3">
                <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="lang-select">
                    <option value="auto">Auto-detect</option>
                    {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
                <button onClick={handleSwap} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={sourceLang === 'auto'}>
                   <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </button>
                <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="lang-select">
                    {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
            </div>
             <div className="space-y-3">
                <div className="relative">
                    <textarea 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)} 
                        rows={4} 
                        placeholder="Enter text..."
                        className="translator-textarea"
                    />
                    <button onClick={handleListen} className={`absolute bottom-2 right-2 p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="relative">
                     <textarea 
                        value={loading ? 'Translating...' : translatedText} 
                        readOnly 
                        rows={4} 
                        placeholder="Translation"
                        className="translator-textarea"
                    />
                    <button onClick={handleSpeak} disabled={!translatedText} className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.33 4.022a2 2 0 011.787 0l8 4.5a2 2 0 010 3.556l-8 4.5a2 2 0 01-2.667-1.778V5.8a2 2 0 01.88-1.778z" /></svg>
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
};

// --- WORLD CLOCK COMPONENT --- //

const timezones = [
    { value: 'America/New_York', label: 'New York (ET)' },
    { value: 'America/Chicago', label: 'Chicago (CT)' },
    { value: 'America/Denver', label: 'Denver (MT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

interface ClockProps {
    timezone: string;
    onRemove?: (timezone: string) => void;
}

const Clock: React.FC<ClockProps> = ({ timezone, onRemove }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        });
    
        const parts = formatter.formatToParts(time);
        const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';
    
        const locationName = (timezone === 'Asia/Kolkata' ? 'India' : timezone.split('/').pop()?.replace('_', ' ')) || '';
        const dateStr = `${getPart('month')} ${getPart('day')}`;
        const timeStr = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
        const dayPeriod = getPart('dayPeriod');
        const tzOffset = getPart('timeZoneName');

        return (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center relative transition-colors">
                <div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="font-bold text-gray-800 dark:text-white text-lg">{locationName}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{tzOffset}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dateStr}</p>
                </div>
                <div className="text-right font-mono text-gray-900 dark:text-white flex items-baseline">
                    <p className="text-2xl font-semibold">{timeStr}</p>
                    <p className="text-sm ml-1">{dayPeriod}</p>
                </div>
                {onRemove && (
                    <button
                        onClick={() => onRemove(timezone)}
                        className="absolute -top-1.5 -right-1.5 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                        aria-label={`Remove ${locationName} clock`}
                    >
                        &times;
                    </button>
                )}
            </div>
        );

    } catch (e) {
        console.error(`Invalid timezone: ${timezone}`);
        return null; // Don't render if timezone is invalid
    }
};

const WorldClock: React.FC = () => {
    const [selectedTimezones, setSelectedTimezones] = useLocalStorage<string[]>('world_clocks', []);
    const [newTimezone, setNewTimezone] = useState(timezones[0].value);

    const handleAddTimezone = () => {
        if (newTimezone && !selectedTimezones.includes(newTimezone) && selectedTimezones.length < 4) {
             setSelectedTimezones([...selectedTimezones, newTimezone]);
        }
    };

    const handleRemoveTimezone = (tzToRemove: string) => {
        setSelectedTimezones(selectedTimezones.filter(tz => tz !== tzToRemove));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4">World Clock</h3>
            
            <div className="space-y-3">
                <Clock timezone="Asia/Kolkata" />
                {selectedTimezones.map(tz => (
                    <Clock key={tz} timezone={tz} onRemove={handleRemoveTimezone} />
                ))}
            </div>

            {selectedTimezones.length < 4 && (
                <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <select
                        value={newTimezone}
                        onChange={e => setNewTimezone(e.target.value)}
                        className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                        {timezones.map(tz => (
                            <option key={tz.value} value={tz.value} disabled={selectedTimezones.includes(tz.value) || tz.value === 'Asia/Kolkata'}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddTimezone}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
};

// --- QR SCANNER PAYMENT COMPONENT --- //
const QRScannerPayment: React.FC<{ onNewTransaction: (transaction: Transaction) => void }> = ({ onNewTransaction }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<{ name: string; address: string; amount: string | null; } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const stopScan = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        setIsScanning(false);
    };

    const startScan = async () => {
        if (!('BarcodeDetector' in window)) {
            setError('QR code scanning is not supported by your browser.');
            return;
        }
        setIsScanning(true);
        setError(null);
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                await videoRef.current.play(); // Important for iOS
            }

            const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            
            const detect = async () => {
                if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
                try {
                    const barcodes = await barcodeDetector.detect(videoRef.current);
                    if (barcodes.length > 0 && barcodes[0].rawValue) {
                        setScannedData(barcodes[0].rawValue);
                        stopScan();
                    } else {
                        animationFrameId.current = requestAnimationFrame(detect);
                    }
                } catch (err) {
                    console.error("Barcode detection failed:", err);
                    animationFrameId.current = requestAnimationFrame(detect);
                }
            };
            
            detect();

        } catch (err) {
            setError('Could not access camera. Please check permissions.');
            setIsScanning(false);
        }
    };

    useEffect(() => {
        if (scannedData) {
            try {
                const url = new URL(scannedData);
                if (url.protocol !== 'upi:') {
                    throw new Error('Not a valid UPI QR code.');
                }
                const params = url.searchParams;
                const payeeName = params.get('pn') || 'Merchant';
                const payeeAddress = params.get('pa');
                const amount = params.get('am');

                if (!payeeAddress) {
                    throw new Error('QR code is missing a payee address.');
                }
                
                setPaymentDetails({ name: payeeName, address: payeeAddress, amount: amount });
                if (amount) { setPaymentAmount(amount); }
                setIsConfirming(true);
            } catch (e: any) {
                setError(e.message || 'Invalid or unsupported QR code format.');
                setTimeout(() => setError(null), 4000);
                setScannedData(null);
            }
        }
    }, [scannedData]);

    const handleConfirmPayment = () => {
        if (!paymentDetails || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            return;
        }
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            type: 'QR Payment',
            description: `Paid to ${paymentDetails.name}`,
            amount: parseFloat(paymentAmount),
            date: new Date().toISOString(),
            status: 'Completed',
        };
        onNewTransaction(newTransaction);
        handleCancelConfirmation();
    };

    const handleCancelConfirmation = () => {
        setIsConfirming(false);
        setPaymentDetails(null);
        setScannedData(null);
        setPaymentAmount('');
    };

    return (
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {isScanning && (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
                    <video ref={videoRef} className="w-full max-w-md h-auto rounded-lg" playsInline />
                    <button onClick={stopScan} className="mt-4 px-6 py-2 rounded-md font-medium text-white bg-red-500 hover:bg-red-600">
                        Cancel
                    </button>
                </div>
            )}
            {isConfirming && paymentDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCancelConfirmation}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm QR Payment</h4>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500 dark:text-gray-400">Paying to:</span>
                                <span className="font-semibold">{paymentDetails.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                                <label htmlFor="qrPaymentAmount" className="font-bold text-lg">Amount (₹):</label>
                                <input
                                    type="number"
                                    id="qrPaymentAmount"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    readOnly={!!paymentDetails.amount}
                                    className="w-32 text-right text-lg font-bold text-orange-600 dark:text-orange-400 bg-gray-100 dark:bg-gray-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleCancelConfirmation} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                                Cancel
                            </button>
                            <button onClick={handleConfirmPayment} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300">
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center">
                <QRIcon /> <span className="ml-2">Scan & Pay</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Make instant payments to merchants by scanning any UPI QR code.
            </p>
            <button onClick={startScan} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center">
                <QRIcon /> <span className="ml-2">Scan QR to Pay</span>
            </button>
            {error && <p className="text-center text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
        </div>
    );
};


// --- PAYMENT COMPONENT --- //
const Payments: React.FC<{ onNewTransaction: (transaction: Transaction) => void }> = ({ onNewTransaction }) => {
    const [category, setCategory] = useState('Electricity');
    const [consumerId, setConsumerId] = useState('');
    const [amount, setAmount] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<{ category: string; consumerId: string; amount: string; } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consumerId || !amount) {
            setFeedback('Please fill all fields.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        setPaymentDetails({ category, consumerId, amount });
        setIsConfirming(true);
        setFeedback(''); // Clear previous feedback
    };

    const handleConfirmPayment = () => {
        if (!paymentDetails) return;

        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            type: 'Bill Payment',
            description: `${paymentDetails.category} Bill for ${paymentDetails.consumerId}`,
            amount: parseFloat(paymentDetails.amount),
            date: new Date().toISOString(),
            status: 'Completed',
        };
        onNewTransaction(newTransaction);
        
        setFeedback('Payment successful!');
        setTimeout(() => setFeedback(''), 3000);

        setConsumerId('');
        setAmount('');
        setIsConfirming(false);
        setPaymentDetails(null);
    };

    const handleCancelConfirmation = () => {
        setIsConfirming(false);
        setPaymentDetails(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {isConfirming && paymentDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCancelConfirmation}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Payment</h4>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                                <span className="font-semibold">{paymentDetails.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500 dark:text-gray-400">Consumer ID:</span>
                                <span className="font-semibold">{paymentDetails.consumerId}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                                <span className="font-bold text-lg">Amount:</span>
                                <span className="font-bold text-lg text-orange-600 dark:text-orange-400">₹{parseFloat(paymentDetails.amount).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleCancelConfirmation} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                                Cancel
                            </button>
                            <button onClick={handleConfirmPayment} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600">
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center">
                <PaymentIcon /> <span className="ml-2">Bill Payments</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600">
                        <option>Electricity</option>
                        <option>Water</option>
                        <option>Gas</option>
                        <option>Broadband</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="consumerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Consumer ID</label>
                    <input type="text" id="consumerId" value={consumerId} onChange={e => setConsumerId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                    <input type="number" id="paymentAmount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600" min="1" />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Pay Bill</button>
                {feedback && <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">{feedback}</p>}
            </form>
        </div>
    );
};

// --- MOBILE RECHARGE COMPONENT --- //
const MobileRecharge: React.FC<{ onNewTransaction: (transaction: Transaction) => void }> = ({ onNewTransaction }) => {
    const [phone, setPhone] = useState('');
    const [operator, setOperator] = useState('Jio');
    const [amount, setAmount] = useState('');
    const [feedback, setFeedback] = useState('');

    const operatorUrls: { [key: string]: string } = {
        'Jio': 'https://www.jio.com/selfcare/recharge/mobility/',
        'Airtel': 'https://www.airtel.in/prepaid-recharge/',
        'Vodafone Idea': 'https://www.myvi.in/prepaid-recharge-online',
        'BSNL': 'https://portal2.bsnl.in/myportal/quickrecharge.do',
    };

    const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperator = e.target.value;
        setOperator(newOperator);

        if (phone.trim().length === 10) {
            const url = operatorUrls[newOperator];
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !amount || phone.length < 10) {
            setFeedback('Please enter a valid 10-digit number and amount.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }

        const url = operatorUrls[operator];
        if (url) {
            // Open the operator's website to complete the payment
            window.open(url, '_blank', 'noopener,noreferrer');

            // Log the transaction as pending
            const newTransaction: Transaction = {
                id: new Date().toISOString(),
                type: 'Mobile Recharge',
                description: `Recharge for ${phone} (${operator})`,
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                status: 'Pending',
            };
            onNewTransaction(newTransaction);
            setFeedback('Redirecting to complete payment. Transaction logged as pending.');
            
            // Reset form
            setPhone('');
            setAmount('');
            setTimeout(() => setFeedback(''), 5000);
        } else {
             setFeedback('Could not find a recharge link for the selected operator.');
             setTimeout(() => setFeedback(''), 3000);
        }
    };
    
    const quickAmounts = [199, 299, 499, 666];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center">
                <MobileRechargeIcon /> <span className="ml-2">Mobile Recharge</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600" maxLength={10} />
                    </div>
                     <div>
                        <label htmlFor="operator" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Operator</label>
                        <select id="operator" value={operator} onChange={handleOperatorChange} className="mt-1 w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600">
                            <option>Jio</option>
                            <option>Airtel</option>
                            <option>Vodafone Idea</option>
                            <option>BSNL</option>
                        </select>
                        {phone.trim().length === 10 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select an operator to go to their site.</p>}
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                     <div className="grid grid-cols-4 gap-2 mt-1">
                        {quickAmounts.map(amt => (
                            <button type="button" key={amt} onClick={() => setAmount(String(amt))} className={`p-2 border rounded-md transition-colors ${amount === String(amt) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>₹{amt}</button>
                        ))}
                     </div>
                     <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Or enter custom amount" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600" min="10" />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Recharge Now</button>
                {feedback && <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">{feedback}</p>}
            </form>
        </div>
    );
};

// --- TRANSACTION HISTORY COMPONENT --- //
const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const getStatusChip = (status: Transaction['status']) => {
        switch(status) {
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
    }

    return (
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4 flex items-center">
                <HistoryIcon /> <span className="ml-2">Transaction History</span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length > 0 ? (
                    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                        <div key={tx.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="mr-3 text-orange-500">
                                {tx.type === 'Mobile Recharge' ? <MobileRechargeIcon /> : tx.type === 'QR Payment' ? <QRIcon /> : <PaymentIcon />}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 dark:text-white">{tx.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">- ₹{tx.amount.toFixed(2)}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusChip(tx.status)}`}>{tx.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transaction history yet.</p>
                )}
            </div>
        </div>
    );
};


const Utilities: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

  const handleNewTransaction = (transaction: Transaction) => {
      setTransactions(prev => [...prev, transaction]);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        .lang-select {
            flex: 1; 
            padding: 0.5rem 0.75rem; 
            border: 1px solid #D1D5DB; 
            border-radius: 0.375rem; 
            background-color: white;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.25em 1.25em;
        }
        .dark .lang-select {
            background-color: #374151;
            border-color: #4B5563;
        }
        .translator-textarea {
            width: 100%; 
            padding: 0.75rem; 
            border: 1px solid #D1D5DB; 
            border-radius: 0.375rem;
        }
        .dark .translator-textarea {
            background-color: #4B5563;
            border-color: #6B7280;
            color: #D1D5DB;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Travel Utilities</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Essential tools to make your travel smoother.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlaceFinder />
        <QRScannerPayment onNewTransaction={handleNewTransaction} />
        <CurrencyConverter />
        <WeatherForecast />
        <Translator />
        <WorldClock />
        <Payments onNewTransaction={handleNewTransaction} />
        <MobileRecharge onNewTransaction={handleNewTransaction} />
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
};

export default Utilities;