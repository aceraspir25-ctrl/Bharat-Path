
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { SafetyIcon } from '../icons/Icons';
import { getGlobalIntelligence } from '../../services/geminiService';
import { GlobalIntelligence } from '../../types';
// Added useUser import
import { useUser } from '../../contexts/UserContext';

interface SharingState {
    isSharing: boolean;
    sharingId: string | null;
    expiryTime: number | null;
}

const SafetyCard: React.FC<{ title: string, content: React.ReactNode, icon: string, color: string }> = ({ title, content, icon, color }) => (
    <div className="bg-white/80 dark:bg-[#1a1c2e]/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 transition-all hover:scale-[1.01] group">
        <div className="flex items-center mb-8">
            <div className={`p-4 rounded-2xl mr-5 shadow-inner transition-transform group-hover:rotate-6 ${color}`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
            {content}
        </div>
    </div>
);

const PartnerLocatorCard: React.FC = () => {
    const [sharingState, setSharingState] = useLocalStorage<SharingState>('partnerLocatorState', {
        isSharing: false,
        sharingId: null,
        expiryTime: null,
    });
    const [duration, setDuration] = useState(900);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [feedback, setFeedback] = useState('');
    const timerId = useRef<ReturnType<typeof setInterval> | null>(null);

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
        return () => { if (timerId.current) clearInterval(timerId.current); };
    }, [sharingState.isSharing, sharingState.expiryTime]);

    const handleStartSharing = () => {
        const newSharingId = crypto.randomUUID();
        const expiry = Date.now() + duration * 1000;
        setSharingState({ isSharing: true, sharingId: newSharingId, expiryTime: expiry });
        setFeedback('');
    };
    
    const handleStopSharing = () => {
        setSharingState({ isSharing: false, sharingId: null, expiryTime: null });
        if (timerId.current) clearInterval(timerId.current);
        setTimeLeft('');
    };
    
    const handleCopyLink = () => {
        const trackingLink = `${window.location.origin}/track?id=${sharingState.sharingId}`;
        navigator.clipboard.writeText(trackingLink)
            .then(() => { setFeedback('Secure path link copied!'); setTimeout(() => setFeedback(''), 3000); });
    };

    return (
        <SafetyCard 
            title="Partner Locator" 
            icon="📍"
            color="bg-blue-500/10 text-blue-500"
            content={
                !sharingState.isSharing ? (
                    <div className="space-y-6">
                        <p className="text-sm font-medium leading-relaxed">Broadcast your live path to a trusted partner. They receive a temporal tracking link to monitor your journey in real-time.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="flex-grow px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#111222] border-2 border-transparent focus:border-orange-500 outline-none text-xs font-black uppercase tracking-widest dark:text-white shadow-inner"
                            >
                                <option value="900">15 Minutes</option>
                                <option value="3600">1 Hour</option>
                                <option value="28800">8 Hours</option>
                            </select>
                            <button
                                onClick={handleStartSharing}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-orange-500/20 transition-all uppercase tracking-[0.2em] text-[10px]"
                            >
                                Initialize Broadcast
                            </button>
                        </div>
                        {feedback && <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{feedback}</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Link Active</span>
                            <span className="font-mono text-lg font-black text-green-700 dark:text-green-400">{timeLeft}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111222] p-5 rounded-2xl shadow-inner border border-white/5">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Encrypted Registry ID</p>
                            <p className="text-[10px] font-mono break-all text-gray-800 dark:text-gray-200 opacity-60">
                                {sharingState.sharingId}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleCopyLink} className="py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">Copy Link</button>
                            <button onClick={handleStopSharing} className="py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95">End Sharing</button>
                        </div>
                        {feedback && <p className="text-center text-[10px] font-black text-blue-500 uppercase">{feedback}</p>}
                    </div>
                )
            }
        />
    )
}

