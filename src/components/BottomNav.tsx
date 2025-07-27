import React from 'react';
import { MedicineIcon } from './icons/MedicineIcon';
import { ReportIcon } from './icons/ReportIcon';
import { DoshaIcon } from './icons/DoshaIcon';
import { ConsultationIcon } from './icons/ConsultationIcon';

type ActiveView = 'medicine' | 'lab' | 'dosha';

interface BottomNavProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    onTalkToDoctorClick: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center justify-center w-full h-full text-center group transition-colors duration-200 ease-in-out focus:outline-none focus:bg-gray-800"
        aria-current={isActive ? 'page' : undefined}
    >
        {React.cloneElement(icon, {
            className: `w-6 h-6 mb-1 transition-all duration-200 ease-in-out ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'}`
        })}
        <span className={`text-xs tracking-wide transition-colors ${isActive ? 'font-bold text-emerald-400' : 'text-gray-400 group-hover:text-white'}`}>
            {label}
        </span>
    </button>
);


export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onTalkToDoctorClick }) => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-gray-900 border-t border-gray-700 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-30">
            <div className="grid grid-cols-4 h-full max-w-md mx-auto">
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
                <NavItem 
                    icon={<ConsultationIcon />} 
                    label="Consult" 
                    isActive={false}
                    onClick={onTalkToDoctorClick}
                />
            </div>
        </nav>
    );
};
