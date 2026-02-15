
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIResponse, PlaceInfo, RouteDetails, GroundingChunk, Booking, MapMarker, GlobalIntelligence, TransitStatus, UserProfile, SearchSuggestion } from '../types';

const CORE_PERSONA = `You are the 'Bharat Path Core Intelligence'.
Memory Protocol: 
1. Maintain a persistent profile for each explorer based on the provided [GLOBAL PROFILE METADATA].
2. Track travel patterns and community contributions.
3. Use this data for hyper-personalized recommendations.
4. Professional Focus Mode: Prioritize quiet, focus-friendly cafes and hotels if relevant.
5. Trust Protocol: Acknowledge 'Expert' badges to build social trust in the response.
6. Strictly prioritize Indian hospitality (Atithi Devo Bhava) and legendary vegetarian food options globally.`;

const bookingSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Name of the establishment." },
            type: { type: Type.STRING, enum: ['Hotel', 'Restaurant'] },
            description: { type: Type.STRING, description: "Description tailored to user memory." },
            rating: { type: Type.NUMBER, description: "Rating out of 5." }
        },
        required: ["name", "type", "description", "rating"]
    }
};

const smartSuggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Name of the suggestion." },
            type: { type: Type.STRING, description: "Category (e.g. City, Hotel, Landmark)." },
            local_veg_specialty: { type: Type.STRING, description: "Authentic local vegetarian dish." }
        },
        required: ["name", "type", "local_veg_specialty"]
    }
};

const getMetadataString = (profile: UserProfile) => `
[GLOBAL PROFILE METADATA]
Explorer: ${profile.name} (Origin: ${profile.country})
Professional Status: ${profile.memory.professionalContext}
Interests Registry: ${profile.memory.interests.join(', ')}
Trust Badges: ${profile.memory.expertiseNodes.join(', ')}
Subscription: ${profile.subscriptionTier}
`;

/**
 * Robust Retry Utility with Exponential Backoff for Quota Management (429 fix)
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1500): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorMsg = error.message || "";
            // Check for rate limit or resource exhausted errors
            const isRateLimit = errorMsg.includes('429') || error.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
            
            if (isRateLimit && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Neural quota reached. Auto-resync in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

/**
 * AI Powered Diverse Suggestions Engine (Unbiased)
 */
export const getSmartSuggestions = async (input: string): Promise<SearchSuggestion[]> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `User is exploring "${input}" on Bharat Path. 
            Provide 5 diverse suggestions (Cities, Hotels, or Local Spots). 
            For food, suggest authentic local vegetarian cuisine of that specific region. 
            DO NOT repeat specific common items like 'Paneer' or 'Momos' unless it's the uniquely dominant local specialty. 
            Treat all vegetarian categories equally.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: smartSuggestionsSchema
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

/**
 * Main Content Generation
 */
export const getAIResponse = async (query: string, profile: UserProfile, options: { useThinking?: boolean; useGrounding?: boolean; fast?: boolean } = {}): Promise<AIResponse> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let model = options.fast ? 'gemini-flash-lite-latest' : 'gemini-3-flash-preview';
        
        const config: any = {
            systemInstruction: `${CORE_PERSONA}\n${getMetadataString(profile)}`
        };

        if (options.useThinking) {
            model = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 16000 };
        }

        if (options.useGrounding) {
            config.tools = [{ googleSearch: {} }];
        }

        const isFoodSearch = /food|eat|restaurant|cafe|dinner|lunch|breakfast|snacks|hungry/i.test(query);

        if (isFoodSearch && !options.useGrounding) {
            config.responseMimeType = "application/json";
            config.responseSchema = bookingSuggestionSchema;
            const response = await ai.models.generateContent({ model, contents: query, config });
            return { suggestions: JSON.parse(response.text || "[]") };
        }

        const response = await ai.models.generateContent({ model, contents: query, config });
        return { 
            story: response.text,
            groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

export const translateText = async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sourceContext = sourceLang && sourceLang !== 'auto' ? ` from ${sourceLang}` : '';
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate to ${targetLang}${sourceContext}: "${text}". Return only the translated text.`,
        });
        return response.text?.trim() || "";
    });
};

