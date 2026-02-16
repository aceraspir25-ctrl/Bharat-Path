// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { View } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';

// View Imports
import Dashboard from './views/Dashboard';
import MapView from './views/MapView';
import Community from './views/CommunityHub'; // Updated to your new Hub
import AIStudio from './views/AIStudio';
import Settings from './views/Settings';
// ... other views (ensure paths are correct in Studio)

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

  // --- WORLDWIDE ATTRACTIVE FEATURE: Neural Notification Logic ---
  const addNotification = useCallback((notif: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [
      { ...notif, id, timestamp: Date.now(), read: false },
      ...prev
    ].slice(0, 5)); // Keep only top 5 for global performance
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // AI Uplink Handler with Global Quota Protection
  const handleAIService = useCallback(async (action: () => Promise<any>) => {
    try {
      return await action();
    } catch (error: any) {
      addNotification({
        title: "Neural Sync Alert",
        message: "Path Intelligence is optimizing. Retrying uplink...",
        type: 'alert'
      });
      throw error;
    }
  }, [addNotification]);

  // --- ATTRACTIVE FEATURE: View Transition Wrapper ---
  const renderView = useMemo(() => {
    const views: Record<string, React.ReactNode> = {
      [View.Dashboard]: <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />,
      [View.Map]: <MapView onAIService={handleAIService} />,
      [View.Community]: <Community />, // Your new Global Hub
      [View.AIStudio]: <AIStudio />,
      [View.Settings]: <Settings toggleTheme={toggleTheme} />,
      // Add other views here similarly
    };

    return (
      <div className="animate-slideIn relative h-full">
        {views[activeView] || <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />}
      </div>
    );
  }, [activeView, handleAIService, toggleTheme]);

  return (
    <div className="flex h-screen bg-[#0a0b14] overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* 1. Global Sidebar - Permanent on Desktop, Drawer on Mobile */}
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

        {/* Dynamic Content View with Global Padding */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative">
          {/* Founder's Overlay - Subtle branding */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
            <h1 className="text-9xl font-black italic">BHARAT PATH</h1>
          </div>
          
          <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
            {renderView}
          </div>
        </div>
      </main>

      {/* 3. Global AI Assistant */}
      <AIChatbot />

      {/* Worldwide Attractive Styles */}
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