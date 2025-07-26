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
    icon: React.ReactElement;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full h-full text-center group">
        <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-emerald-100' : ''}`}>
            {React.cloneElement(icon, {
                className: `w-6 h-6 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-500'}`
            })}
        </div>
        <span className={`text-xs mt-1 transition-colors ${isActive ? 'font-bold text-emerald-600' : 'text-gray-500 group-hover:text-emerald-500'}`}>
            {label}
        </span>
    </button>
);


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm border-t border-gray-200/80 shadow-t-lg z-30">
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
        </div>
    );
};
