const { GoogleGenAI, Type } = require("@google/genai");

// This function will run on Vercel's secure servers where the API_KEY is set
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const medicineSchema = {
    type: Type.OBJECT,
    properties: {
        drugSummary: { type: Type.STRING, description: "A brief summary of the allopathic drug, its uses, and mechanism of action." },
        herbSuggestions: { type: Type.ARRAY, description: "A list of suggested complementary Ayurvedic herbs.", items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, summary: { type: Type.STRING }, dosage: { type: Type.STRING }, form: { type: Type.STRING }, sideEffects: { type: Type.STRING } }, required: ["name", "summary", "dosage", "form", "sideEffects"] } },
        lifestyleSuggestions: { type: Type.ARRAY, description: "A list of suggested lifestyle changes.", items: { type: Type.OBJECT, properties: { suggestion: { type: Type.STRING }, source: { type: Type.STRING } }, required: ["suggestion", "source"] } }
    },
    required: ["drugSummary", "herbSuggestions", "lifestyleSuggestions"]
};

const labReportSchema = {
    type: Type.ARRAY,
    description: "An array of findings from the lab report analysis. If all are normal, return an empty array.",
    items: {
        type: Type.OBJECT,
        properties: {
            parameter: { type: Type.STRING }, status: { type: Type.STRING }, summary: { type: Type.STRING },
            herbSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, summary: { type: Type.STRING }, dosage: { type: Type.STRING }, form: { type: Type.STRING }, sideEffects: { type: Type.STRING } }, required: ["name", "summary", "dosage", "form", "sideEffects"] } },
            lifestyleSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { suggestion: { type: Type.STRING }, source: { type: Type.STRING } }, required: ["suggestion", "source"] } }
        },
        required: ["parameter", "status", "summary", "herbSuggestions", "lifestyleSuggestions"]
    }
};

// This is the main Vercel Serverless Function handler
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, ...data } = req.body;

        if (type === 'medicine') {
            const prompt = `You are an expert AI assistant with deep knowledge in both allopathic medicine and Ayurveda. A user has provided the following allopathic medicine name: "${data.medicineName}". Provide a detailed analysis and complementary suggestions. Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: medicineSchema } });
            return res.status(200).json(JSON.parse(response.text));

        } else if (type === 'lab') {
            const systemInstruction = `You are an expert AI assistant specializing in analyzing medical lab reports. Analyze the provided lab report data (text or image). Identify biomarkers outside the normal range. For EACH out-of-range biomarker, create a distinct finding object. If all are normal, return an empty array. Your response MUST be a single JSON array of finding objects that conforms to the provided schema. Do not include any text outside the JSON array.`;
            const parts = [];
            if (data.input.text) parts.push({ text: `Lab report data:\n\n${data.input.text}` });
            if (data.input.image) parts.push({ inlineData: data.input.image });

            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: { parts }, config: { responseMimeType: "application/json", responseSchema: labReportSchema, systemInstruction } });
            const responseText = response.text.trim();
            // Handle "all clear" reports, which might return an empty string or "[]"
            return res.status(200).json(responseText ? JSON.parse(responseText) : []);
        } else {
            return res.status(400).json({ error: 'Invalid request type' });
        }

    } catch (error) {
        console.error('Error in Vercel API handler:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
};
======================================================================
FILE NAME: index.html
----------------------------------------------------------------------
FILE CONTENT:
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AyurConnect AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        background-color: #f0fdf4; /* A very light green for the body background */
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.1.0",
    "react-dom/": "https://esm.sh/react-dom@^19.1.0/",
    "react/": "https://esm.sh/react@^19.1.0/",
    "@google/genai": "https://esm.sh/@google/genai@^1.9.0"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
