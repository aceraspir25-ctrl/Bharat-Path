
import React from 'react';
import { View } from '../types';
import { MapIcon, BookingIcon, ItineraryIcon, UtilitiesIcon, SafetyIcon, CommunityIcon, DashboardIcon, LogoutIcon, AppDetailIcon, TravelTipsIcon, TimePassIcon } from './icons/Icons';

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

const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTI1Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjk5MzMiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTM4ODA4IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjZ3JhZCkiIGQ9Ik01MCAwIEMyNSAwIDUgMjIgNSA1MCAxIDg1IDUwIDEyNSA1MCAxMjUgQzUwIDEyNSA5NSA4NSA5NSA1MCBDOTUgMjIgNzUgMCA1MCAwIFogTTUwIDc1IEMzNi4yIDc1IDI1IDYzLjggMjUgNTIgUzM2LjIgMjUgNTAgMjUgNzUgMzYuMiA3NSA1MCA2My44IDc1IDUwIDc1IFoiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI0ZGRkZGRiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEyIiBmaWxsPSIjMDAwMDgwIi8+PC9zdmc+";

const AppLogo: React.FC = () => (
    <div className="mb-8 flex flex-col items-center">
        <img src={logoSrc} alt="Bharat Path Logo" className="w-32 h-32 rounded-2xl shadow-md" />
        <h2 className="mt-3 text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">
            Bharat Path
        </h2>
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
    { id: View.TravelTips, label: 'Travel Tips', icon: <TravelTipsIcon /> },
    { id: View.TimePass, label: 'TimePass', icon: <TimePassIcon /> },
    { id: View.AppDetail, label: 'App Details', icon: <AppDetailIcon /> },
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