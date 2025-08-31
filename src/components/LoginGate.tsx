
import React from 'react';
import { UserCheckIcon } from './icons/UserCheckIcon';

interface LoginGateProps {
  openLoginModal: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ openLoginModal }) => {
  return (
    <div className="animate-fade-in mt-6 text-center bg-gradient-to-tr from-emerald-50 to-green-100 rounded-2xl shadow-lg p-6 sm:p-8 border border-emerald-200/80">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 mb-5">
        <UserCheckIcon className="h-9 w-9 text-white" />
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your Analysis is Ready!</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Please verify your identity to unlock and view your personalized Ayurvedic recommendations.
      </p>
      <button
        onClick={openLoginModal}
        className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white text-base font-bold rounded-full shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105"
      >
        Login to View Results
      </button>
    </div>
  );
};
