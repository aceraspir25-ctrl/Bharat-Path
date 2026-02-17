// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { View, Notification } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';

// View Imports - Ek baar check kar lo ki in sabka naam folders mein exact yahi hai
import Dashboard from './views/Dashboard';
import MapView from './views/MapView';
import Booking from './views/Booking';
import Itinerary from './views/Itinerary';
import Utilities from './views/Utilities';
import Safety from './views/Safety';
import AppDetail from './views/AppDetail';
import TravelTips from './views/TravelTips';
import TimePass from './views/TimePass';
import Budget from './views/Budget';
import Flights from './views/Flights';
import Trains from './views/Trains';
import RoutePlanner from './views/RoutePlanner';
import Tracking from './views/Tracking';
import BhashaSangam from './views/BhashaSangam';
import GroupPlanning from './views/GroupPlanning';
import Subscription from './views/Subscription';
import AIStudio from './views/AIStudio';
import LiveGuide from './views/LiveGuide';
import Settings from './views/Settings';
import AIChatbot from './AIChatbot';
import { useUser } from '../contexts/UserContext';

// Safe Import for Community (Agar file nahi hai toh error nahi aayega)
let Community;
try {
  Community = require('./views/Community').default;
} catch (e) {
  Community = () => <div className="p-10 text-center opacity-50">Community Node Offline</div>;
}

interface MainAppProps {
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout, theme, toggleTheme }) => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { profile } = useUser();

  // Optimized Notification Handler
  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [
      { ...notif, id, timestamp: Date.now(), read: false },
      ...prev
    ].slice(0, 8));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleAIService = useCallback(async (action: () => Promise<any>) => {
    try {
      return await action();
    } catch (error: any) {
      const isQuota = error.message?.includes('429');
      addNotification({
        title: isQuota ? "Neural Limit" : "Uplink Error",
        message: isQuota ? "Raipur Node busy. Wait a moment." : "Connection unstable.",
        type: 'alert'
      });
      throw error;
    }
  }, [addNotification]);

  const renderViewContent = useMemo(() => {
    const props = { onAIService: handleAIService, setActiveView };
    
    switch (activeView) {
      case View.Dashboard: return <Dashboard {...props} />;
      case View.Map: return <MapView onAIService={handleAIService} />;
      case View.AIStudio: return <AIStudio />;
      case View.LiveGuide: return <LiveGuide />;
      case View.BhashaSangam: return <BhashaSangam onAIService={handleAIService} />;
      case View.Settings: return <Settings toggleTheme={toggleTheme} />;
      case View.Itinerary: return <Itinerary onNotify={addNotification} />;
      case View.Community: return <Community />;
      case View.AppDetail: return <AppDetail />;
      // ... Baki views ko bhi switch mein check kar lo
      default: return <Dashboard {...props} />;
    }
  }, [activeView, handleAIService, addNotification, toggleTheme]);

  return (
    <div className="flex h-screen bg-[#020208] overflow-hidden text-white font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setActiveView={setActiveView} 
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          onMarkRead={markAllRead}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          {/* Subtle Branding */}
          <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none">
            <h1 className="text-8xl font-black tracking-tighter">BHARAT PATH</h1>
          </div>
          
          <div className="relative z-10 animate-fadeIn">
            {renderViewContent}
          </div>
        </div>
      </main>

      <AIChatbot />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.2); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MainApp;