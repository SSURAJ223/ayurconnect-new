
const express = require('express');
const path = require('path');
const { GoogleGenAI, Type } = require("@google/genai");
const crypto = require('crypto');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// This server will run in a secure environment where process.env.API_KEY is set.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

// Check for email credentials. If not present, the contact form will only log to the console.
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials (EMAIL_USER, EMAIL_PASS) are not set. Contact form and OTP emails will not be sent live.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const app = express();
const port = process.env.PORT || 10000;

// In-memory store for OTPs. In a production environment, use a more persistent store like Redis.
// Format: { "user@example.com": { otp: "123456", timestamp: 167... } }
const otpStore = {};

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Start of Google Sheet Logic ---
async function saveToGoogleSheet(data) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.warn('Google Sheets environment variables not set. Skipping save to sheet.');
        // Log locally as a fallback
        console.log(`--- NEW USER DATA (would be in Google Sheet) ---`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Email: ${data.email}`);
        console.log(`WhatsApp Number: ${data.phone}`);
        console.log('-------------------------------------------');
        return;
    }
    
    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            // Handle escaped newlines in the private key
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // Assumes the first sheet
        
        // More robust logic to handle empty sheets and prevent race conditions.
        await sheet.loadHeaderRow();

        const rowData = {
            Timestamp: new Date().toISOString(),
            Email: data.email,
            WhatsAppNumber: data.phone,
        };
        const expectedHeaders = ['Timestamp', 'Email', 'WhatsAppNumber'];
        
        // Check if the headers are missing or incorrect.
        const hasCorrectHeaders = sheet.headerValues && expectedHeaders.every(h => sheet.headerValues.includes(h));

        if (!hasCorrectHeaders) {
            console.log('Sheet is empty or has incorrect headers. Setting headers and adding first row.');
            // Set the headers
            await sheet.setHeaderRow(expectedHeaders);
            
            // Add the first row of data using an array. This is more direct and avoids race conditions
            // where the library state isn't updated immediately after setHeaderRow.
            const rowValues = expectedHeaders.map(header => rowData[header]);
            await sheet.addRow(rowValues);
        } else {
            // Headers already exist, so we can safely add the row using the object.
            await sheet.addRow(rowData);
        }

        console.log('--- USER DATA SAVED to Google Sheet ---');

    } catch (error) {
        console.error('Error saving to Google Sheet:', error.message);
    }
}
// --- End of Google Sheet Logic ---


// --- Start of Email Logic ---
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: (parseInt(process.env.EMAIL_PORT, 10) || 587) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error("Nodemailer configuration error:", error);
        } else {
            console.log("Nodemailer is configured and ready to send emails.");
        }
    });
}
// --- End of Email Logic ---

// --- Start of API Logic ---

// Endpoint for sending OTP
app.post('/api/send-otp', async (req, res) => {
    const { email, phone } = req.body;
    if (!email || !phone) {
        return res.status(400).json({ error: 'Email and WhatsApp number are required.' });
    }
    
    // Save user details to Google Sheet
    await saveToGoogleSheet({ email, phone });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[email] = { otp, timestamp: Date.now() };

    console.log('--- NEW USER REGISTRATION ATTEMPT ---');
    console.log(`Email: ${email}`);
    console.log(`WhatsApp Number: ${phone}`);
    console.log(`Generated OTP for ${email} is ${otp}.`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`--- OTP EMAIL NOT SENT (credentials not configured) --- OTP for ${email} is ${otp}`);
        return res.status(200).json({ message: 'OTP generated. Check server logs for value.' });
    }
    
    const mailOptions = {
        from: `"AyurConnect AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your AyurConnect AI Verification Code',
        text: `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #047857;">Your Verification Code</h2>
                <p>Please use the following code to complete your verification.</p>
                <p style="font-size: 24px; font-weight: bold; color: #047857; letter-spacing: 2px;">${otp}</p>
                <p>This code will expire in 5 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #ddd;">
                <p>If you did not request this code, you can safely ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`--- OTP EMAIL SENT --- To: ${email}`);
        res.status(200).json({ message: 'An OTP has been sent to your email address.' });
    } catch (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ error: 'There was a problem sending the OTP. Please try again later.' });
    }
});

// Endpoint for verifying OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const storedOtpData = otpStore[email];
    const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

    if (!storedOtpData) {
        return res.status(400).json({ error: 'Invalid email or OTP has expired.' });
    }

    const isExpired = (Date.now() - storedOtpData.timestamp) > OTP_EXPIRATION_MS;
    if (isExpired) {
        delete otpStore[email];
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (storedOtpData.otp === otp) {
        delete otpStore[email]; // OTP is single-use
        console.log(`--- USER VERIFIED --- Email: ${email}`);
        return res.status(200).json({ success: true, message: 'Verification successful.' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP.' });
    }
});


// Endpoint for handling contact requests
app.post('/api/contact', async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    // Fallback for environments where email credentials aren't configured.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--- EMAIL NOT SENT (credentials not configured) ---');
        console.log('--- NEW EXPERT CONTACT REQUEST ---');
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Phone: ${phone}`);
        return res.status(200).json({ message: 'Your request has been received. An expert will contact you shortly.' });
    }

    const mailOptions = {
        from: `"AyurConnect AI" <${process.env.EMAIL_USER}>`, // sender address
        to: 'ssuraj.amz@gmail.com', // list of receivers
        subject: 'New Consultation Request from AyurConnect AI', // Subject line
        text: `You have received a new consultation request from the AyurConnect AI app.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nPlease reach out to them soon.`, // plain text body
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #047857;">New Consultation Request</h2>
                <p>You have received a new consultation request from the <strong>AyurConnect AI</strong> app.</p>
                <hr style="border: 0; border-top: 1px solid #ddd;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #047857;">${email}</a></p>
                <p><strong>Phone:</strong> ${phone}</p>
                <hr style="border: 0; border-top: 1px solid #ddd;">
                <p>Please reach out to them soon.</p>
            </div>
        `, // html body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`--- CONTACT EMAIL SENT --- To: ssuraj.amz@gmail.com, From User: ${name} (${email})`);
        res.status(200).json({ message: 'Your request has been sent. An expert will contact you shortly.' });
    } catch (error) {
        console.error("Error sending contact email:", error);
        res.status(500).json({ error: 'There was a problem sending your request. Please try again later.' });
    }
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
                    id: { type: Type.STRING, description: "A unique ID for the herb, created by lowercasing the name and replacing spaces with hyphens. E.g., 'ashwagandha'." },
                    name: { type: Type.STRING, description: "Name of the Ayurvedic herb." },
                    summary: { type: Type.STRING, description: "Summary of the herb's benefits, clearly stating if it is for the medicine or the user's symptoms." },
                    dosage: { type: Type.STRING, description: "Recommended dosage. E.g., '1-2 tablets twice a day'." },
                    form: { type: Type.STRING, description: "Common form of consumption. E.g., 'Powder, Tablet'." },
                    sideEffects: { type: Type.STRING, description: "Potential side effects or precautions. Mention 'Consult a doctor' if applicable." }
                },
                required: ["id", "name", "summary", "dosage", "form", "sideEffects"]
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
                description: "A list of 3-4 suggested complementary Ayurvedic herbs for this specific finding, personalized to the user.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique ID for the herb, created by lowercasing the name and replacing spaces with hyphens. E.g., 'arjuna-bark'." },
                        name: { type: Type.STRING, description: "Name of the Ayurvedic herb." },
                        summary: { type: Type.STRING, description: "Summary of the herb's benefits related to the finding." },
                        dosage: { type: Type.STRING, description: "Recommended dosage." },
                        form: { type: Type.STRING, description: "Common form of consumption." },
                        sideEffects: { type: Type.STRING, description: "Potential side effects or precautions." }
                    },
                    required: ["id", "name", "summary", "dosage", "form", "sideEffects"]
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
                },
                herbSuggestions: {
                    type: Type.ARRAY,
                    description: "List of 3 specific Ayurvedic herbs to help balance this dosha, personalized to the user's context.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique ID for the herb, created by lowercasing the name and replacing spaces with hyphens." },
                            name: { type: Type.STRING, description: "Name of the Ayurvedic herb." },
                            summary: { type: Type.STRING, description: "Summary of the herb's benefits related to balancing the identified dosha." },
                            dosage: { type: Type.STRING, description: "Recommended dosage." },
                            form: { type: Type.STRING, description: "Common form of consumption." },
                            sideEffects: { type: Type.STRING, description: "Potential side effects or precautions." }
                        },
                        required: ["id", "name", "summary", "dosage", "form", "sideEffects"]
                    }
                }
            },
            required: ["diet", "lifestyle", "herbSuggestions"]
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
            const prompt = `You are an expert AI assistant with deep knowledge in both allopathic medicine and Ayurveda, grounded in classical texts (Charaka Samhita, Sushruta Samhita), standard BAMS course books, and the AYUSH list of essential Ayurvedic medicines. A user has provided the following details: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}. They are taking the allopathic medicine: "${data.medicineName}", and have mentioned these symptoms/allergies: "${data.personalization?.context || 'None'}".

