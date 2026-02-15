
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useUser } from '../../contexts/UserContext';
import { PlaceInfo, MapMarker, View } from '../../types';
import { SearchIcon, CompassIcon, RouteIcon, MapIcon } from '../icons/Icons';
import { searchPlacesWithAI, getPlaceInformation } from '../../services/geminiService';

const MapView: React.FC<{ onAIService: (fn: () => Promise<any>) => Promise<any> }> = ({ onAIService }) => {
  const [theme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const { profile } = useUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingWisdom, setIsFetchingWisdom] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  // Initialize Map with proper resizing fix
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && window.L) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
      }).setView([20, 0], 2); // Initial global view
      
      const darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
      const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tilesUrl = document.documentElement.classList.contains('dark') ? darkTiles : lightTiles;

      const layer = L.tileLayer(tilesUrl, { maxZoom: 20 }).addTo(map);

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      
      // Fix for Leaflet initialization in containers
      setTimeout(() => {
          map.invalidateSize();
      }, 400);

      map.on('click', () => setSelectedMarkerId(null));
    }
    return () => { 
        if (mapInstanceRef.current) { 
            mapInstanceRef.current.remove(); 
            mapInstanceRef.current = null; 
        } 
    };
  }, []);

  // Update tiles when theme changes
  useEffect(() => {
      if (mapInstanceRef.current && tileLayerRef.current) {
          const darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
          const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          tileLayerRef.current.setUrl(document.documentElement.classList.contains('dark') ? darkTiles : lightTiles);
      }
  }, [theme]);

  const handleMarkerClick = useCallback(async (m: MapMarker) => {
    setSelectedMarkerId(m.id);
    setPlaceInfo(null);
    setIsFetchingWisdom(true);
    if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([m.lat, m.lng], 16, { 
            duration: 1.5,
            easeLinearity: 0.25
        });
    }
    try {
        const info = await onAIService(() => getPlaceInformation(m.name, profile));
        setPlaceInfo(info);
    } catch (err) {} finally { setIsFetchingWisdom(false); }
  }, [onAIService, profile]);

  // Render markers layer
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current && window.L) {
      const L = window.L;
      markersLayerRef.current.clearLayers();
      
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        
        markers.forEach(m => {
          const isSelected = m.id === selectedMarkerId;
          const marker = L.marker([m.lat, m.lng], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div class="marker-wrapper ${isSelected ? 'active' : ''}">
                    <div class="marker-pin shadow-2xl">
                        <span class="text-[10px]">📍</span>
                    </div>
                    ${isSelected ? '<div class="marker-aura"></div>' : ''}
                </div>
              `,
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })
          }).addTo(markersLayerRef.current);
          
          marker.on('click', (e: any) => { 
              L.DomEvent.stopPropagation(e); 
              handleMarkerClick(m); 
          });
        });

        if (!selectedMarkerId) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
        }
      }
    }
  }, [markers, selectedMarkerId, handleMarkerClick]);

  const handleSearch = async (queryOverride?: string) => {
    const finalQuery = queryOverride || searchQuery;
    if (!finalQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedMarkerId(null);
    
    // Use current map center to provide context to the AI search
    const center = mapInstanceRef.current?.getCenter();
    const contextCoords = center ? { lat: center.lat, lng: center.lng } : undefined;

    try {
        const res = await onAIService(() => searchPlacesWithAI(finalQuery, profile, contextCoords));
        if (res.markers && res.markers.length > 0) {
            setMarkers(res.markers);
        } else {
            setMarkers([]);
        }
    } catch (err) {} finally { setIsSearching(false); }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !window.L) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([latitude, longitude], 15);
            window.L.circle([latitude, longitude], {
                radius: 100,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.15
            }).addTo(mapInstanceRef.current);
            
            window.L.marker([latitude, longitude], { 
                icon: window.L.divIcon({ 
                    className: 'custom-div-icon', 
                    html: `<div class="user-beacon"></div>`, 
                    iconSize: [20, 20], 
                    iconAnchor: [10, 10] 
                }) 
            }).addTo(mapInstanceRef.current).bindPopup('You are here').openPopup();
        }
        setIsLocating(false);
    }, () => setIsLocating(false));
  };

  const categories = [
      { id: 'stores', label: 'Stores', icon: '🛒', query: 'Shops and supermarkets near here' },
      { id: 'food', label: 'Food', icon: '🥘', query: 'Great vegetarian food spots nearby' },
      { id: 'medical', label: 'Medical', icon: '🏥', query: 'Pharmacies and healthcare centers' },
      { id: 'stays', label: 'Stays', icon: '🏨', query: 'Popular hotels and guest houses here' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Spatial Intelligence</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] px-1">Universal Neural Mapping Protocol</p>
        </div>
        
        <div className="flex-1 max-w-2xl relative group">
            <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Find any city, village, or store worldwide..." 
                className="w-full bg-white dark:bg-[#1a1c2e] border-4 border-transparent dark:border-white/5 rounded-[2rem] py-5 px-14 text-gray-900 dark:text-white font-bold shadow-3xl focus:border-orange-500 outline-none transition-all text-lg" 
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div> : <SearchIcon className="w-6 h-6" />}
            </div>
            <button 
                onClick={() => handleSearch()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
            >
                UPLINK
            </button>
        </div>
      </header>

      {/* Category Quick Picks */}
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSearchQuery(cat.query); handleSearch(cat.query); }}
                className="flex items-center gap-3 bg-white dark:bg-[#1a1c2e] px-6 py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl hover:border-orange-500/50 transition-all group whitespace-nowrap active:scale-95"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">{cat.icon}</span>
                <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{cat.label}</span>
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
        {/* Left Side: Registry List */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col bg-white/60 dark:bg-[#111222]/80 backdrop-blur-xl rounded-[3.5rem] border border-gray-100 dark:border-white/5 shadow-3xl">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center justify-between">
                    Registry Results
                    <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black">{markers.length}</span>
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {markers.length > 0 ? markers.map(m => (
                    <button 
                        key={m.id} 
                        onClick={() => handleMarkerClick(m)} 
                        className={`w-full text-left p-6 rounded-3xl transition-all border-2 group/btn ${selectedMarkerId === m.id ? 'bg-orange-500 border-orange-500 text-white shadow-3xl' : 'bg-white dark:bg-[#1a1c2e] border-transparent text-gray-800 dark:text-gray-300 hover:bg-orange-500/5 hover:border-orange-500/20'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-black uppercase tracking-tight line-clamp-1 group-hover/btn:text-orange-500 transition-colors">{m.name}</span>
                            <span className="text-[9px] opacity-40">📍</span>
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 truncate">Neural Coordinate Sync</p>
                    </button>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner animate-pulse">🛰️</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">Search the world registry to populate spatial nodes.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Center: Main Map Engine */}
        <div className="lg:col-span-6 relative">
            <div className="w-full h-full rounded-[4rem] overflow-hidden shadow-4xl border-4 border-white/50 dark:border-white/5 bg-[#111222]">
                <div ref={mapContainerRef} className="w-full h-full z-0"></div>
                
                {/* Floating Map Controls */}
                <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-4">
                    <button 
                        onClick={handleLocateMe} 
                        className={`p-5 bg-white dark:bg-[#1a1c2e] rounded-3xl shadow-4xl text-blue-500 border border-gray-100 dark:border-white/10 hover:scale-110 transition-all ${isLocating ? 'animate-pulse' : ''}`}
                        title="Locate My Node"
                    >
                        <CompassIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => mapInstanceRef.current?.zoomIn()} 
                        className="p-4 bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-4xl text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/10 font-black text-xl hover:text-orange-500"
                    >
                        +
                    </button>
                    <button 
                        onClick={() => mapInstanceRef.current?.zoomOut()} 
                        className="p-4 bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-4xl text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/10 font-black text-xl hover:text-orange-500"
                    >
                        −
                    </button>
                </div>
            </div>
        </div>

        {/* Right Side: Wisdom Hub */}
        <div className="lg:col-span-3 h-full overflow-y-auto custom-scrollbar bg-white/60 dark:bg-[#111222]/80 backdrop-blur-xl rounded-[3.5rem] border border-gray-100 dark:border-white/5 shadow-3xl p-8 relative">
            {!selectedMarkerId ? (
                <div className="h-full flex flex-col justify-center items-center text-center opacity-40">
                    <div className="w-24 h-24 bg-orange-500/10 rounded-[2.5rem] flex items-center justify-center text-orange-500 text-5xl shadow-inner animate-bounceSubtle">🧭</div>
                    <h4 className="text-sm font-black uppercase mt-6 tracking-widest text-gray-500">Wisdom Hub</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 leading-relaxed">Select a spatial node to decode its historical and local metadata.</p>
                </div>
            ) : (
                <div className="animate-fadeIn space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Active Insight</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900 dark:text-white">{markers.find(m => m.id === selectedMarkerId)?.name}</h3>
                    </div>

                    {isFetchingWisdom ? (
                        <div className="py-24 flex flex-col items-center justify-center space-y-8">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">🧠</div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Decoding Wisdom...</p>
                        </div>
                    ) : placeInfo && (
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Historical Background</h4>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-orange-500/40 pl-6">{placeInfo.history}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Registry Highlights</h4>
                                <div className="space-y-3">
                                    {placeInfo.attractions.slice(0, 3).map((attr, idx) => (
                                        <div key={idx} className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-orange-500/30">
                                            <p className="text-xs font-black uppercase text-gray-800 dark:text-white mb-1">{attr.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{attr.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-600/10">
                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Local Ethics</h4>
                                <p className="text-xs text-blue-900 dark:text-blue-200 font-bold italic leading-relaxed">"{placeInfo.customs}"</p>
                            </div>

                            <div className="pt-6">
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(markers.find(m => m.id === selectedMarkerId)?.name || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-3xl shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-4"
                                >
                                    <RouteIcon className="w-5 h-5" /> <span>Navigate To Node</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
        
        .marker-wrapper {
            position: relative;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-pin {
            width: 24px;
            height: 24px;
            background: #f97316;
            border: 3px solid white;
            border-radius: 10px 10px 10px 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }
        .marker-pin span { transform: rotate(45deg); }
        .marker-wrapper.active { transform: scale(1.4) translateY(-10px); }
        .marker-wrapper.active .marker-pin { background: #3b82f6; }
        
        .marker-aura {
            position: absolute;
            width: 60px;
            height: 60px;
            background: rgba(249, 115, 22, 0.2);
            border-radius: 50%;
            animation: aura-expand 2s infinite;
            z-index: 1;
        }
        @keyframes aura-expand {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(2); opacity: 0; }
        }

        .user-beacon {
            width: 18px;
            height: 18px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
            animation: beacon-pulse 1.5s infinite;
        }
        @keyframes beacon-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
            100% { transform: scale(1); }
        }

        .leaflet-container { background: #111222 !important; outline: none; }
        .shadow-3xl { box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.4); }
        .shadow-4xl { box-shadow: 0 50px 120px -30px rgba(0, 0, 0, 0.6); }
        
        @keyframes bounceSubtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounceSubtle { animation: bounceSubtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default MapView;