const Safety: React.FC = () => {
  // Added profile from context
  const { profile } = useUser();
  const [intel, setIntel] = useState<GlobalIntelligence | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                // Fixed: Pass profile to getGlobalIntelligence
                const data = await getGlobalIntelligence(pos.coords.latitude, pos.coords.longitude, profile);
                setIntel(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        });
    }
    // Added profile to dependencies
  }, [profile]);

  const handleSOS = () => {
    const num = intel?.safety.emergency_numbers[0] || '112';
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fadeIn">
      <header className="mb-12 px-4">
        <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Safety Hub</h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.5em] mt-3 text-xs">
            {intel ? `Securing Path: ${intel.location}` : 'Establishing Secure Global Link...'}
        </p>
      </header>

      <div className="space-y-8 px-2">
        {/* Universal SOS Interface */}
        <div className="bg-orange-600 p-12 rounded-[4rem] shadow-3xl border border-orange-500/30 text-white relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left space-y-4">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Universal SOS Registry</h2>
                    <p className="text-orange-100 font-bold text-sm max-w-sm opacity-80 leading-relaxed">
                        Immediately trigger regional emergency broadcast. Detected local responders will be alerted.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-4">
                        {intel?.safety.emergency_numbers.map(num => (
                            <span key={num} className="bg-white/20 px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] backdrop-blur-md border border-white/10">
                                {num}
                            </span>
                        )) || <div className="w-48 h-10 bg-white/10 rounded-full animate-pulse"></div>}
                    </div>
                </div>
                <button 
                    onClick={handleSOS}
                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-2xl transform hover:scale-110 active:scale-90 transition-all group-hover:rotate-6 border-[8px] border-white/50"
                >
                    <span className="text-5xl">🆘</span>
                </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 text-[20rem] font-black rotate-12 select-none pointer-events-none transition-transform duration-1000 group-hover:rotate-0">SOS</div>
        </div>

        {/* Local Emergency Infrastructure */}
        {intel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SafetyCard 
                    title="Police Registry" 
                    icon="👮"
                    color="bg-blue-600/10 text-blue-600"
                    content={
                        <div className="bg-gray-50 dark:bg-[#111222] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-inner">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Primary Responder</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{intel.safety.police.name}</h4>
                            <p className="text-xs text-gray-500 font-bold mt-4 leading-relaxed opacity-70 italic">{intel.safety.police.address}</p>
                            <div className="mt-8 flex items-center">
                                <span className="px-5 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                    {intel.safety.police.distance} FROM PATH
                                </span>
                            </div>
                        </div>
                    }
                />
                <SafetyCard 
                    title="Medical Response" 
                    icon="🏥"
                    color="bg-red-600/10 text-red-600"
                    content={
                        <div className="bg-gray-50 dark:bg-[#111222] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-inner">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Emergency Hospital</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{intel.safety.hospital.name}</h4>
                            <p className="text-xs text-gray-500 font-bold mt-4 leading-relaxed opacity-70 italic">{intel.safety.hospital.address}</p>
                            <div className="mt-8 flex items-center">
                                <span className="px-5 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                    {intel.safety.hospital.distance} FROM PATH
                                </span>
                            </div>
                        </div>
                    }
                />
            </div>
        )}

        <PartnerLocatorCard />

        <SafetyCard 
            title="Official Assistance" 
            icon="🛰️"
            color="bg-orange-500/10 text-orange-500"
            content={
                <div className="pl-6 border-l-4 border-orange-500/30 py-2">
                    <p className="text-gray-800 dark:text-gray-200 font-black uppercase tracking-tight text-sm">Path Intelligence Support</p>
                    <p className="mt-3 text-xs font-medium leading-relaxed">For registry disputes or technical safety assistance: <a href="mailto:safety@bharatpath.com" className="text-orange-500 hover:underline font-black">safety@bharatpath.com</a></p>
                </div>
            }
        />
      </div>
    </div>
  );
};

export default Safety;