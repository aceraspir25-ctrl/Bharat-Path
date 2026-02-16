// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { MicrosoftIcon } from './icons/Icons';

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
    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setGsiState('ready');
      }
    };
    const interval = setInterval(checkGSI, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gsiState === 'ready' && googleButtonRef.current) {
      try {
        const clientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; 
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            localStorage.setItem('userName', 'Yatri'); 
            localStorage.setItem('isLoggedIn', 'true');
            onLoginSuccess();
          },
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, { 
          theme: 'outline', 
          size: 'large', 
          width: googleButtonRef.current.offsetWidth 
        });
      } catch (err) {
        console.error("GSI Init Error:", err);
      }
    }
  }, [gsiState, onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name) {
      setError('Explorer Name Required');
      return;
    }
    if (!email || !password) {
      setError('Credentials Missing');
      return;
    }

    if (mode === 'signup') {
      localStorage.setItem('userName', name);
    } else {
      const savedName = localStorage.getItem('userName');
      if (!savedName) localStorage.setItem('userName', 'Shashank Mishra');
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b14] p-4 font-sans relative overflow-hidden">
      
      {/* Background Decorative Auras */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-4xl p-10 relative z-10">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            {mode === 'login' ? 'Path Login' : 'New Identity'}
          </h2>
          <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
            Bharat Path Neural Registry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 transition-all uppercase text-sm" 
              placeholder="DISPLAY NAME" 
            />
          )}
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 transition-all uppercase text-sm" 
            placeholder="EMAIL ADDRESS" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 transition-all uppercase text-sm" 
            placeholder="PASSWORD" 
          />

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}

          <button type="submit" className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em] text-xs">
            {mode === 'login' ? 'Initialize Uplink' : 'Create Registry'}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5"></div>
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Or Multi-Node Auth</span>
          <div className="flex-1 h-px bg-white/5"></div>
        </div>

        <div className="space-y-4">
          <div ref={googleButtonRef} className="w-full overflow-hidden rounded-xl"></div>
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
            <MicrosoftIcon className="w-4 h-4" /> Microsoft Azure
          </button>
        </div>

        <div className="mt-10 text-center space-y-4">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black text-gray-500 hover:text-orange-500 uppercase tracking-widest transition-colors"
          >
            {mode === 'login' ? "Need a new identity? Registry here" : "Already in registry? Login"}
          </button>
          <br />
          <button onClick={onBack} className="text-[10px] font-black text-gray-700 uppercase tracking-widest hover:text-white transition-colors">
            ← Back to Entry Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;