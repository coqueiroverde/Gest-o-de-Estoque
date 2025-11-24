import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIItemSuggestion } from "../types";

// Initialize Gemini Client
// CRITICAL: Using process.env.API_KEY directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestItemDetails = async (itemName: string): Promise<AIItemSuggestion | null> => {
  if (!itemName) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Atue como um especialista em suprimentos de restaurantes. Gere detalhes para um insumo chamado "${itemName}". 
      Retorne uma categoria culinária curta (ex: Hortifruti, Carnes, Mercearia), uma descrição técnica de 1 frase, 
      um custo médio estimado unitário (em BRL), uma unidade de medida comum (kg, L, un, cx, pct) e um estoque mínimo recomendado para um restaurante médio.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
            minStockRecommendation: { type: Type.NUMBER },
            unitSuggestion: { type: Type.STRING, enum: ["un", "kg", "g", "L", "ml", "cx", "pct"] }
          },
          required: ["category", "description", "suggestedPrice", "minStockRecommendation", "unitSuggestion"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIItemSuggestion;
    }
    return null;
  } catch (error) {
    console.error("Error generating item details:", error);
    return null;
  }
};

export const generateInventoryInsights = async (items: InventoryItem[]): Promise<string> => {
  if (items.length === 0) return "Adicione insumos ao estoque para receber análises da IA.";

  try {
    // Simplify the data sent to AI to save tokens and focus on relevant metrics
    const simplifiedItems = items.map(i => ({
      name: i.name,
      qty: `${i.quantity}${i.unit}`,
      min: i.minStock,
      cat: i.category,
      val: i.price * i.quantity
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Você é um Gerente de Restaurante experiente (Chef Executivo). Analise estes dados de estoque de insumos (JSON): ${JSON.stringify(simplifiedItems)}.
      Forneça um relatório curto (máximo 3 parágrafos) em Markdown.
      1. Identifique insumos críticos (risco de parar a cozinha).
      2. Sugira ações para categorias com custo elevado parado.
      3. Dê uma recomendação sobre desperdício ou compras.
      Use emojis de comida.`,
    });

    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Erro ao conectar com a IA para análise.";
  }
};