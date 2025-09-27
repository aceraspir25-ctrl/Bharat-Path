import React from 'react';
import { View } from '../types';
import { MapIcon, BookingIcon, ItineraryIcon, UtilitiesIcon, SafetyIcon, CommunityIcon, DashboardIcon, LogoutIcon } from './icons/Icons';

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
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-orange-500 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const logoSrc = "data:image/jpeg;base64,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 obscene amount of characters here /v/Q+r/o/T0/l/wDRH/o//wCHo/Q/9L/T+f8A0H736P0/H/wBH/p//4j+h/wCl/p/P/oP3v0fp+P8A6P8A0//APEf0P8A0v8AT+f/AEH736P0/H/0f+n//AIj+h/6X+n8/9F//2Q==";

const AppLogo: React.FC = () => (
    <div className="mb-8 flex justify-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-32 h-32 rounded-2xl shadow-md" />
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, setIsOpen }) => {
  const navItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: View.Map, label: 'Map', icon: <MapIcon /> },
    { id: View.Booking, label: 'Booking', icon: <BookingIcon /> },
    { id: View.Itinerary, label: 'Itinerary', icon: <ItineraryIcon /> },
    { id: View.Utilities, label: 'Utilities', icon: <UtilitiesIcon /> },
    { id: View.Safety, label: 'Safety', icon: <SafetyIcon /> },
    { id: View.Community, label: 'Community', icon: <CommunityIcon /> },
  ];

  const handleItemClick = (view: View) => {
      setActiveView(view);
      setIsOpen(false);
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`absolute md:relative flex flex-col w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
        <AppLogo />
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>
        <div>
          <NavItem
            icon={<LogoutIcon />}
            label="Logout"
            isActive={false}
            onClick={onLogout}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;