// @ts-nocheck
import React from 'react';

// Common interface for all icons to prevent TS errors
interface IconProps {
  className?: string;
  size?: string;
}

const Icon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <svg 
    className={className || "w-6 h-6"} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

// --- NAVIGATION ICONS ---
export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></Icon>
);

export const MapIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m-6 3l6 10" /></Icon>
);

export const CommunityIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></Icon>
);

// --- UTILITY & ACTION ICONS ---
export const SearchIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-5 h-5 text-gray-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
);

export const BellIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></Icon>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></Icon>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></Icon>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></Icon>
);

// --- SOCIAL & AUTH ICONS ---
export const MicrosoftIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f25022" d="M1 1h9v9H1z" />
    <path fill="#00a4ef" d="M1 11h9v9H1z" />
    <path fill="#7fba00" d="M11 1h9v9h-9z" />
    <path fill="#ffb900" d="M11 11h9v9h-9z" />
  </svg>
);

export const FacebookIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.11h3.128V8.62c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.6h-3.12V24h5.713C23.41 24 24 23.41 24 22.675V1.325C24 .59 23.41 0 22.675 0z" /></svg>
);

// --- BRANDING ---
export const RouteIcon: React.FC<IconProps> = ({ className }) => (
  <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V4a2 2 0 00-2-2h-1a2 2 0 00-2 2v12a2 2 0 002 2h1a2 2 0 002-2zm-3 0V4m3 12h2.586a1 1 0 00.707-.293l3.414-3.414a1 1 0 000-1.414l-3.414-3.414A1 1 0 0015.586 7H13" /></Icon>
);