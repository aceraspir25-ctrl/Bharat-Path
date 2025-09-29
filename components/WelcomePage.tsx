import React from 'react';

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGOTkzMyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMzg4MDgiIC8+PC9saW5lYXJHcmFkaWVudD48ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPjxmZURyb3BTaGFkb3cgZHg9IjEiIGR5PSIyIiBzdGREZXZpYXRpb249IjIiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz48L2ZpbHRlcj48L2RlZnM+PGcgZmlsdGVyPSJ1cmwoI3NoYWRvdykiPjxwYXRoIGZpbGw9InVybCgjZ3JkKSIgZD0iTTUwIDAgQzI1IDAgNSAyMiA1IDUwIEM1IDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9nPjwvc3ZnPg==";

const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-32 h-32 rounded-3xl shadow-lg" />
    </div>
);

const NamasteGesture: React.FC = () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto text-gray-600 dark:text-gray-400">
        <path d="M 40 90 C 40 70, 25 60, 25 40 C 25 20, 40 10, 50 10" stroke="currentColor" fill="transparent" strokeWidth="8" strokeLinecap="round" />
        <path d="M 60 90 C 60 70, 75 60, 75 40 C 75 20, 60 10, 50 10" stroke="currentColor" fill="transparent" strokeWidth="8" strokeLinecap="round" />
    </svg>
);


const WelcomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900 p-4">
            <div className="text-center max-w-2xl mx-auto animate-fadeInUp">

                <NamasteGesture />

                <h2 className="text-3xl text-gray-700 dark:text-gray-300 mt-4 font-light">
                    Namaste <span className="font-serif">नमस्ते</span>
                </h2>

                <div className="my-8">
                    <AppLogo />
                </div>

                 <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">
                    Welcome to<br />
                    <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">
                        Bharat Path
                    </span>
                </h1>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 1.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default WelcomePage;