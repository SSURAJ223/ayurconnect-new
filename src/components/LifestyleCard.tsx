import React from 'react';
import type { LifestyleSuggestion } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface LifestyleCardProps {
  suggestion: LifestyleSuggestion;
}

export const LifestyleCard: React.FC<LifestyleCardProps> = ({ suggestion }) => {
  return (
    <div className="flex items-start bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
      <SparklesIcon className="w-5 h-5 text-emerald-600 mr-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-gray-800">{suggestion.suggestion}</p>
        <p className="text-xs text-gray-500 mt-1">Source: <span className="italic">{suggestion.source}</span></p>
      </div>
    </div>
  );
};
