// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { View } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';

// Core View Imports
import Dashboard from './views/Dashboard';
import MapView from './views/MapView';
import AIStudio from './views/AIStudio';
import Settings from './views/Settings';

import { useUser } from '../contexts/UserContext';
import AIChatbot from './AIChatbot';

interface MainAppProps {
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout, theme, toggleTheme }) => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { profile } = useUser();

  // Neural Notification Logic
  const addNotification = useCallback((notif: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [
      { ...notif, id, timestamp: Date.now(), read: false },
      ...prev
    ].slice(0, 5));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // AI Uplink Handler
  const handleAIService = useCallback(async (action: () => Promise<any>) => {
    try {
      return await action();
    } catch (error: any) {
      addNotification({
        title: "Neural Sync Alert",
        message: "Path Intelligence optimizing...",
        type: 'alert'
      });
      throw error;
    }
  }, [addNotification]);

  // View Transition Logic
  const renderView = useMemo(() => {
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
      case View.Map:
        return <MapView onAIService={handleAIService} />;
      case View.AIStudio:
        return <AIStudio />;
      case View.Settings:
        return <Settings toggleTheme={toggleTheme} />;
      default:
        return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
    }
  }, [activeView, handleAIService, toggleTheme]);

  return (
    <div className="flex h-screen bg-[#0a0b14] overflow-hidden font-sans selection:bg-orange-500/30 text-white">
      
      {/* 1. Global Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* 2. Main Terminal Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0b14] relative">
        
        {/* Top Command Bar */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setActiveView={setActiveView} 
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          onMarkRead={markAllRead}
          onLogout={onLogout}
        />

        {/* Dynamic Content View */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative">
          {/* Subtle Branding Overlay */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
            <h1 className="text-9xl font-black italic">BHARAT PATH</h1>
          </div>
          
          <div className="p-4 md:p-10 max-w-[1600px] mx-auto animate-slideIn">
            {renderView}
          </div>
        </div>
      </main>

      {/* 3. Global AI Assistant */}
      <AIChatbot />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 20px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}</style>
    </div>
  );
};

export default MainApp;