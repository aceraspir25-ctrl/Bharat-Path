
import React from 'react';

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGOTkzMyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMzg4MDgiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPjxmZURyb3BTaGFkb3cgZHg9IjEiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPjxwYXRoIGZpbGw9InVybCgjZ3JkKSIgZD0iTTUwIDAgQzI1IDAgNSAyMiA1IDUwIEM1IDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9nPjwvc3ZnPg==";

const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-24 h-24 rounded-3xl shadow-2xl relative z-10" />
    </div>
);

const MandalaSVG: React.FC<{ className?: string; rotationSpeed?: string; scale?: number; reverse?: boolean }> = ({ className, rotationSpeed = '60s', scale = 1, reverse = false }) => (
    <svg 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${className} absolute inset-0 m-auto pointer-events-none`}
        style={{ 
            animation: `rotate ${rotationSpeed} linear infinite ${reverse ? 'reverse' : 'normal'}`,
            transform: `scale(${scale})`
        }}
    >
        <defs>
            <filter id="glow-welcome">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow-welcome)" stroke="currentColor" strokeWidth="0.5" fill="none">
            {/* Outer Decorative Rings */}
            <circle cx="100" cy="100" r="95" className="mandala-path opacity-20" />
            <circle cx="100" cy="100" r="90" className="mandala-path opacity-40" strokeDasharray="4 4" />
            
            {/* Outer Petals */}
            {[...Array(24)].map((_, i) => (
                <path
                    key={`petal-outer-${i}`}
                    className="mandala-path"
                    d="M100 10 C 115 35, 115 55, 100 70 C 85 55, 85 35, 100 10 Z"
                    transform={`rotate(${i * 15}, 100, 100)`}
                    style={{ animationDelay: `${i * 0.05}s`, opacity: 0.6 }}
                />
            ))}

            {/* Secondary Petal Layer */}
            {[...Array(12)].map((_, i) => (
                <path
                    key={`petal-inner-${i}`}
                    className="mandala-path"
                    d="M100 40 C 110 55, 110 75, 100 85 C 90 75, 90 55, 100 40 Z"
                    transform={`rotate(${i * 30 + 15}, 100, 100)`}
                    style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                />
            ))}

            {/* Inner Radiating Lines */}
            {[...Array(36)].map((_, i) => (
                <line 
                    key={`line-${i}`}
                    className="mandala-path opacity-30"
                    x1="100" y1="100" x2="100" y2="20" 
                    transform={`rotate(${i * 10}, 100, 100)`}
                    style={{ animationDelay: `${1 + i * 0.02}s` }}
                />
            ))}

            {/* Center Core */}
            <circle cx="100" cy="100" r="15" className="mandala-path" />
            <circle cx="100" cy="100" r="5" fill="currentColor" className="animate-pulse" />
        </g>
    </svg>
);


const WelcomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] p-4 overflow-hidden relative">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Ultra-Large Background Mandala (Slow Reverse) */}
                <MandalaSVG 
                    className="text-orange-900/10" 
                    rotationSpeed="240s" 
                    scale={5} 
                    reverse 
                />
                
                {/* Medium Layer (Mid Speed) */}
                <MandalaSVG 
                    className="text-orange-500/5" 
                    rotationSpeed="120s" 
                    scale={2.5} 
                />

                {/* Focus Layer (Standard Speed) */}
                <MandalaSVG 
                    className="text-orange-400/20" 
                    rotationSpeed="80s" 
                    scale={1.2} 
                />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                    {/* Concentric Glow effect behind logo */}
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-[60px] animate-pulse"></div>
                    <div className="absolute inset-12 bg-white/5 rounded-full blur-[40px]"></div>
                    
                    <div className="welcome-logo-container">
                        <AppLogo />
                    </div>
                </div>
                
                <div className="text-center">
                    <h2 className="welcome-namaste text-4xl text-gray-300 font-light tracking-[0.2em] uppercase">
                        Namaste <span className="font-serif ml-2 opacity-60">नमस्ते</span>
                    </h2>

                    <h1 className="welcome-title text-6xl md:text-7xl font-black mt-6">
                        <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent drop-shadow-2xl">
                            Bharat Path
                        </span>
                    </h1>
                    
                    <p className="welcome-tagline text-gray-500 text-sm font-bold uppercase tracking-[0.5em] mt-6 opacity-60">
                        Universal Connection Hub
                    </p>
                    
                    {/* Interactive Loading Indicator */}
                    <div className="mt-12 flex justify-center gap-3 welcome-tagline">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes rotate {
                    from { transform: rotate(0deg) scale(var(--tw-scale-x)); }
                    to { transform: rotate(360deg) scale(var(--tw-scale-x)); }
                }

                @keyframes draw {
                    from { stroke-dashoffset: 600; opacity: 0; }
                    to { stroke-dashoffset: 0; opacity: 1; }
                }
                
                .mandala-path {
                    stroke-dasharray: 600;
                    stroke-dashoffset: 600;
                    animation: draw 3s ease-out forwards;
                }

                @keyframes fadeInScale {
                  from { opacity: 0; transform: scale(0.85); filter: blur(10px); }
                  to { opacity: 1; transform: scale(1); filter: blur(0px); }
                }

                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }

                .welcome-logo-container {
                    opacity: 0;
                    animation: fadeInScale 1.5s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards;
                }
                .welcome-namaste {
                    opacity: 0;
                    animation: fadeIn 1.2s ease-out 1.8s forwards;
                }
                .welcome-title {
                    opacity: 0;
                    animation: fadeIn 1.2s ease-out 2s forwards;
                }
                .welcome-tagline {
                    opacity: 0;
                    animation: fadeIn 1.2s ease-out 2.4s forwards;
                }

                /* Custom Scrollbar for the whole app just in case */
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 153, 51, 0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255, 153, 51, 0.4); }
            `}</style>
        </div>
    );
};

export default WelcomePage;
