import React, { useState } from 'react';
import { Header } from './components/Header';
import { MedicineFinder } from './components/MedicineFinder';
import { LabAnalyzer } from './components/LabAnalyzer';
import { DoshaIdentifier } from './components/DoshaIdentifier';
import { PillIcon } from './components/icons/PillIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { UserIcon } from './components/icons/UserIcon';
import { NavCard } from './components/NavCard';
import type { PersonalizationData } from './types';
import { PersonalizationForm } from './components/PersonalizationForm';
import { ConnectModal } from './components/ConnectModal';


type ActiveView = 'medicine' | 'lab' | 'dosha';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('medicine');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>({
    age: '',
    gender: '',
    context: ''
  });


  const renderActiveView = () => {
    switch (activeView) {
      case 'medicine':
        return <MedicineFinder personalizationData={personalizationData} />;
      case 'lab':
        return <LabAnalyzer personalizationData={personalizationData} />;
      case 'dosha':
        return <DoshaIdentifier personalizationData={personalizationData} />;
      default:
        return <MedicineFinder personalizationData={personalizationData} />;
    }
  };

  const getTitleForView = (view: ActiveView) => {
    switch (view) {
      case 'medicine':
        return { title: 'Medicine Guide', icon: <PillIcon className="w-7 h-7 mr-3 text-emerald-600" /> };
      case 'lab':
        return { title: 'Lab Analyzer', icon: <BeakerIcon className="w-7 h-7 mr-3 text-emerald-600" /> };
      case 'dosha':
        return { title: 'Dosha Identifier', icon: <UserIcon className="w-7 h-7 mr-3 text-emerald-600" /> };
    }
  }

  const { title, icon } = getTitleForView(activeView);

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans">
      <Header onConnectClick={() => setIsConnectModalOpen(true)} />
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">

        <PersonalizationForm data={personalizationData} setData={setPersonalizationData} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Navigation (1/3 width on desktop) */}
          <aside className="md:col-span-1 space-y-6 animate-fade-in">
             <NavCard
              title="Medicine Guide"
              description="Find Ayurvedic herbs for your medicines."
              icon={<PillIcon className="w-8 h-8" />}
              isActive={activeView === 'medicine'}
              onClick={() => setActiveView('medicine')}
            />
             <NavCard
              title="Lab Analyzer"
              description="Get insights from your lab reports."
              icon={<BeakerIcon className="w-8 h-8" />}
              isActive={activeView === 'lab'}
              onClick={() => setActiveView('lab')}
            />
             <NavCard
              title="Dosha Identifier"
              description="Discover your unique constitution."
              icon={<UserIcon className="w-8 h-8" />}
              isActive={activeView === 'dosha'}
              onClick={() => setActiveView('dosha')}
            />
          </aside>

          {/* Main Content Area (2/3 width on desktop) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 animate-fade-in">
               <div className="flex items-center border-b border-green-200 pb-4 mb-6">
                {icon}
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              </div>
              {renderActiveView()}
            </div>
          </div>
        </div>

        <footer className="text-center text-sm text-green-700 pt-4">
          <p>
            Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.
          </p>
        </footer>
      </main>

      {isConnectModalOpen && <ConnectModal onClose={() => setIsConnectModalOpen(false)} />}
    </div>
  );
};

export default App;
