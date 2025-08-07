import React from 'react';
import { ConsultationIcon } from './icons/ConsultationIcon';

interface ConsultationCTAProps {
    onTalkToDoctorClick: () => void;
}

export const ConsultationCTA: React.FC<ConsultationCTAProps> = ({ onTalkToDoctorClick }) => {
  return (
    <div className="relative bg-gradient-to-tr from-emerald-50 to-green-100 rounded-2xl shadow-lg p-6 text-center border border-emerald-200/80 mt-12">
      <div className="relative z-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 mb-4">
            <ConsultationIcon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-2">Need Expert Guidance?</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Our AI provides helpful suggestions, but a personalized consultation with a qualified Ayurvedic doctor can provide the best path for your unique health needs.
        </p>
        <button
          onClick={onTalkToDoctorClick}
          className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white text-base font-bold rounded-full shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105"
        >
          Request a Consultation
        </button>
      </div>
    </div>
  );
};
