
import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import { SearchProvider } from './contexts/SearchContext';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'auth' | 'app'>(() => {
    try {
      const isLoggedIn = window.localStorage.getItem('isLoggedIn');
      return isLoggedIn === 'true' ? 'app' : 'home';
    } catch (error) {
      console.error("Could not access localStorage:", error);
      return 'home';
    }
  });
  
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
    setView('app');
  }, []);
  
  const handleShowAuth = useCallback(() => {
      setView('auth');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    setView('home');
  }, []);
  
  const handleBackToHome = useCallback(() => {
      setView('home');
  }, []);

  const renderContent = () => {
    switch(view) {
        case 'home':
            return <HomePage onLogin={handleLoginSuccess} onShowAuth={handleShowAuth} />;
        case 'auth':
            return <AuthPage onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />;
        case 'app':
            return (
              <SearchProvider>
                <MainApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
              </SearchProvider>
            );
        default:
            return <HomePage onLogin={handleLoginSuccess} onShowAuth={handleShowAuth} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
