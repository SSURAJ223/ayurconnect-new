
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getHerbSuggestionForMedicine } from '../services/geminiService';
import type { MedicineAnalysisResult } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { SearchIcon } from './icons/SearchIcon';
import { LifestyleCard } from './LifestyleCard';
import { ShareButton } from './ShareButton';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const formatMedicineResultForSharing = (query: string, result: MedicineAnalysisResult | null): string => {
  if (!result) return 'No analysis available.';
  if (result.error) return `AyurConnect AI: ${result.error}`;
  
  let text = `AyurConnect AI Analysis for: ${query}\n------------------------\n\n`;
  
  if(result.drugSummary) {
    text += `Drug Summary:\n${result.drugSummary}\n\n`;
  }

  result.herbSuggestions?.forEach(herb => {
    text += `🌿 ${herb.name}:\n`;
    text += `   Summary: ${herb.summary}\n`;
    text += `   Dosage: ${herb.dosage}\n`;
    text += `   Form: ${herb.form}\n`;
    text += `   Side Effects: ${herb.sideEffects}\n\n`;
  });

  result.lifestyleSuggestions?.forEach(item => {
    text += `🧘 ${item.suggestion}:\n`;
    text += `   Details: ${item.details}\n`;
    text += `   Duration: ${item.duration}\n`;
    text += `   Source: ${item.source}\n\n`;
  });
  text += 'Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. More info at ' + window.location.href;
  return text.trim();
};

export const MedicineFinder: React.FC = () => {
  const [medicineName, setMedicineName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
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
    setAge('');
    setGender('');
    setAllergies('');
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
      const profile = {
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        allergies: allergies.trim() || undefined,
      };

      const analysis = await getHerbSuggestionForMedicine(query, profile, signal);
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
  }, [medicineName, age, gender, allergies]);

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
          <form onSubmit={handleSubmit}>
            <fieldset className="mb-6 p-4 border border-gray-200 rounded-lg">
                <legend className="px-2 text-sm font-semibold text-gray-600">Optional: Personalize Your Results</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input type="number" name="age" id="age" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g., 35" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition" disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select id="gender" name="gender" value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition" disabled={isLoading}>
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
                        <input type="text" name="allergies" id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g., Peanuts, Sulfa" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition" disabled={isLoading} />
                    </div>
                </div>
            </fieldset>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g., Metformin, Atorvastatin"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                disabled={isLoading}
                aria-label="Medicine Name"
              />
              <button
                type="submit"
                disabled={isLoading || !medicineName.trim()}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                {isLoading ? <Spinner /> : <SearchIcon className="w-5 h-5 mr-2" />}
                Find Complementary Ayurvedic Herb
              </button>
            </div>
          </form>
        </>
      )}
      
      <div ref={resultsRef} aria-live="polite">
        {isLoading && <div className="text-center p-4"><p className="text-emerald-700">Analyzing, please wait...</p></div>}
        
        {showResults && (
           <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Analysis for: <span className="font-bold text-emerald-700">{submittedQuery}</span></h3>
              </div>
              <div className="flex items-center gap-2">
                {result && <ShareButton textToShare={formatMedicineResultForSharing(submittedQuery, result)} shareTitle={`AyurConnect AI: ${submittedQuery} Analysis`} />}
                <button onClick={handleReset} className="flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                    <ArrowLeftIcon className="w-4 h-4 mr-2 text-gray-500" />
                    Back
                </button>
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
