import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { getAIResponse } from '../services/geminiService';
import { AIResponse } from '../types';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: AIResponse | null;
  loading: boolean;
  error: string | null;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
    setLoading(false);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await getAIResponse(query);
      setSearchResults(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the search.");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    performSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
