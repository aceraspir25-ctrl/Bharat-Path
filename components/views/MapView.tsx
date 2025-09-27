import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { OfflineMap } from '../../types';
import { MapIcon } from '../icons/Icons';

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
    imageData: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZmZlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMwNTk2NjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5PZmZsaW5lIE1hcDogS2VyYWxhIEJhY2t3YXRlcnM8L3RleHQ+PC9zdmc+',
  },
];


const MapView: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMaps, setOfflineMaps] = useLocalStorage<OfflineMap[]>('offlineMaps', []);
  const [mapToDownload, setMapToDownload] = useState(AVAILABLE_MAPS[0].id);
  const [selectedOfflineMap, setSelectedOfflineMap] = useState<OfflineMap | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial selected map if offline and maps exist
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Interactive Map</h1>
      <div className={`flex items-center mb-4 p-2 rounded-md ${isOnline ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <p className={`text-sm font-semibold ${isOnline ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            You are currently {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>

      {/* Offline Map Management Section */}
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

      {/* Map Display */}
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        {isOnline ? (
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14945374.39812497!2d72.39999999999999!3d22.500000000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b791%3A0xd78c4fa1854213a6!2sIndia!5e0!3m2!1sen!2sus!4v1678886453123!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="India Map"
          ></iframe>
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
      </div>
    </div>
  );
};

export default MapView;