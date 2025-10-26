import React from 'react';

export const AppSummary: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-fade-in border border-gray-200/80">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-2">Heal Deeper with AI-Powered Ayurvedic Guidance</h2>
      <p className="text-gray-600 text-sm sm:text-base">
        Complement your allopathic treatments with personalized Ayurvedic recovery herbs and lifestyle advice. Our AI analyzes your needs to support root-cause healing and reduce side effects, bridging the gap between modern medicine and ancient wisdom.
      </p>
    </div>
  );
};
