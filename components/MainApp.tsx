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
// Agar Community file nahi hai, toh ise comment kar dena build ke waqt
import Community from './views/Community'; 
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

  // Neural Notification System
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

  // AI Service Uplink Handler
  const handleAIService = useCallback(async (action: () => Promise<any>) => {
    try {
      return await action();
    } catch (error: any) {
      const isQuotaError = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      addNotification({
        title: isQuotaError ? "Neural Quota Exhausted" : "Uplink Error",
        message: isQuotaError ? "API capacity reached. Please wait." : "Communication interrupted.",
        type: 'alert'
      });
      throw error;
    }
  }, [addNotification]);

  // View Router Logic
  const renderViewContent = useMemo(() => {
    switch (activeView) {
      case View.Dashboard: return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
      case View.Map: return <MapView onAIService={handleAIService} />;
      case View.AIStudio: return <AIStudio />;
      case View.LiveGuide: return <LiveGuide />;
      case View.Booking: return <Booking />;
      case View.Flights: return <Flights />;
      case View.Trains: return <Trains />;
      case View.Tracking: return <Tracking />;
      case View.RoutePlanner: return <RoutePlanner />;
      case View.GroupPlanning: return <GroupPlanning />;
      case View.Subscription: return <Subscription />;
      case View.BhashaSangam: return <BhashaSangam onAIService={handleAIService} />;
      case View.Itinerary: return <Itinerary onNotify={addNotification} />;
      case View.Budget: return <Budget />;
      case View.Utilities: return <Utilities />;
      case View.Safety: return <Safety />;
      case View.Community: return <Community />; // Ensure file exists!
      case View.TravelTips: return <TravelTips />;
      case View.TimePass: return <TimePass />;
      case View.AppDetail: return <AppDetail />;
      case View.Settings: return <Settings toggleTheme={toggleTheme} />;
      default: return <Dashboard setActiveView={setActiveView} onAIService={handleAIService} />;
    }
  }, [activeView, handleAIService, addNotification, toggleTheme]);

  return (
    <div className="flex h-screen bg-[#0F111A] overflow-hidden text-white">
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
           {/* Visual Branding Overlay */}
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
            <h1 className="text-9xl font-black italic">BHARAT PATH</h1>
          </div>
          
          <div className="animate-fadeIn">
            {renderViewContent}
          </div>
        </div>
      </main>
      <AIChatbot />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MainApp;