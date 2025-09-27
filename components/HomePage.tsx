import React, { useEffect, useRef } from 'react';

interface HomePageProps {
  onLogin: () => void;
  onShowAuth: () => void;
}

const logoSrc = "data:image/jpeg;base64,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 obscene amount of characters here /v/Q+r/o/T0/l/wDRH/o//wCHo/Q/9L/T+f8A0H736P0/H/wBH/p//4j+h/wCl/p/P/oP3v0fp+P8A6P8A0//APEf0P8A0v8AT+f/AEH736P0/H/0f+n//AIj+h/6X+n8/9F//2Q==";

const AppLogo: React.FC = () => (
    <div className="flex justify-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-48 h-48 rounded-3xl shadow-lg" />
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin, onShowAuth }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !googleButtonRef.current) {
        return;
    }

    if (googleButtonRef.current.childElementCount > 0) {
        return; // Button is already rendered, prevent duplicates
    }

    window.google.accounts.id.initialize({
        // The Google Client ID MUST be obtained from the environment variable.
        // It is assumed to be pre-configured, valid, and accessible.
        client_id: process.env.GOOGLE_CLIENT_ID!,
        callback: (response: any) => {
            // A real app would verify the token on a backend server.
            // For this demo, a successful callback is sufficient to log the user in.
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
  }, [onLogin]);

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
        <div ref={googleButtonRef} className="w-full flex justify-center"></div>
      </div>
    </div>
  );
};

export default HomePage;