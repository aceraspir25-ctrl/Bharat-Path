import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { getAIResponse } from '../services/geminiService';
import { AIResponse } from '../types';
import { useUser } from './UserContext';

export interface SearchFilters {
  category: 'All' | 'Hotel' | 'Restaurant';
  minRating: number;
  date: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: AIResponse | null;
  setSearchResults: (results: AIResponse | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    minRating: 0,
    date: ''
  });
  
  const { profile } = useUser();

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
      // We pass filters as context to the AI to improve the initial "story" and "suggestions"
      const filterContext = `[Context: Filter by ${filters.category}, min rating ${filters.minRating}${filters.date ? `, for date ${filters.date}` : ''}]`;
      const enrichedQuery = `${filterContext} ${query}`;
      
      const response = await getAIResponse(enrichedQuery, profile);
      setSearchResults(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the search.");
    } finally {
      setLoading(false);
    }
  }, [profile, filters]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    loading,
    setLoading,
    error,
    setError,
    filters,
    setFilters,
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