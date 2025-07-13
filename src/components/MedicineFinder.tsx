
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getHerbSuggestionForMedicine } from '../services/geminiService';
import type { MedicineAnalysisResult } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { SearchIcon } from './icons/SearchIcon';
import { LifestyleCard } from './LifestyleCard';
import { ShareButton } from './ShareButton';

const formatMedicineResultForSharing = (query: string, result: MedicineAnalysisResult | null): string => {
  if (!result) return 'No analysis available.';
  if (result.error) return `AyurConnect AI: ${result.error}`;
  
  let text = `AyurConnect AI Analysis for: ${query}\n------------------------\n\n`;
  
  if(result.drugSummary) {
    text += `Drug Summary:\n${result.drugSummary}\n\n`;
  }

  if (result.herbSuggestions?.length) {
    text += 'Complementary Herb Suggestions:\n';
    result.herbSuggestions.forEach(herb => {
      text += `- ${herb.name}:\n`;
      text += `  Summary: ${herb.summary}\n`;
      text += `  Dosage: ${herb.dosage}\n`;
      text += `  Form: ${herb.form}\n`;
      text += `  Side Effects: ${herb.sideEffects}\n\n`;
    });
  }
  if (result.lifestyleSuggestions?.length) {
    text += 'Lifestyle Recommendations:\n';
    result.lifestyleSuggestions.forEach(item => {
      text += `- ${item.suggestion}:\n`;
      text += `  Details: ${item.details}\n`;
      text += `  Duration: ${item.duration}\n`;
      text += `  Source: ${item.source}\n\n`;
    });
  }
  text += 'Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider. More info at ' + window.location.href;
  return text.trim();
};

export const MedicineFinder: React.FC = () => {
  const [medicineName, setMedicineName] = useState<string>('');
  const [result, setResult] = useState<MedicineAnalysisResult | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup function to abort fetch on component unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if ((result || error) && !isLoading) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, error, isLoading]);

  const handleReset = () => {
    setMedicineName('');
    setResult(null);
    setSubmittedQuery('');
    setError(null);
    setIsLoading(false);
    if(abortControllerRef.current){
      abortControllerRef.current.abort();
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Cancel any ongoing request
    abortControllerRef.current?.abort();
    // Create a new controller for the new request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const query = medicineName.trim();
    if (!query) {
      setError('Please enter a medicine or molecule name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedQuery(query);

    try {
      const analysis = await getHerbSuggestionForMedicine(query, signal);
      // If the signal was aborted, fetchFromApi returns null
      if (analysis === null) { 
        console.log("Medicine finder request was cancelled.");
        return; 
      }

      if (analysis && analysis.error) {
        setError(analysis.error);
        setResult(null);
      } else if (analysis && analysis.drugSummary) {
        setResult(analysis);
      } else {
        setError('An unexpected error occurred. The AI did not return a valid analysis. Please try again.');
        setResult(null);
      }
    } catch (err) {
       if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Failed to get suggestion. Please check your connection or try again later.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [medicineName]);

  const showResults = (result || error) && submittedQuery && !isLoading;

  return (
    <div className="space-y-6">
      {!showResults && (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Find a Complementary Ayurvedic Herb</h2>
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
              Find Complementary Ayurvedic Herb
            </button>
          </form>
        </>
      )}
      
      <div ref={resultsRef} aria-live="polite">
        {isLoading && <div className="text-center p-4"><p className="text-emerald-700">Analyzing, please wait...</p></div>}
        
        {showResults && (
           <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-700">Analysis for: <span className="font-bold text-emerald-700">{submittedQuery}</span></h3>
              <div className="flex items-center gap-2">
                {result && <ShareButton textToShare={formatMedicineResultForSharing(submittedQuery, result)} shareTitle={`AyurConnect AI: ${submittedQuery} Analysis`} />}
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-800">Start New</button>
              </div>
            </div>
        )}

        {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg animate-fade-in">{error}</div>}

        {result && (
          <div className="space-y-6 animate-fade-in">
            {result.drugSummary && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Drug Summary:</h3>
                <p className="bg-green-50 p-4 rounded-lg text-gray-800">{result.drugSummary}</p>
              </div>
            )}
            
            {result.herbSuggestions && result.herbSuggestions.length > 0 && (
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
    </div>
  );
};
