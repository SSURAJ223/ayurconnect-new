
import type { MedicineAnalysisResult, LabAnalysisResult, DoshaAnalysisResult, PersonalizationData, ContactDetails, LoginDetails } from '../types';

interface LabInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

const BACKEND_URL = ''; 

async function fetchFromApi(endpoint: string, body: object) {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
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

export async function getHerbSuggestionForMedicine(medicineName: string, personalization: PersonalizationData): Promise<MedicineAnalysisResult> {
  return fetchFromApi('/api/gemini', {
    type: 'medicine',
    medicineName,
    personalization,
  });
}

export async function analyzeLabReport(input: LabInput, personalization: PersonalizationData): Promise<LabAnalysisResult> {
   return fetchFromApi('/api/gemini', {
    type: 'lab',
    input,
    personalization,
  });
}

export async function identifyDosha(answers: Record<string, string>, personalization: PersonalizationData): Promise<DoshaAnalysisResult> {
  return fetchFromApi('/api/gemini', {
    type: 'dosha',
    answers,
    personalization,
  });
}

export async function contactExpert(details: ContactDetails): Promise<{ message: string }> {
  return fetchFromApi('/api/contact', details);
}

export async function sendOtp(details: LoginDetails): Promise<{ message: string }> {
    return fetchFromApi('/api/send-otp', details);
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean }> {
    return fetchFromApi('/api/verify-otp', { email, otp });
}
