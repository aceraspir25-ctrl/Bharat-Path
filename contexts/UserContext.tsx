
import { createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProfile } from '../types';

interface UserContextType {
    profile: UserProfile;
    updateMemory: (interests: string[], context?: string) => void;
    addExpertiseBadge: (badge: string) => void;
    setSubscriptionTier: (tier: UserProfile['subscriptionTier']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialProfile = (): UserProfile => ({
    name: localStorage.getItem('userName') || 'Yatri',
    country: localStorage.getItem('userCountry') || 'IN',
    subscriptionTier: 'Global Gold',
    profilePic: localStorage.getItem('userProfilePic') || null,
    memory: {
        interests: ['Indian Culture', 'Local Cuisine'],
        searchHistory: [],
        expertiseNodes: ['Raipur Local Expert'],
        professionalContext: 'Explorer'
    }
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useLocalStorage<UserProfile>('bharat_path_profile_v1', getInitialProfile());

    const updateMemory = useCallback((interests: string[], context?: string) => {
        setProfile(prev => ({
            ...prev,
            memory: {
                ...prev.memory,
                interests: Array.from(new Set([...prev.memory.interests, ...interests])),
                professionalContext: context || prev.memory.professionalContext
            }
        }));
    }, [setProfile]);

    const addExpertiseBadge = useCallback((badge: string) => {
        setProfile(prev => ({
            ...prev,
            memory: {
                ...prev.memory,
                expertiseNodes: Array.from(new Set([...prev.memory.expertiseNodes, badge]))
            }
        }));
    }, [setProfile]);

    const setSubscriptionTier = useCallback((tier: UserProfile['subscriptionTier']) => {
        setProfile(prev => ({ ...prev, subscriptionTier: tier }));
    }, [setProfile]);

    return (
        <UserContext.Provider value={{ profile, updateMemory, addExpertiseBadge, setSubscriptionTier }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
