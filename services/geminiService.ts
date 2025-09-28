import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AIResponse, AIBookingSuggestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In a real deployed app, the key must be provided.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const bookingSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "Name of the hotel or restaurant."
            },
            type: {
                type: Type.STRING,
                enum: ['Hotel', 'Restaurant'],
                description: "The type of establishment."
            },
            description: {
                type: Type.STRING,
                description: "A brief, enticing description."
            },
            rating: {
                type: Type.NUMBER,
                description: "A rating out of 5, e.g., 4.5."
            }
        },
        required: ["name", "type", "description", "rating"]
    }
};

export const getAIResponse = async (query: string): Promise<AIResponse> => {
  try {
    const isBookingRequest = /hotels|restaurants|stays|food|eat/i.test(query);
    const isImageRequest = /image|picture|photo|show me|visualize/i.test(query);

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are 'Path Darshak', an expert travel guide for India, specializing in its history, culture, and spiritual significance. Your name means 'one who shows the path'. Respond in a warm, engaging, and story-telling manner. If asked for suggestions like hotels or restaurants, provide them in the requested JSON format. Otherwise, provide a rich, narrative answer.`;

    let aiResponse: AIResponse = {};

    // Step 1: Get primary content (text or suggestions)
    if (isBookingRequest) {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `Please suggest some hotels or restaurants related to this query: "${query}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: bookingSuggestionSchema
            },
        });

        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        aiResponse.suggestions = suggestions;

    } else {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: query,
            config: {
                systemInstruction
            },
        });
        
        aiResponse.story = response.text;
    }

    // Step 2: If an image is requested, generate it and add to the response
    if (isImageRequest) {
        const imageGenResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, artistic, high-quality photograph of a travel scene in India related to: "${query}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (imageGenResponse.generatedImages && imageGenResponse.generatedImages.length > 0) {
          const base64ImageBytes: string = imageGenResponse.generatedImages[0].image.imageBytes;
          aiResponse.image = base64ImageBytes;
        }
    }
    
    return aiResponse;

  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw new Error("Failed to get a response from the AI. The API key might be missing or invalid.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A vibrant, artistic, high-quality photograph of a travel scene in India related to: "${prompt}"`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    } else {
      throw new Error("No image was generated.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate an image. The API key might be missing or invalid.");
  }
};

const flightSchema = {
    type: Type.OBJECT,
    properties: {
        number: { type: Type.STRING, description: "The flight number, e.g., '6E-204'. Return an empty string if not found." },
        departureAirport: { type: Type.STRING, description: "The departure airport IATA code. Infer this from a city name if provided (e.g., 'Delhi' becomes 'DEL'). Return an empty string if not found." },
        arrivalAirport: { type: Type.STRING, description: "The arrival airport IATA code. Infer this from a city name if provided (e.g., 'Mumbai' becomes 'BOM'). Return an empty string if not found." },
        date: { type: Type.STRING, description: "The date of the flight in YYYY-MM-DD format. Resolve relative and ambiguous dates like 'tomorrow' or 'next Friday' based on the current date. Return an empty string if not found." }
    },
    required: ["number", "departureAirport", "arrivalAirport", "date"]
};

const trainSchema = {
    type: Type.OBJECT,
    properties: {
        number: { type: Type.STRING, description: "The train number or name, e.g., '12001 Shatabdi'. Return an empty string if not found." },
        departureStation: { type: Type.STRING, description: "The departure station code. Infer this from a city name if provided (e.g., 'New Delhi' becomes 'NDLS'). Return an empty string if not found." },
        arrivalStation: { type: Type.STRING, description: "The arrival station code. Infer this from a city name if provided (e.g., 'Mumbai Central' becomes 'BCT'). Return an empty string if not found." },
        date: { type: Type.STRING, description: "The date of the journey in YYYY-MM-DD format. Resolve relative and ambiguous dates like 'tomorrow' or 'next Friday' based on the current date. Return an empty string if not found." }
    },
    required: ["number", "departureStation", "arrivalStation", "date"]
};

export const parseTravelDetails = async (query: string, type: 'Flight' | 'Train'): Promise<any> => {
    try {
        const systemInstruction = `You are an expert travel detail parser. Your task is to extract flight or train information from a user's query and return it in the specified JSON format.
Key responsibilities:
1.  **Date Resolution:** Accurately convert relative and ambiguous dates (e.g., 'today', 'tomorrow', 'next Friday', 'August 15th') into a precise 'YYYY-MM-DD' format based on the provided current date.
2.  **Location Inference:** If a city name is given for departure or arrival (e.g., 'Delhi', 'Mumbai'), infer the most common corresponding IATA airport code for flights (e.g., 'DEL', 'BOM') or railway station code for trains (e.g., 'NDLS', 'BCT'). If a code is already provided, use it directly.
3.  **Data Integrity:** If a specific piece of information (like a flight number or date) cannot be reliably determined from the query, return an empty string for that field.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Parse the following travel information. The current date is ${new Date().toISOString().split('T')[0]}. Query: "${query}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: type === 'Flight' ? flightSchema : trainSchema
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error(`Error parsing ${type} details:`, error);
        throw new Error(`Failed to parse ${type} details. Please check the format or fill the form manually.`);
    }
}

const dateSchema = {
    type: Type.OBJECT,
    properties: {
        date: {
            type: Type.STRING,
            description: "The parsed date in YYYY-MM-DD format. Resolve relative and ambiguous dates like 'tomorrow' or 'next Friday' based on the current date. Return an empty string if not found."
        }
    },
    required: ["date"]
};

export const parseDate = async (dateQuery: string): Promise<string> => {
    if (!dateQuery.trim()) {
        return '';
    }
    try {
        const systemInstruction = `You are an expert date parser. Your task is to extract a date from a user's query and return it in YYYY-MM-DD format. Accurately convert relative and ambiguous dates (e.g., 'today', 'tomorrow', 'next Friday', 'August 15th') into a precise 'YYYY-MM-DD' format based on the provided current date. If you cannot determine a date, return an empty string.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Parse the following date. The current date is ${new Date().toISOString().split('T')[0]}. Date query: "${dateQuery}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: dateSchema
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.date || '';

    } catch (error) {
        console.error(`Error parsing date:`, error);
        throw new Error(`Failed to parse date. Please use the YYYY-MM-DD format or try again.`);
    }
};

const hotelSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "Name of the hotel."
            },
            type: {
                type: Type.STRING,
                enum: ['Hotel'],
                description: "The type of establishment, which must be 'Hotel'."
            },
            description: {
                type: Type.STRING,
                description: "A brief, one-sentence description of the hotel."
            },
            rating: {
                type: Type.NUMBER,
                description: "A rating out of 5, e.g., 4.5."
            }
        },
        required: ["name", "type", "description", "rating"]
    }
};

export const getHotelSuggestions = async (location: string): Promise<AIBookingSuggestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful travel assistant. Your task is to provide a list of hotel suggestions for a given location in the specified JSON format.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: `Please suggest up to 5 popular hotels in or near "${location}".`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: hotelSuggestionSchema
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error fetching hotel suggestions:", error);
    throw new Error("Failed to get hotel suggestions from the AI.");
  }
};