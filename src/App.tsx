import React, { useState } from 'react';
import { Header } from './components/Header';
import { MedicineFinder } from './components/MedicineFinder';
import { LabAnalyzer } from './components/LabAnalyzer';
import { DoshaIdentifier } from './components/DoshaIdentifier';
import { NavCard } from './components/NavCard';
import type { PersonalizationData } from './types';
import { PersonalizationForm } from './components/PersonalizationForm';
import { ConnectModal } from './components/ConnectModal';
import { BottomNav } from './components/BottomNav';
import { MedicineIcon } from './components/icons/MedicineIcon';
import { ReportIcon } from './components/icons/ReportIcon';
import { DoshaIcon } from './components/icons/DoshaIcon';

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
        return { title: 'Medicine Guide', icon: <MedicineIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
      case 'lab':
        return { title: 'Lab Analyzer', icon: <ReportIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
      case 'dosha':
        return { title: 'Dosha Identifier', icon: <DoshaIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
    }
  }

  const { title, icon } = getTitleForView(activeView);

  return (
    <div className="font-sans text-gray-800 pb-24 lg:pb-0">
      <Header onTalkToDoctorClick={() => setIsConnectModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <PersonalizationForm data={personalizationData} setData={setPersonalizationData} />

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-1/4 space-y-4">
             <NavCard
              title="Medicine Guide"
              description="Herbs for your medicines."
              icon={<MedicineIcon className="w-8 h-8" />}
              isActive={activeView === 'medicine'}
              onClick={() => setActiveView('medicine')}
            />
             <NavCard
              title="Lab Analyzer"
              description="Insights from your reports."
              icon={<ReportIcon className="w-8 h-8" />}
              isActive={activeView === 'lab'}
              onClick={() => setActiveView('lab')}
            />
             <NavCard
              title="Dosha Identifier"
              description="Discover your constitution."
              icon={<DoshaIcon className="w-8 h-8" />}
              isActive={activeView === 'dosha'}
              onClick={() => setActiveView('dosha')}
            />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 min-h-[500px] animate-fade-in">
               <div className="flex items-center border-b border-green-200 pb-4 mb-6">
                {icon}
                <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
              </div>
              {renderActiveView()}
            </div>
          </div>
        </div>

      </main>
      
      <footer className="text-center text-xs text-gray-500 py-6 px-4">
          <p>
            Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.
          </p>
      </footer>
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      {isConnectModalOpen && <ConnectModal onClose={() => setIsConnectModalOpen(false)} />}
    </div>
  );
};

export default App;
