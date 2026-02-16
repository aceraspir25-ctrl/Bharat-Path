// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useUser } from '../../contexts/UserContext';
import { PlaceInfo, MapMarker } from '../../types';
import { SearchIcon, CompassIcon, RouteIcon } from '../icons/Icons';
import { searchPlacesWithAI, getPlaceInformation } from '../../services/geminiService';

const MapView: React.FC<{ onAIService: (fn: () => Promise<any>) => Promise<any> }> = ({ onAIService }) => {
  const [theme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
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

  const START_POS: [number, number] = [21.2514, 81.6296]; // Raipur Hub

  // --- INITIALIZE NEURAL MAP ---
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && window.L) {
      const L = window.L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView(START_POS, 13);
      
      const tilesUrl = theme === 'dark' 
        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tilesUrl, { maxZoom: 20 }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Initial Marker
      L.marker(START_POS, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-wrapper active"><div class="marker-pin shadow-2xl bg-orange-600 border-white"><span class="text-[10px]">🚩</span></div><div class="marker-aura"></div></div>`,
          iconSize: [40, 40], iconAnchor: [20, 40]
        })
      }).addTo(markersLayerRef.current).bindPopup('<p class="font-black text-[10px] uppercase text-orange-600">Raipur Central Hub Active</p>');
    }
    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, []);

  const handleMarkerClick = useCallback(async (m: MapMarker) => {
    setSelectedMarkerId(m.id);
    setIsFetchingWisdom(true);
    mapInstanceRef.current?.flyTo([m.lat, m.lng], 16, { duration: 1.5 });
    
    try {
        const info = await onAIService(() => getPlaceInformation(m.name, profile));
        setPlaceInfo(info);
    } catch (err) {} finally { setIsFetchingWisdom(false); }
  }, [onAIService, profile]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
        const res = await onAIService(() => searchPlacesWithAI(searchQuery, profile));
        setMarkers(res.markers || []);
    } catch (err) {} finally { setIsSearching(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12 px-4 selection:bg-orange-500/30">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Global <span className="text-orange-500">Node</span> Map</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Spatial Intelligence Registry v4.0</p>
        </div>
        <div className="flex-1 max-w-2xl relative">
            <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-white/5 border border-white/10 rounded-full py-5 px-14 text-white font-bold outline-none focus:border-orange-500 transition-all italic"
                placeholder="Search any global node (e.g. Kyoto, London, Raipur)..."
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
                {isSearching ? <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent animate-spin rounded-full"></div> : <SearchIcon className="text-gray-500" />}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
        {/* Sidebar: World Wisdom */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5">
                <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Node Registry</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {markers.map(m => (
                    <button key={m.id} onClick={() => handleMarkerClick(m)} className={`w-full text-left p-6 rounded-3xl border-2 transition-all ${selectedMarkerId === m.id ? 'bg-orange-500 border-orange-500' : 'bg-white/5 border-transparent hover:border-orange-500/30'}`}>
                        <p className="font-black uppercase text-xs tracking-tight">{m.name}</p>
                        <p className="text-[8px] font-bold uppercase text-gray-500 mt-1">Coordinate Locked</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Map Core */}
        <div className="lg:col-span-6 relative rounded-[4rem] overflow-hidden border-4 border-white/5 shadow-4xl bg-[#0a0b14]">
            <div ref={mapContainerRef} className="w-full h-full z-0"></div>
            <button onClick={() => {}} className="absolute top-8 right-8 z-[1000] p-5 bg-orange-500 text-white rounded-3xl shadow-4xl hover:scale-110 transition-all active:rotate-12">
                <CompassIcon />
            </button>
        </div>

        {/* Info Hub: The Spatial Wisdom */}
        <div className="lg:col-span-3 bg-[#111222] rounded-[3.5rem] border border-white/10 p-8 overflow-y-auto custom-scrollbar shadow-3xl relative">
            {!selectedMarkerId ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                    <div className="text-7xl mb-6">🧭</div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Node Interaction</p>
                </div>
            ) : isFetchingWisdom ? (
                <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent animate-spin rounded-full mb-6"></div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Synchronizing Wisdom...</p>
                </div>
            ) : placeInfo && (
                <div className="animate-fadeIn space-y-10">
                    <div className="space-y-4">
                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-4 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">Spatial Intel</span>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{placeInfo.name || markers.find(m => m.id === selectedMarkerId)?.name}</h3>
                    </div>
                    <div className="space-y-4 border-l-4 border-orange-500/30 pl-6">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Neural History</p>
                        <p className="text-sm font-medium italic text-gray-300 leading-relaxed">"{placeInfo.history}"</p>
                    </div>
                    <button className="w-full py-5 bg-orange-500 text-white font-black rounded-[2rem] uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                        <RouteIcon /> Launch Path Darshak
                    </button>
                </div>
            )}
        </div>
      </div>

      <style>{`
        .marker-wrapper { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .marker-pin { width: 24px; height: 24px; border-radius: 10px 10px 10px 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; z-index: 2; border: 2px solid white; }
        .marker-pin span { transform: rotate(45deg); }
        .marker-aura { position: absolute; width: 50px; height: 50px; background: rgba(249, 115, 22, 0.2); border-radius: 50%; animation: aura-pulse 2s infinite; }
        @keyframes aura-pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        .leaflet-container { background: #0a0b14 !important; }
      `}</style>
    </div>
  );
};

export default MapView;