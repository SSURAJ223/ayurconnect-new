
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getHerbSuggestionForMedicine } from '../services/geminiService';
import type { MedicineAnalysisResult, PersonalizationData, HerbSuggestion } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { SearchIcon } from './icons/SearchIcon';
import { LifestyleCard } from './LifestyleCard';
import { ShareButton } from './ShareButton';
import { ConsultationCTA } from './ConsultationCTA';
import { LoginGate } from './LoginGate';

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

interface MedicineFinderProps {
  personalizationData: PersonalizationData;
  cart: HerbSuggestion[];
  onAddToCart: (item: HerbSuggestion) => void;
  onTalkToDoctorClick: () => void;
  isAuthenticated: boolean;
  openLoginModal: () => void;
}

export const MedicineFinder: React.FC<MedicineFinderProps> = ({ personalizationData, cart, onAddToCart, onTalkToDoctorClick, isAuthenticated, openLoginModal }) => {
  const [medicineName, setMedicineName] = useState<string>('');
  const [result, setResult] = useState<MedicineAnalysisResult | null>(null);
  const [pendingResult, setPendingResult] = useState<MedicineAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result || pendingResult) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, pendingResult]);

  useEffect(() => {
    if (isAuthenticated && pendingResult) {
        setResult(pendingResult);
        setPendingResult(null);
    }
  }, [isAuthenticated, pendingResult]);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError('Please enter a medicine or molecule name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setPendingResult(null);

    try {
      const analysis = await getHerbSuggestionForMedicine(medicineName, personalizationData);
      if (isAuthenticated) {
        setResult(analysis);
      } else {
        setPendingResult(analysis);
      }
    } catch (err) {
      setError('Failed to get suggestion. Please check your connection or try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [medicineName, personalizationData, isAuthenticated]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-4"><p className="text-emerald-700 font-semibold">Analyzing, please wait...</p></div>;
    }

    if (result) {
      return (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center mt-4">
             <h3 className="font-display text-xl font-bold text-gray-700">Analysis Result:</h3>
             <ShareButton textToShare={formatMedicineResultForSharing(result)} shareTitle="AyurConnect AI: Medicine Analysis" />
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-gray-700 mb-2">Drug Summary</h4>
            <p className="bg-green-50 p-4 rounded-xl text-gray-800 border border-green-100">{result.drugSummary}</p>
          </div>
          
          {result.herbSuggestions.length > 0 && (
            <div>
              <h4 className="font-display text-lg font-bold text-gray-700 mb-3">Complementary Herb Suggestions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.herbSuggestions.map((suggestion) => (
                  <ResultCard 
                    key={suggestion.id} 
                    suggestion={suggestion} 
                    onAddToCart={onAddToCart}
                    cart={cart}
                  />
                ))}
              </div>
            </div>
          )}

          {result.lifestyleSuggestions && result.lifestyleSuggestions.length > 0 && (
            <div>
              <h4 className="font-display text-lg font-bold text-gray-700 mb-3">Lifestyle Recommendations</h4>
              <div className="space-y-3">
                {result.lifestyleSuggestions.map((suggestion, index) => (
                  <LifestyleCard key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}

          <ConsultationCTA onTalkToDoctorClick={onTalkToDoctorClick} />
        </div>
      );
    }

    if (pendingResult) {
      return <LoginGate openLoginModal={openLoginModal} />;
    }

    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 mt-1">
          Enter an allopathic medicine to discover complementary Ayurvedic recovery herbs. Find natural support to manage side effects and promote root-cause healing during your treatment.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="e.g., Metformin, Atorvastatin"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !medicineName.trim()}
          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isLoading ? <Spinner /> : <><SearchIcon className="w-5 h-5 mr-2" /> Find Herbs</>}
        </button>
      </form>
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}

      <div ref={resultsRef}>
        {renderContent()}
      </div>
    </div>
  );
};
