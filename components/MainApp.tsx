
import React, { useState, useCallback } from 'react';
import { View } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './views/Dashboard';
import MapView from './views/MapView';
import Booking from './views/Booking';
import Itinerary from './views/Itinerary';
import Utilities from './views/Utilities';
import Safety from './views/Safety';
import Community from './views/Community';
import AppDetail from './views/AppDetail';
import TravelTips from './views/TravelTips';
import TimePass from './views/TimePass';

interface MainAppProps {
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onLogout, theme, toggleTheme }) => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderView = useCallback(() => {
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.Map:
        return <MapView />;
      case View.Booking:
        return <Booking />;
      case View.Itinerary:
        return <Itinerary />;
      case View.Utilities:
        return <Utilities />;
      case View.Safety:
        return <Safety />;
      case View.Community:
        return <Community />;
      case View.TravelTips:
        return <TravelTips />;
      case View.TimePass:
        return <TimePass />;
      case View.AppDetail:
        return <AppDetail />;
      default:
        return <Dashboard />;
    }
  }, [activeView]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          setActiveView={setActiveView} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default MainApp;