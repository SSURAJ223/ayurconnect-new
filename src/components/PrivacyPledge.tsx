
import React from 'react';
import { ShieldIcon } from './icons/ShieldIcon';

export const PrivacyPledge: React.FC = () => {
  return (
    <div className="bg-emerald-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-emerald-200/80 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="p-3 bg-emerald-100 rounded-full">
          <ShieldIcon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      <div>
        <h3 className="font-display text-base sm:text-lg font-bold text-emerald-800">Your Privacy is Paramount</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          We do not store your personal health data. All information is processed in real-time and immediately forgotten.
        </p>
      </div>
    </div>
  );
};
