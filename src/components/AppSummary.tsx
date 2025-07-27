import React from 'react';

export const AppSummary: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-fade-in border border-gray-200/80">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your AI-Powered Ayurvedic Companion</h2>
      <p className="text-gray-600 text-sm sm:text-base">
        Bridge the gap between modern medicine and ancient Ayurvedic wisdom. Get personalized herb suggestions, analyze lab reports, and discover your unique dosha for a holistic approach to wellness.
      </p>
    </div>
  );
};
