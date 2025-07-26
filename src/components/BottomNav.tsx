import React from 'react';
import { MedicineIcon } from './icons/MedicineIcon';
import { ReportIcon } from './icons/ReportIcon';
import { DoshaIcon } from './icons/DoshaIcon';

type ActiveView = 'medicine' | 'lab' | 'dosha';

interface BottomNavProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center justify-center w-full h-full text-center group transition-colors duration-200 ease-in-out focus:outline-none"
        aria-current={isActive ? 'page' : undefined}
    >
        <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200 ease-in-out mb-1 ${isActive ? 'bg-emerald-100' : 'bg-transparent group-hover:bg-gray-100'}`}>
            {React.cloneElement(icon, {
                className: `w-6 h-6 transition-all duration-200 ease-in-out ${isActive ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-500'}`
            })}
        </div>
        <span className={`text-xs tracking-wide transition-colors ${isActive ? 'font-bold text-emerald-600' : 'font-medium text-gray-600 group-hover:text-emerald-600'}`}>
            {label}
        </span>
    </button>
);


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30">
            <div className="grid grid-cols-3 h-full max-w-md mx-auto">
                <NavItem 
                    icon={<MedicineIcon />} 
                    label="Medicine" 
                    isActive={activeView === 'medicine'}
                    onClick={() => setActiveView('medicine')} 
                />
                <NavItem 
                    icon={<ReportIcon />} 
                    label="Lab Report" 
                    isActive={activeView === 'lab'}
                    onClick={() => setActiveView('lab')} 
                />
                <NavItem 
                    icon={<DoshaIcon />} 
                    label="Dosha" 
                    isActive={activeView === 'dosha'}
                    onClick={() => setActiveView('dosha')}
                />
            </div>
        </nav>
    );
};
