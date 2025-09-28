import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { OfflineMap, AIBookingSuggestion } from '../../types';
import { MapIcon, ExternalLinkIcon } from '../icons/Icons';
import { getAIResponse } from '../../services/geminiService';

// In a real application, these images would be fetched or bundled.
// For this demo, we embed simple, identifiable SVG placeholders as Base64 data URLs.
const AVAILABLE_MAPS = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    imageData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjllYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNjMjQwMGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5PZmZsaW5lIE1hcDogRGVsaGkgTkNSPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 'mumbai',
    name: 'Mumbai Region',
    imageData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2UwZjJmZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMwYzRhNmUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5PZmZsaW5lIE1hcDogTXVtYmFpIFJlZ2lvbjwvdGV4dD48L3N2Zz4=',
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    imageData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZmZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMwNTk2NjIiIHRleHQtYW5jaG-yPSJtaWRkbGUiIGR5PSIuM2VtIj5PZmZsaW5lIE1hcDogS2VyYWxhIEJhY2t3YXRlcnM8L3RleHQ+PC9zdmc+',
  },
];

type MapLayer = 'street' | 'satellite' | 'terrain' | 'poi';

const POI_LAYER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U5ZThkMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM4YzYwMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qb2ludHMgb2YgSW50ZXJlc3Q8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzhjNjAzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPihIaXN0b3JpY2FsIFNpdGVzLCBSZXN0YXVyYW50cywgZXRjLik8L3RleHQ+PC9zdmc+';

interface POI {
  name: string;
  top: string;
  left: string;
}

const POINTS_OF_INTEREST: POI[] = [
  { name: 'Taj Mahal, Agra', top: '45%', left: '58%' },
  { name: 'India Gate, Delhi', top: '38%', left: '56%' },
  { name: 'Gateway of India, Mumbai', top: '68%', left: '48%' },
  { name: 'Hampi, Karnataka', top: '78%', left: '55%' },
];

const PoiMarker: React.FC<{ poi: POI, onClick: () => void }> = ({ poi, onClick }) => (
    <button
        onClick={onClick}
        className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ top: poi.top, left: poi.left }}
        title={`Explore near ${poi.name}`}
    >
        <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulsePlus group-hover:animate-none"></div>
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-white bg-black bg-opacity-60 px-2 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {poi.name.split(',')[0]}
        </span>
    </button>
);

