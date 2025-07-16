
import React, { useState } from 'react';
import { Header } from './components/Header';
import { MedicineFinder } from './components/MedicineFinder';
import { LabAnalyzer } from './components/LabAnalyzer';
import { DoshaFinder } from './components/DoshaFinder';
import { TabButton } from './components/TabButton';
import { PillIcon } from './components/icons/PillIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { UserCircleIcon } from './components/icons/UserCircleIcon';

type Tab = 'medicine' | 'lab' | 'dosha';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('medicine');

  const renderContent = () => {
    switch(activeTab) {
      case 'medicine':
        return <MedicineFinder />;
      case 'lab':
        return <LabAnalyzer />;
      case 'dosha':
        return <DoshaFinder />;
      default:
        return <MedicineFinder />;
    }
  }

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
          <div className="flex space-x-2 border-b border-green-200 mb-6">
            <TabButton
              label="Medicine Guide"
              icon={<PillIcon className="w-5 h-5 mr-2" />}
              isActive={activeTab === 'medicine'}
              onClick={() => setActiveTab('medicine')}
            />
            <TabButton
              label="Lab Analyzer"
              icon={<BeakerIcon className="w-5 h-5 mr-2" />}
              isActive={activeTab === 'lab'}
              onClick={() => setActiveTab('lab')}
            />
            <TabButton
              label="Dosha Finder"
              icon={<UserCircleIcon className="w-5 h-5 mr-2" />}
              isActive={activeTab === 'dosha'}
              onClick={() => setActiveTab('dosha')}
            />
          </div>
          <div>
            {renderContent()}
          </div>
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
