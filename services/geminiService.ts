
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MindMapNode, MindMapNodeData } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Please ensure it is configured.");
  // Potentially throw an error or handle this state in the UI if needed
  // For now, this service will fail if API_KEY is missing, and UI should show error.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, assuming it's set or app won't work

let nodeIdCounter = 0; // Counter for generating unique node IDs

// Recursive helper function to assign unique IDs to nodes
const assignIdsToNode = (node: MindMapNode): MindMapNodeData => {
  nodeIdCounter++;
  const newNode: MindMapNodeData = {
    id: `node-${nodeIdCounter}`,
    name: node.name,
  };
  if (node.children && node.children.length > 0) {
    newNode.children = node.children.map(child => assignIdsToNode(child));
  }
  return newNode;
};


export const generateMindMapData = async (topic: string): Promise<MindMapNodeData> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
  }

  const prompt = `
    Generate a hierarchical mind map structure in JSON format for the central topic: "${topic}".
    The JSON should represent a tree structure with a root node.
    The root node object should have a "name" property (which should be the central topic: "${topic}") and an optional "children" array.
    Each child in the "children" array should be an object with its own "name" property and an optional "children" array for sub-topics.
    
    Provide between 3 to 6 main branches (direct children of the root).
    Each main branch can have 2 to 4 sub-topics.
    Limit the total depth of the mind map to 3 levels (root, main branches, sub-topics of main branches).
    
    Example of the desired JSON structure:
    {
      "name": "Central Topic",
      "children": [
        {
          "name": "Main Branch 1",
          "children": [
            { "name": "Sub-topic 1.1" },
            { "name": "Sub-topic 1.2" }
          ]
        },
        { "name": "Main Branch 2" },
        { 
          "name": "Main Branch 3",
          "children": [
            { "name": "Sub-topic 3.1" },
            { "name": "Sub-topic 3.2" },
            { "name": "Sub-topic 3.3" }
          ]
        }
      ]
    }

    The names of the nodes should be concise and relevant to the topic.
    Ensure the output is ONLY the JSON object, without any surrounding text, explanations, or markdown fences like \`\`\`json or \`\`\`.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, // Lower temperature for more focused and structured output
      },
    });

    let jsonStr = response.text.trim();
    
    // Remove potential markdown fences (```json ... ```)
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    // Validate if it's a string that looks like JSON
    if (!jsonStr.startsWith("{") || !jsonStr.endsWith("}")) {
        console.error("Response from Gemini is not valid JSON format after trimming fences:", jsonStr);
        throw new Error("AI response was not in the expected JSON format. The response started with: " + jsonStr.substring(0, 50));
    }

    const parsedData: MindMapNode = JSON.parse(jsonStr);

    // Ensure the root node name matches the topic, or set it if missing
    if (!parsedData.name || parsedData.name.toLowerCase() !== topic.toLowerCase()) {
        console.warn(`Gemini root name "${parsedData.name}" differs from topic "${topic}". Using topic as root name.`);
        parsedData.name = topic; 
    }
    
    nodeIdCounter = 0; // Reset ID counter for each new mind map
    return assignIdsToNode(parsedData);

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof Error) {
        // Check for specific Gemini API errors if possible, e.g. related to API key
        if (error.message.includes("API key not valid")) {
            throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
         throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the AI service.");
  }
};
