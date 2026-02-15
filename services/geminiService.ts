import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIResponse, PlaceInfo, RouteDetails, GroundingChunk, Booking, MapMarker, GlobalIntelligence, TransitStatus, UserProfile, SearchSuggestion } from '../types';

const CORE_PERSONA = `You are the 'Bharat Path Core Intelligence'.
Memory Protocol: 
1. Maintain a persistent profile for each explorer based on the provided [GLOBAL PROFILE METADATA].
2. Track travel patterns and community contributions.
3. Strictly prioritize Indian hospitality (Atithi Devo Bhava) and legendary vegetarian food options globally.`;

const getMetadataString = (profile: UserProfile) => `
[GLOBAL PROFILE METADATA]
Explorer: ${profile.name}
Interests: ${profile.memory.interests.join(', ')}
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

export const getSmartSuggestions = async (input: string): Promise<SearchSuggestion[]> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Suggest 5 diverse travel nodes for query: "${input}". Include unique local vegetarian specialties for each.`,
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
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

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
            contents: `Global mapping request: Locate markers for: "${query}". Search across all cities, villages and landmarks.`,
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

export const translateText = async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = sourceLang && sourceLang !== 'auto' 
        ? `Translate from ${sourceLang} to ${targetLang}: "${text}". Return only the result.`
        : `Translate to ${targetLang}: "${text}". Return only the result.`;
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

export const getPlaceInformation = async (placeName: string, profile: UserProfile): Promise<PlaceInfo> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Wisdom Hub interrogation for: "${placeName}". Return historical, cultural and tourist metadata as JSON.`,
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
};

export const getRouteDetails = async (start: any, dest: string, preference: string, profile: UserProfile, options: any): Promise<RouteDetails> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const startStr = start.lat ? `${start.lat},${start.lon}` : start;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Generate a ${preference} route from ${startStr} to ${dest}. Return steps as JSON array.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        instruction: { type: Type.STRING },
                        distance: { type: Type.STRING },
                        duration: { type: Type.STRING }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const getGlobalIntelligence = async (lat: number, lng: number, profile: UserProfile): Promise<GlobalIntelligence> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Local Path Intelligence for [${lat}, ${lng}]. Essentials, safety and local context.`,
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

export const getHotelSuggestions = async (loc: string, profile: UserProfile): Promise<any[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Vegetarian-first hotel suggestions in ${loc}. Focus on heritage and comfort.`,
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
        contents: `Suggest 3 activities based on this itinerary: ${JSON.stringify(bookings)}`,
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

export const getFlightStatus = async (no: string, date: string): Promise<{ text: string; groundingChunks: GroundingChunk[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Real-time status for flight ${no} on ${date}. Terminal, gate and T-minus status.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return {
        text: response.text || "Flight node synchronization pending.",
        groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
    };
};

export const getUnifiedTransitStatus = async (id: string, profile: UserProfile): Promise<TransitStatus> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Full status registry interrogation for transit ID: ${id}`,
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
    throw new Error("Neural image synthesis failed.");
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
    throw new Error("Path editing failed.");
};

export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
    });
    return response.text || "Media analysis registry empty.";
};

export const transcribeAudioFromBase64 = async (base64Audio: string, mimeType: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64Audio, mimeType } }, { text: "Transcribe exactly what you hear." }] }
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
            systemInstruction: 'You are Bharat, a warm Indian travel companion. Guide the user through their global path.'
        }
    });
};

export const getChatTranslation = async (text: string, lang: string): Promise<string> => translateText(text, lang);