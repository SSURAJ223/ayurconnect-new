// src/components/Header.tsx
import React from 'react';
import Image from 'next/image';
import { ConsultationIcon } from './icons/ConsultationIcon';

interface HeaderProps {
  onTalkToDoctorClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTalkToDoctorClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center" aria-label="AyurConnect AI Home">
              <div className="relative h-14 w-14">
                {/* Put /public/logo.png in your repo (see instructions below) */}
                <Image
                  src="/logo.png"
                  alt="Ayurconnect AI"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <span className="ml-3 text-xl font-semibold text-emerald-800 hidden sm:block">
                Ayurconnect AI
              </span>
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={onTalkToDoctorClick}
              className="ml-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-full shadow-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105"
            >
              <ConsultationIcon className="w-5 h-5 mr-2" />
              Talk to an Ayurvedic Doctor
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
