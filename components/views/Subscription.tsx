
import React, { useState } from 'react';
import { GlobeIcon, MicrophoneIcon, BellIcon, SafetyIcon, CompassIcon, RouteIcon } from '../icons/Icons';

const PlanFeature: React.FC<{ included: boolean; text: string; premiumOnly?: boolean }> = ({ included, text, premiumOnly }) => (
    <div className={`flex items-start gap-3 py-2 ${premiumOnly ? 'group/feat' : ''}`}>
        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${included ? 'bg-orange-500/20 text-orange-500 group-hover/feat:scale-110' : 'bg-gray-800 text-gray-600'}`}>
            {included ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
        </div>
        <p className={`text-sm font-bold tracking-tight transition-colors ${included ? 'text-gray-200 group-hover/feat:text-white' : 'text-gray-500 line-through'}`}>
            {text}
        </p>
    </div>
);

const WhyPremiumItem: React.FC<{ icon: React.ReactNode; title: string; sub: string }> = ({ icon, title, sub }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
        <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
            {icon}
        </div>
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter leading-tight">{sub}</p>
    </div>
);

const Subscription: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto pb-24 animate-fadeIn min-h-screen bg-[#050510] -m-4 md:-m-8 p-4 md:p-12 overflow-hidden relative">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Glowing Trial Banner */}
            <div className="relative z-20 mb-12 animate-slideDown">
                <div className="bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 p-[1px] rounded-full shadow-[0_0_40px_rgba(249,115,22,0.3)]">
                    <div className="bg-[#050510] rounded-full py-3 px-8 text-center">
                        <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            Experience Global Gold: <span className="text-orange-500">Start Your 3-Day Free Trial!</span>
                        </p>
                    </div>
                </div>
            </div>

            <header className="text-center mb-16 relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                    Bharat Path <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Premium</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] max-w-lg mx-auto leading-relaxed">
                    Join the elite registry of global explorers and unlock the full master protocol of Bharat Path Intelligence.
                </p>
            </header>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
                {/* Plan 1: Standard */}
                <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 flex flex-col transition-all hover:bg-white/10 shadow-2xl relative">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Yatri Standard</h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em]">Fundamental Intelligence</p>
                    </div>
                    
                    <div className="mb-10 flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white tracking-tighter">₹49</span>
                        <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">/mo</span>
                    </div>

                    <div className="flex-1 space-y-2 mb-12">
                        <PlanFeature included={true} text="Ad-Free Master Experience" />
                        <PlanFeature included={true} text="AI Itinerary Synthesis" />
                        <PlanFeature included={true} text="Priority Safety Access" />
                        <PlanFeature included={false} text="Global Chat Sync" />
                        <PlanFeature included={false} text="Real-time Voice Bhasha" />
                        <PlanFeature included={false} text="Smart Tracking Alerts" />
                    </div>

                    <button className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-black transition-all active:scale-95">
                        Choose Standard
                    </button>
                </div>

                {/* Plan 2: Global Gold */}
                <div className="relative bg-gradient-to-b from-orange-600/20 to-[#0d0c11] p-10 rounded-[4rem] border-2 border-orange-500 flex flex-col transition-all hover:scale-[1.02] shadow-[0_0_60px_rgba(249,115,22,0.2)] overflow-hidden group">
                    {/* Trial Badge */}
                    <div className="absolute top-8 right-8">
                        <span className="px-5 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/40 animate-pulse">
                            Free Trial
                        </span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                            Yatri Global Gold <span className="text-2xl">✨</span>
                        </h2>
                        <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em]">Universal Connection Hub</p>
                    </div>
                    
                    <div className="mb-10 flex items-baseline gap-2">
                        <span className="text-7xl font-black text-white tracking-tighter bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">₹99</span>
                        <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">/mo</span>
                    </div>

                    <div className="flex-1 space-y-2 mb-12">
                        <PlanFeature included={true} text="Auto-Voice Bhasha Sync" premiumOnly />
                        <PlanFeature included={true} text="Global Connectivity Rooms" premiumOnly />
                        <PlanFeature included={true} text="Smart Transit Tracking" premiumOnly />
                        <PlanFeature included={true} text="Deep AI History Wisdom" premiumOnly />
                        <PlanFeature included={true} text="24/7 Digital Concierge" premiumOnly />
                        <PlanFeature included={true} text="Pioneer Badge Status" premiumOnly />
                    </div>

                    <div className="space-y-4">
                        <button className="w-full py-7 rounded-[2rem] bg-orange-500 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-600 hover:scale-[1.02] transition-all shadow-2xl shadow-orange-500/40 active:scale-95">
                            START FREE TRIAL
                        </button>
                        <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Then ₹99/month</p>
                    </div>

                    {/* Gold Texture Overlay */}
                    <div className="absolute -bottom-10 -right-10 text-[18rem] font-black text-white/[0.02] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000 uppercase">GOLD</div>
                </div>
            </div>

            {/* Why Premium Section */}
            <div className="mt-24 max-w-4xl mx-auto relative z-10">
                <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] text-center mb-12 flex items-center gap-6">
                    <span className="flex-1 h-px bg-white/5"></span>
                    GOLD PROTOCOL ADVANTAGES
                    <span className="flex-1 h-px bg-white/5"></span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <WhyPremiumItem 
                        icon={<GlobeIcon className="w-7 h-7" />} 
                        title="Universal Sync" 
                        sub="Low-latency Global Uplink"
                    />
                    <WhyPremiumItem 
                        icon={<MicrophoneIcon className="w-7 h-7" />} 
                        title="Voice Sangam" 
                        sub="Zero-Barrier Bhasha Audio"
                    />
                    <WhyPremiumItem 
                        icon={<BellIcon className="w-7 h-7" />} 
                        title="Radar Alerts" 
                        sub="Proactive Transit Logistics"
                    />
                </div>
            </div>

            {/* No-Risk Guarantee */}
            <div className="mt-20 max-w-2xl mx-auto text-center relative z-10 px-8 py-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="text-3xl mb-4">🛡️</div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Master Protocol Guarantee</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-md mx-auto">
                    Pay <span className="text-orange-500 font-black">₹0 today</span>. Cancel anytime before the trial cycle ends via your profile registry. No hidden charges. Secure encryption active.
                </p>
            </div>

            <footer className="mt-24 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] pb-12">
                Bharat Path Secure Payment Protocol v2.0 • SSL Encrypted
            </footer>

            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideDown { animation: slideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .shadow-inner { box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
            `}</style>
        </div>
    );
};

export default Subscription;
