
import React, { useEffect, useRef, useState } from 'react';
import { FacebookIcon, MicrosoftIcon, RouteIcon } from './icons/Icons';

interface HomePageProps {
  onLogin: () => void;
  onShowAuth: () => void;
}

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGOTkzMyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMzg4MDgiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPjxmZURyb3BTaGFkb3cgZHg9IjEiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPjxwYXRoIGZpbGw9InVybCgjZ3JkKSIgZD0iTTUwIDAgQzI1IDAgNSAyMiA1IDUwIEM1IDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9nPjwvc3ZnPg==";

const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-lg" />
        <h2 className="mt-4 text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">
            Bharat Path
        </h2>
    </div>
);

const FeatureCard: React.FC<{ icon: string; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-2xl">
        <div className={`text-4xl mb-4 p-4 rounded-full ${color} bg-opacity-10`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin, onShowAuth }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [gsiState, setGsiState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const pollTimer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGsiState('ready');
        clearInterval(pollTimer);
      }
    }, 200);
    return () => clearInterval(pollTimer);
  }, []);

  useEffect(() => {
    if (gsiState === 'ready' && googleButtonRef.current && googleButtonRef.current.childElementCount === 0) {
      try {
        const clientId = process.env.API_KEY;
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: () => onLogin(),
          });
          window.google.accounts.id.renderButton(googleButtonRef.current, { 
            theme: 'filled_blue', 
            size: 'large', 
            text: 'continue_with',
            shape: 'rectangular',
            width: "300"
          });
        }
      } catch (error) {
        setGsiState('error');
      }
    }
  }, [gsiState, onLogin]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 px-4 bg-gradient-to-br from-orange-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <AppLogo />
          <div className="text-center mt-8 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight">
              One Path. <span className="text-orange-600">The Entire</span> Planet.
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
              Your AI travel companion for every corner of the Earth. From sacred temples to hidden cafes, from majestic rivers to urban routes—walk the global path with total intelligence.
            </p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-4 w-full justify-center items-center">
            <button
              onClick={onShowAuth}
              className="w-full md:w-auto px-12 py-4 bg-orange-600 text-white font-black rounded-full shadow-2xl hover:bg-orange-700 transition-all transform hover:scale-105"
            >
              START EXPLORING
            </button>
            <div ref={googleButtonRef} className="min-w-[300px] flex justify-center" />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-800 dark:text-white mb-12 uppercase tracking-widest">Global Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🌍" 
              title="Universal Maps" 
              description="Interactive knowledge of every city, river, church, temple, and tiny village across the world." 
              color="text-blue-600"
            />
            <FeatureCard 
              icon="🏘️" 
              title="Establishment Guide" 
              description="Instantly find the best hotels, restaurants, and local cafes in any country with real-time AI grounding." 
              color="text-red-600"
            />
            <FeatureCard 
              icon="🧭" 
              title="Global Path Darshak" 
              description="A route planner that masters every terrain. Whether it's the Himalayas or the Streets of Tokyo, we guide the way." 
              color="text-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="py-12 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-around items-center opacity-50 grayscale gap-8">
            <span className="text-2xl font-bold">Global Explorer</span>
            <span className="text-2xl font-bold">Smart Logistics</span>
            <span className="text-2xl font-bold">Universal Search</span>
            <span className="text-2xl font-bold">AI Companion</span>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 text-center px-4">
         <p className="text-gray-500 mb-6">Ready to see the world?</p>
         <button onClick={onShowAuth} className="text-orange-600 font-bold hover:underline">Log in to your universal dashboard</button>
      </footer>
    </div>
  );
};

export default HomePage;
