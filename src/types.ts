export interface HerbSuggestion {
  name: string;
  summary: string;
  dosage: string;
  form: string;
  sideEffects: string;
}

export interface LifestyleSuggestion {
  suggestion: string;
  source: string;
  reasoning?: string;
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

// Types for Dosha Finder
export interface DoshaHerbSuggestion {
  name: string;
  benefits: string;
  usage: string;
  source: string;
}

export interface DoshaLifestyleSuggestion {
  suggestion: string;
  reasoning: string;
  source: string;
}

export interface DoshaAnalysisResult {
  dominantDosha: string;
  doshaDescription: string;
  herbSuggestions: DoshaHerbSuggestion[];
  lifestyleSuggestions: DoshaLifestyleSuggestion[];
}
