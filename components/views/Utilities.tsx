
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Transaction } from '../../types';
import { PaymentIcon, MobileRechargeIcon, HistoryIcon, QRIcon } from '../icons/Icons';
import { translateText } from '../../services/geminiService';

// --- SMART TRANSPORT HUB COMPONENT --- //

const TransportCard: React.FC<{ icon: string; label: string; sub: string; link: string; color: string }> = ({ icon, label, sub, link, color }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-white dark:bg-[#1a1c2e] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
    >
        <div className={`absolute top-0 left-0 w-full h-1.5 ${color} opacity-80 group-hover:h-full group-hover:opacity-[0.03] transition-all duration-500`}></div>
        <div className="w-16 h-16 flex items-center justify-center bg-gray-50 dark:bg-[#111222] rounded-3xl mb-4 group-hover:rotate-6 transition-all duration-500 shadow-inner text-4xl">
            {icon}
        </div>
        <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">
            {label}
        </h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 group-hover:text-orange-500 transition-colors">
            {sub}
        </p>
        <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
            INSTANT BOOK ➔
        </div>
    </a>
);

const SmartTransportHub: React.FC = () => {
    const services = [
        { icon: '✈️', label: 'Sky Path', sub: 'Domestic & Int', link: 'https://www.indigo.in/', color: 'bg-blue-500' },
        { icon: '🚂', label: 'Rail Path', sub: 'IRCTC Connect', link: 'https://www.irctc.co.in/', color: 'bg-red-500' },
        { icon: '🚕', label: 'Cabs', sub: 'Uber / Ola', link: 'https://www.uber.com/in/en/', color: 'bg-yellow-500' },
        { icon: '🛺', label: 'Auto', sub: 'Local Transit', link: 'https://www.olacabs.com/', color: 'bg-green-500' },
        { icon: '🏍️', label: 'Bike', sub: 'Rapido / Ola', link: 'https://www.rapido.bike/', color: 'bg-orange-500' },
        { icon: '🚗', label: 'Car Rental', sub: 'Zoomcar / Revv', link: 'https://www.zoomcar.com/in/delhi', color: 'bg-indigo-500' },
    ];

    return (
        <div className="md:col-span-2 bg-white/50 dark:bg-[#111222]/30 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h3 className="font-black text-xl text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <span className="text-2xl">🚀</span> Smart Transport Hub
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Multi-Modal Path Logistics</p>
                </div>
                <div className="hidden sm:block text-[9px] font-black text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                    Authorized Gateway
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {services.map((s, i) => (
                    <TransportCard key={i} {...s} />
                ))}
            </div>
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
        <div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-[2.5rem] shadow-md border border-gray-200 dark:border-white/5">
            <h3 className="font-black text-lg text-orange-600 dark:text-orange-400 mb-4 uppercase tracking-tighter">Currency Converter</h3>
            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <div className="w-6 h-6 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 items-end">
                        <div className="space-y-1">
                            <label htmlFor="amount" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Amount</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-6 py-3 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none text-gray-800 dark:text-white font-bold transition-all"
                                min="0"
                            />
                        </div>
                         <div className="grid grid-cols-3 gap-2 items-center">
                            <div className="col-span-1">
                                <select id="from" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-3 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-orange-500 dark:text-white transition-all">
                                    {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button onClick={handleSwapCurrencies} className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-orange-500 hover:text-white focus:outline-none transition-all flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                            <div className="col-span-1">
                                <select id="to" value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-3 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-orange-500 dark:text-white transition-all">
                                     {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    {convertedAmount && (
                         <div className="text-center bg-gray-50 dark:bg-[#111222] p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{amount} {fromCurrency}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{convertedAmount} {toCurrency}</p>
                            <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-2">1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}</p>
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
         <div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-[2.5rem] shadow-md border border-gray-200 dark:border-white/5">
            <h3 className="font-black text-lg text-orange-600 dark:text-orange-400 mb-4 uppercase tracking-tighter">Weather Forecast</h3>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city..."
                    className="flex-grow px-5 py-2.5 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none text-gray-800 dark:text-white font-bold transition-all"
                />
                <button type="button" onClick={handleGeolocate} className="p-3 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-2xl hover:border-orange-500 text-gray-500 dark:text-gray-400 transition-all" aria-label="Use my location">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </button>
            </form>

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
            )}
            {error && !weather && <p className="text-center text-yellow-600 dark:text-yellow-400 py-8 font-bold">{error}</p>}

            {weather && (
                <div>
                    <div className="text-center border-b border-gray-100 dark:border-white/5 pb-6">
                        <h4 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">{weather.location.areaName}</h4>
                        <div className="flex items-center justify-center gap-4 my-4">
                            <span className="text-7xl drop-shadow-xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                            <div className="text-left">
                                <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{weather.current.temp_C}°</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{weather.current.weatherDesc}</p>
                            </div>
                        </div>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                             Feels {weather.current.feelsLikeC}° · Humidity {weather.current.humidity}% · Wind {weather.current.windspeedKmph}km/h
                         </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-6">
                        {weather.forecast.map((day, index) => (
                            <div key={day.date} className="bg-gray-50 dark:bg-[#111222] p-3 rounded-2xl">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                    {index === 0 ? 'Today' : index === 1 ? 'Tmrrw' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className="text-2xl my-2">{getWeatherIcon(day.weatherCode)}</p>
                                <p className="text-[10px] font-black text-gray-800 dark:text-white">{day.maxtempC}° / {day.mintempC}°</p>
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
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    const translate = async (text: string) => {
        if (!text.trim()) {
            setTranslatedText('');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Using the robust Gemini engine instead of an external API
            const result = await translateText(text, targetLang, sourceLang);
            setTranslatedText(result);
        } catch (err: any) {
            setError(err.message || 'Translation failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            translate(inputText);
        }, 800); // Slightly longer debounce for AI efficiency
        return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputText, sourceLang, targetLang]);
    
    const handleSwap = () => {
        if (sourceLang === 'auto') return;
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
            return;
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
        <div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-[2.5rem] shadow-md border border-gray-200 dark:border-white/5">
            <h3 className="font-black text-lg text-orange-600 dark:text-orange-400 mb-4 uppercase tracking-tighter">Bhasha Translator</h3>
            <div className="flex items-center space-x-2 mb-4">
                <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="lang-select">
                    <option value="auto">Auto-Detect</option>
                    {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
                <button onClick={handleSwap} className="p-2.5 bg-gray-50 dark:bg-[#111222] rounded-2xl hover:text-orange-500 transition-all disabled:opacity-50" disabled={sourceLang === 'auto'}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
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
                        rows={3} 
                        placeholder="Type text for AI translation..."
                        className="translator-textarea"
                    />
                    <button onClick={handleListen} className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-[#1a1c2e] text-gray-400 hover:text-orange-500'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="relative">
                     <textarea 
                        value={loading ? 'Linking AI path...' : translatedText} 
                        readOnly 
                        rows={3} 
                        placeholder="Result Path"
                        className={`translator-textarea font-black ${loading ? 'opacity-50 animate-pulse' : 'bg-gray-50 dark:bg-[#111222]'}`}
                    />
                    <button onClick={handleSpeak} disabled={!translatedText || loading} className="absolute bottom-3 right-3 p-2 rounded-xl bg-white dark:bg-[#1a1c2e] text-gray-400 hover:text-blue-500 transition-all disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.33 4.022a2 2 0 011.787 0l8 4.5a2 2 0 010 3.556l-8 4.5a2 2 0 01-2.667-1.778V5.8a2 2 0 01.88-1.778z" /></svg>
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 text-[10px] mt-2 font-bold">{error}</p>}
        </div>
    );
};

// --- WORLD CLOCK COMPONENT --- //

const timezones = [
    { value: 'America/New_York', label: 'New York' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Australia/Sydney', label: 'Sydney' },
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
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    
        const parts = formatter.formatToParts(time);
        const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';
    
        const locationName = (timezone === 'Asia/Kolkata' ? 'Bharat' : timezone.split('/').pop()?.replace('_', ' ')) || '';
        const timeStr = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
        const dayPeriod = getPart('dayPeriod');

        return (
            <div className="bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl flex justify-between items-center relative group">
                <div>
                    <h4 className="font-black text-gray-800 dark:text-white uppercase tracking-tighter">{locationName}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{timezone.split('/')[0]}</p>
                </div>
                <div className="text-right font-mono text-gray-900 dark:text-white flex items-baseline">
                    <p className="text-xl font-black">{timeStr}</p>
                    <p className="text-[10px] ml-1 uppercase font-black text-orange-500">{dayPeriod}</p>
                </div>
                {onRemove && (
                    <button
                        onClick={() => onRemove(timezone)}
                        className="absolute -top-1 -right-1 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                        &times;
                    </button>
                )}
            </div>
        );

    } catch (e) {
        return null;
    }
};

const WorldClock: React.FC = () => {
    const [selectedTimezones, setSelectedTimezones] = useLocalStorage<string[]>('world_clocks', []);
    const [newTimezone, setNewTimezone] = useState(timezones[0].value);

    const handleAddTimezone = () => {
        if (newTimezone && !selectedTimezones.includes(newTimezone) && selectedTimezones.length < 3) {
             setSelectedTimezones([...selectedTimezones, newTimezone]);
        }
    };

    const handleRemoveTimezone = (tzToRemove: string) => {
        setSelectedTimezones(selectedTimezones.filter(tz => tz !== tzToRemove));
    };

    return (
        <div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-[2.5rem] shadow-md border border-gray-200 dark:border-white/5">
            <h3 className="font-black text-lg text-orange-600 dark:text-orange-400 mb-4 uppercase tracking-tighter">Path Chrono</h3>
            
            <div className="space-y-3">
                <Clock timezone="Asia/Kolkata" />
                {selectedTimezones.map(tz => (
                    <Clock key={tz} timezone={tz} onRemove={handleRemoveTimezone} />
                ))}
            </div>

            {selectedTimezones.length < 3 && (
                <div className="flex gap-2 border-t border-gray-100 dark:border-white/5 pt-4 mt-4">
                    <select
                        value={newTimezone}
                        onChange={e => setNewTimezone(e.target.value)}
                        className="flex-grow bg-gray-50 dark:bg-[#111222] p-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-orange-500 dark:text-white"
                    >
                        {timezones.map(tz => (
                            <option key={tz.value} value={tz.value} disabled={selectedTimezones.includes(tz.value) || tz.value === 'Asia/Kolkata'}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddTimezone}
                        className="bg-orange-500 text-white font-black text-[10px] px-4 rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest"
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
                await videoRef.current.play();
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
                    animationFrameId.current = requestAnimationFrame(detect);
                }
            };
            
            detect();

        } catch (err) {
            setError('Could not access camera.');
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
                    throw new Error('QR missing payee address.');
                }
                
                setPaymentDetails({ name: payeeName, address: payeeAddress, amount: amount });
                if (amount) { setPaymentAmount(amount); }
                setIsConfirming(true);
            } catch (e: any) {
                setError(e.message || 'Invalid QR format.');
                setTimeout(() => setError(null), 4000);
                setScannedData(null);
            }
        }
    }, [scannedData]);

    const handleConfirmPayment = () => {
        if (!paymentDetails || !paymentAmount || parseFloat(paymentAmount) <= 0) return;
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
        <div className="md:col-span-2 bg-[#1a1c2e] p-8 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden group">
            {isScanning && (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
                    <video ref={videoRef} className="w-full max-w-md h-auto rounded-3xl" playsInline />
                    <button onClick={stopScan} className="mt-8 px-12 py-4 rounded-full font-black text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-widest text-xs">
                        Cancel Scan
                    </button>
                </div>
            )}
            {isConfirming && paymentDetails && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={handleCancelConfirmation}>
                    <div className="bg-white dark:bg-[#1a1c2e] rounded-[3rem] shadow-2xl w-full max-w-sm p-8 border border-white/5" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-tight">Confirm Bharat Pay</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payee</span>
                                <span className="font-bold text-gray-800 dark:text-white">{paymentDetails.name}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-4">
                                <label htmlFor="qrPaymentAmount" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Enter Amount (₹)</label>
                                <input
                                    type="number"
                                    id="qrPaymentAmount"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    readOnly={!!paymentDetails.amount}
                                    className="w-full text-center text-4xl font-black text-orange-500 bg-gray-50 dark:bg-[#111222] py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button onClick={handleCancelConfirmation} className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleConfirmPayment} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0} className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 transition-all shadow-xl shadow-orange-500/20">
                                Pay Path
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
                    <QRIcon /> <span>Path Scanner</span>
                </h3>
                <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed max-w-sm">
                    Bharat's unified interface for instant merchant settlement via UPI infrastructure.
                </p>
                <button onClick={startScan} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 px-4 rounded-[2rem] transition-all transform active:scale-98 flex items-center justify-center gap-4 shadow-2xl shadow-orange-500/20 uppercase tracking-widest text-xs">
                    <QRIcon /> <span>Launch Integrated Scanner</span>
                </button>
                {error && <p className="text-center text-xs text-red-500 mt-4 font-bold">{error}</p>}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-[10rem] font-black rotate-12 select-none pointer-events-none group-hover:rotate-0 transition-transform duration-1000">UPI</div>
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
            setFeedback('Parameters missing.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        setPaymentDetails({ category, consumerId, amount });
        setIsConfirming(true);
        setFeedback('');
    };

    const handleConfirmPayment = () => {
        if (!paymentDetails) return;

        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            type: 'Bill Payment',
            description: `${paymentDetails.category} for ${paymentDetails.consumerId}`,
            amount: parseFloat(paymentDetails.amount),
            date: new Date().toISOString(),
            status: 'Completed',
        };
        onNewTransaction(newTransaction);
        setFeedback('Path Securely Settled.');
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
        <div className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] shadow-xl border border-gray-200 dark:border-white/5">
            {isConfirming && paymentDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelConfirmation}>
                    <div className="bg-white dark:bg-[#1a1c2e] rounded-[3rem] p-8 max-w-sm w-full border border-white/5" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-tight">Confirm Bill Settlement</h4>
                        <div className="space-y-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between"><span>Type</span><span className="text-gray-900 dark:text-white">{paymentDetails.category}</span></div>
                            <div className="flex justify-between"><span>Registry ID</span><span className="text-gray-900 dark:text-white">{paymentDetails.consumerId}</span></div>
                            <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-4 mt-4">
                                <span className="text-lg uppercase">Amount</span>
                                <span className="text-2xl font-black text-orange-500 tracking-tighter">₹{parseFloat(paymentDetails.amount).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button onClick={handleCancelConfirmation} className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">Back</button>
                            <button onClick={handleConfirmPayment} className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white shadow-lg shadow-orange-500/20">Pay Hub</button>
                        </div>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-black text-orange-600 dark:text-orange-400 mb-6 uppercase tracking-tighter flex items-center gap-2">
                <PaymentIcon /> Bill Ledger
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Utility Sector</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-black outline-none border-2 border-transparent focus:border-orange-500 dark:text-white">
                        <option>Electricity</option><option>Water</option><option>Gas</option><option>Broadband</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Consumer Registry ID</label>
                    <input type="text" id="consumerId" value={consumerId} onChange={e => setConsumerId(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-orange-500 dark:text-white" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Settlement Amount (₹)</label>
                    <input type="number" id="paymentAmount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-bold outline-none border-2 border-transparent focus:border-orange-500 dark:text-white" min="1" />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 mt-2">Initialize Payment</button>
                {feedback && <p className="text-center text-[10px] text-green-500 font-bold uppercase mt-2">{feedback}</p>}
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
            window.open(operatorUrls[newOperator], '_blank');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !amount || phone.length < 10) {
            setFeedback('Valid ID required.');
            setTimeout(() => setFeedback(''), 3000);
            return;
        }
        window.open(operatorUrls[operator], '_blank');
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            type: 'Mobile Recharge',
            description: `Path Recharge: ${phone} (${operator})`,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            status: 'Pending',
        };
        onNewTransaction(newTransaction);
        setFeedback('Redirected to operator node.');
        setPhone(''); setAmount('');
        setTimeout(() => setFeedback(''), 5000);
    };
    
    const quickAmounts = [199, 499, 749, 999];

    return (
        <div className="bg-white dark:bg-[#1a1c2e] p-8 rounded-[3rem] shadow-xl border border-gray-200 dark:border-white/5">
            <h3 className="text-lg font-black text-orange-600 dark:text-orange-400 mb-6 uppercase tracking-tighter flex items-center gap-2">
                <MobileRechargeIcon /> Path Top-Up
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile No.</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-bold outline-none dark:text-white" maxLength={10} />
                    </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Network Node</label>
                        <select value={operator} onChange={handleOperatorChange} className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-black outline-none border-2 border-transparent focus:border-orange-500 dark:text-white">
                            <option>Jio</option><option>Airtel</option><option>Vodafone Idea</option><option>BSNL</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Path Pack (₹)</label>
                     <div className="grid grid-cols-4 gap-2 mb-3 mt-1">
                        {quickAmounts.map(amt => (
                            <button type="button" key={amt} onClick={() => setAmount(String(amt))} className={`py-2 text-[10px] font-black rounded-xl transition-all ${amount === String(amt) ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-50 dark:bg-[#111222] text-gray-500 dark:text-gray-400 hover:border-orange-500/20 border-2 border-transparent'}`}>₹{amt}</button>
                        ))}
                     </div>
                     <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Custom amount" className="w-full bg-gray-50 dark:bg-[#111222] p-4 rounded-2xl text-xs font-bold outline-none dark:text-white" min="10" />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 mt-2">Initialize Top-Up</button>
                {feedback && <p className="text-center text-[10px] text-green-500 font-bold uppercase mt-2">{feedback}</p>}
            </form>
        </div>
    );
};

// --- TRANSACTION HISTORY COMPONENT --- //
const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    return (
        <div className="md:col-span-2 bg-[#111222] p-8 rounded-[3rem] shadow-2xl border border-white/5">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <HistoryIcon /> <span>Path Transaction Log</span>
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {transactions.length > 0 ? (
                    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                        <div key={tx.id} className="flex items-center p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="mr-4 w-12 h-12 rounded-2xl bg-[#1a1c2e] flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform">
                                {tx.type === 'Mobile Recharge' ? <MobileRechargeIcon /> : tx.type === 'QR Payment' ? <QRIcon /> : <PaymentIcon />}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-black text-white uppercase tracking-tight">{tx.description}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white">₹{tx.amount.toFixed(2)}</p>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{tx.status}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-4xl opacity-10 mb-4">📜</div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Log Registry Empty</p>
                    </div>
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
    <div className="max-w-6xl mx-auto pb-24 animate-fadeIn">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Utility Matrix</h1>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] mt-2">Critical Path Infrastructure & Tools</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SmartTransportHub />
        <QRScannerPayment onNewTransaction={handleNewTransaction} />
        <CurrencyConverter />
        <WeatherForecast />
        <Translator />
        <WorldClock />
        <Payments onNewTransaction={handleNewTransaction} />
        <MobileRecharge onNewTransaction={handleNewTransaction} />
        <TransactionHistory transactions={transactions} />
      </div>

      <style>{`
        .lang-select {
            flex: 1; padding: 0.75rem; border-radius: 1rem; background-color: #f9fafb; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; outline: none; border: 2px solid transparent; transition: all 0.3s;
        }
        .dark .lang-select { background-color: #111222; color: #fff; }
        .lang-select:focus { border-color: #f97316; }
        .translator-textarea {
            width: 100%; padding: 1.25rem; border-radius: 1.5rem; background-color: #fff; border: 2px solid #f3f4f6; font-size: 0.875rem; font-weight: 600; outline: none; transition: all 0.3s; resize: none;
        }
        .dark .translator-textarea { background-color: #111222; border-color: transparent; color: #fff; }
        .translator-textarea:focus { border-color: #f97316; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Utilities;
