// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { RouteIcon } from './icons/Icons';

interface HomePageProps {
    onLogin: () => void;
    onShowAuth: () => void;
}

// Optimized Logo Component
const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center animate-fadeIn">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-5xl border-4 border-white/10">
            🧭
        </div>
        <h2 className="mt-6 text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
            Bharat <span className="text-orange-500">Path</span>
        </h2>
        <div className="mt-2 px-4 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Universal Intelligence</p>
        </div>
    </div>
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string; color: string; delay: number }> = ({ icon, title, description, color, delay }) => (
    <div 
        className={`bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 flex flex-col items-center text-center transition-all hover:scale-105 hover:bg-white/10 group animate-fadeIn`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`text-4xl mb-6 p-5 rounded-[2rem] bg-white/5 group-hover:bg-orange-500/20 transition-colors ${color}`}>
            {icon}
        </div>
        <h3 className="text-xl font-black text-white mb-3 uppercase italic tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin, onShowAuth }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [gsiState, setGsiState] = useState<'loading' | 'ready' | 'error'>('loading');

  // Logic to safely detect Google GSI library
  useEffect(() => {
    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setGsiState('ready');
      }
    };
    const timer = setInterval(checkGSI, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gsiState === 'ready' && googleButtonRef.current) {
      try {
        // Use your Google Client ID here
        const clientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: () => onLogin(),
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, { 
          theme: 'outline', 
          size: 'large', 
          shape: 'pill',
          width: 300
        });
      } catch (error) {
        console.error("GSI Error:", error);
      }
    }
  }, [gsiState, onLogin]);

  return (
    <div className="min-h-screen bg-[#0a0b14] overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6 flex flex-col items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
          <AppLogo />
          
          <div className="text-center mt-12 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              ONE PATH. <br/>
              <span className="text-orange-500">EVERY NODE.</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Experience the world's first AI-native travel registry. From Raipur's hidden gems to global frontiers, navigate with the intelligence of Gemini 1.5 Pro.
            </p>
          </div>

          <div className="mt-16 flex flex-col md:flex-row gap-6 w-full justify-center items-center">
            <button
              onClick={onShowAuth}
              className="w-full md:w-auto px-16 py-5 bg-orange-500 text-white font-black rounded-full shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
            >
              Initialize Explorer ➔
            </button>
            <div ref={googleButtonRef} className="min-w-[300px] flex justify-center bg-white rounded-full overflow-hidden" />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.6em] mb-4">Neural Infrastructure</h2>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tight">Global Capabilities</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🌍" 
              title="Universal Maps" 
              description="Native integration with Leaflet & CartoDB for high-fidelity spatial awareness across all continents." 
              color="text-blue-500"
              delay={100}
            />
            <FeatureCard 
              icon="🎙️" 
              title="Voice Protocol" 
              description="Low-latency neural voice synthesis tuned for multi-lingual travel guidance and local greetings." 
              color="text-purple-500"
              delay={200}
            />
            <FeatureCard 
              icon="🧭" 
              title="Path Darshak" 
              description="Advanced route optimization engines that master terrain from Raipur to the Himalayas." 
              color="text-orange-500"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Branding Footer */}
      <footer className="py-24 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Architected by</p>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Shashank Mishra</h2>
          <div className="mt-6">
            <button onClick={onShowAuth} className="text-orange-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
              Access Universal Dashboard ➔
            </button>
          </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default HomePage;