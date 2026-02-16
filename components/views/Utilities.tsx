// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Transaction } from '../../types';
import { PaymentIcon, MobileRechargeIcon, QRIcon } from '../icons/Icons';

// --- SHARED PREMIUM CARD COMPONENT ---
const UtilityNode: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/10 shadow-3xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-700">
        <div className="absolute top-0 right-0 p-6 text-6xl font-black text-white/[0.02] italic uppercase select-none pointer-events-none group-hover:text-orange-500/[0.05] transition-colors">{title.split(' ')[0]}</div>
        <div className="flex items-center gap-4 mb-8 relative z-10">
            <span className="text-3xl p-3 bg-white/5 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">{icon}</span>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{title}</h3>
        </div>
        <div className="relative z-10">{children}</div>
    </div>
);

const Utilities: React.FC = () => {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('INR');

    return (
        <div className="max-w-7xl mx-auto pb-40 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
            
            {/* --- MATRIX HEADER --- */}
            <header className="py-16 text-center lg:text-left border-b border-white/5 mb-16">
                <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Utility <span className="text-orange-500">Matrix</span></h1>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.6em] mt-4">Universal Critical Path Infrastructure v4.8</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. CURRENCY CONVERTER NODE */}
                <UtilityNode title="Currency Converter" icon="💱">
                    <div className="space-y-6">
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white font-black text-2xl outline-none focus:border-orange-500" 
                        />
                        <div className="flex items-center gap-4">
                            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="flex-1 bg-white/5 p-4 rounded-xl text-xs font-black text-gray-400 outline-none uppercase">{['USD','EUR','INR','GBP','JPY'].map(c => <option key={c}>{c}</option>)}</select>
                            <span className="text-orange-500">➔</span>
                            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="flex-1 bg-white/5 p-4 rounded-xl text-xs font-black text-gray-400 outline-none uppercase">{['USD','EUR','INR','GBP','JPY'].map(c => <option key={c}>{c}</option>)}</select>
                        </div>
                        <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20 text-center">
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Market Sync Conversion</p>
                            <p className="text-4xl font-black text-white italic">{(amount * 82.5).toFixed(2)} <span className="text-sm font-normal text-gray-500">INR</span></p>
                        </div>
                    </div>
                </UtilityNode>

                {/* 2. PATH SCANNER (QR) */}
                <UtilityNode title="Path Scanner" icon="📸">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest leading-relaxed mb-10 italic">"Instant merchant settlement via secure UPI gateway node."</p>
                    <button className="w-full py-6 bg-orange-500 text-white font-black rounded-full shadow-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-4 active:scale-95">
                        <QRIcon className="w-5 h-5" /> <span className="text-[10px] uppercase tracking-[0.2em]">Launch Integrated Scanner</span>
                    </button>
                    <div className="mt-6 flex justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[8px] font-black text-gray-600 uppercase">Uplink Status: Secure</span>
                    </div>
                </UtilityNode>

                {/* 3. WEATHER HUB */}
                <UtilityNode title="Weather Forecast" icon="☁️">
                    <div className="text-center space-y-6">
                        <p className="text-6xl group-hover:scale-110 transition-transform duration-700">☀️</p>
                        <div>
                            <p className="text-4xl font-black text-white italic leading-none">28°C</p>
                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-2">Raipur Node: Clear Skies</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                            {['MON','TUE','WED'].map(d => (
                                <div key={d} className="p-3 bg-white/5 rounded-xl">
                                    <p className="text-[8px] font-black text-gray-600">{d}</p>
                                    <p className="text-sm my-1">🌦️</p>
                                    <p className="text-[9px] font-black text-white">24°</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </UtilityNode>

                {/* 4. BHASHA TRANSLATOR (Full-Width Add-on) */}
                <div className="lg:col-span-2">
                    <UtilityNode title="Bhasha Translator" icon="🗣️">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-gray-500 uppercase ml-4">Source Protocol</label>
                                <textarea placeholder="Type for AI translation..." className="w-full h-32 bg-black/40 border border-white/5 p-6 rounded-[2rem] text-white font-medium italic outline-none focus:border-orange-500/50" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-orange-500 uppercase ml-4">Neural Output</label>
                                <div className="w-full h-32 bg-white/5 border border-white/10 p-6 rounded-[2rem] text-orange-500 font-black italic flex items-center justify-center text-center">
                                    "Waiting for input node..."
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-4xl active:scale-95">
                            Execute Linguistic Uplink
                        </button>
                    </UtilityNode>
                </div>

                {/* 5. WORLD CLOCK */}
                <UtilityNode title="Path Chrono" icon="🕙">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5 group/clock">
                            <div>
                                <p className="text-white font-black text-lg italic uppercase">Bharat</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase">Asia/Kolkata</p>
                            </div>
                            <p className="text-2xl font-black text-orange-500 tracking-tighter animate-pulse">12:05:21 AM</p>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                            <div>
                                <p className="text-white font-black text-lg italic uppercase">London</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase">Europe/London</p>
                            </div>
                            <p className="text-2xl font-black text-white tracking-tighter">06:35:21 PM</p>
                        </div>
                    </div>
                </UtilityNode>

            </div>

            <footer className="mt-32 pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic">Utility Engine v4.8 • Designed by Shashank Mishra</p>
            </footer>

            <style>{`
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.6); }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Utilities;