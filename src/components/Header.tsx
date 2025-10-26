import React from 'react';
import { LeafIcon } from './icons/LeafIcon';
import { ConsultationIcon } from './icons/ConsultationIcon';

interface HeaderProps {
    onTalkToDoctorClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onTalkToDoctorClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <div className="flex items-center">
          <LeafIcon className="w-9 h-9 mr-3 text-emerald-600" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-800">AyurConnect AI</h1>
            <p className="text-xs text-gray-500 -mt-1">AI-Powered Ayurvedic Support for Your Allopathic Journey</p>
          </div>
        </div>
         <button
          onClick={onTalkToDoctorClick}
          className="hidden sm:inline-flex items-center px-6 py-3 bg-emerald-600 text-white text-base font-bold rounded-full shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105 hover:shadow-2xl"
        >
          <ConsultationIcon className="w-5 h-5 mr-2" />
          Talk to an Ayurvedic Doctor
        </button>
      </div>
    </header>
  );
};
