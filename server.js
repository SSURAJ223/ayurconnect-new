
const express = require('express');
const path = require('path');
const { GoogleGenAI, Type } = require("@google/genai");
const cors = require('cors');

// This server will run in a secure environment where process.env.API_KEY is set.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const app = express();
const port = process.env.PORT || 10000;

// Enable CORS for all routes. This is crucial for allowing cross-domain requests.
app.use(cors());

app.use(express.json({ limit: '50mb' })); // Use express's body parser for JSON

// --- Start of AI Logic ---

const medicineSchema = {
    type: Type.OBJECT,
    properties: {
        drugSummary: {
            type: Type.STRING,
            description: "A brief summary of the allopathic drug, its uses, and mechanism of action."
        },
        herbSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested complementary Ayurvedic herbs.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the Ayurvedic herb." },
                    summary: { type: Type.STRING, description: "Summary of the herb's benefits, particularly in relation to the drug's purpose." },
                    dosage: { type: Type.STRING, description: "Recommended dosage. E.g., '1-2 tablets twice a day'." },
                    form: { type: Type.STRING, description: "Common form of consumption. E.g., 'Powder, Tablet'." },
                    sideEffects: { type: Type.STRING, description: "Potential side effects or precautions. Mention 'Consult a doctor' if applicable." }
                },
                required: ["name", "summary", "dosage", "form", "sideEffects"]
            }
        },
        lifestyleSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested lifestyle changes (diet, exercise, etc.) that complement the treatment.",
            items: {
                type: Type.OBJECT,
                properties: {
                    suggestion: { type: Type.STRING, description: "The lifestyle recommendation." },
                    source: { type: Type.STRING, description: "The basis for the suggestion. E.g., 'Rasayana: Ayurvedic herbs for longevity and rejuvenation', 'Sushruta Samhita'." }
                },
                required: ["suggestion", "source"]
            }
        }
    },
    required: ["drugSummary", "herbSuggestions", "lifestyleSuggestions"]
};

const labReportSchema = {
    type: Type.ARRAY,
    description: "An array of findings from the lab report analysis. If all markers are normal, return an empty array.",
    items: {
        type: Type.OBJECT,
        properties: {
            parameter: { type: Type.STRING, description: "The name of the lab marker that is out of range, e.g., 'Total Cholesterol'." },
            status: { type: Type.STRING, description: "The status of the marker, e.g., 'High', 'Low'." },
            summary: { type: Type.STRING, description: "A brief summary explaining the implication of this finding." },
            herbSuggestions: {
                type: Type.ARRAY,
                description: "A list of suggested complementary Ayurvedic herbs for this specific finding.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Name of the Ayurvedic herb." },
                        summary: { type: Type.STRING, description: "Summary of the herb's benefits related to the finding." },
                        dosage: { type: Type.STRING, description: "Recommended dosage." },
                        form: { type: Type.STRING, description: "Common form of consumption." },
                        sideEffects: { type: Type.STRING, description: "Potential side effects or precautions." }
                    },
                    required: ["name", "summary", "dosage", "form", "sideEffects"]
                }
            },
            lifestyleSuggestions: {
                type: Type.ARRAY,
                description: "A list of suggested lifestyle changes for this specific finding.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING, description: "The lifestyle recommendation." },
                        source: { type: Type.STRING, description: "The basis for the suggestion. E.g., 'Rasayana: Ayurvedic herbs for longevity and rejuvenation', 'Sushruta Samhita'." }
                    },
                    required: ["suggestion", "source"]
                }
            }
        },
        required: ["parameter", "status", "summary", "herbSuggestions", "lifestyleSuggestions"]
    }
};


// API endpoint for all Gemini calls
app.post('/api/gemini', async (req, res) => {
    try {
        const { type, ...data } = req.body;

        if (type === 'medicine') {
            const prompt = `You are an expert AI assistant with deep knowledge in both allopathic medicine and Ayurveda. A user has provided the following allopathic medicine name: "${data.medicineName}". Your task is to provide a detailed analysis and complementary suggestions. Follow these instructions precisely: 1. Provide a brief, easy-to-understand summary of the allopathic drug. 2. Suggest 2-3 complementary Ayurvedic herbs. 3. Provide 2-3 relevant lifestyle suggestions based on the principles found in the books "Rasayana: Ayurvedic herbs for longevity and rejuvenation" by H.S. Puri and "Sushruta Samhita". When sourcing from these books, mention the book's title in the 'source' field of the lifestyle suggestion. IMPORTANT: Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: medicineSchema },
            });
            res.status(200).json(JSON.parse(response.text));

        } else if (type === 'lab') {
            const systemInstruction = `You are an expert AI assistant specializing in analyzing medical lab reports from both an allopathic and Ayurvedic perspective. Your task is to analyze the provided lab report data (which can be text or an image). Follow these instructions carefully: 1. Identify key biomarkers in the report that are outside of the standard normal range. 2. For EACH biomarker that is out of range, create a distinct finding object. 3. If all biomarkers are within the normal range, return an empty array. 4. For each finding, provide a simple summary explaining what the result might indicate. 5. For each finding, suggest 1-2 complementary Ayurvedic herbs that could help bring the marker back to balance. 6. For each finding, suggest 1-2 relevant lifestyle modifications based on the principles found in the books "Rasayana: Ayurvedic herbs for longevity and rejuvenation" by H.S. Puri and "Sushruta Samhita". When sourcing from these books, mention the book's title in the 'source' field of the lifestyle suggestion. IMPORTANT: Your response MUST be a single JSON array of finding objects that conforms to the provided schema. Do not include any text, greetings, or explanations outside of the JSON array.`;
            const parts = [];
            if (data.input.text) {
                parts.push({ text: `Here is the lab report data:\n\n${data.input.text}` });
            }
            if (data.input.image) {
                parts.push({ inlineData: data.input.image });
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: { parts },
                config: { responseMimeType: "application/json", responseSchema: labReportSchema, systemInstruction },
            });

            const responseText = response.text.trim();
            if (responseText === "" || responseText === "[]") {
                res.status(200).json([]);
            } else {
                res.status(200).json(JSON.parse(responseText));
            }
        } else {
            res.status(400).json({ error: 'Invalid request type' });
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
             console.error('Error parsing JSON from AI:', error);
             res.status(500).json({ error: 'The AI returned an invalid response format. Please try again.' });
        } else {
            console.error('Error in API handler:', error);
            res.status(500).json({ error: error.message || 'An internal server error occurred.' });
        }
    }
});

// --- End of AI Logic ---

// Serve the static files from the 'dist' directory created by Vite's build process
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't match one above,
// send back the index.html file from the 'dist' directory.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
