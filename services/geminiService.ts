// @ts-nocheck
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    AIResponse, PlaceInfo, RouteStrategies, MapMarker, 
    GlobalIntelligence, TransitStatus, UserProfile, 
    SearchSuggestion, Booking, GroundingChunk 
} from '../types';

// API Key Configuration for Vite/IDX
const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenAI(API_KEY);

const CORE_PERSONA = `You are the 'Bharat Path Core Intelligence'.
Memory Protocol: 
1. Maintain a persistent profile for each explorer.
2. Strictly prioritize Indian hospitality (Atithi Devo Bhava) and legendary vegetarian food globally.
3. Be a global guide from Raipur's local streets to international wonders.`;

// --- CORE UTILITY: Call With Retry (For Raipur's varying network & API limits) ---
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1500): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
            if (isRateLimit && i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, initialDelay * Math.pow(2, i)));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

// --- 1. GENERAL AI RESPONSE (Thinking & Flash) ---
export const getAIResponse = async (query: string, profile: UserProfile, options: { useThinking?: boolean } = {}): Promise<AIResponse> => {
    return callWithRetry(async () => {
        const model = genAI.getGenerativeModel({ 
            model: options.useThinking ? 'gemini-2.0-flash-thinking-exp' : 'gemini-1.5-flash',
            systemInstruction: CORE_PERSONA + `\nExplorer: ${profile.name}`
        });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: query }] }],
            tools: [{ googleSearch: {} }]
        });
        return { 
            story: result.response.text(),
            groundingChunks: (result.response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[]
        };
    });
};

// --- 2. GLOBAL MAPPING (Spatial Intelligence) ---
export const searchPlacesWithAI = async (query: string, profile: UserProfile, center?: { lat: number; lng: number }): Promise<any> => {
    return callWithRetry(async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Locate markers for: "${query}". Global Search focus.`);
        const metadata = result.response.candidates?.[0]?.groundingMetadata;
        const markers: MapMarker[] = [];
        metadata?.groundingChunks?.forEach((chunk, i) => {
            if (chunk.mapsUri) {
                const match = chunk.mapsUri.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) markers.push({ id: `m-${i}`, name: chunk.title || 'Spot', lat: parseFloat(match[1]), lng: parseFloat(match[2]), uri: chunk.mapsUri });
            }
        });
        return { story: result.response.text(), markers };
    });
};

// --- 3. MULTIMEDIA HUB (Veo Video & Nano Banana Image) ---
export const generateAIVideo = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: 'veo-1' });
    const result = await model.generateContent([prompt, { inlineData: { data: base64Image.split(',')[1], mimeType } }]);
    return result.response.text(); // Returns URI
};

export const generateAIImage = async (prompt: string, aspectRatio: string, size: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: 'imagen-3' });
    const result = await model.generateContent(prompt);
    const part = result.response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part) throw new Error("Synthesis failed.");
    return `data:image/png;base64,${part.inlineData.data}`;
};

// --- 4. TRAVEL LOGISTICS (Hotels, Routes, Flights) ---
export const getHotelSuggestions = async (loc: string, profile: UserProfile): Promise<any[]> => {
    return callWithRetry(async () => {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Vegetarian hotels in ${loc}. JSON output.`);
        return JSON.parse(result.response.text() || "[]");
    });
};

export const getUnifiedTransitStatus = async (id: string): Promise<TransitStatus> => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Status for transit ID: ${id}. Google Search grounded.`);
    return JSON.parse(result.response.text() || "{}");
};

// --- 5. AUDIO & VOICE (BhashaSangam Hub) ---
export const playRawPcm = async (base64Audio: string) => {
    if (!base64Audio) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    buffer.getChannelData(0).set(Array.from(dataInt16).map(v => v / 32768.0));
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Translate to ${targetLang}: "${text}". Result only.`);
    return result.response.text().trim();
};