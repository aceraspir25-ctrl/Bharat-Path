import React from 'react';
import { GlobeIcon, MicrophoneIcon, BellIcon, SafetyIcon, CompassIcon, RouteIcon } from '../icons/Icons';

const Subscription: React.FC = () => {
  const plans = [
    {
      name: "Yatri Standard",
      price: "₹49",
      period: "/month",
      features: ["Ad-free experience", "AI Itinerary Planning", "Priority Safety Access"],
      color: "border-gray-500",
      button: "bg-gray-700",
      icon: "🧭"
    },
    {
      name: "Yatri Global Gold",
      price: "₹99",
      period: "/month",
      features: ["All Standard Features", "Global Chat Connectivity", "Auto-Voice Translation", "Smart Tracking Alerts"],
      color: "border-orange-500",
      button: "bg-gradient-to-r from-orange-500 to-red-600",
      popular: true,
      icon: "✨"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 animate-fadeIn pb-24">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">CHOOSE YOUR PATH</h1>
        <p className="text-orange-500 text-[10px] font-black tracking-[0.5em] uppercase">Upgrade to unlock global travel intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <div key={i} className={`relative p-10 bg-[#1A1C26] rounded-[45px] border-2 ${plan.color} shadow-2xl transition-all hover:scale-[1.02] hover:shadow-orange-500/10 flex flex-col`}>
            {plan.popular && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                Most Popular
              </span>
            )}
            
            <div className="mb-10 text-center md:text-left">
              <span className="text-4xl mb-4 block">{plan.icon}</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline justify-center md:justify-start gap-1 mt-4">
                <span className="text-6xl font-black text-white tracking-tighter">{plan.price}</span>
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-5 mb-12 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4 text-sm font-bold text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 text-xs">✔</span> 
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-6 rounded-[2rem] font-black text-white uppercase tracking-[0.2em] text-xs shadow-xl ${plan.button} active:scale-95 transition-all hover:brightness-110`}>
              Initialize Protocol
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden group">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] relative z-10">
          Neural Guarantee Included
        </p>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.1em] mt-2 relative z-10">
          Include 3-Day Free Trial for New Explorers
        </p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] group-hover:scale-150 transition-transform"></div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Subscription;