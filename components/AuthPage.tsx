import React, { useState, useEffect, useRef } from 'react';
import { FacebookIcon, MicrosoftIcon } from './icons/Icons';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
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
            callback: (response: any) => {
              // Simulation: In a real app we would decode the JWT and get the name
              localStorage.setItem('userName', 'Yatri'); 
              localStorage.setItem('isLoggedIn', 'true');
              onLoginSuccess();
            },
          });
          window.google.accounts.id.renderButton(googleButtonRef.current, { 
            theme: 'filled_blue', 
            size: 'large', 
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (error) {}
    }
  }, [gsiState, onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name) {
      setError('Please provide your name.');
      return;
    }

    if (!email || !password) {
      setError('Missing credentials.');
      return;
    }

    // Persist Name Protocol
    if (mode === 'signup') {
        localStorage.setItem('userName', name);
    } else {
        const existingName = localStorage.getItem('userName');
        if (!existingName) localStorage.setItem('userName', 'Yatri');
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-10">
        <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
          {mode === 'login' ? 'Path Login' : 'Initialize Explorer'}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-bold uppercase tracking-widest text-[10px]">
          {mode === 'login' ? 'Synchronize your travel history' : 'Register your universal identity'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold dark:text-white shadow-inner" placeholder="Bharat Explorer" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold dark:text-white shadow-inner" placeholder="yatri@domain.com" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Registry Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold dark:text-white shadow-inner" placeholder="••••••••" />
          </div>

          {error && <p className="text-[10px] text-red-500 text-center font-black uppercase">{error}</p>}

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs active:scale-95">
            {mode === 'login' ? 'Authorize Path' : 'Create Registry'}
          </button>
        </form>

        <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">or link via</span>
            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
        </div>
        
        <div className="space-y-3">
          <div ref={googleButtonRef} className="w-full flex justify-center" />
          <button onClick={onLoginSuccess} className="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-700 dark:text-white font-bold py-4 rounded-2xl shadow-md border border-gray-100 dark:border-white/10 transition-all text-xs">
              <MicrosoftIcon />
              <span className="ml-3">Continue with Microsoft</span>
          </button>
        </div>

        <p className="mt-10 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
          {mode === 'login' ? "New to Bharat Path?" : "Already have a registry?"}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-black text-orange-500 hover:text-orange-600 ml-2 uppercase tracking-widest">
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>

       <button onClick={onBack} className="mt-8 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-orange-500 transition-colors">
          &larr; Back to Home
       </button>
    </div>
  );
};

export default AuthPage;
