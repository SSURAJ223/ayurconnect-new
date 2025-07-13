
import React from 'react';
import type { LifestyleSuggestion } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClockIcon } from './icons/ClockIcon';
import { InfoIcon } from './icons/InfoIcon';

interface LifestyleCardProps {
  suggestion: LifestyleSuggestion;
}

export const LifestyleCard: React.FC<LifestyleCardProps> = ({ suggestion }) => {
  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
      <div className="flex items-start">
        <BookOpenIcon className="w-5 h-5 text-green-700 mr-3 mt-1 flex-shrink-0" />
        <p className="font-semibold text-gray-800">{suggestion.suggestion}</p>
      </div>
      <div className="pl-8 space-y-2 text-sm">
        <div className="flex items-start text-gray-600">
          <InfoIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>{suggestion.details}</p>
        </div>
        <div className="flex items-start text-gray-600">
          <ClockIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>{suggestion.duration}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 pl-8">Source: <span className="italic">{suggestion.source}</span></p>
    </div>
  );
};
