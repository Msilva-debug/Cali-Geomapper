import { GoogleGenAI, Type } from "@google/genai";
import { LocationPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCyFjjWXRj5Q--asuW4iWmYGD0hL9BWJWk" });

const CALI_CENTER = { lat: 3.4516, lng: -76.5320 };

export const generateLocations = async (
  userPrompt: string, 
  isRoute: boolean
): Promise<LocationPoint[]> => {
  const modelId = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a Geographic Information System (GIS) expert specialized in Cali, Colombia (Valle del Cauca).
    Your task is to interpret the user's request and return a list of geographical coordinates (latitude/longitude) in Cali.
    
    If the user asks for a specific category (e.g., "Salsa clubs", "Museums"), list the top 3-5 popular ones.
    If the user provides a raw list of place names, find their approximate coordinates in Cali.
    If the user asks for a route, order the points logically to minimize travel distance.
    
    Ensure all coordinates are strictly within or near Cali, Colombia.
    Provide a short, engaging description (in Spanish) for each point.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "A list of location points generated based on the user request.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the location" },
            lat: { type: Type.NUMBER, description: "Latitude" },
            lng: { type: Type.NUMBER, description: "Longitude" },
            description: { type: Type.STRING, description: "Short description in Spanish" }
          },
          required: ["name", "lat", "lng", "description"]
        }
      }
    }
  });

  const rawData = response.text;
  
  if (!rawData) {
    throw new Error("No data received from Gemini");
  }

  try {
    const parsedData: Omit<LocationPoint, 'id'>[] = JSON.parse(rawData);
    
    return parsedData.map((item, index) => ({
      ...item,
      id: `loc-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};
