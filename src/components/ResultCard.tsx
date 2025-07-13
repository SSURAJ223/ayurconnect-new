
import React from 'react';
import type { HerbSuggestion } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface ResultCardProps {
  suggestion: HerbSuggestion;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="text-emerald-600 mt-1 mr-3 flex-shrink-0">{icon}</div>
        <div>
            <p className="font-semibold text-gray-700">{label}</p>
            <p className="text-gray-600">{value}</p>
        </div>
    </div>
);


export const ResultCard: React.FC<ResultCardProps> = ({ suggestion }) => {
  return (
    <div className="border border-green-200 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="bg-emerald-100 p-2 rounded-full mr-4">
            <LeafIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <h4 className="text-xl font-bold text-emerald-800">{suggestion.name}</h4>
        </div>

        <p className="text-gray-600 mb-6">{suggestion.summary}</p>
        
        <div className="space-y-4">
          <InfoRow icon={<BookOpenIcon className="w-5 h-5"/>} label="Dosage" value={suggestion.dosage} />
          <InfoRow icon={<BeakerIcon className="w-5 h-5"/>} label="Form" value={suggestion.form} />
          <InfoRow icon={<AlertTriangleIcon className="w-5 h-5"/>} label="Side Effects" value={suggestion.sideEffects} />
        </div>
      </div>
    </div>
  );
};
