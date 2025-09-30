import React from 'react';

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGOTkzMyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMzg4MDgiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPjxmZURyb3BTaGFkb3cgZHg9IjEiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPjxwYXRoIGZpbGw9InVybCgjZ3JkKSIgZD0iTTUwIDAgQzI1IDAgNSAyMiA1IDUwIEM1IDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9nPjwvc3ZnPg==";

const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-24 h-24 rounded-3xl shadow-lg" />
    </div>
);

const AnimatedMandala: React.FC = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 absolute inset-0 m-auto text-orange-400 dark:text-orange-500 opacity-80">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)" stroke="currentColor" strokeWidth="1" fill="none">
            {/* Outer Petals */}
            {[...Array(12)].map((_, i) => (
                <path
                    key={`petal-outer-${i}`}
                    className="mandala-path"
                    d="M100 20 C 120 40, 120 65, 100 85 C 80 65, 80 40, 100 20 Z"
                    transform={`rotate(${i * 30}, 100, 100)`}
                    style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                />
            ))}
            {/* Inner Circle */}
            <circle cx="100" cy="100" r="20" className="mandala-path" style={{ animationDelay: '0s' }}/>
             {/* Lines */}
            {[...Array(12)].map((_, i) => (
                <line 
                    key={`line-${i}`}
                    className="mandala-path"
                    x1="100" y1="100" x2="100" y2="25" 
                    transform={`rotate(${i * 30}, 100, 100)`}
                    style={{ animationDelay: `${1.2 + i * 0.05}s` }}
                />
            ))}
            <circle cx="100" cy="100" r="85" className="mandala-path" style={{ animationDelay: '0.2s' }}/>
        </g>
    </svg>
);


const WelcomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900 p-4 overflow-hidden">
            <div className="relative w-64 h-64 flex items-center justify-center">
                <AnimatedMandala />
                <div className="welcome-logo-container">
                    <AppLogo />
                </div>
            </div>
            
            <div className="text-center mt-8">
                <h2 className="welcome-namaste text-4xl text-gray-700 dark:text-gray-300 font-light">
                    Namaste <span className="font-serif">नमस्ते</span>
                </h2>

                 <h1 className="welcome-title text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white mt-4">
                    <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">
                        Bharat Path
                    </span>
                </h1>
                
                <p className="welcome-tagline text-gray-600 dark:text-gray-400 mt-4">
                    Your journey into the heart of India begins.
                </p>
            </div>
            
            <style>{`
                @keyframes draw {
                    from { stroke-dashoffset: 500; }
                    to { stroke-dashoffset: 0; }
                }
                .mandala-path {
                    stroke-dasharray: 500;
                    stroke-dashoffset: 500;
                    animation: draw 2s ease-out forwards;
                }

                @keyframes fadeInScale {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 1; transform: scale(1); }
                }

                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                .welcome-logo-container {
                    opacity: 0;
                    animation: fadeInScale 1s ease-out 1.8s forwards;
                }
                .welcome-namaste {
                    opacity: 0;
                    animation: fadeIn 1s ease-out 2.2s forwards;
                }
                .welcome-title {
                    opacity: 0;
                    animation: fadeIn 1s ease-out 2.4s forwards;
                }
                .welcome-tagline {
                    opacity: 0;
                    animation: fadeIn 1s ease-out 2.6s forwards;
                }
            `}</style>
        </div>
    );
};

export default WelcomePage;