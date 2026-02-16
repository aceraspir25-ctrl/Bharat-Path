// @ts-nocheck
import React from 'react';
import { TravelTipsIcon } from '../icons/Icons';

const travelTipsData = [
  {
    category: 'Packing Logistics',
    icon: '🧳',
    tips: [
      { title: 'Breathable Fabrics', content: 'Pack cotton and linen for the Indian sun. Always keep a shawl for sudden north-side cooling or religious entry.' },
      { title: 'Removal Footwear', content: 'Sandals are essential. You will be removing them frequently at temples and local homes.' },
      { title: 'Type C/D/M Adapters', content: 'India uses specific pin configurations. A universal node adapter is mandatory for your gear.' },
    ]
  },
  {
    category: 'Bio-Intelligence (Health)',
    icon: '🏥',
    tips: [
      { title: 'Hydration Protocol', content: 'Only consume sealed mineral water. Avoid tap water even for dental hygiene nodes.' },
      { title: 'Street Food Interrogation', content: 'Choose stalls with high turnover where food is synthesized fresh in front of you.' },
      { title: 'Heat Sync', content: 'Carry electrolyte salts. The Indian tropical mesh can dehydrate global nodes quickly.' },
    ]
  },
  {
    category: 'Cultural Protocols',
    icon: '🕉️',
    tips: [
      { title: 'Modesty Filter', content: 'Cover shoulders and knees at heritage sites. It respects the local cultural frequency.' },
      { title: 'Right Hand Priority', content: 'The left hand is considered secondary. Use your right hand for exchange and consumption.' },
      { title: 'Elder Recognition', content: 'Respect elders first. Use "Namaste" with joined palms to sync with local respect nodes.' },
    ]
  },
  {
    category: 'Linguistic Uplink (Hindi)',
    icon: '🗣️',
    tips: [
        { title: 'Dhanyavaad', content: 'The gratitude protocol: "Thank you".' },
        { title: 'Kitna hua?', content: 'Interrogate price: "How much is this?".' },
        { title: 'Madad', content: 'High-priority alert: "Help".' },
    ]
  }
];

const TipCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="group bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-orange-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <h4 className="font-black text-white uppercase italic tracking-tighter text-lg group-hover:text-orange-500 transition-colors">{title}</h4>
            <p className="text-gray-400 text-xs font-medium mt-4 leading-relaxed italic">"{content}"</p>
        </div>
        <div className="absolute -bottom-2 -right-2 text-4xl opacity-[0.03] group-hover:opacity-10 transition-opacity">⚡</div>
    </div>
);


const TravelTips: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto pb-40 animate-fadeIn px-6 h-screen overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
      
      {/* Cinematic Header */}
      <div className="text-center py-16 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-orange-500/5 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 inline-flex items-center justify-center p-6 bg-orange-500/10 rounded-[2.5rem] mb-4 text-orange-500 border border-orange-500/20 shadow-2xl animate-float">
            <TravelTipsIcon className="w-10 h-10" />
        </div>
        <h1 className="relative z-10 text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Travel <span className="text-orange-500">Wisdom</span></h1>
        <p className="relative z-10 text-gray-500 text-[10px] font-black tracking-[0.6em] uppercase">Universal Protocol for the Global Explorer</p>
      </div>

      <div className="space-y-24">
        {travelTipsData.map((categoryData, i) => (
          <section key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-center gap-6 mb-10 px-4">
                <span className="text-4xl">{categoryData.icon}</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    {categoryData.category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              {categoryData.tips.map((tip, idx) => (
                <TipCard key={idx} title={tip.title} content={tip.content} />
              ))}
            </div>
            
            {/* Pro-Tip Add-on */}
            <div className="mt-8 mx-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4 group">
                <span className="text-blue-500 font-black text-xs uppercase tracking-widest">PRO-NODE:</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight group-hover:text-blue-400 transition-colors">Download offline maps for this region via the Map Registry.</p>
            </div>
          </section>
        ))}
      </div>

      {/* Founder Signature Footer */}
      <footer className="mt-32 pt-10 border-t border-white/5 text-center">
        <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic">Knowledge Architecture by Shashank Mishra • Bharat Path v4.5</p>
      </footer>

      <style>{`
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TravelTips;