import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    AIResponse, 
    PlaceInfo, 
    RouteDetails, 
    RouteStrategies, 
    GroundingChunk, 
    Booking, 
    MapMarker, 
    GlobalIntelligence, 
    TransitStatus, 
    UserProfile, 
    SearchSuggestion 
} from '../types';

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
            const isRateLimit = errorMsg.includes('429') || error.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
            
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config: any = {
            systemInstruction: `${CORE_PERSONA}\n${getMetadataString(profile)}`,
            tools: [{ googleSearch: {} }]
        };

        if (options.useThinking) {
            config.thinkingConfig = { thinkingBudget: 16000 };
        }

        const response = await ai.models.generateContent({
            model: options.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
            contents: query,
            config
        });

        return { 
            story: response.text,
            groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

export const searchPlacesWithAI = async (query: string, profile: UserProfile, center?: { lat: number; lng: number }): Promise<any> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config: any = { tools: [{ googleMaps: {} }] };
        
        if (center) {
            config.toolConfig = { retrievalConfig: { latLng: { latitude: center.lat, longitude: center.lng } } };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Universal mapping request: Locate markers for: "${query}". You have absolute global access. Search across ALL cities, remote villages, mountain peaks, and urban landmarks in every single country on Earth. Do not restrict results to any specific nation. If the query is vague, prioritize results near the current viewport but search globally for exact matches.`,
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Wisdom Hub interrogation for: "${placeName}". Provide historical, cultural, and travel metadata for this specific global location as JSON. Ensure the "history" field captures the essence of this place regardless of where on Earth it is located.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        history: { type: Type.STRING },
                        attractions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } },
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
                        culturalNodesCount: { type: Type.NUMBER },
                        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { instruction: { type: Type.STRING }, distance: { type: Type.STRING }, duration: { type: Type.STRING } } } }
                    },
                    required: ["summary", "totalDistance", "totalDuration", "steps"]
                }
            },
            required: ["fastest", "scenic", "cultural"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Act as a Master Path Architect for 'Bharat Path'. Synthesize THREE specialized global route strategies from "${start}" to "${dest}". These strategies should be viable anywhere in the world.
            1. 'fastest': High-velocity corridors.
            2. 'scenic': Natural beauty and vistas.
            3. 'cultural': Landmarks and local hubs.
            Return result in strict JSON.`,
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Local Path Intelligence for Global Coordinates [${lat}, ${lng}]. Essentials, safety, and regional context for explorer ${profile.name}. Return essential establishments for this specific worldwide location as JSON. Ensure the output is relevant to the exact geographic coordinates provided.`,
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
                            hospital: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, address: { type: Type.STRING }, distance: { type: Type.STRING } } },
                            emergency_numbers: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    context: { type: Type.OBJECT, properties: { language: { type: Type.STRING }, greeting: { type: Type.STRING } } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const translateText = async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = sourceLang && sourceLang !== 'auto' 
        ? `Translate from ${sourceLang} to ${targetLang}: "${text}". Return only result.`
        : `Translate to ${targetLang}: "${text}". Return only result.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });
    return response.text?.trim() || "";
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const encodePCM = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
};

export const decodePCM = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
};

export const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

export const playRawPcm = async (base64Audio: string) => {
    if (!base64Audio) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decodePCM(base64Audio), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
};

export const getHotelSuggestions = async (loc: string, profile: UserProfile): Promise<any[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vegetarian-first hotel suggestions in ${loc} for explorer ${profile.name}. Focus on local character and high ratings globally.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        rating: { type: Type.NUMBER }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const getItinerarySuggestions = async (bookings: Booking[], profile: UserProfile): Promise<any[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Suggest 3 activities anywhere on Earth for ${profile.name} based on this itinerary: ${JSON.stringify(bookings)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const getUnifiedTransitStatus = async (id: string, profile: UserProfile): Promise<TransitStatus> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Full status registry interrogation for international transit ID: ${id}. Ensure the data is current and verified via global search.`,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['On-time', 'Delayed', 'Cancelled', 'Arrived', 'Scheduled'] },
                    current_location: { type: Type.STRING },
                    progress_percent: { type: Type.NUMBER },
                    arrival_node: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, terminal: { type: Type.STRING }, gate: { type: Type.STRING }, platform: { type: Type.STRING } } },
                    amenities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, description: { type: Type.STRING } } } },
                    timezone_info: { type: Type.STRING },
                    scheduled_arrival: { type: Type.STRING },
                    estimated_arrival: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const getSmartSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate 3 global search suggestions for travel query: "${query}". Include a local specialty (vegetarian favored) for each suggestion anywhere in the world.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            type: { type: Type.STRING },
                            local_veg_specialty: { type: Type.STRING }
                        },
                        required: ["name", "type", "local_veg_specialty"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const getFlightStatus = async (flightNumber: string, date: string): Promise<{ text: string; groundingChunks: GroundingChunk[] }> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Retrieve current status for flight ${flightNumber} on ${date}. Access international flight databases and grounding.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return { 
            text: response.text || "Neural registry uplink failed.",
            groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

export const generateAIVideo = async (prompt: string, base64Image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: { imageBytes: base64Image.split(',')[1], mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const generateAIImage = async (prompt: string, aspectRatio: string, size: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any }
        }
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Neural synthesis failed.");
};

export const editAIImage = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image.split(',')[1], mimeType } },
                { text: prompt }
            ]
        }
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Editing failed.");
};

export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
    });
    return response.text || "Analysis registry empty.";
};

export const transcribeAudioFromBase64 = async (base64Audio: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64Audio, mimeType } }, { text: "Transcribe exactly." }] }
    });
    return response.text || "No voice activity detected.";
};

export const connectLiveGuide = async (callbacks: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'You are Bharat, a warm Indian travel companion with global wisdom. You help explorers anywhere on Earth.'
        }
    });
};

export const getChatTranslation = async (text: string, lang: string): Promise<string> => translateText(text, lang);
