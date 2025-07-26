import React from 'react';
import { LeafIcon } from './icons/LeafIcon';
import { MailIcon } from './icons/MailIcon';

interface HeaderProps {
    onConnectClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onConnectClick }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md sticky top-0 z-20">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center">
          <LeafIcon className="w-10 h-10 mr-4 text-white" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AyurConnect AI</h1>
            <p className="text-sm text-emerald-100">Your Bridge to Integrated Wellness</p>
          </div>
        </div>
         <button
          onClick={onConnectClick}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-600 focus:ring-white transition-colors duration-200"
        >
          <MailIcon className="w-5 h-5 mr-2" />
          Connect to Expert
        </button>
      </div>
    </header>
  );
};
