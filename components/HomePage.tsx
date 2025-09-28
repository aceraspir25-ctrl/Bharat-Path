import React, { useEffect, useRef, useState } from 'react';

interface HomePageProps {
  onLogin: () => void;
  onShowAuth: () => void;
}

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjk5MzMiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTM4ODA4IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjZ3JhZCkiIGQ9Ik01MCAwIEMyNSAwIDUgMjIgNSA1MCAxIDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFogTTUwIDc1IEMzNi4yIDc1IDI1IDYzLjggMjUgNTIgUzM2LjIgMjUgNTAgMjUgNzUgMzYuMiA3NSA1MCA2My44IDc1IDUwIDc1IFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIiIvPjwvc3ZnPg==";

const AppLogo: React.FC = () => (
    <div className="flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-48 h-48 rounded-3xl shadow-lg" />
        <h2 className="mt-4 text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">
            Bharat Path
        </h2>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin, onShowAuth }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [gsiState, setGsiState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gsiError, setGsiError] = useState<string | null>(null);

  // Poll for the Google Sign-In script to be loaded with a timeout.
  useEffect(() => {
    const POLLING_INTERVAL = 200;
    const POLLING_TIMEOUT = 10000; // 10 seconds
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      if (pollTimer) {
        clearInterval(pollTimer);
        setGsiState('error');
        setGsiError('Google Sign-In failed to load. Please try again later.');
      }
    }, POLLING_TIMEOUT);

    pollTimer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGsiState('ready');
        clearInterval(pollTimer!);
        clearTimeout(timeout);
      }
    }, POLLING_INTERVAL);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize and render the Google Sign-In button once the script is available.
  useEffect(() => {
    if (gsiState === 'ready' && googleButtonRef.current) {
      if (googleButtonRef.current.childElementCount > 0) {
        return; // Button already rendered
      }

      try {
        const clientId = process.env.API_KEY;
        if (!clientId) {
          console.error("API_KEY for Google Sign-In is missing. Google Sign-In will not work.");
          setGsiState('error');
          setGsiError('Google Sign-In is misconfigured. The required API key is missing.');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            console.log("Google Sign-In successful.");
            onLogin();
          },
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { 
            theme: 'filled_blue', 
            size: 'large', 
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setGsiState('error');
        setGsiError('Could not initialize Google Sign-In. The provided API key may be invalid.');
      }
    }
  }, [gsiState, onLogin]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <AppLogo />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mt-6">
          Your AI Travel Guide to India
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Discover the soul of India with Bharat Path. Let our AI guide you through ancient stories, vibrant cultures, and breathtaking landscapes. Plan your perfect journey, find the best stays, and travel with confidence.
        </p>
      </div>

      <div className="mt-12 space-y-4 w-full max-w-xs">
        <button
          onClick={onShowAuth}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Login
        </button>
        <button
          onClick={onShowAuth}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg border border-gray-300 shadow-lg transition-transform transform hover:scale-105 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Sign Up
        </button>
        <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div ref={googleButtonRef} className="w-full flex justify-center items-center h-[40px]">
            {gsiState === 'loading' && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading Google Sign-In...</span>
                </div>
            )}
            {gsiState === 'error' && <p className="text-xs text-red-500">{gsiError}</p>}
        </div>
      </div>
    </div>
  );
};

export default HomePage;