import React from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { AIBookingSuggestion } from '../../types';

const SearchSuggestion: React.FC<{ title: string, subtitle: string, onClick: () => void }> = ({ title, subtitle, onClick }) => (
    <button onClick={onClick} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700/50 w-full text-left transition-colors">
        <h3 className="font-bold text-orange-600 dark:text-orange-400">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </button>
);

const WelcomeScreen: React.FC = () => {
    const { setSearchQuery, performSearch } = useSearch();

    const handleSuggestionClick = (query: string) => {
        setSearchQuery(query);
        performSearch(query);
    }

    return (
        <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
                Discover India with <span className="bg-gradient-to-r from-orange-500 via-red-500 to-green-500 bg-clip-text text-transparent">Path Darshak</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Your AI travel companion. Ask me anything about your journey through India.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchSuggestion
                    title="Uncover History"
                    subtitle="of the ancient city of Hampi"
                    onClick={() => handleSuggestionClick("Tell me the history of Hampi")}
                />
                <SearchSuggestion
                    title="Find Local Cuisine"
                    subtitle="in Mumbai"
                    onClick={() => handleSuggestionClick("Suggest some famous local food spots in Mumbai")}
                />
                <SearchSuggestion
                    title="Generate an Image"
                    subtitle="of the serene Kerala backwaters"
                    onClick={() => handleSuggestionClick("Generate an image of the serene Kerala backwaters")}
                />
                <SearchSuggestion
                    title="Plan an Adventure"
                    subtitle="trekking in Himachal Pradesh"
                    onClick={() => handleSuggestionClick("Suggest beginner-friendly trekking routes in Himachal Pradesh")}
                />
            </div>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-10">
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Path Darshak is thinking...</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p>{message}</p>
    </div>
);

const SuggestionCard: React.FC<{ suggestion: AIBookingSuggestion }> = ({ suggestion }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{suggestion.name}</h4>
            <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full text-sm font-bold">
                <span>⭐</span>
                <span>{suggestion.rating}</span>
            </div>
        </div>
        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">{suggestion.type}</p>
        <p className="text-gray-600 dark:text-gray-400">{suggestion.description}</p>
    </div>
);

const SearchResults: React.FC = () => {
    const { searchResults, clearSearch } = useSearch();

    if (!searchResults) return null;

    const { story, suggestions, image } = searchResults;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {story && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">A Story from Path Darshak</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{story}</p>
                </div>
            )}
             {image && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">A Glimpse of India</h2>
                    <img
                        src={`data:image/jpeg;base64,${image}`}
                        alt="AI generated visual of India"
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                    />
                </div>
            )}
            {suggestions && suggestions.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Suggestions for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((s, index) => <SuggestionCard key={index} suggestion={s} />)}
                    </div>
                </div>
            )}

            <div className="text-center">
                <button onClick={clearSearch} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                    Start a New Search
                </button>
            </div>
        </div>
    );
}

const Dashboard: React.FC = () => {
  const { searchResults, loading, error } = useSearch();

  const hasResults = searchResults && (searchResults.story || searchResults.suggestions || searchResults.image);

  return (
    <div>
        {loading ? (
            <LoadingSpinner />
        ) : error ? (
            <ErrorDisplay message={error} />
        ) : hasResults ? (
            <SearchResults />
        ) : (
            <WelcomeScreen />
        )}
    </div>
  );
};

export default Dashboard;