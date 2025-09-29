export enum View {
  Dashboard = 'Dashboard',
  Map = 'Map',
  Booking = 'Booking',
  Itinerary = 'Itinerary',
  Utilities = 'Utilities',
  Safety = 'Safety',
  Community = 'Community',
  TravelTips = 'TravelTips',
  TimePass = 'TimePass',
  AppDetail = 'AppDetail',
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

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface AIResponse {
    story?: string;
    suggestions?: AIBookingSuggestion[];
    image?: string;
    groundingChunks?: GroundingChunk[];
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
  content: string;
  image?: string | null;
  timestamp: number;
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
    
    // Ambient types for the Barcode Detection API
    interface BarcodeDetectorOptions {
        formats: string[];
    }

    interface DetectedBarcode {
        boundingBox: DOMRectReadOnly;
        rawValue: string;
        format: string;
        cornerPoints: { x: number; y: number }[];
    }

    const BarcodeDetector: {
        prototype: BarcodeDetector;
        new(options?: BarcodeDetectorOptions): BarcodeDetector;
        getSupportedFormats(): Promise<string[]>;
    };

    interface BarcodeDetector {
        detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
    }
}