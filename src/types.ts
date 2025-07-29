export interface HerbSuggestion {
  id: string;
  name: string;
  summary: string;
  dosage: string;
  form: string;
  sideEffects: string;
}

export interface LifestyleSuggestion {
  suggestion: string;
  source: string;
}

export interface MedicineAnalysisResult {
  drugSummary: string;
  herbSuggestions: HerbSuggestion[];
  lifestyleSuggestions: LifestyleSuggestion[];
}

export interface LabFindingAnalysis {
  parameter: string;
  status: string;
  summary: string;
  herbSuggestions: HerbSuggestion[];
  lifestyleSuggestions: LifestyleSuggestion[];
}

export type LabAnalysisResult = LabFindingAnalysis[];

export interface DoshaAnalysisResult {
  dosha: string;
  explanation: string;
  recommendations: {
    diet: string[];
    lifestyle: string[];
  };
  sources: string[];
}

export interface PersonalizationData {
  age: string;
  gender: string;
  context: string;
}

export interface ContactDetails {
    name: string;
    phone: string;
    email: string;
}
