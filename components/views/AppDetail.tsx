// @ts-nocheck
import React from 'react';

const AppDetail: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 animate-fadeIn">
      {/* Main Glassmorphism Container */}
      <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden">
        
        {/* Aesthetic Glow Decor */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"></div>

        <header className="text-center relative z-10">
          <div className="inline-block px-4 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
            <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.5em]">System Version 1.0.4</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            Bharat <span className="text-orange-500">Path</span>
          </h1>
          <h2 className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-[0.4em]">
            Universal Travel & Tourism Intelligence
          </h2>
        </header>

        <div className="my-12 flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        </div>

        <article className="space-y-8 text-center max-w-3xl mx-auto relative z-10">
          <p className="text-xl text-gray-300 leading-relaxed font-medium">
            With Bharat Path, you don't just travel; you synchronize with the <span className="text-white font-black italic underline decoration-orange-500 underline-offset-8">Soul of Humanity</span>. 
            Our neural network connects you with ancient wisdom, vibrant cultures, and the hidden routes that define our world.
          </p>

          <blockquote className="py-10 px-8 bg-white/5 border-x-2 border-orange-500/30 italic text-white rounded-[2.5rem] relative group hover:bg-white/10 transition-all duration-700">
            <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              "Every mile is a node in a global story. Bharat Path isn't just a map; it's the key to unlocking the world's deep heritage."
            </p>
            <div className="mt-6 text-[10px] font-black text-orange-500 uppercase tracking-widest">— Shashank Mishra, Founder</div>
          </blockquote>
          
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">
            Architected in <span className="text-orange-500">Raipur</span> for the <span className="text-white">Global Explorer</span>. 
            This interface is where cutting-edge AI meets centuries of history.
          </p>
        </article>

        {/* Global Tech Specs - Worldwide Appeal */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/5">
            {[
                { label: 'Engine', val: 'Gemini 3 Pro' },
                { label: 'Network', val: 'Global Mesh' },
                { label: 'Security', val: 'E2E Encrypted' },
                { label: 'Uplink', val: 'Neural Voice' }
            ].map((spec, i) => (
                <div key={i} className="text-center p-4 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[8px] font-black text-gray-600 uppercase mb-1">{spec.label}</p>
                    <p className="text-[10px] font-black text-white uppercase">{spec.val}</p>
                </div>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AppDetail;