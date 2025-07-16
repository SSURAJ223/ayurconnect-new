
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { getDoshaAnalysis } from '../services/geminiService';
import type { DoshaAnalysisResult } from '../types';
import { Spinner } from './Spinner';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LifestyleCard } from './LifestyleCard';
import { DoshaResultCard } from './DoshaResultCard';
import { ShareButton } from './ShareButton';
import { BookOpenIcon } from './icons/BookOpenIcon';


const questions = [
    {
        section: "Physical Constitution",
        items: [
            { key: 'frame', question: 'Body Frame & Build', options: ['Thin, light, slender frame', 'Medium, muscular frame', 'Large, sturdy, well-built frame'] },
            { key: 'skin', question: 'Skin Texture', options: ['Dry, thin, cool to touch, tans easily', 'Oily, warm, sensitive, prone to redness/acne', 'Thick, cool, smooth, sometimes pale'] },
            { key: 'hair', question: 'Hair Type', options: ['Dry, brittle, thin, can be frizzy', 'Fine, soft, may grey early or thin', 'Thick, oily, wavy, lustrous'] },
        ]
    },
    {
        section: "Metabolism & Digestion",
        items: [
            { key: 'appetite', question: 'Appetite', options: ['Irregular, variable, can forget to eat', 'Strong, sharp, cannot miss meals', 'Slow but steady, can skip meals easily'] },
            { key: 'digestion', question: 'Digestion Tendency', options: ['Tends toward gas, bloating, and constipation', 'Tends toward acidity, heartburn, loose stools', 'Tends to be slow, heavy, sluggish after meals'] },
            { key: 'temperature', question: 'Body Temperature', options: ['Often feel cold, especially hands and feet', 'Feel warm, prefer cool environments', 'Adaptable, but dislike cold, damp weather'] },
        ]
    },
    {
        section: "Mind & Energy",
        items: [
            { key: 'mind', question: 'Mental Nature', options: ['Quick, active, restless, many ideas', 'Sharp, intelligent, focused, determined', 'Calm, steady, methodical, stable'] },
            { key: 'stress', question: 'Reaction to Stress', options: ['Become anxious, worried, fearful', 'Become irritable, angry, impatient', 'Become withdrawn, quiet, possessive'] },
            { key: 'sleep', question: 'Sleep Pattern', options: ['Light, interrupted, difficulty falling asleep', 'Sound, moderate duration, may wake feeling hot', 'Deep, long, heavy, difficulty waking up'] },
            { key: 'energy', question: 'Energy Levels', options: ['Comes in bursts, variable stamina', 'Strong, consistent energy, competitive', 'Steady, enduring stamina, slower to start'] },
        ]
    }
];

const formatDoshaResultForSharing = (result: DoshaAnalysisResult): string => {
  if (!result) return '';
  let text = `AyurConnect AI - My Dosha Analysis\n------------------------\n\n`;
  text += `Dominant Dosha: ${result.dominantDosha}\n\n`;
  text += `About ${result.dominantDosha}:\n${result.doshaDescription}\n\n`;

  if (result.herbSuggestions?.length > 0) {
    text += 'Recommended Herbs:\n';
    result.herbSuggestions.forEach(herb => {
      text += `- ${herb.name}:\n`;
      text += `  Benefits: ${herb.benefits}\n`;
      text += `  Usage: ${herb.usage}\n`;
      text += `  Source: ${herb.source}\n\n`;
    });
  }
  if (result.lifestyleSuggestions?.length > 0) {
    text += 'Lifestyle Recommendations:\n';
    result.lifestyleSuggestions.forEach(item => {
      text += `- ${item.suggestion}:\n`;
      text += `  Reasoning: ${item.reasoning}\n`;
      text += `  Source: ${item.source}\n\n`;
    });
  }
  text += 'Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.';
  return text.trim();
};


