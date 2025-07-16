
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";
import cors from 'cors';

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

const lifestyleSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestion: { type: Type.STRING, description: "The core lifestyle recommendation. E.g., 'Engage in moderate daily exercise'." },
        details: { type: Type.STRING, description: "Specific, quantifiable details for the suggestion. E.g., 'Brisk walking for 30 minutes'." },
        duration: { type: Type.STRING, description: "Recommended duration for the practice. E.g., '5 times a week for at least 3 months'." },
        source: { type: Type.STRING, description: "The basis for the suggestion, citing the book name. E.g., 'Sushruta Samhita'." }
    },
    required: ["suggestion", "details", "duration", "source"]
};

const medicineSchema = {
    type: Type.OBJECT,
    properties: {
        drugSummary: {
            type: Type.STRING,
            description: "A brief summary of the allopathic drug, its uses, and mechanism of action. This field should be present and populated only if the medicine name is valid."
        },
        herbSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested complementary Ayurvedic herbs. This field should be present only if the medicine name is valid.",
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
            description: "A list of suggested lifestyle changes (diet, exercise, etc.) that complement the treatment. This field should be present only if the medicine name is valid.",
            items: lifestyleSuggestionSchema
        },
        error: {
          type: Type.STRING,
          description: "An error message to be returned ONLY if the provided medicine name is not recognized or is invalid. In this case, this should be the ONLY field in the response. If the name is valid, this field must be null."
        }
    },
};

const labReportFindingSchema = {
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
            items: lifestyleSuggestionSchema
        }
    },
    required: ["parameter", "status", "summary", "herbSuggestions", "lifestyleSuggestions"]
};

const labReportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        findings: {
            type: Type.ARRAY,
            description: "An array of finding objects, one for each out-of-range biomarker. This field must be null if the input is not a valid lab report or if no biomarkers are found.",
            items: labReportFindingSchema
        },
        error: {
            type: Type.STRING,
            description: "An error message to be returned ONLY if the provided text or image does not appear to contain recognizable lab report data. If recognizable data is present, this field must be null."
        }
    }
}


// API endpoint for all Gemini calls
app.post('/api/gemini', async (req, res) => {
    try {
        const { type, profile, ...data } = req.body;

        const buildProfileString = (userProfile) => {
            if (!userProfile || (!userProfile.age && !userProfile.gender && !userProfile.allergies)) {
                 return "";
            }
            const parts = [];
            if (userProfile.age) parts.push(`Age: ${userProfile.age}`);
            if (userProfile.gender) parts.push(`Gender: ${userProfile.gender}`);
            if (userProfile.allergies) parts.push(`Known Allergies: ${userProfile.allergies}`);

            if (parts.length === 0) return "";
            return `\n\nPlease tailor your recommendations for the following user profile: ${parts.join(', ')}. Crucially, ensure that none of your herb or lifestyle suggestions conflict with the user's known allergies. If a common suggestion is contraindicated due to an allergy, you must state that and suggest an alternative if possible.`;
        };

        const profileString = buildProfileString(profile);

        if (type === 'medicine') {
            const prompt = `You are an expert AI assistant with deep knowledge in both allopathic medicine and Ayurveda. A user has provided the following allopathic medicine name: "${data.medicineName}".
Your tasks are:
1.  First, verify if "${data.medicineName}" is a recognized allopathic medicine or molecule name.
2.  If the name is NOT valid or not recognized, your entire response MUST be a JSON object with only one key: "error". Its value should be a string like "The medicine name provided was not recognized. Please check the spelling and try again.". In this case, no other fields should be present in the JSON.
3.  If the name IS valid, provide a detailed analysis. Your response MUST be a JSON object containing the 'drugSummary', 'herbSuggestions', and 'lifestyleSuggestions' fields. The 'error' field MUST be omitted entirely from the JSON object.
4.  For 'lifestyleSuggestions', provide 2-3 relevant suggestions based on the principles found in the books "Rasayana: Ayurvedic herbs for longevity and rejuvenation" by H.S. Puri and "Sushruta Samhita". Each lifestyle suggestion must be specific and actionable, including quantifiable details (e.g., 'for 30 minutes daily') and a recommended duration (e.g., 'for at least 2 months'). You must cite the book's title in the 'source' field.${profileString}

IMPORTANT: Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: medicineSchema },
            });
            res.status(200).json(JSON.parse(response.text));

        } else if (type === 'lab') {
            const systemInstruction = `You are an expert AI assistant specializing in analyzing medical lab reports from both an allopathic and Ayurvedic perspective. Your task is to analyze the provided lab report data (which can be text or an image). Follow these instructions carefully:
1. First, determine if the input contains recognizable lab report data (e.g., biomarkers like 'Cholesterol', 'Hemoglobin', 'TSH', with corresponding values and units).
2. If no recognizable biomarkers are found, or if the input is clearly not a lab report (e.g., random words like 'cold', '123', 'test'), you MUST return a JSON object containing only the 'error' key. The value should be "The provided input does not appear to be a valid lab report. Please provide text or an image containing lab results.". The 'findings' key must be omitted.
3. If the input IS a valid lab report, you must return a JSON object containing the 'findings' key. The 'error' key MUST be omitted.
4. For the 'findings' key, identify key biomarkers that are outside of the standard normal range.
5. If all biomarkers are within the normal range, the value for the 'findings' key should be an empty array (\`[]\`).
6. For each out-of-range finding, provide a simple summary explaining what the result might indicate.
7. For each finding, suggest 1-2 complementary Ayurvedic herbs that could help bring the marker back to balance.
8. For each finding, suggest 1-2 relevant lifestyle modifications based on the principles found in the books "Rasayana: Ayurvedic herbs for longevity and rejuvenation" by H.S. Puri and "Sushruta Samhita". Each lifestyle suggestion must be specific and actionable, including quantifiable details (e.g., 'for 30 minutes daily') and a recommended duration (e.g., 'for at least 2 months'). You must cite the book's title in the 'source' field of the lifestyle suggestion.${profileString}
IMPORTANT: Your entire response MUST be a single JSON object conforming to the provided schema. It must contain EITHER the 'findings' key (for a valid report) OR the 'error' key (for an invalid one), but not both. Do not add any text, greetings, or explanations outside of the JSON object.`;
            
            const parts = [];
            if (data.input.text) {
                parts.push({ text: `Analyze the following lab report data:\n\n${data.input.text}` });
            }
            if (data.input.image) {
                parts.push({ inlineData: data.input.image });
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: { parts },
                config: { responseMimeType: "application/json", responseSchema: labReportResponseSchema, systemInstruction },
            });
            
            res.status(200).json(JSON.parse(response.text));

        } else {
            res.status(400).json({ error: 'Invalid request type' });
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
             console.error('Error parsing JSON from AI:', error.message);
             res.status(500).json({ error: 'The AI returned an invalid response format. Please try again.' });
        } else {
            console.error('Error in API handler:', error);
            // Corrected line using standard JavaScript error handling.
            const errorMessage = (error instanceof Error) ? error.message : 'An internal server error occurred.';
            res.status(500).json({ error: errorMessage });
        }
    }
});


// --- End of AI Logic ---

// Get the directory name using ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
