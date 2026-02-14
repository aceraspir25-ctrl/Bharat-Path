
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { AIResponse, AIBookingSuggestion, PlaceInfo, RouteDetails, GroundingChunk, Booking, AIActivitySuggestion, MapMarker, GlobalIntelligence, TransitStatus, UserProfile } from '../types';

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

const getMetadataString = (profile: UserProfile) => `
[GLOBAL PROFILE METADATA]
Explorer: ${profile.name} (Origin: ${profile.country})
Professional Status: ${profile.memory.professionalContext}
Interests Registry: ${profile.memory.interests.join(', ')}
Trust Badges: ${profile.memory.expertiseNodes.join(', ')}
Subscription: ${profile.subscriptionTier}
`;

/**
 * Robust Retry Utility with Exponential Backoff for Quota Management
 */
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota');
            
            if (isRateLimit && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`Neural quota reached. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

/**
 * Main Content Generation with Thinking and Grounding
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
            config.thinkingConfig = { thinkingBudget: 32768 };
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

/**
 * AI Powered Input Suggestions
 */
export const getSuggestions = async (input: string, type: 'city' | 'hotel' | 'flight'): Promise<string[]> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Give me 5 popular ${type} suggestions starting with or related to "${input}". Return as a simple comma-separated list. Ensure suggestions are global and relevant.`
        });
        const text = response.text || "";
        return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    });
};

/**
 * Image Generation (Nano Banana Pro)
 */
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

/**
 * Image Editing (Gemini 2.5 Flash Image)
 */
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

/**
 * Video Generation (Veo)
 */
export const generateAIVideo = async (prompt: string, base64Image: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: { imageBytes: base64Image.split(',')[1], mimeType },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio
            }
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

/**
 * Audio Transcription
 */
export const transcribeAudioFromBase64 = async (base64Audio: string, mimeType: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Audio, mimeType } },
                    { text: "Transcribe this audio exactly as spoken. If there are multiple speakers, identify them." }
                ]
            }
        });
        return response.text || "";
    });
};

/**
 * Analyze Media (Image/Video Understanding)
 */
export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: prompt }
                ]
            }
        });
        return response.text || "";
    });
};

/**
 * Live API Session Helper
 */
export const connectLiveGuide = async (callbacks: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: 'You are a cheerful Indian travel guide named Bharat. Speak warmly and suggest legendary vegetarian food and cultural landmarks. Keep your responses concise and conversational.'
        }
    });
};

/**
 * Text To Speech
 */
export const generateSpeech = async (text: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    });
};

/**
 * Audio Utilities
 */
export const decodePCM = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
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
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodePCM(base64Audio), outputAudioContext, 24000, 1);
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
};

export const getPlaceInformation = async (placeName: string, profile: UserProfile): Promise<PlaceInfo> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Wisdom Hub: "${placeName}". Details about history, attractions, and local customs. Return JSON.`,
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
                thinkingConfig: { thinkingBudget: 32768 },
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
            model: "gemini-2.5-flash",
            contents: `Analyze [${lat}, ${lng}]. Provide localized intel using Maps Grounding.`,
            config: {
                tools: [{ googleMaps: {} }],
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

export const searchPlacesWithAI = async (query: string, profile: UserProfile): Promise<any> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: { tools: [{ googleMaps: {} }] }
        });
        const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
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

/**
 * Translates text with an optional source language.
 */
export const translateText = async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sourceContext = sourceLang && sourceLang !== 'auto' ? ` from ${sourceLang}` : '';
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate to ${targetLang}${sourceContext}: "${text}". Return only the translated text.`,
        });
        if (!response.text) throw new Error("Empty translation response.");
        return response.text.trim();
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
            contents: `Suggest activities based on these bookings: ${JSON.stringify(bookings)}`,
            config: { thinkingConfig: { thinkingBudget: 1000 }, responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    });
};

/**
 * Real-time Flight Status Interrogator
 */
export const getFlightStatus = async (no: string, date: string): Promise<{ data: any; groundingChunks: GroundingChunk[] }> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find the real-time flight status for ${no} on ${date}. Return status, terminal, gate, estimatedDeparture, estimatedArrival, origin, and destination.`,
            config: { 
                tools: [{ googleSearch: {} }], 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING },
                        terminal: { type: Type.STRING },
                        gate: { type: Type.STRING },
                        estimatedDeparture: { type: Type.STRING },
                        estimatedArrival: { type: Type.STRING },
                        origin: { type: Type.STRING },
                        destination: { type: Type.STRING }
                    }
                }
            }
        });

        try {
            return {
                data: JSON.parse(response.text || "{}"),
                groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
            };
        } catch (e) {
            return { data: {}, groundingChunks: [] };
        }
    });
};

export const getUnifiedTransitStatus = async (id: string, profile: UserProfile): Promise<TransitStatus> => {
    return callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Live status for transit ${id}`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const getChatTranslation = async (text: string, lang: string): Promise<string> => translateText(text, lang);
