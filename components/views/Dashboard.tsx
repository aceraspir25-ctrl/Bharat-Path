import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { AIBookingSuggestion, GroundingChunk } from '../../types';
import { ExternalLinkIcon } from '../icons/Icons';

const SpiritualBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <svg
            className="mandala-svg absolute top-1/2 left-1/2 text-gray-300 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
        >
            {/* Circles */}
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <circle cx="100" cy="100" r="20" />
            {/* Petals */}
            {[...Array(12)].map((_, i) => (
                <path
                    key={`petal-${i}`}
                    d="M100 20 C 115 40, 115 60, 100 80 C 85 60, 85 40, 100 20 Z"
                    transform={`rotate(${i * 30}, 100, 100)`}
                />
            ))}
             {[...Array(8)].map((_, i) => (
                <line 
                    key={`line-${i}`}
                    x1="100" y1="100" x2="100" y2="0" 
                    transform={`rotate(${i * 45}, 100, 100)`}
                />
            ))}
        </svg>
    </div>
);


const SearchSuggestion: React.FC<{ title: string, subtitle: string, onClick: () => void }> = ({ title, subtitle, onClick }) => (
    <button onClick={onClick} className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700/50 w-full text-left transition-all hover:shadow-lg hover:scale-105">
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
        <div className="text-center max-w-3xl mx-auto py-16">
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
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
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
    const [activeFilter, setActiveFilter] = useState<'All' | 'Story' | 'Suggestions' | 'Image'>('All');

    // Reset filter when search results change
    useEffect(() => {
        setActiveFilter('All');
    }, [searchResults]);

    if (!searchResults) return null;

    const { story, suggestions, image, groundingChunks } = searchResults;

    // Determine which filters are applicable based on the results
    const availableFilters: ('All' | 'Story' | 'Suggestions' | 'Image')[] = ['All'];
    if (story) availableFilters.push('Story');
    if (suggestions && suggestions.length > 0) availableFilters.push('Suggestions');
    if (image) availableFilters.push('Image');

    const showStoryContent = story && (activeFilter === 'All' || activeFilter === 'Story');
    const showSuggestionsContent = suggestions && suggestions.length > 0 && (activeFilter === 'All' || activeFilter === 'Suggestions');
    const showImageContent = image && (activeFilter === 'All' || activeFilter === 'Image');
    const showGroundingContent = groundingChunks && groundingChunks.length > 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Filter Chips */}
            {availableFilters.length > 2 && ( // Only show filters if there's more than one category type in results
                 <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    {availableFilters.map(filter => (
                         <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors border-2 ${
                                activeFilter === filter
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                 </div>
            )}

            {showStoryContent && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">A Story from Path Darshak</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{story}</p>
                    {showGroundingContent && (
                        <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sources from the web:</h3>
                            <ul className="space-y-1">
                                {groundingChunks.map((chunk, index) => (
                                    <li key={index}>
                                        <a 
                                            href={chunk.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:underline"
                                        >
                                            <ExternalLinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span>{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
             {showImageContent && (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">A Glimpse of India</h2>
                    <img
                        src={`data:image/jpeg;base64,${image}`}
                        alt="AI generated visual of India"
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                    />
                </div>
            )}
            {showSuggestionsContent && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Suggestions for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((s, index) => <SuggestionCard key={index} suggestion={s} />)}
                    </div>
                </div>
            )}
            
            {!(showStoryContent || showSuggestionsContent || showImageContent) && (
                <div className="text-center p-8 bg-gray-50/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">No results for this filter. Try selecting 'All'.</p>
                </div>
            )}

            <div className="text-center">
                <button onClick={clearSearch} className="bg-gray-200/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                    Start a New Search
                </button>
            </div>
        </div>
    );
}

const Dashboard: React.FC = () => {
  const { searchResults, loading, error } = useSearch();

  const hasResults = searchResults && (searchResults.story || (searchResults.suggestions && searchResults.suggestions.length > 0) || searchResults.image);

  return (
    <div className="relative isolate -m-4 md:-m-8 min-h-full bg-gradient-to-b from-sky-200 via-orange-100 to-amber-50 dark:bg-gradient-to-b dark:from-slate-900 via-indigo-800 to-rose-900">
        <style>{`
            @keyframes rotateMandala {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .mandala-svg {
                width: 150vmax;
                height: 150vmax;
                min-width: 800px;
                min-height: 800px;
                opacity: 0.1;
                animation: rotateMandala 120s linear infinite;
            }
            .dark .mandala-svg {
                opacity: 0.15;
            }
        `}</style>
        <SpiritualBackground />
        <div className="relative z-10 p-4 md:p-8">
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
    </div>
  );
};

export default Dashboard;