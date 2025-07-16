import React from 'react';
import type { LifestyleSuggestion } from '../types';
import { BookOpenIcon } from './icons';

interface LifestyleCardProps {
  suggestion: LifestyleSuggestion;
}

export const LifestyleCard: React.FC<LifestyleCardProps> = ({ suggestion }) => {
  return (
    <div className="flex items-start bg-green-50 p-4 rounded-lg border border-green-200">
      <BookOpenIcon className="w-6 h-6 text-green-600 mr-4 mt-1 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-800">{suggestion.suggestion}</p>
        {suggestion.reasoning && <p className="text-gray-700 text-sm mt-1">{suggestion.reasoning}</p>}
        <p className="text-xs text-gray-500 mt-2">Source: <span className="italic">{suggestion.source}</span></p>
      </div>
    </div>
  );
};
