// @ts-nocheck
import React, { useEffect, useState } from 'react';

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGOTkzMyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMzg4MDgiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPjxmZURyb3BTaGFkb3cgZHg9IjEiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPjxwYXRoIGZpbGw9InVybCgjZ3JkKSIgZD0iTTUwIDAgQzI1IDAgNSAyMiA1IDUwIEM1IDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9nPjwvc3ZnPg==";

// Pehle types define karte hain
interface WelcomePageProps {
    onComplete: () => void;
}

const AppLogo: React.FC = () => (
    <div className="relative group">
        <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
        <img src={logoSrc} alt="Bharat Path Logo" className="w-32 h-32 rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.3)] relative z-10 transition-transform duration-1000 group-hover:scale-110" />
    </div>
);

const MandalaSVG: React.FC<any> = ({ className, rotationSpeed = '60s', scale = 1, reverse = false, opacity = 1 }) => (
    <svg 
        viewBox="0 0 200 200" 
        className={`${className} absolute inset-0 m-auto pointer-events-none transition-transform duration-700`}
        style={{ 
            animation: `rotate ${rotationSpeed} linear infinite ${reverse ? 'reverse' : 'normal'}`,
            transform: `scale(${scale})`,
            opacity: opacity
        }}
    >
        <g stroke="currentColor" strokeWidth="0.3" fill="none">
            <circle cx="100" cy="100" r="95" strokeDasharray="2 2" className="opacity-20" />
            {[...Array(12)].map((_, i) => (
                <path
                    key={i}
                    d="M100 10 C 130 50, 130 80, 100 100 C 70 80, 70 50, 100 10 Z"
                    transform={`rotate(${i * 30}, 100, 100)`}
                    className="mandala-path"
                />
            ))}
            <circle cx="100" cy="100" r="20" className="animate-pulse" />
        </g>
    </svg>
);

const WelcomePage: React.FC<WelcomePageProps> = ({ onComplete }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // FIX 1: Auto-redirect logic after animation
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete(); // Yeh function App.tsx ko batayega ki MainApp dikhao
        }, 3500); // 3.5 seconds ka buffer
        return () => clearTimeout(timer);
    }, [onComplete]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020208] p-4 overflow-hidden relative selection:bg-orange-500/30">
            
            <div className="absolute inset-0 z-0 overflow-hidden" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                <MandalaSVG className="text-orange-900" rotationSpeed="300s" scale={6} opacity={0.05} reverse />
                <MandalaSVG className="text-orange-500" rotationSpeed="180s" scale={3} opacity={0.08} />
                <MandalaSVG className="text-white" rotationSpeed="120s" scale={1.5} opacity={0.1} reverse />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
                <div className="mb-12 welcome-logo-container">
                    <AppLogo />
                </div>

                <div className="space-y-8">
                    <div className="welcome-namaste">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.8em] mb-4 block">Welcome to the Registry</span>
                        <h2 className="text-5xl md:text-6xl text-white font-light tracking-[0.1em] uppercase leading-none">
                            Namaste <span className="font-serif italic text-orange-500/80 ml-2">नमस्ते</span>
                        </h2>
                    </div>

                    <h1 className="welcome-title text-8xl md:text-9xl font-black tracking-tighter leading-none">
                        <span className="bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">BHARAT</span>
                        <br />
                        <span className="bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(249,115,22,0.3)]">PATH</span>
                    </h1>

                    <div className="welcome-tagline space-y-6">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.6em] opacity-60">
                            Universal Spiritual & Physical Connectivity Hub
                        </p>
                        
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-orange-500 w-1/2 animate-scan"></div>
                            </div>
                            <p className="text-[8px] font-black text-orange-500/60 uppercase tracking-[0.3em] animate-pulse">Initializing Path Intelligence...</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] whitespace-nowrap">
                System Architecture by Shashank Mishra
            </div>

            <style>{`
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                
                .welcome-logo-container { opacity: 0; animation: reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards; }
                .welcome-namaste { opacity: 0; animation: revealUp 1s ease-out 0.6s forwards; }
                .welcome-title { opacity: 0; animation: revealUp 1s ease-out 0.9s forwards; }
                .welcome-tagline { opacity: 0; animation: revealUp 1s ease-out 1.2s forwards; }

                @keyframes reveal { from { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(20px); } to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); } }
                @keyframes revealUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                
                .mandala-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 5s ease-in-out forwards; }
                @keyframes draw { to { stroke-dashoffset: 0; } }

                .animate-scan { animation: scan 2s linear infinite; }
            `}</style>
        </div>
    );
};

export default WelcomePage;