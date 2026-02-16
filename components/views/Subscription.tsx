// @ts-nocheck
import React from 'react';
import { useUser } from '../../contexts/UserContext';

const Subscription: React.FC = () => {
  const { profile } = useUser();
  const myUPI = "shashankm887@okicici";

  const plans = [
    {
      name: "Yatri Standard",
      price: 49,
      period: "/month",
      features: ["Ad-free experience", "AI Itinerary Planning", "Priority Safety Access"],
      color: "border-gray-500",
      button: "bg-gray-700",
      icon: "🧭"
    },
    {
      name: "Yatri Global Gold",
      price: 99,
      period: "/month",
      features: ["All Standard Features", "Global Chat Connectivity", "Auto-Voice Translation", "Smart Tracking Alerts"],
      color: "border-orange-500",
      button: "bg-gradient-to-r from-orange-500 to-red-600",
      popular: true,
      icon: "✨"
    }
  ];

  // --- UPI PAYMENT GATEWAY PROTOCOL ---
  const handlePayment = (planName: string, amount: number) => {
    const transactionId = `BHP-${Date.now()}`;
    const note = `Bharat Path Subscription: ${planName} for ${profile.name}`;
    
    // Deep Link URI for UPI
    const upiUrl = `upi://pay?pa=${myUPI}&pn=Shashank%20Mishra&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR&tr=${transactionId}`;

    // Action: Open UPI Apps on Mobile
    window.location.href = upiUrl;
  };

  return (
    <div className="max-w-5xl mx-auto pb-40 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar">
      
      {/* Dynamic Header */}
      <div className="text-center py-16 space-y-6">
        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Choose <span className="text-orange-500">Path</span></h1>
        <p className="text-gray-500 text-[10px] font-black tracking-[0.5em] uppercase px-1">Unlock Universal Travel Intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {plans.map((plan, i) => (
          <div key={i} className={`group relative p-12 bg-white/5 backdrop-blur-3xl rounded-[4rem] border-2 transition-all duration-700 hover:shadow-[0_20px_80px_rgba(249,115,22,0.15)] flex flex-col ${plan.color}`}>
            
            {plan.popular && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black px-8 py-2 rounded-full uppercase tracking-widest shadow-2xl animate-bounce">
                Most Popular Node
              </span>
            )}
            
            <div className="mb-12 relative">
              <span className="text-6xl mb-6 block group-hover:scale-125 transition-transform duration-700">{plan.icon}</span>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mt-6">
                <span className="text-7xl font-black text-white tracking-tighter italic">₹{plan.price}</span>
                <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-6 mb-16 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-4">
                  <span className="text-orange-500">⚡</span> {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePayment(plan.name, plan.price)}
              className={`w-full py-7 rounded-[2rem] font-black text-white uppercase tracking-[0.3em] text-[10px] shadow-3xl transition-all active:scale-95 group-hover:brightness-125 ${plan.button}`}
            >
              Initialize Payment ➔
            </button>
            
            <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-white/[0.01] pointer-events-none select-none uppercase italic">{plan.name.split(' ')[1]}</div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#0a0b14] border border-white/5 p-10 rounded-[3.5rem] text-center shadow-inner group">
        <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.4em] mb-4">Neural Security Guarantee</p>
        <p className="text-gray-600 text-xs font-medium leading-relaxed max-w-lg mx-auto italic uppercase opacity-60">
          Payment is routed through secure UPI nodes. Your explorer registry will update instantly upon transaction confirmation.
        </p>
      </div>

      <style>{`
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Subscription;