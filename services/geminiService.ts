import type { MedicineAnalysisResult, LabAnalysisResult } from '../types';

// This interface defines the expected structure for lab report submissions to our backend.
interface LabInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}
