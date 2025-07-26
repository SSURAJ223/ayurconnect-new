import React from 'react';

interface NavCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const NavCard: React.FC<NavCardProps> = ({ title, description, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group ${
        isActive
          ? 'bg-emerald-600 text-white shadow-xl'
          : 'bg-white/80 hover:bg-white text-gray-800 shadow-lg'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center">
        <div className={`mr-4 p-3 rounded-full transition-colors ${isActive ? 'bg-white/20' : 'bg-emerald-100 group-hover:bg-emerald-200'}`}>
          <div className={isActive ? 'text-white' : 'text-emerald-600'}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className={`font-display text-lg font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-sm ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>{description}</p>
        </div>
      </div>
    </button>
  );
};