Your task is to provide personalized complementary suggestions. Follow these instructions precisely:
1.  Provide a brief, easy-to-understand summary of the allopathic drug.
2.  Suggest exactly 3 complementary Ayurvedic recommendations.
3.  The FIRST recommendation MUST be a classical compound formulation (like 'Dashamularishta', 'Chyavanprash', or 'Triphala Guggulu') relevant to the user's context.
4.  The other TWO recommendations must be single herbs (like 'Ashwagandha' or 'Brahmi').
5.  If the user has listed symptoms, one of your recommendations (either the compound formulation or a single herb) should be specifically chosen to address those symptoms.
6.  For each of the 3 recommendations, generate a unique 'id' and clearly state its purpose (e.g., "This formulation helps manage the side effects of [Medicine Name]..." or "This herb is traditionally used for [Symptom]...").
7.  Provide 2-3 relevant lifestyle suggestions, tailored to the user.
8.  Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: medicineSchema, seed: 42 },
            });
            res.status(200).json(JSON.parse(response.text));

        } else if (type === 'lab') {
            const systemInstruction = `You are an expert AI assistant specializing in analyzing medical lab reports from both an allopathic and Ayurvedic perspective. Your Ayurvedic knowledge MUST be strictly based on authoritative classical texts (e.g., Charaka Samhita, Sushruta Samhita), standard BAMS course books, and the AYUSH list of essential medicines. Do NOT use generic, non-classical, or web-based interpretations. Your task is to analyze the provided lab report data for a user with these details: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}, Known Allergies/Symptoms: "${data.personalization?.context || 'None'}".

Follow these instructions carefully:
1.  Identify key biomarkers that are out of the standard normal range.
2.  For EACH biomarker that is out of range, create a distinct finding object.
3.  If all biomarkers are within the normal range, return an empty array.
4.  For each finding, provide a simple summary.
5.  For each finding, suggest exactly 3 complementary Ayurvedic recommendations tailored to the user's context. The FIRST recommendation MUST be a classical compound formulation (e.g., 'Arjunarishta', 'Punarnavasava'). The other TWO recommendations must be single herbs (e.g., 'Guduchi').
6.  For each of the 3 recommendations, generate a unique 'id' by lowercasing its name and replacing spaces with hyphens (e.g., 'arjunarishta', 'arjuna-bark').
7.  For each finding, suggest 1-2 relevant lifestyle modifications, also tailored to the user. For lifestyle suggestions, cite the Ayurvedic principle in the 'source' field.
8.  IMPORTANT: Clearly state how recommendations are personalized. Your response MUST be a single JSON array of finding objects that conforms to the provided schema. Do not include any text outside of the JSON array.`;
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
                config: { responseMimeType: "application/json", responseSchema: labReportSchema, systemInstruction, seed: 42 },
            });

            const responseText = response.text.trim();
            if (responseText === "" || responseText === "[]") {
                res.status(200).json([]);
            } else {
                res.status(200).json(JSON.parse(responseText));
            }
        } else if (type === 'dosha') {
            const prompt = `You are an expert Ayurvedic practitioner whose knowledge is strictly derived from classical texts like the Charaka Samhita, Sushruta Samhita, and the AYUSH list of essential medicines. Based on the following user inputs, identify their dominant Prakriti (dosha).

User's questionnaire answers (this includes a mix of pre-defined choices and their own written answers): ${JSON.stringify(data.answers, null, 2)}
User's context: Age: ${data.personalization?.age || 'Not provided'}, Gender: ${data.personalization?.gender || 'Not provided'}, Known Allergies/Symptoms: "${data.personalization?.context || 'None'}".

Your task is to:
1.  Analyze all inputs to determine the dominant Prakriti (Vata, Pitta, Kapha, or a combination).
2.  Provide a clear explanation of the identified Prakriti's qualities based on classical texts.
3.  Offer personalized recommendations:
    a. 3-4 specific dietary changes.
    b. 3-4 specific lifestyle changes.
    c. Suggest exactly 3 Ayurvedic recommendations to help balance this Prakriti. The FIRST recommendation MUST be a classical compound formulation (e.g., 'Ashvagandharishta' for Vata). The other TWO recommendations must be single herbs. For each of the 3 recommendations, provide full details including a unique id.
4.  You MUST cite your classical sources in the 'sources' field.
5.  IMPORTANT: Clearly mention how the user's context influences the recommendations. Structure your entire response as a single JSON object that conforms to the provided schema. Do not add any text outside of the JSON object.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: doshaSchema, seed: 42 },
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

// Serve the static files from the 'dist' directory created by Vite's build process
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't match one above,
// send back the index.html file from the 'dist' directory.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Could not load the application. This can happen if the build process failed.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening successfully on port ${port}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
