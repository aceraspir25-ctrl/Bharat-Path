// @ts-nocheck
import React, { useState } from 'react';
const AuthPage = ({ onLoginSuccess, onBack }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', 'Shashank Mishra');
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b14] text-white p-6">
      <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-4xl font-black uppercase italic mb-8 text-center">{mode === 'login' ? 'Path Login' : 'Registry'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" placeholder="EMAIL" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-orange-500" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-orange-500" onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-5 bg-orange-600 rounded-2xl font-black uppercase tracking-widest shadow-xl">Initialize Uplink</button>
        </form>
        <button onClick={onBack} className="w-full mt-6 text-[10px] text-gray-500 uppercase font-black tracking-widest">← Back</button>
      </div>
    </div>
  );
};
export default AuthPage;