export const DoshaFinder: React.FC = () => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<DoshaAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (result) {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const totalQuestions = useMemo(() => questions.reduce((sum, section) => sum + section.items.length, 0), []);
    const answeredQuestions = useMemo(() => Object.keys(answers).length, [answers]);
    const isComplete = useMemo(() => answeredQuestions === totalQuestions, [answeredQuestions, totalQuestions]);

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete) {
            setError('Please answer all questions to get your analysis.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysis = await getDoshaAnalysis(answers);
            setResult(analysis);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(`Failed to get analysis. Please check your connection or try again later. Server response: ${message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [answers, isComplete]);

    const handleReset = () => {
        setAnswers({});
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="text-center p-8 space-y-4">
            <Spinner />
            <p className="text-emerald-700 animate-pulse">Calculating your Dosha, please wait...</p>
            <p className="text-sm text-gray-500">The cosmos is aligning with your constitution.</p>
        </div>;
    }
    
    if (error) {
        return <div className="text-center p-8 space-y-4">
            <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>
            <button
                onClick={handleReset}
                className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
            >
                Try Again
            </button>
        </div>;
    }

    if (result) {
        return (
            <div className="space-y-8 animate-fade-in" ref={resultsRef}>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                    <h2 className="text-2xl font-bold text-emerald-800">Your Ayurvedic Constitution Analysis</h2>
                    <p className="text-gray-600 mt-1">Based on your answers, your dominant Dosha is:</p>
                    <p className="text-4xl font-extrabold text-emerald-600 my-3">{result.dominantDosha}</p>
                    <div className="flex justify-center gap-4 mt-4">
                      <ShareButton textToShare={formatDoshaResultForSharing(result)} shareTitle="My AyurConnect AI Dosha Analysis" />
                      <button onClick={handleReset} className="inline-flex items-center px-3 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 transition">Retake Quiz</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><BookOpenIcon className="w-5 h-5 mr-2 text-emerald-600" />About {result.dominantDosha}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.doshaDescription}</p>
                </div>
                
                {result.herbSuggestions.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Herb Recommendations</h3>
                        <div className="space-y-4">
                            {result.herbSuggestions.map((suggestion, index) => (
                                <DoshaResultCard key={index} suggestion={suggestion} />
                            ))}
                        </div>
                    </div>
                )}

                {result.lifestyleSuggestions.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Lifestyle Recommendations</h3>
                        <div className="space-y-3">
                            {result.lifestyleSuggestions.map((suggestion, index) => (
                                <LifestyleCard key={index} suggestion={{...suggestion}} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Discover Your Dosha</h2>
                <p className="text-gray-600 mt-1">
                    Answer these questions about your natural tendencies to understand your unique mind-body constitution.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                {questions.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="p-4 border-l-4 border-emerald-500 bg-green-50/50 rounded-r-lg">
                       <h3 className="text-lg font-semibold text-emerald-700 mb-4">{section.section}</h3>
                       <div className="space-y-6">
                           {section.items.map((q, qIndex) => (
                               <div key={q.key}>
                                   <label className="font-semibold text-gray-700 block mb-2">{(qIndex + 1) + (sectionIndex * 3)}. {q.question}</label>
                                   <div className="flex flex-col space-y-2">
                                       {q.options.map((opt, optIndex) => (
                                           <label key={optIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${answers[q.key] === opt ? 'bg-emerald-100 border-emerald-500 shadow' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
                                               <input
                                                   type="radio"
                                                   name={q.key}
                                                   value={opt}
                                                   checked={answers[q.key] === opt}
                                                   onChange={() => handleAnswerChange(q.key, opt)}
                                                   className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                               />
                                               <span className="ml-3 text-sm text-gray-700">{opt}</span>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           ))}
                       </div>
                    </div>
                ))}

                <div className="pt-4 text-center space-y-4">
                    <div className="text-sm text-gray-600">
                        Progress: {answeredQuestions} / {totalQuestions} questions answered
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isComplete || isLoading}
                        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
                    >
                        <UserCircleIcon className="w-5 h-5 mr-2" />
                        Find My Dosha
                    </button>
                </div>
            </form>
        </div>
    );
};
