import React from 'react';
import { ConsultationIcon } from './icons/ConsultationIcon';

interface HeaderProps {
    onTalkToDoctorClick: () => void;
}

// The logo is now served from the /public directory for reliability.
const logoUrl = "/logo.png";

export const Header: React.FC<HeaderProps> = ({ onTalkToDoctorClick }) => {
    return (
        <header className="bg-white/95 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    <div className="flex-shrink-0">
                        <a href="/" aria-label="Back to home">
                            <img className="h-20 w-auto" src={logoUrl} alt="AyurConnect AI Logo" />
                        </a>
                    </div>
                    <div className="hidden lg:block">
                        <button
                            onClick={onTalkToDoctorClick}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105"
                        >
                            <ConsultationIcon className="w-5 h-5 mr-3 -ml-1" />
                            Talk to an Expert
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
