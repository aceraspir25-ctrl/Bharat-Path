// @ts-nocheck
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    AIResponse, 
    PlaceInfo, 
    RouteStrategies, 
    MapMarker, 
    GlobalIntelligence, 
    TransitStatus, 
    UserProfile, 
    SearchSuggestion, 
    Booking, 
    GroundingChunk 
} from '../types';

// API Key Configuration - must use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CORE_PERSONA = `You are the 'Bharat Path Core Intelligence'.
Memory Protocol: 
1. Maintain a persistent profile for each explorer based on the provided metadata.
2. Track travel patterns and community contributions.
3. Strictly prioritize Indian hospitality (Atithi Devo Bhava) and legendary vegetarian food options globally.`;

const getMetadataString = (profile: UserProfile) => `
[GLOBAL PROFILE METADATA]
Explorer: ${profile.name}
Interests: ${profile.memory?.interests?.join(', ') || 'General Travel'}
Tier: ${profile.subscriptionTier}
`;

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1500): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorMsg = error.message || "";
            const isRateLimit = errorMsg.includes('429') || error.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
            
            if (isRateLimit && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

export const getAIResponse = async (query: string, profile: UserProfile, options: { useThinking?: boolean } = {}): Promise<AIResponse> => {
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: options.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
            contents: query,
            config: {
                systemInstruction: `${CORE_PERSONA}\n${getMetadataString(profile)}`,
                tools: [{ googleSearch: {} }],
                ...(options.useThinking ? { thinkingConfig: { thinkingBudget: 16000 } } : {})
            }
        });

        return { 
            story: response.text,
            groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

export const getAIResponseStream = async function* (query: string, profile: UserProfile) {
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
            systemInstruction: `${CORE_PERSONA}\n${getMetadataString(profile)}`,
            tools: [{ googleSearch: {} }]
        }
    });

    for await (const chunk of responseStream) {
        yield chunk.text;
    }
};

export const searchPlacesWithAI = async (query: string, profile: UserProfile, center?: { lat: number; lng: number }): Promise<any> => {
    return callWithRetry(async () => {
        const config: any = { 
            tools: [{ googleMaps: {} }] 
        };
        
        if (center) {
            config.toolConfig = { 
                retrievalConfig: { 
                    latLng: { 
                        latitude: center.lat, 
                        longitude: center.lng 
                    } 
                } 
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite-latest",
            contents: `Universal mapping request: Locate markers for: "${query}". Search across ALL cities and urban landmarks globally.`,
            config
        });
        
        const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as any[];
        const markers: MapMarker[] = [];
        groundingChunks.forEach((chunk, index) => {
            if (chunk.maps) {
                const match = chunk.maps.uri.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match && match[1] && match[2]) {
                    markers.push({ 
                        id: `m-${index}`, 
                        name: chunk.maps.title || 'Spot', 
                        lat: parseFloat(match[1]), 
                        lng: parseFloat(match[2]), 
                        uri: chunk.maps.uri 
                    });
                }
            }
        });
        return { story: response.text, markers, groundingChunks };
    });
};

export const getPlaceInformation = async (placeName: string, profile: UserProfile): Promise<PlaceInfo> => {
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Provide historical, cultural, and travel metadata for: "${placeName}". Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        history: { type: Type.STRING },
                        attractions: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    name: { type: Type.STRING }, 
                                    description: { type: Type.STRING } 
                                } 
                            } 
                        },
                        customs: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const getRouteStrategies = async (start: string, dest: string, profile: UserProfile, options: any): Promise<RouteStrategies> => {
    return callWithRetry(async () => {
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                fastest: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        totalDistance: { type: Type.STRING },
                        totalDuration: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { instruction: { type: Type.STRING }, distance: { type: Type.STRING }, duration: { type: Type.STRING } } } }
                    },
                    required: ["summary", "totalDistance", "totalDuration", "steps"]
                },
                scenic: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        totalDistance: { type: Type.STRING },
                        totalDuration: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { instruction: { type: Type.STRING }, distance: { type: Type.STRING }, duration: { type: Type.STRING } } } }
                    },
                    required: ["summary", "totalDistance", "totalDuration", "steps"]
                },
                cultural: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        totalDistance: { type: Type.STRING },
                        totalDuration: { type: Type.STRING },
                        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { instruction: { type: Type.STRING }, distance: { type: Type.STRING }, duration: { type: Type.STRING } } } }
                    },
                    required: ["summary", "totalDistance", "totalDuration", "steps"]
                }
            },
            required: ["fastest", "scenic", "cultural"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Synthesize THREE specialized global route strategies from "${start}" to "${dest}". Return JSON.`,
            config: {
                thinkingConfig: { thinkingBudget: 8000 },
                responseMimeType: "application/json",
                responseSchema: responseSchema as any
            }
        });

        return JSON.parse(response.text || "{}");
    });
};

export const getGlobalIntelligence = async (lat: number, lng: number, profile: UserProfile): Promise<GlobalIntelligence> => {
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Local Path Intelligence for Global Coordinates [${lat}, ${lng}]. Essentials, safety, and regional context for explorer ${profile.name}. Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        essentials: {
                            type: Type.OBJECT,
                            properties: {
                                cafes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } } } },
                                hotels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, rating: { type: Type.STRING } } } },
                                banks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, services: { type: Type.STRING } } } },
                                culture: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } } } },
                                transport: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING } } } }
                            }
                        },
                        safety: {
                            type: Type.OBJECT,
                            properties: {
                                police: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, address: { type: Type.STRING }, distance: { type: Type.STRING } } },
                                hospital: