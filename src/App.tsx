import React from 'react';
import { Header } from './components/Header';
import { MedicineFinder } from './components/MedicineFinder';
import { LabAnalyzer } from './components/LabAnalyzer';
import { DoshaIdentifier } from './components/DoshaIdentifier';
import { PillIcon } from './components/icons/PillIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { UserIcon } from './components/icons/UserIcon';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Dosha Identifier Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 animate-fade-in">
          <div className="flex items-center border-b border-green-200 pb-4 mb-6">
            <UserIcon className="w-7 h-7 mr-3 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Dosha Identifier</h2>
          </div>
          <DoshaIdentifier />
        </div>

        {/* Medicine Finder Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 animate-fade-in">
          <div className="flex items-center border-b border-green-200 pb-4 mb-6">
            <PillIcon className="w-7 h-7 mr-3 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Medicine Guide</h2>
          </div>
          <MedicineFinder />
        </div>

        {/* Lab Analyzer Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 animate-fade-in">
           <div className="flex items-center border-b border-green-200 pb-4 mb-6">
            <BeakerIcon className="w-7 h-7 mr-3 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Lab Analyzer</h2>
          </div>
          <LabAnalyzer />
        </div>

        <footer className="text-center text-sm text-green-700 mt-8">
          <p>
            Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
