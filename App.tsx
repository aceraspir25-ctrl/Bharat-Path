// @ts-nocheck
import React, { useState } from 'react';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import WelcomePage from './components/WelcomePage';
import HomePage from './components/HomePage';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SearchProvider } from './contexts/SearchContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      if (showAuth) return <AuthPage onLoginSuccess={handleLoginSuccess} onBack={() => setShowAuth(false)} />;
      return <HomePage onLogin={handleLoginSuccess} onShowAuth={() => setShowAuth(true)} />;
    }
    if (showWelcome) return <WelcomePage onComplete={handleWelcomeComplete} />;
    return <MainApp onLogout={() => setIsAuthenticated(false)} />;
  };

  return (
    <UserProvider>
      <LanguageProvider>
        <SearchProvider>
          <div className="min-h-screen bg-[#0F111A] text-white font-sans transition-colors duration-500">
            {renderContent()}
          </div>
        </SearchProvider>
      </LanguageProvider>
    </UserProvider>
  );
};

export default App;