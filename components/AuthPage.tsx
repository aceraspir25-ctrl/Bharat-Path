// @ts-nocheck
import React, { useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', 'Shashank Mishra');
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b14] text-white p-6">
      <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px]"></div>
        
        <h2 className="text-4xl font-black uppercase italic mb-8 text-center tracking-tighter">
          {mode === 'login' ? 'Path Login' : 'New Registry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <input type="email" placeholder="EMAIL ADDRESS" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-xs" required />
          <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-xs" required />
          
          <button type="submit" className="w-full py-5 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95">
            Initialize Uplink
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-gray-500 hover:text-orange-500 uppercase tracking-widest">
            {mode === 'login' ? "Need a new identity?" : "Already in registry?"}
          </button>
          <br />
          <button onClick={onBack} className="text-[10px] font-black text-gray-700 hover:text-white uppercase tracking-widest">
            ← Back to Entry Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;