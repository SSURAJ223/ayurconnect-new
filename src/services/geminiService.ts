import type { MedicineAnalysisResult, LabAnalysisResult, DoshaAnalysisResult } from '../types';

// This interface defines the expected structure for lab report submissions to our backend.
interface LabInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

const BACKEND_URL = 'https://ayurconnect-new-backend.onrender.com'; 

/**
 * A helper function to call our secure backend proxy.
 * @param body The payload to send to the serverless function.
 * @returns The parsed JSON data from the AI.
 * @throws An error if the API call fails.
 */
async function fetchFromApi(body: object) {
  try {
    // The endpoint is relative to the backend URL
    const response = await fetch(`${BACKEND_URL}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
     console.error("API proxy error:", error);
     throw error;
  }
}

/**
 * Sends a request to our backend to get herb suggestions for a medicine.
 * @param medicineName The name of the medicine to analyze.
 * @returns A promise that resolves to the medicine analysis result.
 */
export async function getHerbSuggestionForMedicine(medicineName: string): Promise<MedicineAnalysisResult> {
  return fetchFromApi({
    type: 'medicine',
    medicineName,
  });
}


/**
 * Sends a request to our backend to analyze a lab report.
 * @param input An object containing either text or image data for the lab report.
 * @returns A promise that resolves to the lab analysis result.
 */
export async function analyzeLabReport(input: LabInput): Promise<LabAnalysisResult> {
   return fetchFromApi({
    type: 'lab',
    input,
  });
}

/**
 * Sends a request to our backend to identify the user's dosha based on their answers.
 * @param answers A record of question keys and user's answers.
 * @returns A promise that resolves to the dosha analysis result.
 */
export async function identifyDosha(answers: Record<string, string>): Promise<DoshaAnalysisResult> {
  return fetchFromApi({
    type: 'dosha',
    answers,
  });
}
