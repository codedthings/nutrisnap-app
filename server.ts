import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support high-resolution camera photos uploaded as base64
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Meal Nutrition Analysis Endpoint
app.post('/api/analyze-meal', async (req: Request, res: Response) => {
  try {
    const { image, mimeType: rawMimeType, contextNotes } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Meal image is required for analysis.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
      return;
    }

    let mimeType = rawMimeType || 'image/jpeg';
    let base64Data = image;

    // Handle data URL prefix if present
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = image.split(',')[1] || image;
      }
    }

    const promptText = `
You are an expert clinical dietitian, sports nutritionist, and computer vision food analysis specialist.
Analyze this meal photo in extreme detail.

${contextNotes ? `User Note regarding this meal: "${contextNotes}". Factor this note carefully into your portion and ingredient estimates.` : ''}

CRITICAL ACCURACY INSTRUCTIONS:
1. Identify the meal name precisely and assign its culinary/dietary category.
2. Estimate the realistic standard serving size / total mass (e.g., "1 bowl (~380g)", "1 plate with 2 tacos (~320g)").
3. Account for commonly invisible or hidden calories: cooking oils (olive oil, butter, sesame oil), dressings, marinades, cheese toppings, and sauces.
4. Calculate realistic total calories and exact macronutrient grams (Protein, Carbohydrates, Fat, Dietary Fiber, Sugars, Sodium in mg).
   Ensure the calories approximately align with: (Protein × 4) + (Carbs × 4) + (Fat × 9) + (Fiber impact).
5. Breakdown EVERY discernible ingredient component: name, portion/weight, calories, protein(g), carbs(g), fat(g), health rating ('high' for wholesome nutrient-rich, 'moderate' for balanced, 'indulgent' for refined/fried/high-sugar), and helpful notes.
6. Compute a 1-100 Health Score (based on micronutrient density, whole foods ratio, fiber, and lean protein vs saturated fat & refined carbs).
7. Determine Glycemic Impact: 'Low', 'Medium', or 'High'.
8. Provide 2 to 4 actionable, encouraging dietitian insights and highlight potential allergen warnings.
`;

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: promptText,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: {
              type: Type.STRING,
              description: 'Clear, enticing name of the meal or dish.',
            },
            cuisineType: {
              type: Type.STRING,
              description: 'Cuisine style or dietary classification (e.g. Mediterranean, Mexican, American Healthy).',
            },
            mealType: {
              type: Type.STRING,
              description: 'Meal time category: breakfast, lunch, dinner, or snack.',
            },
            estimatedPortion: {
              type: Type.STRING,
              description: 'Estimated portion description with approximate grams (e.g. "1 medium plate (~350g)").',
            },
            totalCalories: {
              type: Type.NUMBER,
              description: 'Estimated total kilocalories (kcal) for this portion.',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence percentage in the meal identification (e.g. 92).',
            },
            healthScore: {
              type: Type.NUMBER,
              description: 'Health & nutrient density score from 1 to 100.',
            },
            glycemicImpact: {
              type: Type.STRING,
              description: 'Estimated blood sugar impact: Low, Medium, or High.',
            },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: {
                  type: Type.OBJECT,
                  properties: {
                    grams: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['grams', 'percentage'],
                },
                carbs: {
                  type: Type.OBJECT,
                  properties: {
                    grams: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['grams', 'percentage'],
                },
                fat: {
                  type: Type.OBJECT,
                  properties: {
                    grams: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['grams', 'percentage'],
                },
                fiber: {
                  type: Type.OBJECT,
                  properties: {
                    grams: { type: Type.NUMBER },
                  },
                  required: ['grams'],
                },
                sugar: {
                  type: Type.OBJECT,
                  properties: {
                    grams: { type: Type.NUMBER },
                  },
                  required: ['grams'],
                },
                sodium: {
                  type: Type.OBJECT,
                  properties: {
                    milligrams: { type: Type.NUMBER },
                  },
                  required: ['milligrams'],
                },
              },
              required: ['protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'],
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  portion: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  healthRating: { type: Type.STRING, description: 'high, moderate, or indulgent' },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fat', 'healthRating'],
              },
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            allergenWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'mealName',
            'cuisineType',
            'mealType',
            'estimatedPortion',
            'totalCalories',
            'confidenceScore',
            'healthScore',
            'glycemicImpact',
            'macros',
            'ingredients',
            'dietaryTags',
            'insights',
            'allergenWarnings',
          ],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('No analysis text received from Gemini.');
    }

    const parsedData = JSON.parse(textOutput);
    // Enrich with id and timestamp
    const result = {
      ...parsedData,
      id: 'meal-' + Date.now(),
      timestamp: new Date().toISOString(),
      portionMultiplier: 1.0,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze meal image. Please try another photo.',
    });
  }
});

// Mount Vite or serve static build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriSnap server running on port ${PORT}`);
  });
}

startServer();
