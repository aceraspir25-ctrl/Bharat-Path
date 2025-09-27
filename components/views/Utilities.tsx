
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

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
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM11 7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-2 4a1 1 0 100 2h5a1 1 0 100-2H9z" clipRule="evenodd" /><path d="M4 7a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>
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


const Utilities: React.FC = () => {
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
      `}</style>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Travel Utilities</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Essential tools to make your travel smoother.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CurrencyConverter />
        <WeatherForecast />
        <Translator />
        <WorldClock />
      </div>
    </div>
  );
};

export default Utilities;
