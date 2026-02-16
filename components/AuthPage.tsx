// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { MicrosoftIcon } from './icons/Icons'; // Removed Facebook as it wasn't used

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

  // Logic to detect Google Script Load
  useEffect(() => {
    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setGsiState('ready');
      }
    };

    const interval = setInterval(checkGSI, 500);
    return () => clearInterval(interval);
  }, []);

  // Initialize Google Login
  useEffect(() => {
    if (gsiState === 'ready' && googleButtonRef.current) {
      try {
        // Use your Google Client ID here directly or via env
        const clientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; 
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            console.log("Auth Protocol: Google Handshake Success");
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

    // Save Identity to Local Hub
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b14] p-4 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-2xl p-10 relative overflow-hidden">
        
        {/* Aesthetic Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10 text-center mb-10">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            {mode === 'login' ? 'Path Login' : 'New Identity'}
          </h2>
          <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">
            Bharat Path Neural Registry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {mode === 'signup' && (
            <div>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 transition-all" 
                placeholder="DISPLAY NAME" 
              />
            </div>
          )}
          <div>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-600 outline-none focus:border-orange-500 transition-all" 
              placeholder="EMAIL ADDRESS" 
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-6 py-4 bg