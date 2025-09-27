import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AIResponse } from '../types';

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