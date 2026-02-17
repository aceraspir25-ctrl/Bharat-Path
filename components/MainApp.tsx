// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { View, Notification } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';

// View Imports
import Dashboard from './views/Dashboard';
import MapView from './views/MapView';
import Booking from './views/Booking';
import Itinerary from './views/Itinerary';
import Utilities from './views/Utilities';
import Safety from './views/Safety';
// import Community from './views/Community'; // <--- Build Error ki wajah ye line thi
import Settings from './views/Settings';
import AIStudio from './views/AIStudio';
import LiveGuide from './views/LiveGuide';
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
import Gallery from './views/Gallery';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { profile } = useUser();

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => {
        if (prev.some(p => p.message === notif.message && Date.now() - p.timestamp < 60000)) return prev;
        return [{
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            read: false
        }, ...prev].slice(0, 10);
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleAIService = useCallback(async (action: () => Promise<any>) => {
    try {
      return await action();
    } catch (error: any) {
      const isQuotaError = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
      
      if (isQuotaError) {
        addNotification({
          title: "Neural Quota Exhausted",
          message: "The global path intelligence is at capacity. Please wait a few minutes.",
          type: 'alert'
        });
      } else {
        addNotification({
          title: "Uplink Error",
          message: "Communication error occurred with AI protocol.",
          type: 'alert'
        });
      }
      throw error;
    }
  }, [addNotification]);

  const renderViewContent = useMemo(() => {
    // Safety check for views that might be missing
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
      case View.Map:
        return <MapView onAIService={handleAIService} />;
      case View.AIStudio:
        return <AIStudio />;
      case View.LiveGuide:
        return <LiveGuide />;
      case View.Gallery:
        return <Gallery />;
      case View.Booking:
        return <Booking />;
      case View.Flights:
        return <Flights />;
      case View.Trains:
        return <Trains />;
      case View.Tracking:
        return <Tracking />;
      case View.RoutePlanner:
        return <RoutePlanner />;
      case View.GroupPlanning:
        return <GroupPlanning />;
      case View.Subscription:
        return <Subscription />;
      case View.BhashaSangam:
        return <BhashaSangam onAIService={handleAIService} />;
      case View.Itinerary:
        return <Itinerary />;
      case View.Budget:
        return <Budget />;
      case View.Utilities:
        return <Utilities />;
      case View.Safety:
        return <Safety />;
      case View.Community:
        // Agar Community view ki file nahi hai, toh Dashboard dikhao taaki crash na ho
        return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
      case View.TravelTips:
        return <TravelTips />;
      case View.TimePass:
        return <TimePass />;
      case View.AppDetail:
        return <AppDetail />;
      case View.Settings:
        return <Settings toggleTheme={toggleTheme} />;
      default:
        return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
    }
  }, [activeView, handleAIService, toggleTheme]);

  return (
    <div className="flex h-screen bg-[#0a0b14] overflow-hidden font-sans selection:bg-orange-500/30 text-white">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0b14] relative">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setActiveView={setActiveView} 
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          onMarkRead={markAllRead}
          onLogout={onLogout}
        />
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-10 max-w-[1600px] mx-auto animate-fadeIn">
            {renderViewContent}
          </div>
        </div>
      </main>
      <AIChatbot />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MainApp;