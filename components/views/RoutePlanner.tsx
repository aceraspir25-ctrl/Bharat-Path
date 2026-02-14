
import React, { useState, useMemo } from 'react';
import { PlaceInfo, RouteDetails } from '../../types';
import { CompassIcon, RouteIcon, InfoIcon, GlobeIcon } from '../icons/Icons';
import { getPlaceInformation, getRouteDetails } from '../../services/geminiService';
// Added useUser import
import { useUser } from '../../contexts/UserContext';

type RoutePreference = 'fastest' | 'scenic' | 'cultural';

interface PathAnalysis {
    title: string;
    description: string;
    highlights: string[];
}

const RoutePlanner: React.FC = () => {
    // Added profile from context
    const { profile } = useUser();
    const [startPoint, setStartPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [result, setResult] = useState<PlaceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedPreference, setSelectedPreference] = useState<RoutePreference>('fastest');
    const [avoidTolls, setAvoidTolls] = useState(false);
    const [historicalFocus, setHistoricalFocus] = useState(false);

    const [routes, setRoutes] = useState<Record<RoutePreference, RouteDetails | null>>({
        fastest: null,
        scenic: null,
        cultural: null
    });
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);
    const [routeError, setRouteError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setRoutes({ fastest: null, scenic: null, cultural: null });
        setRouteError(null);

        try {
            // Get info about the destination for contextual insights
            // Fixed: Pass profile to getPlaceInformation
            const info = await getPlaceInformation(destination, profile);
            setResult(info);
            // After getting info, automatically trigger route generation
            handleGetDirections(startPoint || 'Current Location', destination);
        } catch (err: any) {
            setError(err.message || 'Could not find information for this destination.');
            // Fallback: try directions even if info fails
            handleGetDirections(startPoint || 'Current Location', destination);
        } finally {
            setLoading(false);
        }
    };

    const handleGetDirections = (start: string, dest: string) => {
        setIsFetchingRoute(true);
        setRouteError(null);

        const fetchRoute = (startVal: string | { lat: number; lon: number }) => {
            // Fixed: Pass profile to getRouteDetails as 4th argument
            getRouteDetails(startVal, dest, selectedPreference, profile, { avoidTolls, historicalFocus })
                .then(details => {
                    setRoutes(prev => ({ ...prev, [selectedPreference]: details }));
                })
                .catch(err => {
                    setRouteError(err.message || `Could not fetch the ${selectedPreference} route.`);
                })
                .finally(() => {
                    setIsFetchingRoute(false);
                });
        };

        if (!startPoint.trim()) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchRoute({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    () => {
                        setRouteError(`Geolocation required for "My Location". Please enter a starting point manually.`);
                        setIsFetchingRoute(false);
                    }
                );
            } else {
                setRouteError("Geolocation is not supported by your browser.");
                setIsFetchingRoute(false);
            }
        } else {
            fetchRoute(start);
        }
    };

    const pathAnalyses: Record<RoutePreference, PathAnalysis> = {
        fastest: {
            title: "Global Velocity",
            description: "Optimized for speed using the world's most efficient highways and transit corridors.",
            highlights: ["Autobahn Protocol", "Transit Sync", "Express Route Priority"]
        },
        scenic: {
            title: "Global Nature",
            description: "Visually stunning paths crossing natural wonders, rivers, and coastal highways.",
            highlights: ["Panoramic Overlooks", "River Trails", "Eco-sensitive Routes"]
        },
        cultural: {
            title: "Global Heritage",
            description: "A path through history, touching ancient temples, gothic churches, and vibrant local bazaars.",
            highlights: ["UNESCO Path Access", "Religious Hubs", "Historic Districts"]
        }
    };

    const StrategyButton: React.FC<{ pref: RoutePreference, icon: string, label: string }> = ({ pref, icon, label }) => (
        <button
            type="button"
            onClick={() => {
                setSelectedPreference(pref);
                if (destination) handleGetDirections(startPoint || 'Current Location', destination);
            }}
            className={`group flex-1 p-5 rounded-[2rem] border-2 transition-all text-center relative overflow-hidden ${
                selectedPreference === pref 
                ? 'border-orange-500 bg-orange-500 text-white shadow-xl shadow-orange-500/20' 
                : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1c2e] hover:border-orange-500/30'
            }`}
        >
            <div className={`text-3xl mb-2 transition-transform duration-500 ${selectedPreference === pref ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
            <p className={`font-black text-xs uppercase tracking-widest ${selectedPreference === pref ? 'text-white' : 'text-gray-900 dark:text-gray-200'}`}>{label}</p>
            {routes[pref] && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]"></div>
            )}
        </button>
    );

    const RouteDisplay: React.FC<{ route: RouteDetails; pref: RoutePreference }> = ({ route, pref }) => (
        <div className="mt-12 space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Active Global Selection</p>
                    <h5 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <RouteIcon /> {pathAnalyses[pref].title}
                    </h5>
                    <p className="mt-2 text-blue-100 font-medium max-w-lg leading-relaxed">{pathAnalyses[pref].description}</p>
                    <div className="mt-4 flex gap-4">
                        {avoidTolls && <span className="bg-amber-400 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase">No Tolls</span>}
                        {historicalFocus && <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Heritage Locked</span>}
                    </div>
                </div>
                <div className="relative z-10 flex flex-wrap gap-2 justify-center">
                    {pathAnalyses[pref].highlights.map((h, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {h}
                        </span>
                    ))}
                </div>
                <div className="absolute -right-10 -bottom-10 text-[15rem] opacity-5 pointer-events-none rotate-12 select-none">🌍</div>
            </div>

            <div className="space-y-6">
                <ol className="relative border-l-2 border-orange-500/30 space-y-10 pl-10 ml-4">
                    {route.map((step, index) => (
                        <li key={index} className="relative group/step">
                            <div className="absolute w-8 h-8 bg-white dark:bg-[#1a1c2e] border-2 border-orange-500 rounded-full -left-[57px] shadow-lg flex items-center justify-center transition-all group-hover/step:scale-110 group-hover/step:bg-orange-500">
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-black group-hover/step:text-white">{index + 1}</span>
                            </div>
                            <div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                                <p className="font-black text-gray-800 dark:text-white text-xl tracking-tight leading-tight">{step.instruction}</p>
                                <div className="mt-4 flex items-center gap-6">
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                                        <span className="text-sm">📏</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{step.distance || '---'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                                        <span className="text-sm">⏱️</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{step.duration || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-500/10 rounded-[2.5rem] mb-6 text-orange-600 shadow-inner">
                    <RouteIcon />
                </div>
                <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Global Path Planner</h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Universal AI-Optimized Routing</p>
            </div>

            <div className="bg-white dark:bg-[#1a1c2e] p-10 md:p-14 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-white/5">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight flex items-center gap-4">
                    <CompassIcon /> <span>MAP YOUR JOURNEY</span>
                </h3>
                
                <form onSubmit={handleSearch} className="space-y-6 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                value={startPoint}
                                onChange={(e) => setStartPoint(e.target.value)}
                                placeholder="Starting Point (blank for My Location)"
                                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1c2e] text-gray-800 dark:text-white font-bold transition-all outline-none text-lg shadow-inner"
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                📍
                            </div>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="Destination (e.g., Paris, Tokyo...)"
                                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-[#111222] border-2 border-transparent rounded-[2rem] focus:border-orange-500 focus:bg-white dark:focus:bg-[#1a1c2e] text-gray-800 dark:text-white font-bold transition-all outline-none text-lg shadow-inner"
                                required
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                <GlobeIcon />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !destination.trim()} 
                        className="w-full bg-orange-500 text-white font-black py-6 rounded-[2.5rem] hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-500/20 active:scale-95 uppercase tracking-[0.2em] text-lg flex items-center justify-center gap-4"
                    >
                        {loading ? (
                             <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <RouteIcon className="w-6 h-6" />
                                <span>Calculate Global Path</span>
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 mb-8 text-center font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-12">
                    <div className="flex items-center gap-4 px-2">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Path Modifiers</h5>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setAvoidTolls(!avoidTolls)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${avoidTolls ? 'border-orange-500 bg-orange-500/10 text-orange-600' : 'border-gray-100 dark:border-white/5 text-gray-500'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">🚫 No Toll Roads</span>
                            <div className={`w-4 h-4 rounded-full border-2 ${avoidTolls ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}></div>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setHistoricalFocus(!historicalFocus)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${historicalFocus ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-100 dark:border-white/5 text-gray-500'}`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">🏛️ Max Heritage & Sites</span>
                            <div className={`w-4 h-4 rounded-full border-2 ${historicalFocus ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center gap-4 px-2 pt-4">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Route Strategy</h5>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StrategyButton pref="fastest" icon="⚡" label="Fastest" />
                        <StrategyButton pref="scenic" icon="🏔️" label="Scenic" />
                        <StrategyButton pref="cultural" icon="⛪" label="Heritage" />
                    </div>
                </div>

                {result && (
                    <div className="mt-12 space-y-12 animate-fadeIn">
                        <div className="bg-gradient-to-br from-[#1a1c2e] to-[#111222] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                            <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter">Insights: {destination}</h4>
                            <p className="text-gray-400 leading-relaxed font-medium text-lg border-l-4 border-orange-500 pl-8 italic">{result.history}</p>
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-black rotate-12 select-none pointer-events-none">AI</div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-[#111222] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5">
                                <h5 className="font-black text-lg text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                    🗺️ Destination Vitals
                                </h5>
                                <ul className="space-y-4">
                                    {result.attractions.map(attraction => (
                                        <li key={attraction.name} className="flex flex-col gap-1.5 group/attr">
                                            <strong className="text-gray-800 dark:text-white group-hover/attr:text-orange-500 transition-colors uppercase text-sm tracking-tight">{attraction.name}</strong>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{attraction.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-orange-500/5 p-8 rounded-[3rem] border border-orange-500/10 flex flex-col justify-between">
                                <div>
                                    <h5 className="font-black text-lg text-orange-600 dark:text-orange-400 mb-6 uppercase tracking-tight flex items-center gap-3">
                                        💡 Local Wisdom
                                    </h5>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium italic border-l-2 border-orange-500/30 pl-6">{result.customs}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {routeError && (
                    <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 rounded-[2rem] border border-yellow-100 dark:border-yellow-900/30 text-center font-bold">
                        {routeError}
                    </div>
                )}
                
                {isFetchingRoute && !routeError && (
                    <div className="mt-12 py-20 flex flex-col items-center justify-center space-y-6">
                        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synthesizing Global Path Data...</p>
                    </div>
                )}

                {routes[selectedPreference] && !isFetchingRoute && (
                    <RouteDisplay route={routes[selectedPreference]!} pref={selectedPreference} />
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .border-3 { border-width: 3px; }
            `}</style>
        </div>
    );
};

export default RoutePlanner;