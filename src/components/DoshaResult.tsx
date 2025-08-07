import React from 'react';
import { DoshaAnalysisResult, HerbSuggestion } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ResultCard } from './ResultCard';

interface DoshaResultProps {
  result: DoshaAnalysisResult;
  cart: HerbSuggestion[];
  onAddToCart: (item: HerbSuggestion) => void;
}

export const DoshaResult: React.FC<DoshaResultProps> = ({ result, cart, onAddToCart }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 sm:p-6 rounded-2xl border border-green-200 animate-fade-in space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Your Dominant Dosha</p>
        <h3 className="font-display text-4xl sm:text-5xl font-bold text-emerald-800 -ml-1">{result.dosha}</h3>
      </div>
      <p className="text-gray-700 text-base">{result.explanation}</p>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-display font-bold text-gray-800 mb-3 flex items-center text-lg"><LeafIcon className="w-5 h-5 mr-2 text-emerald-600" /> Diet Recommendations</h4>
          <ul className="space-y-2 text-gray-700">
            {result.recommendations.diet.map((item, index) => 
                <li key={index} className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">✓</span><span>{item}</span></li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-gray-800 mb-3 flex items-center text-lg"><SparklesIcon className="w-5 h-5 mr-2 text-emerald-600" /> Lifestyle Recommendations</h4>
          <ul className="space-y-2 text-gray-700">
            {result.recommendations.lifestyle.map((item, index) => 
                <li key={index} className="flex items-start"><span className="text-emerald-500 mr-2 mt-1">✓</span><span>{item}</span></li>
            )}
          </ul>
        </div>
      </div>

       {result.recommendations.herbSuggestions && result.recommendations.herbSuggestions.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-gray-800 mb-3 flex items-center text-lg"><LeafIcon className="w-5 h-5 mr-2 text-emerald-600" /> Herb Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.recommendations.herbSuggestions.map((suggestion) => (
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

      {result.sources && result.sources.length > 0 && (
         <div className="pt-4">
            <h4 className="font-display font-bold text-gray-800 mb-2 flex items-center"><BookOpenIcon className="w-5 h-5 mr-2 text-emerald-600" /> Sources</h4>
             <ul className="text-xs text-gray-500 list-disc list-inside">
                {result.sources.map((source, index) => <li key={index}>{source}</li>)}
            </ul>
        </div>
      )}
    </div>
  );
};
