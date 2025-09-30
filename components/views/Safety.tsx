import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { SafetyIcon } from '../icons/Icons';

// --- PARTNER LOCATOR COMPONENT --- //

interface SharingState {
    isSharing: boolean;
    sharingId: string | null;
    expiryTime: number | null;
}

const PartnerLocatorCard: React.FC = () => {
    const [sharingState, setSharingState] = useLocalStorage<SharingState>('partnerLocatorState', {
        isSharing: false,
        sharingId: null,
        expiryTime: null,
    });
    const [duration, setDuration] = useState(900); // Default to 15 minutes (in seconds)
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [feedback, setFeedback] = useState('');
    const watchId = useRef<number | null>(null);
    const timerId = useRef<ReturnType<typeof setInterval> | null>(null);

    // Effect to manage the countdown timer
    useEffect(() => {
        if (sharingState.isSharing && sharingState.expiryTime) {
            timerId.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.round((sharingState.expiryTime! - now) / 1000);
                if (remaining <= 0) {
                    handleStopSharing();
                } else {
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
                }
            }, 1000);
        }

        return () => {
            if (timerId.current) clearInterval(timerId.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharingState.isSharing, sharingState.expiryTime]);

    // Effect to manage geolocation tracking
    useEffect(() => {
        if (sharingState.isSharing) {
            if (navigator.geolocation) {
                watchId.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        // In a real app, you would send these coordinates to your backend,
                        // associated with the `sharingState.sharingId`.
                        console.log(`Sharing Location: ${latitude}, ${longitude}`);
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        setFeedback("Error: Could not get location. Sharing stopped.");
                        handleStopSharing();
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                setFeedback("Geolocation is not supported by this browser.");
                handleStopSharing();
            }
        }
    
        return () => {
            if (watchId.current && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sharingState.isSharing]);


    const handleStartSharing = () => {
        const newSharingId = crypto.randomUUID();
        const expiry = Date.now() + duration * 1000;
        setSharingState({
            isSharing: true,
            sharingId: newSharingId,
            expiryTime: expiry,
        });
        setFeedback('');
    };
    
    const handleStopSharing = () => {
        setSharingState({ isSharing: false, sharingId: null, expiryTime: null });
        if (timerId.current) clearInterval(timerId.current);
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        setTimeLeft('');
    };
    
    const handleCopyLink = () => {
        // In a real app, this URL would point to a page that can read the sharingId
        // and display the location from the backend.
        const trackingLink = `${window.location.origin}/track?id=${sharingState.sharingId}`;
        navigator.clipboard.writeText(trackingLink)
            .then(() => {
                setFeedback('Link copied to clipboard!');
                setTimeout(() => setFeedback(''), 3000);
            })
            .catch(() => setFeedback('Failed to copy link.'));
    };

    return (
        <SafetyCard 
            title="Partner Locator" 
            content={
                !sharingState.isSharing ? (
                    <div>
                        <p className="mb-4">Temporarily share your live location with a partner or friend. They'll receive a unique link to see your position on a map.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="flex-grow mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="900">For 15 minutes</option>
                                <option value="3600">For 1 hour</option>
                                <option value="28800">For 8 hours</option>
                            </select>
                            <button
                                onClick={handleStartSharing}
                                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
                            >
                                Start Sharing
                            </button>
                        </div>
                        {feedback && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{feedback}</p>}
                    </div>
                ) : (
                    <div>
                        <p className="mb-2 font-semibold text-green-700 dark:text-green-400">You are currently sharing your location!</p>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share this link with your partner:</p>
                            <p className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
                                {`${window.location.origin.replace('https://', '')}/track?id=${sharingState.sharingId?.substring(0, 8)}...`}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Note: This is a demo. A backend is needed for the link to work.</p>
                        </div>
                        {feedback && <p className="text-blue-500 dark:text-blue-400 text-sm mt-2 text-center">{feedback}</p>}

                        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                            <button onClick={handleCopyLink} className="w-full sm:w-auto flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Copy Link</button>
                            <button onClick={handleStopSharing} className="w-full sm:w-auto flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Stop Sharing</button>
                            <div className="font-mono text-lg text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 px-4 py-1.5 rounded-lg">
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                )
            }
        />
    )
}


const SafetyCard: React.FC<{ title: string, content: React.ReactNode }> = ({ title, content }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full mr-4">
                <SafetyIcon />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400 mt-4">
            {content}
        </div>
    </div>
);

const Safety: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Safety & Support</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your safety is our priority. Here are some resources to help you travel with peace of mind.
      </p>

      <div className="space-y-6">
        <SafetyCard 
            title="Emergency Services" 
            content={
                <ul className="space-y-2 pl-2 border-l-2 border-orange-500">
                    <li><strong>Police:</strong> 100</li>
                    <li><strong>Ambulance:</strong> 102</li>
                    <li><strong>Fire:</strong> 101</li>
                    <li><strong>National Emergency Number:</strong> 112</li>
                    <li><strong>Tourist Helpline:</strong> 1363</li>
                </ul>
            }
        />
        
        <PartnerLocatorCard />

        <SafetyCard 
            title="Customer Support" 
            content={
                <p className="pl-2 border-l-2 border-orange-500">For assistance with the app or your trip, please contact our support team at <a href="mailto:support@bharatpath.com" className="text-orange-500 hover:underline">support@bharatpath.com</a>.</p>
            }
        />
      </div>
    </div>
  );
};

export default Safety;
