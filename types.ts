
export enum View {
  Dashboard = 'Dashboard',
  Map = 'Map',
  Booking = 'Booking',
  Flights = 'Flights',
  Trains = 'Trains',
  Tracking = 'Tracking',
  RoutePlanner = 'RoutePlanner',
  BhashaSangam = 'BhashaSangam',
  Itinerary = 'Itinerary',
  Budget = 'Budget',
  Utilities = 'Utilities',
  Safety = 'Safety',
  Community = 'Community',
  GroupPlanning = 'GroupPlanning',
  Subscription = 'Subscription',
  TravelTips = 'TravelTips',
  TimePass = 'TimePass',
  AppDetail = 'AppDetail',
  AIStudio = 'AIStudio',
  LiveGuide = 'LiveGuide',
  Settings = 'Settings'
}

export interface UserMemory {
    interests: string[];
    searchHistory: string[];
    expertiseNodes: string[];
    professionalContext: string;
}

export interface UserProfile {
    name: string;
    country: string;
    subscriptionTier: 'Standard' | 'Global Gold' | 'Free';
    profilePic: string | null;
    memory: UserMemory;
}

export interface GroupMember {
    id: string;
    name: string;
    pic: string | null;
    country: string;
    currentLat: number;
    currentLng: number;
    isHost: boolean;
}

export interface GroupSpot {
    id: string;
    name: string;
    votes: number;
    suggestedBy: string;
    description: string;
}

export interface GroupTrip {
    id: string;
    code: string;
    name: string;
    members: GroupMember[];
    spots: GroupSpot[];
    messages: ChatMessage[];
}

export interface Expense {
  id: string;
  category: 'Flights' | 'Accommodation' | 'Food' | 'Activities' | 'Other';
  description: string;
  amount: number;
  date: string;
}

export interface Booking {
  id: string;
  type: 'Flight' | 'Hotel' | 'Train' | 'Activity';
  details: string;
  date: string;
  time?: string;
  reminderSet?: boolean;
}

export interface AIBookingSuggestion {
    name: string;
    type: 'Hotel' | 'Restaurant';
    description: string;
    rating: number;
}

export interface SearchSuggestion {
    name: string;
    type: string;
    local_veg_specialty: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface MapMarker {
    id: string;
    name: string;
    lat: number;
    lng: number;
    uri: string;
}

export interface AIResponse {
    story?: string;
    suggestions?: AIBookingSuggestion[];
    image?: string;
    video?: string;
    groundingChunks?: GroundingChunk[];
    markers?: MapMarker[];
}

export interface PlaceInfo {
  history: string;
  attractions: {
    name: string;
    description: string;
  }[];
  customs: string;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

export type RouteDetails = RouteStep[];

export interface Post {
  id: string;
  authorName: string;
  authorPic: string | null;
  authorCountry: string;
  badges: string[];
  content: string;
  image?: string | null;
  timestamp: number;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderPic: string | null;
    senderCountry: string;
    senderBadges: string[];
    text: string;
    translatedText?: string;
    sourceLang: string;
    timestamp: number;
}

export interface ChatRoom {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface OfflineMap {
  id: string;
  name: string;
  imageData: string;
}

export interface Transaction {
  id: string;
  type: 'Bill Payment' | 'Mobile Recharge' | 'QR Payment';
  description: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface AIActivitySuggestion {
  name: string;
  description: string;
}

export interface TripDetails {
  startDate: string;
  endDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface GlobalIntelligence {
    location: string;
    essentials: {
        cafes: { name: string; type: string }[];
        hotels: { name: string; rating: string }[];
        banks: { name: string; services: string }[];
        culture: { name: string; type: string }[];
        transport: { name: string; type: string }[];
    };
    safety: {
        police: { name: string; address: string; distance: string };
        hospital: { name: string; address: string; distance: string };
        emergency_numbers: string[];
    };
    context: {
        language: string;
        greeting: string;
    };
}

export interface TransitStatus {
    id: string;
    status: 'On-time' | 'Delayed' | 'Cancelled' | 'Arrived' | 'Scheduled';
    current_location: string;
    progress_percent: number;
    arrival_node: {
        gate?: string;
        terminal?: string;
        platform?: string;
        description: string;
    };
    amenities: {
        name: string;
        type: string;
        description: string;
    }[];
    timezone_info: string;
    scheduled_arrival: string;
    estimated_arrival: string;
}

// Ambient declaration for the Google Identity Services library
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

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
        aistudio?: AIStudio;
        L?: any;
    }
}
