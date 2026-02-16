// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import WelcomePage from './components/WelcomePage';
import { SearchProvider } from './contexts/SearchContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';

const App: React.FC = () => {
  // Authentication & Navigation States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Logic to handle screen transitions
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Main Router Logic
  const renderContent = () => {
    if (!isAuthenticated) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }
    if (showWelcome) {
      return <WelcomePage onComplete={handleWelcomeComplete} />;
    }
    return <MainApp />;
  };

  return (
    <UserProvider>
      <LanguageProvider>
        <SearchProvider>
          <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0F111A] text-white' : 'bg-gray-50 text-gray-800'} font-sans transition-colors duration-500`}>
            {renderContent()}
          </div>
        </SearchProvider>
      </LanguageProvider>
    </UserProvider>
  );
};

export default App;