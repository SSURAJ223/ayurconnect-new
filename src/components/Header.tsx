import React from 'react';
import { LeafIcon } from './icons';
import { ShareButton } from './ShareButton';

export const Header: React.FC = () => {
  const appShareText = "Discover Ayurvedic insights for your health with AyurConnect AI. An AI-powered tool to analyze medicines and lab reports.";
  const appShareTitle = "Check out AyurConnect AI";

  return (
    <header className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center">
          <LeafIcon className="w-10 h-10 mr-4 text-white" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AyurConnect AI</h1>
            <p className="text-sm text-emerald-100">Your Bridge to Integrated Wellness</p>
          </div>
        </div>
        <ShareButton textToShare={appShareText} shareTitle={appShareTitle} />
      </div>
    </header>
  );
};
