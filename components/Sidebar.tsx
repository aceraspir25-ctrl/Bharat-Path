// @ts-nocheck
import React from 'react';
import { View } from '../types';
import { 
  MapIcon, ItineraryIcon, UtilitiesIcon, SafetyIcon, CommunityIcon, 
  DashboardIcon, LogoutIcon, RouteIcon, UsersIcon
} from './icons/Icons';
import { SparklesIcon } from './icons/StudioIcons';

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
    className={`group relative flex items-center w-full px-5 py-4 text-[10px] font-black rounded-2xl transition-all duration-500 overflow-hidden ${
      isActive
        ? 'bg-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] scale-[1.02]'
        : highlight 
          ? 'bg-white/5 text-orange-500 hover:bg-orange-500/10 border border-orange-500/20'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    {/* Neural Glow Background for Active Item */}
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 blur-xl animate-pulse"></div>
    )}

    <span className={`relative z-10 transition-transform duration-300 group-hover:scale-125 ${isActive ? 'text-white' : (highlight ? 'text-orange-500' : 'text-gray-500')}`}>
      {icon}
    </span>
    
    <span className="relative z-10 ml-4 uppercase tracking-[0.2em]">{label}</span>

    {/* PRO Badge for International Appeal */}
    {highlight && !isActive && (
      <span className="ml-auto bg-orange-500 text-[8px] px-2 py-0.5 rounded-full text-white font-black animate-bounce">PRO</span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, setIsOpen }) => {
  const navItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: View.Map, label: 'Global Map', icon: <MapIcon /> },
    { id: View.Community, label: 'Connectivity', icon: <CommunityIcon /> },
    { id: View.AIStudio, label: 'Neural Studio', icon: <SparklesIcon />, premium: true },
    { id: View.Itinerary, label: 'Path Archive', icon: <ItineraryIcon /> },
    { id: View.RoutePlanner, label: 'Path Darshak', icon: <RouteIcon /> },
    { id: View.GroupPlanning, label: 'Group Nodes', icon: <UsersIcon /> },
    { id: View.Utilities, label: 'Logistics', icon: <UtilitiesIcon /> },
    { id: View.Safety, label: 'Secure Hub', icon: <SafetyIcon /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed md:relative flex flex-col w-72 h-screen bg-[#0a0b14] border-r border-white/5 p-6 transform transition-all duration-700 cubic-bezier(0.22, 1, 0.36, 1) z-[70] ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Branding Node */}
        <div className="flex items-center gap-4 mb-16 px-2 group cursor-pointer" onClick={() => setActiveView(View.Dashboard)}>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-transform group-hover:rotate-180 duration-700">
                <span className="text-white text-2xl font-black italic">B</span>
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Bharat Path</h2>
                <div className="h-0.5 w-full bg-orange-500/30 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-1/3 animate-progress"></div>
                </div>
            </div>
        </div>

        {/* Neural Navigation Stream */}
        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
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
          
          <div className="pt-8 mt-4 border-t border-white/5">
             <NavItem
                label="Premium Uplink"
                icon={<span className="text-xl">💎</span>}
                isActive={activeView === View.Subscription}
                onClick={() => { setActiveView(View.Subscription); setIsOpen(false); }}
                highlight
              />
          </div>
        </nav>

        {/* Founder Terminal Footer */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <button
            onClick={onLogout}
            className="group flex items-center w-full px-6 py-4 text-[10px] font-black rounded-2xl bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all duration-500"
          >
            <div className="group-hover:rotate-12 transition-transform"><LogoutIcon /></div>
            <span className="ml-4 uppercase tracking-[0.3em]">Exit Registry</span>
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .animate-progress { animation: progress 3s infinite linear; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default Sidebar;