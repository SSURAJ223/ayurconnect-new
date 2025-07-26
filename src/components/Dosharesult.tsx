import React from 'react';
import { DoshaAnalysisResult } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface DoshaResultProps {
  result: DoshaAnalysisResult;
}

export const DoshaResult: React.FC<DoshaResultProps> = ({ result }) => {
  return (
    <div className="bg-green-50 p-5 rounded-xl border border-green-200 animate-fade-in space-y-4">
      <div>
        <p className="text-sm text-emerald-600">Your Dominant Dosha</p>
        <h3 className="text-3xl font-bold text-emerald-800">{result.dosha}</h3>
      </div>
      <p className="text-gray-700">{result.explanation}</p>
      
      <div>
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><LeafIcon className="w-5 h-5 mr-2 text-emerald-600" /> Rasayana Recommendations</h4>
        <div className="pl-4">
          <h5 className="font-semibold text-gray-700 mt-2">Diet:</h5>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
            {result.recommendations.diet.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
          <h5 className="font-semibold text-gray-700 mt-3">Lifestyle:</h5>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mt-1">
            {result.recommendations.lifestyle.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>

      {result.sources && result.sources.length > 0 && (
         <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><BookOpenIcon className="w-5 h-5 mr-2 text-emerald-600" /> Sources</h4>
             <ul className="text-xs text-gray-500 list-disc list-inside">
                {result.sources.map((source, index) => <li key={index}>{source}</li>)}
            </ul>
        </div>
      )}
    </div>
  );
};
