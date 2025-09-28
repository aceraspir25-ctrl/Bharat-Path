import React, { useState, useEffect, useRef } from 'react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const CheckIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
);

const CrossIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
);

const passwordInitialState = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
};

const CriteriaItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <li className={`flex items-center transition-colors ${isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
        {isValid ? <CheckIcon /> : <CrossIcon />}
        <span className="ml-2">{text}</span>
    </li>
);

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState(passwordInitialState);
  
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
            console.log("Google Sign-In successful from Auth page.");
            onLoginSuccess();
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
  }, [gsiState, onLoginSuccess]);


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);

      if (mode === 'signup') {
          setPasswordCriteria({
              minLength: newPassword.length >= 8,
              uppercase: /[A-Z]/.test(newPassword),
              lowercase: /[a-z]/.test(newPassword),
              number: /[0-9]/.test(newPassword),
              specialChar: /[!@#$%^&*]/.test(newPassword),
          });
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if ((mode === 'signup' && (!name || !phone)) || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (mode === 'signup') {
        const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
        if (!allCriteriaMet) {
            setError('Please ensure your password meets all the criteria.');
            return;
        }
    }

    // In a real app, you would now call your backend to authenticate/create the user.
    // For this demo, we just log the action and proceed.
    if (mode === 'login') {
      console.log(`Simulating login for user: ${email}`);
    } else {
      console.log('Simulating account creation for:', { name, email, phone });
    }
    
    onLoginSuccess();
  };
  
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setPasswordCriteria(passwordInitialState);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {mode === 'login' ? 'Sign in to continue your journey.' : 'Join Bharat Path to start exploring.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="you@example.com"
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., 9876543210"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === 'signup' && (
              <ul className="space-y-1 text-xs list-none pl-1 mt-2">
                  <CriteriaItem isValid={passwordCriteria.minLength} text="At least 8 characters" />
                  <CriteriaItem isValid={passwordCriteria.lowercase} text="A lowercase letter (a-z)" />
                  <CriteriaItem isValid={passwordCriteria.uppercase} text="An uppercase letter (A-Z)" />
                  <CriteriaItem isValid={passwordCriteria.number} text="A number (0-9)" />
                  <CriteriaItem isValid={passwordCriteria.specialChar} text="A special character (!@#$%^&*)" />
              </ul>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
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

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleMode} className="font-medium text-orange-500 hover:text-orange-600 ml-1">
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>

       <button onClick={onBack} className="mt-8 text-sm text-gray-600 dark:text-gray-400 hover:underline">
          &larr; Back to Home
       </button>
    </div>
  );
};

export default AuthPage;