
import type { MedicineAnalysisResult, LabAnalysisResult, UserProfile } from '../types';

// This interface defines the expected structure for lab report submissions to our backend.
interface LabInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

// In a production environment, this should be an environment variable.
// For this project, we hardcode it since it's a known, single backend.
const BACKEND_URL = 'https://ayurconnect-new-backend.onrender.com';

/**
 * A helper function to call our secure backend proxy.
 * @param body The payload to send to the serverless function.
 * @param signal The AbortSignal to allow for request cancellation.
 * @returns The parsed JSON data from the AI.
 * @throws An error if the API call fails.
 */
async function fetchFromApi(body: object, signal: AbortSignal) {
  try {
    // The endpoint is relative to the backend URL
    const response = await fetch(`${BACKEND_URL}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal, // Pass the signal to the fetch request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
     if ((error as Error).name === 'AbortError') {
      console.log('Fetch aborted');
      // Don't throw an error for aborted fetches, let the caller handle it.
      return null;
     }
     console.error("API proxy error:", error);
     throw error;
  }
}

/**
 * Sends a request to our backend to get herb suggestions for a medicine.
 * @param medicineName The name of the medicine to analyze.
 * @param profile The user's profile data for personalization.
 * @param signal The AbortSignal for the request.
 * @returns A promise that resolves to the medicine analysis result.
 */
export async function getHerbSuggestionForMedicine(medicineName: string, profile: UserProfile, signal: AbortSignal): Promise<MedicineAnalysisResult | null> {
  return fetchFromApi({
    type: 'medicine',
    medicineName,
    profile,
  }, signal);
}


/**
 * Sends a request to our backend to analyze a lab report.
 * @param input An object containing either text or image data for the lab report.
 * @param profile The user's profile data for personalization.
 * @param signal The AbortSignal for the request.
 * @returns A promise that resolves to the lab analysis result.
 */
export async function analyzeLabReport(input: LabInput, profile: UserProfile, signal: AbortSignal): Promise<LabAnalysisResult | null> {
   return fetchFromApi({
    type: 'lab',
    input,
    profile,
  }, signal);
}
