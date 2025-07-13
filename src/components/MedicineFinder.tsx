
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getHerbSuggestionForMedicine } from '../services/geminiService';
import type { MedicineAnalysisResult } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { SearchIcon } from './icons/SearchIcon';
import { LifestyleCard } from './LifestyleCard';
import { ShareButton } from './ShareButton';

const formatMedicineResultForSharing = (result: MedicineAnalysisResult): string => {
  if (!result) return '';
  let text = `AyurConnect AI Analysis\n------------------------\n\n`;
  text += `Drug Summary:\n${result.drugSummary}\n\n`;
  if (result.herbSuggestions?.length > 0) {
    text += 'Complementary Herb Suggestions:\n';
    result.herbSuggestions.forEach(herb => {
      text += `- ${herb.name}:\n`;
      text += `  Summary: ${herb.summary}\n`;
      text += `  Dosage: ${herb.dosage}\n`;
      text += `  Form: ${herb.form}\n`;
      text += `  Side Effects: ${herb.sideEffects}\n\n`;
    });
  }
  if (result.lifestyleSuggestions?.length > 0) {
    text += 'Lifestyle Recommendations:\n';
    result.lifestyleSuggestions.forEach(item => {
      text += `- ${item.suggestion} (Source: ${item.source})\n`;
    });
    text += '\n';
  }
  text += 'Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.';
  return text.trim();
};

export const MedicineFinder: React.FC = () => {
  const [medicineName, setMedicineName] = useState<string>('');
  const [result, setResult] = useState<MedicineAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError('Please enter a medicine or molecule name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await getHerbSuggestionForMedicine(medicineName);
      setResult(analysis);
      setMedicineName('');
    } catch (err) {
      setError('Failed to get suggestion. Please check your connection or try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [medicineName]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Find a Complementary Herb</h2>
        <p className="text-gray-600 mt-1">
          Enter an allopathic medicine or molecule name to discover Ayurvedic herbs that can support your treatment.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="e.g., Metformin, Atorvastatin"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !medicineName.trim()}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
        >
          {isLoading ? <Spinner /> : <SearchIcon className="w-5 h-5 mr-2" />}
          Find Complementary Herb
        </button>
      </form>
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

      {isLoading && <div className="text-center p-4"><p className="text-emerald-700">Analyzing, please wait...</p></div>}

      {result && (
        <div className="space-y-6 animate-fade-in" ref={resultsRef}>
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-semibold text-gray-700">Analysis Result:</h3>
             <ShareButton textToShare={formatMedicineResultForSharing(result)} shareTitle="AyurConnect AI: Medicine Analysis" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Drug Summary:</h3>
            <p className="bg-green-50 p-4 rounded-lg text-gray-800">{result.drugSummary}</p>
          </div>
          
          {result.herbSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Complementary Herb Suggestions:</h3>
              <div className="space-y-4">
                {result.herbSuggestions.map((suggestion, index) => (
                  <ResultCard key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}

          {result.lifestyleSuggestions && result.lifestyleSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Lifestyle Recommendations:</h3>
              <div className="space-y-3">
                {result.lifestyleSuggestions.map((suggestion, index) => (
                  <LifestyleCard key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
