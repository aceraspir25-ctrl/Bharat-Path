
import React from 'react';
import { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MapIcon, BookingIcon, ItineraryIcon, UtilitiesIcon, SafetyIcon, CommunityIcon, 
  DashboardIcon, LogoutIcon, AppDetailIcon, TravelTipsIcon, TimePassIcon, BudgetIcon,
  CompassIcon, RouteIcon, BhashaIcon, UsersIcon
} from './icons/Icons';
import { SparklesIcon, VideoIcon } from './icons/StudioIcons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  highlight?: boolean;
}> = ({ icon, label, isActive, onClick, highlight }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-5 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
      isActive
        ? 'bg-[#FF9933] text-white shadow-lg shadow-orange-500/20'
        : highlight 
          ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/20'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <span className={isActive ? 'text-white' : (highlight ? 'text-orange-500' : 'text-gray-500')}>{icon}</span>
    <span className="ml-4 uppercase tracking-widest">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, setIsOpen }) => {
  const navItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: View.Map, label: 'Interactive Map', icon: <MapIcon /> },
    { id: View.AIStudio, label: 'AI Media Studio', icon: <SparklesIcon />, premium: true },
    { id: View.LiveGuide, label: 'Live AI Guide', icon: <div className="w-5 h-5 flex items-center justify-center">🎤</div>, premium: true },
    { id: View.Itinerary, label: 'My Itinerary', icon: <ItineraryIcon /> },
    { id: View.RoutePlanner, label: 'Path Darshak', icon: <RouteIcon /> },
    { id: View.Tracking, label: 'Live Transit', icon: <div className="w-5 h-5 flex items-center justify-center">📡</div> },
    { id: View.GroupPlanning, label: 'Group Path', icon: <UsersIcon /> },
    { id: View.Utilities, label: 'Travel Utilities', icon: <UtilitiesIcon /> },
    { id: View.Community, label: 'Community Hub', icon: <CommunityIcon /> },
    { id: View.Safety, label: 'Safety Hub', icon: <SafetyIcon /> },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`absolute md:relative flex flex-col w-72 h-full bg-[#111222] border-r border-white/5 p-6 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-300 ease-in-out z-40`}>
        <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-12">
                <span className="text-white text-xl font-black -rotate-12">B</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Bharat Path</h2>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              onClick={() => { setActiveView(item.id); setIsOpen(false); }}
              highlight={item.premium}
            />
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/5">
             <NavItem
                label="Upgrade Path"
                icon={<span className="text-lg">⭐</span>}
                isActive={activeView === View.Subscription}
                onClick={() => { setActiveView(View.Subscription); setIsOpen(false); }}
                highlight
              />
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-5 py-3.5 text-xs font-bold rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            <LogoutIcon />
            <span className="ml-4 uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