export const generateAIImage = async (prompt: string, aspectRatio: string, size: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as any,
                    imageSize: size as any
                }
            }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image data returned.");
    });
};

export const generateAIVideo = async (prompt: string, base64Image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes: base64Image.split(',')[1], mimeType },
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
        });
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    });
};

export const editAIImage = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    return callWithRetry(async () => {
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
        throw new Error("Image editing failed.");
    });
};

export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
        });
        return response.text || "";
    });
};

export const transcribeAudioFromBase64 = async (base64Audio: string, mimeType: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data: base64Audio, mimeType } }, { text: "Transcribe exactly." }] }
        });
        return response.text || "";
    });
};

export const connectLiveGuide = async (callbacks: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'You are Bharat, a warm Indian guide. Help users find their path.'
        }
    });
};

export const generateSpeech = async (text: string): Promise<string> => {
    return callWithRetry(async () => {
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
    });
};

export const decodePCM = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
};

export const encodePCM = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
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
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Wisdom Hub: Comprehensive data for the location: "${placeName}". Provide details about history, attractions, and local customs for this area, whether it is a global city or a remote village. Return JSON.`,
            config: {
                systemInstruction: `${CORE_PERSONA}\n${getMetadataString(profile)}`,
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

export const getRouteDetails = async (start: any, dest: string, preference: string, profile: UserProfile, options: any): Promise<RouteDetails> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const startStr = typeof start === 'string' ? start : `${start.lat}, ${start.lon}`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Plan ${preference} route from ${startStr} to ${dest}. Return JSON array of steps.`,
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
    });
};

export const getGlobalIntelligence = async (lat: number, lng: number, profile: UserProfile): Promise<GlobalIntelligence> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze coordinates [${lat}, ${lng}]. Provide localized travel intelligence for essentials and safety.`,
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
                        context: {
                            type: Type.OBJECT,
                            properties: { language: { type: Type.STRING }, greeting: { type: Type.STRING } }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const searchPlacesWithAI = async (query: string, profile: UserProfile, center?: { lat: number; lng: number }): Promise<any> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
            model: "gemini-2.5-flash",
            contents: `Global Search: Find places matching "${query}". Search worldwide for any city, village, landmark, or specific store. Use the googleMaps tool to provide precise results.`,
            config
        });
        
        const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as any[];
        const markers: MapMarker[] = [];
        groundingChunks.forEach((chunk, index) => {
            if (chunk.maps) {
                const match = chunk.maps.uri.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match && match[1] && match[2]) {
                    markers.push({ id: `m-${index}`, name: chunk.maps.title || 'Spot', lat: parseFloat(match[1]), lng: parseFloat(match[2]), uri: chunk.maps.uri });
                }
            }
        });
        return { story: response.text, markers };
    });
};

export const getHotelSuggestions = async (loc: string, profile: UserProfile): Promise<any[]> => {
    const res = await getAIResponse(`Best vegetarian friendly hotels in ${loc}`, profile);
    return res.suggestions || [];
};

export const getItinerarySuggestions = async (bookings: Booking[], profile: UserProfile): Promise<any[]> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Suggest 3 activities based on these bookings: ${JSON.stringify(bookings)}. Return JSON array of objects with "name" and "description".`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const getFlightStatus = async (no: string, date: string): Promise<{ text: string; groundingChunks: GroundingChunk[] }> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Search for the real-time flight status of flight ${no} on ${date}. 
            Provide a concise summary including current status (e.g. On-time, Delayed), Terminal, Gate, Estimated Departure Time, and Estimated Arrival Time. 
            Format the answer clearly with labels.`,
            config: { tools: [{ googleSearch: {} }] }
        });
        return {
            text: response.text || "No information found for this flight vector.",
            groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

export const getUnifiedTransitStatus = async (id: string, profile: UserProfile): Promise<TransitStatus> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Live status for transit ID ${id}`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const getChatTranslation = async (text: string, lang: string): Promise<string> => translateText(text, lang);
