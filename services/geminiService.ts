import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AIResponse, AIBookingSuggestion, PlaceInfo, RouteDetails, GroundingChunk, Booking, AIActivitySuggestion } from '../types';

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
    
    let aiResponse: AIResponse = {};

    // Step 1: Get primary content (text, suggestions, or grounded response)
    if (isBookingRequest) {
        const systemInstruction = `You are 'Path Darshak', an expert travel guide for India, specializing in its history, culture, and spiritual significance. Your name means 'one who shows the path'. When asked for suggestions like hotels or restaurants, provide them in the requested JSON format.`;
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
        // Use Google Search Grounding for all other queries
        const systemInstruction = `You are 'Path Darshak', an expert travel guide for India, specializing in its history, culture, and spiritual significance. Your name means 'one who shows the path'. Use the provided search results from Google to create a comprehensive, accurate, and up-to-date response. Synthesize the information into a warm, engaging, and story-telling narrative. If the user asks a simple question, provide a direct and helpful answer based on the search results.`;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: query,
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });
        
        aiResponse.story = response.text;
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            aiResponse.groundingChunks = response.candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
        }
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

const placeInfoSchema = {
    type: Type.OBJECT,
    properties: {
        history: {
            type: Type.STRING,
            description: "A brief, engaging history of the place (2-3 sentences)."
        },
        attractions: {
            type: Type.ARRAY,
            description: "A list of 3-4 key attractions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the attraction." },
                    description: { type: Type.STRING, description: "A one-sentence description of the attraction." }
                },
                required: ["name", "description"]
            }
        },
        customs: {
            type: Type.STRING,
            description: "A short note on a local custom, etiquette tip, or unique local experience."
        }
    },
    required: ["history", "attractions", "customs"]
};

export const getPlaceInformation = async (placeName: string): Promise<PlaceInfo> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert travel guide for India. Provide a concise and informative summary for the requested location in the specified JSON format.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: `Generate a travel guide summary for the following place in India: "${placeName}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: placeInfoSchema
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error fetching place information:", error);
    throw new Error("Failed to get information for this place from the AI.");
  }
};

const routeDetailsSchema = {
    type: Type.ARRAY,
    description: "A list of turn-by-turn directions.",
    items: {
        type: Type.OBJECT,
        properties: {
            instruction: { type: Type.STRING, description: "The navigation instruction for this step (e.g., 'Turn left onto Main St')." },
            distance: { type: Type.STRING, description: "The distance for this step (e.g., '1.2 km')." },
            duration: { type: Type.STRING, description: "The estimated time for this step (e.g., '5 mins')." }
        },
        required: ["instruction", "distance", "duration"]
    }
};

export const getRouteDetails = async (start: { lat: number; lon: number }, destination: string): Promise<RouteDetails> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a route planning assistant. Provide clear, turn-by-turn driving directions from the given start coordinates to the destination. The response must be in the specified JSON format. If a step is very short, combine it with the next one.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: `Generate driving directions from start latitude ${start.lat}, longitude ${start.lon} to the following destination in India: "${destination}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: routeDetailsSchema
        },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error("AI returned an invalid route format.");
    }
    return parsed;

  } catch (error) {
    console.error("Error fetching route details:", error);
    throw new Error("Failed to get route details from the AI.");
  }
};

const itinerarySuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "The name of the suggested activity or point of interest."
            },
            description: {
                type: Type.STRING,
                description: "A brief, one-sentence description of the suggestion."
            }
        },
        required: ["name", "description"]
    }
};

export const getItinerarySuggestions = async (bookings: Booking[]): Promise<AIActivitySuggestion[]> => {
    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `You are a helpful travel assistant specializing in India. Based on the user's itinerary, suggest relevant and interesting local activities, sights, or restaurants. Do not suggest new flights or hotels. Provide the response in the specified JSON format.`;
        
        const bookingSummary = bookings.map(b => `${b.type} for '${b.details}' on ${b.date}`).join('; ');

        if (!bookingSummary) {
            return [];
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: `My itinerary is: ${bookingSummary}. Please suggest 3 to 4 nearby activities or points of interest I might enjoy.`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: itinerarySuggestionSchema
            },
        });

        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);

        if (!Array.isArray(suggestions)) {
            throw new Error("AI returned an invalid suggestion format.");
        }

        return suggestions;

    } catch (error) {
        console.error("Error fetching itinerary suggestions:", error);
        throw new Error("Failed to get itinerary suggestions from the AI.");
    }
};