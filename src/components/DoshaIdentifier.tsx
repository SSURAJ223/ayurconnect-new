import React, { useState, useCallback } from 'react';
import { identifyDosha } from '../services/geminiService';
import type { DoshaAnalysisResult, PersonalizationData } from '../types';
import { Spinner } from './Spinner';
import { UserIcon } from './icons/UserIcon';
import { DoshaResult } from './DoshaResult';

type Answer = string | null;

interface Question {
  key: string;
  text: string;
  options: string[];
}

const questions: Question[] = [
  { key: 'build', text: 'How would you describe your body frame?', options: ['Thin, light, tall or short', 'Medium, muscular', 'Large, sturdy, well-built'] },
  { key: 'skin', text: 'What is your skin usually like?', options: ['Dry, rough, cool, thin', 'Oily, sensitive, warm, reddish', 'Thick, cool, pale, moist'] },
  { key: 'hair', text: 'Describe your hair type.', options: ['Dry, brittle, thin', 'Oily, fine, tendency for early graying', 'Thick, oily, wavy'] },
  { key: 'appetite', text: 'How is your appetite?', options: ['Irregular, variable', 'Strong, sharp, gets irritable if hungry', 'Slow but steady, can skip meals'] },
  { key: 'energy', text: 'How are your energy levels?', options: ['Comes in bursts, variable', 'Moderate, steady, competitive', 'High stamina, but slow to start'] },
  { key: 'stressResponse', text: 'Under stress, you tend to feel...', options: ['Anxious, worried, fearful', 'Irritable, angry, critical', 'Calm, withdrawn, possessive'] },
];

interface DoshaIdentifierProps {
  personalizationData: PersonalizationData;
}

export const DoshaIdentifier: React.FC<DoshaIdentifierProps> = ({ personalizationData }) => {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<DoshaAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (key: string, option: string) => {
    setAnswers(prev => ({ ...prev, [key]: option }));
  };

  const isComplete = questions.every(q => answers[q.key]);

  const handleSubmit = useCallback(async () => {
    if (!isComplete) {
      setError('Please answer all questions to identify your dosha.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await identifyDosha(answers as Record<string, string>, personalizationData);
      setResult(analysis);
    } catch (err) {
      setError('Failed to identify dosha. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [answers, isComplete, personalizationData]);

  return (
    <div className="space-y-6">
       {!result && (
        <div className="space-y-6">
            <p className="text-gray-600 mt-1">Answer a few questions about your physical and mental tendencies to discover your primary Ayurvedic constitution.</p>
            {questions.map((q) => (
                <div key={q.key}>
                <p className="font-semibold text-gray-700 mb-2">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                    {q.options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswer(q.key, option)}
                        className={`px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${
                        answers[q.key] === option
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50'
                        }`}
                    >
                        {option}
                    </button>
                    ))}
                </div>
                </div>
            ))}
            <button
                onClick={handleSubmit}
                disabled={isLoading || !isComplete}
                className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
            >
                {isLoading ? <Spinner /> : <UserIcon className="w-5 h-5 mr-2" />}
                Identify My Dosha
            </button>
        </div>
      )}
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
      
      {isLoading && <div className="text-center p-4"><p className="text-emerald-700">Analyzing your constitution...</p></div>}
      
      {result && (
        <div>
          <DoshaResult result={result} />
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="mt-4 w-full text-center text-emerald-600 hover:text-emerald-800 font-semibold text-sm"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
};
