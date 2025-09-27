export enum View {
  Dashboard = 'Dashboard',
  Map = 'Map',
  Booking = 'Booking',
  Itinerary = 'Itinerary',
  Utilities = 'Utilities',
  Safety = 'Safety',
  Community = 'Community',
}

export interface Booking {
  id: string;
  type: 'Flight' | 'Hotel' | 'Train' | 'Activity';
  details: string;
  date: string;
  reminderSet?: boolean;
}

export interface AIBookingSuggestion {
    name: string;
    type: 'Hotel' | 'Restaurant';
    description: string;
    rating: number;
}

export interface AIResponse {
    story?: string;
    suggestions?: AIBookingSuggestion[];
    image?: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorPic: string | null;
  content: string;
  image?: string | null;
  timestamp: number;
}

export interface OfflineMap {
  id: string;
  name: string;
  imageData: string;
}


// Ambient declaration for the Google Identity Services library
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: any) => void; }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            theme?: 'outline' | 'filled_blue' | 'filled_black';
                            size?: 'large' | 'medium' | 'small';
                            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                            logo_alignment?: 'left' | 'center';
                            width?: string;
                        }
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}