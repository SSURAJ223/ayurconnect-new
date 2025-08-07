import React, { useState, useCallback } from 'react';
import { identifyDosha } from '../services/geminiService';
import type { DoshaAnalysisResult, PersonalizationData, HerbSuggestion } from '../types';
import { Spinner } from './Spinner';
import { DoshaResult } from './DoshaResult';
import { DoshaIcon } from './icons/DoshaIcon';

type Answer = string | null;

interface Question {
  key: string;
  text: string;
  options: string[];
}

const questions: Question[] = [
  { key: 'build', text: 'How would you describe your body frame?', options: ['Thin, light, tall or short', 'Medium, muscular', 'Large, sturdy, well-built'] },
  { key: 'skin', text: 'What is your skin usually like?', options: ['Dry, rough, cool, thin', 'Oily, sensitive, warm, reddish', 'Thick, cool, pale, moist'] },
  { key: 'hair', text: 'Describe your hair type.', options: ['Dry, brittle, thin', 'Oily, fine, early graying', 'Thick, oily, wavy'] },
  { key: 'appetite', text: 'How is your appetite?', options: ['Irregular, variable', 'Strong, sharp, irritable if hungry', 'Slow but steady, can skip meals'] },
  { key: 'energy', text: 'How are your energy levels?', options: ['Comes in bursts, variable', 'Moderate, steady, competitive', 'High stamina, but slow to start'] },
  { key: 'stressResponse', text: 'Under stress, you tend to feel...', options: ['Anxious, worried, fearful', 'Irritable, angry, critical', 'Calm, withdrawn, possessive'] },
];

interface DoshaIdentifierProps {
  personalizationData: PersonalizationData;
  cart: HerbSuggestion[];
  onAddToCart: (item: HerbSuggestion) => void;
  onTalkToDoctorClick: () => void;
}

export const DoshaIdentifier: React.FC<DoshaIdentifierProps> = ({ personalizationData, cart, onAddToCart, onTalkToDoctorClick }) => {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [freeText, setFreeText] = useState('');
  const [result, setResult] = useState<DoshaAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (key: string, option: string) => {
    setAnswers(prev => ({ ...prev, [key]: option }));
  };

  const isComplete = questions.every(q => answers[q.key]);

  const handleSubmit = useCallback(async () => {
    if (!isComplete) {
      setError('Please answer all questions to identify your Dosha.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await identifyDosha(answers as Record<string, string>, freeText, personalizationData);
      setResult(analysis);
    } catch (err) {
      setError('Failed to identify your Dosha. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [answers, freeText, isComplete, personalizationData]);

  return (
    <div className="space-y-6">
       {!result && (
        <div className="space-y-8">
            <p className="text-gray-600 mt-1">Answer a few questions to discover your dominant Dosha and get personalized wellness tips.</p>
            {questions.map((q) => (
                <div key={q.key}>
                <p className="font-display font-semibold text-gray-700 mb-3">{q.text}</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {q.options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswer(q.key, option)}
                        className={`w-full sm:w-auto text-left sm:text-center px-4 py-3 text-sm rounded-lg border transition-all duration-200 ${
                        answers[q.key] === option
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                    >
                        {option}
                    </button>
                    ))}
                </div>
                </div>
            ))}
             <div>
                <p className="font-display font-semibold text-gray-700 mb-3">Optionally, add more details.</p>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Describe your physical and mental traits in your own words..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-white"
                  disabled={isLoading}
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={isLoading || !isComplete}
                className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
                {isLoading ? <Spinner /> : <><DoshaIcon className="w-5 h-5 mr-2" />Find My Dosha</>}
            </button>
        </div>
      )}
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
      
      {isLoading && <div className="text-center p-4"><p className="text-emerald-700 font-semibold">Analyzing your constitution...</p></div>}
      
      {result && (
        <div className="animate-fade-in">
          <DoshaResult result={result} cart={cart} onAddToCart={onAddToCart} onTalkToDoctorClick={onTalkToDoctorClick} />
          <button
            onClick={() => { setResult(null); setAnswers({}); setFreeText(''); }}
            className="mt-6 w-full text-center text-emerald-600 hover:text-emerald-800 font-semibold"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};