const SuggestionModal: React.FC<{ 
    poiName: string; 
    suggestions: AIBookingSuggestion[];
    isLoading: boolean;
    error: string | null;
    onClose: () => void; 
}> = ({ poiName, suggestions, isLoading, error, onClose }) => (
    <div className="absolute inset-0 bg-black bg-opacity-60 z-30 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Suggestions near {poiName}</h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500" aria-label="Close suggestions">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading && <p className="text-center text-gray-500 dark:text-gray-400">Fetching suggestions with AI...</p>}
                {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}
                {!isLoading && !error && suggestions.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No suggestions found.</p>}
                {suggestions.map((s, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                        <div className="flex justify-between items-start gap-2">
                             <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{s.name}</h4>
                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{s.type}</p>
                            </div>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ", " + poiName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-orange-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-orange-600 flex items-center gap-1 whitespace-nowrap transition-colors"
                            >
                                Book <ExternalLinkIcon className="w-3 h-3"/>
                            </a>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


const MapView: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMaps, setOfflineMaps] = useLocalStorage<OfflineMap[]>('offlineMaps', []);
  const [mapToDownload, setMapToDownload] = useState(AVAILABLE_MAPS[0].id);
  const [selectedOfflineMap, setSelectedOfflineMap] = useState<OfflineMap | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('street');

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [suggestions, setSuggestions] = useState<AIBookingSuggestion[]>([]);
  const [isSuggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine && offlineMaps.length > 0) {
        setSelectedOfflineMap(offlineMaps[0]);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineMaps]);
  
  const handleDownload = () => {
    const mapExists = offlineMaps.some(map => map.id === mapToDownload);
    if (mapExists) {
        setFeedback({ message: 'This map is already downloaded.', type: 'info' });
        setTimeout(() => setFeedback(null), 3000);
        return;
    }

    const mapData = AVAILABLE_MAPS.find(map => map.id === mapToDownload);
    if (mapData) {
        setOfflineMaps([...offlineMaps, mapData]);
        setFeedback({ message: `'${mapData.name}' downloaded successfully!`, type: 'success' });
        setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    setOfflineMaps(offlineMaps.filter(map => map.id !== id));
    if (selectedOfflineMap?.id === id) {
        setSelectedOfflineMap(null);
    }
  }
  
  const handlePoiClick = async (poi: POI) => {
    if (!isOnline) return;
    setSelectedPoi(poi);
    setSuggestionLoading(true);
    setSuggestionError(null);
    setSuggestions([]);
    try {
        const response = await getAIResponse(`Suggest 3 popular hotels and restaurants near ${poi.name}`);
        if (response.suggestions && response.suggestions.length > 0) {
            setSuggestions(response.suggestions);
        } else {
             setSuggestionError("Could not find any suggestions for this location.");
        }
    } catch (error: any) {
        setSuggestionError(error.message || "Failed to fetch suggestions.");
    } finally {
        setSuggestionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedPoi(null);
  };


  const getMapUrlForLayer = (layer: MapLayer): string => {
      const baseUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14945374.39812497!2d72.39999999999999!3d22.500000000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b791%3A0xd78c4fa1854213a6!2sIndia!5e0!3m2!1sen!2sus!4v1678886453123!5m2!1sen!2sus";
      switch (layer) {
          case 'satellite':
              return baseUrl.replace('!5e0', '!5e3');
          case 'terrain':
              return baseUrl.replace('!5e0', '!5e1');
          case 'street':
          default:
              return baseUrl;
      }
  };

  const layerButtons = [
      { id: 'street', label: 'Street' },
      { id: 'satellite', label: 'Satellite' },
      { id: 'terrain', label: 'Terrain' },
      { id: 'poi', label: 'POI' },
  ];

  return (
    <div>
      <style>{`
        @keyframes pulsePlus {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
        }
        .animate-pulsePlus { animation: pulsePlus 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Interactive Map</h1>
      <div className={`flex items-center mb-4 p-2 rounded-md ${isOnline ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <p className={`text-sm font-semibold ${isOnline ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            You are currently {isOnline ? 'Online' : 'Offline'}{isOnline && ', click a point to explore!'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-3">Manage Offline Maps</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <select
                value={mapToDownload}
                onChange={(e) => setMapToDownload(e.target.value)}
                className="flex-grow mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                {AVAILABLE_MAPS.map(map => <option key={map.id} value={map.id}>{map.name}</option>)}
            </select>
            <button
                onClick={handleDownload}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
            >
                Download Region
            </button>
        </div>
        {feedback && (
            <p className={`mt-2 text-sm text-center font-medium ${
                feedback.type === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`}>
                {feedback.message}
            </p>
        )}

        {offlineMaps.length > 0 && (
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Downloaded Maps:</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                    {offlineMaps.map(map => (
                        <li key={map.id} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{map.name}</span>
                            <button onClick={() => handleDelete(map.id)} className="ml-2 text-gray-400 hover:text-red-500 text-lg">&times;</button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative">
        {isOnline && (
            <div className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-lg flex space-x-1">
                {layerButtons.map(layer => (
                    <button
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id as MapLayer)}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            activeLayer === layer.id
                                ? 'bg-orange-500 text-white'
                                : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        {layer.label}
                    </button>
                ))}
            </div>
        )}
        {isOnline ? (
            activeLayer === 'poi' ? (
                <div className="bg-gray-200 dark:bg-gray-800 w-full h-full flex flex-col justify-center items-center p-4">
                    <img src={POI_LAYER_PLACEHOLDER} alt="Points of Interest Layer" className="max-w-full max-h-full object-contain" />
                </div>
            ) : (
                <iframe
                    key={activeLayer}
                    src={getMapUrlForLayer(activeLayer)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="India Map"
                    className="transition-opacity duration-300"
                ></iframe>
            )
        ) : (
            <div className="bg-gray-200 dark:bg-gray-800 w-full h-full flex flex-col justify-center items-center p-4">
                {selectedOfflineMap ? (
                     <img src={selectedOfflineMap.imageData} alt={`Offline map of ${selectedOfflineMap.name}`} className="max-w-full max-h-full object-contain" />
                ) : (
                    offlineMaps.length > 0 ? (
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Select a map to view</h3>
                            <div className="mt-4 flex flex-wrap justify-center gap-3">
                                {offlineMaps.map(map => (
                                    <button 
                                        key={map.id} 
                                        onClick={() => setSelectedOfflineMap(map)}
                                        className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-orange-100 dark:hover:bg-gray-600"
                                    >
                                        {map.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                             <div className="flex justify-center text-orange-500 mb-4 text-5xl">
                                <MapIcon />
                             </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">No Offline Maps Available</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Connect to the internet to download maps for offline use.</p>
                        </div>
                    )
                )}
            </div>
        )}
        {isOnline && POINTS_OF_INTEREST.map(poi => (
            <PoiMarker key={poi.name} poi={poi} onClick={() => handlePoiClick(poi)} />
        ))}
        {selectedPoi && (
            <SuggestionModal 
                poiName={selectedPoi.name.split(',')[0]}
                suggestions={suggestions}
                isLoading={isSuggestionLoading}
                error={suggestionError}
                onClose={handleCloseModal}
            />
        )}
      </div>
    </div>
  );
};

export default MapView;