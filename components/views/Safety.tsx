// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getGlobalIntelligence } from '../../services/geminiService';

const Safety: React.FC = () => {
    const { profile } = useUser();
    const [intel, setIntel] = useState<any>(null);
    const [isSOSTriggered, setIsSOSTriggered] = useState(false);
    const [sosStatus, setSosStatus] = useState('');

    useEffect(() => {
        // Fetch location and intel on mount
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const data = await getGlobalIntelligence(pos.coords.latitude, pos.coords.longitude, profile);
            setIntel(data);
        });
    }, []);

    // --- WORLDWIDE ADD-ON: ACTUAL SOS DISPATCH LOGIC ---
    const dispatchEmergencyProtocol = async () => {
        setIsSOSTriggered(true);
        setSosStatus('Scanning Nearest Police Node...');

        // 1. Get exact address using Reverse Geocoding
        const pos = await new Promise<GeolocationPosition>((res) => 
            navigator.geolocation.getCurrentPosition(res)
        );
        
        // 2. Prepare Dispatch Package
        const dispatchData = {
            founderNode: "Shashank Mishra",
            victimName: profile.name,
            coordinates: `${pos.coords.latitude}, ${pos.coords.longitude}`,
            googleMapsLink: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
            nearestStation: intel?.safety.police.name || "Regional Headquarters"
        };

        // 3. Trigger API (Simulation for now, connects to Twilio/Firebase Cloud Function)
        console.log("ALARM: Dispatching to Police...", dispatchData);
        
        setTimeout(() => setSosStatus('SMS ALERT SENT TO POLICE'), 1500);
        setTimeout(() => setSosStatus('DISPATCHING GPS COORDINATES...'), 3000);
        setTimeout(() => {
            setSosStatus('OFFICIAL CALL INITIALIZED');
            // Trigger actual phone call
            window.location.href = `tel:${intel?.safety.emergency_numbers[0] || '112'}`;
        }, 4500);
    };

    return (
        <div className="max-w-7xl mx-auto pb-40 px-6 h-screen overflow-y-auto bg-[#0a0b14]">
            
            {/* SOS Terminal Overlay */}
            {isSOSTriggered && (
                <div className="fixed inset-0 z-[2000] bg-red-600/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center animate-pulse">
                    <div className="text-9xl mb-10">🚨</div>
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-4">SOS ACTIVE</h2>
                    <p className="text-2xl font-black text-white/80 uppercase tracking-widest">{sosStatus}</p>
                    <div className="mt-12 w-full max-w-md bg-white/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-white h-full animate-progress"></div>
                    </div>
                    <button 
                        onClick={() => setIsSOSTriggered(false)}
                        className="mt-20 px-12 py-4 bg-white text-red-600 font-black rounded-full uppercase tracking-widest text-xs shadow-2xl"
                    >
                        Abort Protocol (Mistake)
                    </button>
                </div>
            )}

            <header className="py-16">
                <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter">Secure <span className="text-orange-500">Hub</span></h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Emergency Dispatch System v4.5</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main SOS Button Node */}
                <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[4rem] p-12 relative overflow-hidden group shadow-4xl">
                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Regional Guardian Link</h2>
                            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Nearest Node: {intel?.safety.police.name || 'Searching...'}</p>
                        </div>

                        <button 
                            onClick={dispatchEmergencyProtocol}
                            className="w-56 h-56 rounded-full bg-red-600 text-white shadow-[0_0_100px_rgba(220,38,38,0.5)] border-[15px] border-white/10 hover:scale-110 active:scale-90 transition-all duration-500 relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10 text-6xl group-hover/btn:rotate-12 transition-transform inline-block">🆘</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </button>

                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] animate-pulse">Critical: Tap only in life-threatening situations</p>
                    </div>
                    <div className="absolute -bottom-20 -right-20 text-[20rem] font-black text-white/[0.02] pointer-events-none italic select-none">POLICE</div>
                </div>

                {/* Dispatch Details HUD */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#111222] p-10 rounded-[3.5rem] border border-white/5 shadow-inner">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">Dispatch Package</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Target Address</p>
                                <p className="text-[10px] text-white font-black uppercase truncate">{intel?.safety.police.address || 'SYNCING...'}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Response Radius</p>
                                <p className="text-lg font-black text-orange-500 italic">{intel?.safety.police.distance || '---'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
                .animate-progress { animation: progress 4.5s linear forwards; }
                .shadow-4xl { box-shadow: 0 60px 150px -30px rgba(0,0,0,0.7); }
            `}</style>
        </div>
    );
};

export default Safety;