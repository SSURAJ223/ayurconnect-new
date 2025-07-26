import type { MedicineAnalysisResult, LabAnalysisResult, DoshaAnalysisResult } from '../types';

interface LabInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

const BACKEND_URL = ''; 

async function fetchFromApi(body: object) {
  try {
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

export async function getHerbSuggestionForMedicine(medicineName: string): Promise<MedicineAnalysisResult> {
  return fetchFromApi({
    type: 'medicine',
    medicineName,
  });
}

export async function analyzeLabReport(input: LabInput): Promise<LabAnalysisResult> {
   return fetchFromApi({
    type: 'lab',
    input,
  });
}

export async function identifyDosha(answers: Record<string, string>): Promise<DoshaAnalysisResult> {
  return fetchFromApi({
    type: 'dosha',
    answers,
  });
}
