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

// Enable CORS for all routes.
app.use(cors());

app.use(express.json({ limit: '50mb' }));

// --- Start of AI Logic ---

// New endpoint for handling contact requests
app.post('/api/contact', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    // In a real-world application, you would integrate an email service like Nodemailer or SendGrid here
    // to send an email to ssuraj.amz@gmail.com.
    console.log('--- NEW EXPERT CONTACT REQUEST ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log('This would trigger an email to ssuraj.amz@gmail.com');
    
    res.status(200).json({ message: 'Your request has been sent. An expert will contact you shortly.' });
});


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
                    summary: { type: Type.STRING, description: "Summary of the herb's benefits, particularly in relation to the drug's purpose and the user's context." },
                    dosage: { type: Type.STRING, description: "Recommended dosage. E.g., '1-2 tablets twice a day'." },
                    form: { type: Type.STRING, description: "Common form of consumption. E.g., 'Powder, Tablet'." },
                    sideEffects: { type: Type.STRING, description: "Potential side effects or precautions. Mention 'Consult a doctor' if applicable." }
                },
                required: ["name", "summary", "dosage", "form", "sideEffects"]
            }
        },
        lifestyleSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested lifestyle changes (diet, exercise, etc.) that complement the treatment, personalized to the user.",
            items: {
                type: Type.OBJECT,
                properties: {
                    suggestion: { type: Type.STRING, description: "The lifestyle recommendation." },
                    source: { type: Type.STRING, description: "The basis for the suggestion, citing a classical text or principle. E.g., 'Ayurvedic principles from Charaka Samhita'." }
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
                description: "A list of suggested complementary Ayurvedic herbs for this specific finding, personalized to the user.",
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
                description: "A list of suggested lifestyle changes for this specific finding, personalized to the user.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING, description: "The lifestyle recommendation." },
                        source: { type: Type.STRING, description: "The basis for the suggestion, citing a classical text or principle." }
                    },
                    required: ["suggestion", "source"]
                }
            }
        },
        required: ["parameter", "status", "summary", "herbSuggestions", "lifestyleSuggestions"]
    }
};

const doshaSchema = {
    type: Type.OBJECT,
    properties: {
        dosha: { type: Type.STRING, description: "The dominant dosha identified (e.g., 'Vata', 'Pitta', 'Kapha', or a combination like 'Vata-Pitta')." },
        explanation: { type: Type.STRING, description: "A detailed explanation of the characteristics of this dosha, drawing from Ayurvedic principles from sources like the Sushruta Samhita." },
        recommendations: {
            type: Type.OBJECT,
            properties: {
                diet: {
                    type: Type.ARRAY,
                    description: "List of 3-4 specific dietary recommendations based on Rasayana principles to balance this dosha, personalized to the user's context.",
                    items: { type: Type.STRING }
                },
                lifestyle: {
                    type: Type.ARRAY,
                    description: "List of 3-4 specific lifestyle recommendations based on Rasayana principles, personalized to the user's context.",
                    items: { type: Type.STRING }
                }
            },
            required: ["diet", "lifestyle"]
        },
        sources: {
             type: Type.ARRAY,
             description: "A list of sources cited for the information provided. E.g., 'Sushruta Samhita, Sutrasthanam, Chap. XV', 'Puri, H.S. Rasayana, Ayurvedic herbs for longevity and rejuvenation'.",
             items: { type: Type.STRING }
        }
    },
    required: ["dosha", "explanation", "recommendations", "sources"]
};


// API endpoint for all Gemini calls
app.post('/api/gemini', async (req, res) => {
    try {
        const { type, ...data } = req.body;

        if (type === 'medicine') {
            const prompt = `You are an expert AI assistant with deep knowledge in both allopathic medicine and Ayurveda. Your Ayurvedic knowledge MUST be strictly based on authoritative classical texts (e.g., Charaka Samhita, Sushruta Samhita) and standard BAMS (Bachelor of Ayurvedic Medicine and Surgery) course books. Do NOT use generic, non-classical, or web-based interpretations. A user has provided the following details: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}, Known Allergies/Symptoms: "${data.personalization?.context || 'None'}". They are taking the allopathic medicine: "${data.medicineName}". Your task is to provide personalized complementary suggestions. Follow these instructions precisely: 1. Provide a brief, easy-to-understand summary of the allopathic drug. 2. Suggest 2-3 complementary Ayurvedic herbs, ensuring they are appropriate for the user's context. 3. Provide 2-3 relevant lifestyle suggestions, tailored to the user. For lifestyle suggestions, cite the Ayurvedic principle in the 'source' field. IMPORTANT: In your summaries and suggestions, clearly state how the recommendation is personalized if applicable (e.g., "Given your age..."). Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: medicineSchema },
            });
            res.status(200).json(JSON.parse(response.text));

        } else if (type === 'lab') {
            const systemInstruction = `You are an expert AI assistant specializing in analyzing medical lab reports from both an allopathic and Ayurvedic perspective. Your Ayurvedic knowledge MUST be strictly based on authoritative classical texts (e.g., Charaka Samhita, Sushruta Samhita) and standard BAMS (Bachelor of Ayurvedic Medicine and Surgery) course books. Do NOT use generic, non-classical, or web-based interpretations. Your task is to analyze the provided lab report data for a user with these details: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}, Known Allergies/Symptoms: "${data.personalization?.context || 'None'}". Follow these instructions carefully: 1. Identify key biomarkers that are out of the standard normal range. 2. For EACH biomarker that is out of range, create a distinct finding object. 3. If all biomarkers are within the normal range, return an empty array. 4. For each finding, provide a simple summary. 5. For each finding, suggest 1-2 complementary Ayurvedic herbs that could help, tailoring them to the user's context. 6. For each finding, suggest 1-2 relevant lifestyle modifications, also tailored to the user. For lifestyle suggestions, cite the Ayurvedic principle in the 'source' field. IMPORTANT: Clearly state how recommendations are personalized. Your response MUST be a single JSON array of finding objects that conforms to the provided schema. Do not include any text outside of the JSON array.`;
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
        } else if (type === 'dosha') {
            const prompt = `You are an expert Ayurvedic practitioner whose knowledge is strictly derived from classical texts like the Charaka Samhita and Sushruta Samhita, and the curriculum of BAMS (Bachelor of Ayurvedic Medicine and Surgery). Do NOT use non-classical or modern web interpretations. Based on the following user-provided characteristics, identify their dominant dosha (Prakriti).
            
            User's questionnaire answers: ${JSON.stringify(data.answers, null, 2)}
            User's context: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}, Known Allergies/Symptoms: "${data.personalization?.context || 'None'}".
            
            Your task is to:
            1.  Analyze the inputs and determine the most likely dominant dosha (Vata, Pitta, Kapha, or a combination).
            2.  Provide a clear explanation of the identified dosha's qualities, based on classical texts.
            3.  Offer 3-4 specific dietary and 3-4 lifestyle recommendations based on classical principles (like Rasayana), tailoring them to the user's context in addition to their dosha.
            4.  You MUST cite your classical sources in the 'sources' field of the response, e.g., "Sushruta Samhita, Sutrasthanam, Chap. XV".
            
            IMPORTANT: Clearly mention how the user's context influences the recommendations. Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: doshaSchema },
            });
            res.status(200).json(JSON.parse(response.text));

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
