
export interface HerbSuggestion {
  name: string;
  summary: string;
  dosage: string;
  form: string;
  sideEffects: string;
}

export interface LifestyleSuggestion {
  suggestion: string;
  details: string;
  duration: string;
  source: string;
}

export interface MedicineAnalysisResult {
  drugSummary?: string;
  herbSuggestions?: HerbSuggestion[];
  lifestyleSuggestions?: LifestyleSuggestion[];
  error?: string;
}

export interface LabFindingAnalysis {
  parameter: string;
  status: string;
  summary: string;
  herbSuggestions: HerbSuggestion[];
  lifestyleSuggestions: LifestyleSuggestion[];
}

export interface LabAnalysisResult {
  findings?: LabFindingAnalysis[];
  error?: string;
}
