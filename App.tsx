
import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import WelcomePage from './components/WelcomePage';
import { SearchProvider } from './contexts/SearchContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './contexts/UserContext';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'welcome' | 'home' | 'auth' | 'app'>('welcome');
  
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = window.localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  });

  useEffect(() => {
    if (appState === 'welcome') {
      const timer = setTimeout(() => {
        try {
          const isLoggedIn = window.localStorage.getItem('isLoggedIn');
          setAppState(isLoggedIn === 'true' ? 'app' : 'home');
        } catch (error) {
          console.error("Could not access localStorage:", error);
          setAppState('home');
        }
      }, 3000); // 3-second welcome screen

      return () => clearTimeout(timer);
    }
  }, [appState]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error("Could not save theme to localStorage:", error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLoginSuccess = useCallback(() => {
    localStorage.setItem('isLoggedIn', 'true');
    setAppState('app');
  }, []);
  
  const handleShowAuth = useCallback(() => {
      setAppState('auth');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    setAppState('home');
  }, []);
  
  const handleBackToHome = useCallback(() => {
      setAppState('home');
  }, []);

  const renderContent = () => {
    switch(appState) {
        case 'welcome':
            return <WelcomePage />;
        case 'home':
            return <HomePage onLogin={handleLoginSuccess} onShowAuth={handleShowAuth} />;
        case 'auth':
            return <AuthPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />;
        case 'app':
            return (
              <UserProvider>
                <LanguageProvider>
                  <SearchProvider>
                    <MainApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
                  </SearchProvider>
                </LanguageProvider>
              </UserProvider>
            );
        default:
            return <HomePage onLogin={handleLoginSuccess} onShowAuth={handleShowAuth} />;
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0F111A]' : 'bg-gray-50'} text-gray-800 dark:text-gray-200 font-sans transition-colors duration-500`}>
      {renderContent()}
    </div>
  );
};

export default App;
