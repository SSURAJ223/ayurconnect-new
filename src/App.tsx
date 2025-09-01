
import React, { useState } from 'react';
import { Header } from './components/Header';
import { MedicineFinder } from './components/MedicineFinder';
import { LabAnalyzer } from './components/LabAnalyzer';
import { DoshaIdentifier } from './components/DoshaIdentifier';
import { NavCard } from './components/NavCard';
import type { PersonalizationData, HerbSuggestion } from './types';
import { PersonalizationForm } from './components/PersonalizationForm';
import { ConnectModal } from './components/ConnectModal';
import { BottomNav } from './components/BottomNav';
import { MedicineIcon } from './components/icons/MedicineIcon';
import { ReportIcon } from './components/icons/ReportIcon';
import { DoshaIcon } from './components/icons/DoshaIcon';
import { AppSummary } from './components/AppSummary';
import { CartFAB } from './components/CartFAB';
import { CartModal } from './components/CartModal';
import { LoginModal } from './components/LoginModal';
import { ContactStrip } from './components/ContactStrip';
import { PrivacyPledge } from './components/PrivacyPledge';

type ActiveView = 'medicine' | 'lab' | 'dosha';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('medicine');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>({
    age: '',
    gender: '',
    context: ''
  });
  const [cart, setCart] = useState<HerbSuggestion[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // New state for authentication and login modal
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem('isAuthenticated'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsLoginModalOpen(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);

  const handleAddToCart = (item: HerbSuggestion) => {
      if (!cart.some(cartItem => cartItem.id === item.id)) {
        setCart(prev => [...prev, item]);
      }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleTalkToDoctorClick = () => setIsConnectModalOpen(true);

  const renderActiveView = () => {
    const commonProps = {
      personalizationData,
      cart,
      onAddToCart: handleAddToCart,
      onTalkToDoctorClick: handleTalkToDoctorClick,
      isAuthenticated,
      openLoginModal,
    };
    switch (activeView) {
      case 'medicine':
        return <MedicineFinder {...commonProps} />;
      case 'lab':
        return <LabAnalyzer {...commonProps} />;
      case 'dosha':
        return <DoshaIdentifier {...commonProps} />;
      default:
        return <MedicineFinder {...commonProps} />;
    }
  };

  const getTitleForView = (view: ActiveView) => {
    switch (view) {
      case 'medicine':
        return { title: 'Medicine Guide', icon: <MedicineIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
      case 'lab':
        return { title: 'Lab Analyzer', icon: <ReportIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
      case 'dosha':
        return { title: "What's Your Dosha?", icon: <DoshaIcon className="w-8 h-8 mr-3 text-emerald-600" /> };
    }
  }

  const { title, icon } = getTitleForView(activeView);

  return (
    <div className="font-sans text-gray-800 pb-24 lg:pb-0">
      <Header onTalkToDoctorClick={handleTalkToDoctorClick} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <AppSummary />
        <PrivacyPledge />
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
              title="What's Your Dosha?"
              description="Discover your mind-body type."
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
        
        <ContactStrip />

      </main>
      
      <footer className="text-center text-xs text-gray-500 py-6 px-4">
          <p>
            Disclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.
          </p>
      </footer>
      
      <BottomNav 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onTalkToDoctorClick={handleTalkToDoctorClick} 
      />
      
      <CartFAB cartItemCount={cart.length} onClick={() => setIsCartOpen(true)} />

      {isConnectModalOpen && <ConnectModal onClose={() => setIsConnectModalOpen(false)} />}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
      />
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
