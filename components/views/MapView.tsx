
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useUser } from '../../contexts/UserContext';
import { PlaceInfo, MapMarker } from '../../types';
import { SearchIcon, CompassIcon } from '../icons/Icons';
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

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && window.L) {
      const L = window.L;
      const map = L.map(mapContainerRef.current).setView([21.2514, 81.6296], 13);
      
      const darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
      const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tilesUrl = document.documentElement.classList.contains('dark') ? darkTiles : lightTiles;

      const layer = L.tileLayer(tilesUrl, { attribution: '&copy; Stadia Maps' }).addTo(map);

      tileLayerRef.current = layer;
      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      map.on('click', () => setSelectedMarkerId(null));
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
      if (mapInstanceRef.current && tileLayerRef.current) {
          const darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
          const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          tileLayerRef.current.setUrl(document.documentElement.classList.contains('dark') ? darkTiles : lightTiles);
      }
  }, [theme]);

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
              html: `<div class="marker-container ${isSelected ? 'selected' : ''}"><div class="marker-dot"></div>${isSelected ? '<div class="marker-pulse"></div>' : ''}</div>`,
              iconSize: [24, 24], iconAnchor: [12, 12]
            })
          }).addTo(markersLayerRef.current);
          marker.on('click', (e: any) => { L.DomEvent.stopPropagation(e); handleMarkerClick(m); });
          marker.bindPopup(`<div class="p-4 text-center"><p class="text-[9px] font-black text-orange-500 uppercase mb-1">Path Node Discovered</p><h4 class="font-black text-gray-900 uppercase text-base mb-3">${m.name}</h4><div class="py-2 px-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase animate-pulse">Memory Synced</div></div>`, { closeButton: false });
        });
        if (!selectedMarkerId) mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 14 });
      }
    }
  }, [markers, selectedMarkerId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSelectedMarkerId(null);
    try {
        const res = await onAIService(() => searchPlacesWithAI(searchQuery, profile));
        setMarkers(res.markers || []);
    } catch (err) {} finally { setIsSearching(false); }
  };

  const handleMarkerClick = async (m: MapMarker) => {
    setSelectedMarkerId(m.id);
    setPlaceInfo(null);
    setIsFetchingWisdom(true);
    if (mapInstanceRef.current) mapInstanceRef.current.flyTo([m.lat, m.lng], 15, { duration: 1.5 });
    try {
        const info = await onAIService(() => getPlaceInformation(m.name, profile));
        setPlaceInfo(info);
    } catch (err) {} finally { setIsFetchingWisdom(false); }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([latitude, longitude], 13);
            window.L.marker([latitude, longitude], { icon: window.L.divIcon({ className: 'custom-div-icon', html: `<div class="user-location-marker"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(mapInstanceRef.current).bindPopup('Current Coordinate').openPopup();
        }
        setIsLocating(false);
    }, () => setIsLocating(false));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
        <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Spatial Registry</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Personalized Global Intelligence</p>
        </div>
        <div className="flex flex-1 max-w-2xl gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Interrogate node (e.g. Veg Momos near me)" className="w-full bg-white dark:bg-[#1a1c2e] border-2 border-transparent dark:border-white/5 rounded-2xl py-4 px-12 text-gray-800 dark:text-white focus:border-orange-500 outline-none font-bold shadow-2xl" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
            </form>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 h-[70vh]">
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col bg-white/50 dark:bg-[#111222]/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-inner">
            <div className="p-6 border-b border-gray-100 dark:border-white/5"><h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Registry Nodes</h3></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {markers.length > 0 ? markers.map(m => (
                    <button key={m.id} onClick={() => handleMarkerClick(m)} className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedMarkerId === m.id ? 'bg-orange-500 border-orange-500 text-white shadow-xl' : 'bg-white dark:bg-[#1a1c2e] border-transparent text-gray-800 dark:text-gray-300'}`}>
                        <span className="text-xs font-black uppercase line-clamp-1">{m.name}</span>
                    </button>
                )) : <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6"><div className="text-6xl mb-4">📍</div><p className="text-[10px] font-black uppercase tracking-[0.3em]">Query nodes to populate registry</p></div>}
            </div>
        </div>

        <div className="lg:col-span-6 relative">
            <div className="w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/5 bg-[#111222]">
                <div ref={mapContainerRef} className="w-full h-full z-0"></div>
                <div className="absolute top-6 right-6 z-[1000]"><button onClick={handleLocateMe} className={`p-4 bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-2xl text-orange-500 border border-gray-100 dark:border-white/5 ${isLocating ? 'animate-pulse' : ''}`}><CompassIcon /></button></div>
            </div>
        </div>

        <div className="lg:col-span-3 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl p-6 relative">
            {!selectedMarkerId ? (
                <div className="h-full flex flex-col justify-center items-center text-center opacity-40">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 text-4xl shadow-inner">🧭</div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-4">Select node for AI interrogate</p>
                </div>
            ) : (
                <div className="animate-fadeIn space-y-8">
                    <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight relative z-10">{markers.find(m => m.id === selectedMarkerId)?.name}</h3>
                    </div>
                    {isFetchingWisdom ? <div className="py-20 flex flex-col items-center justify-center space-y-6"><div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div><p className="text-[10px] font-black text-gray-400 uppercase">Querying Wisdom Registry...</p></div> : placeInfo && (
                        <div className="space-y-6">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic border-l-4 border-orange-500/40 pl-6">{placeInfo.history}</p>
                            <div className="bg-blue-600/5 p-6 rounded-[2.5rem] border border-blue-600/10"><p className="text-xs text-blue-900 dark:text-blue-200 font-bold italic leading-relaxed">"{placeInfo.customs}"</p></div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
        .marker-container { position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .marker-dot { width: 14px; height: 14px; background: #f97316; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.4); z-index: 2; }
        .marker-container.selected { transform: scale(1.6); }
        .marker-pulse { position: absolute; width: 50px; height: 50px; background: rgba(249, 115, 22, 0.4); border-radius: 50%; animation: marker-pulse-anim 2s infinite; z-index: 1; }
        @keyframes marker-pulse-anim { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
        .user-location-marker { width: 18px; height: 18px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); animation: user-pulse 1.5s infinite; }
        @keyframes user-pulse { 0% { transform: scale(1); } 70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { transform: scale(1); } }
        .leaflet-container { background: #111222 !important; border-radius: 3.5rem; }
      `}</style>
    </div>
  );
};

export default MapView;
