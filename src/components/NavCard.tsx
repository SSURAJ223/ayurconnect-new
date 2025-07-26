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
      className={`w-full text-left p-6 rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
        isActive
          ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white ring-2 ring-white/50'
          : 'bg-white hover:bg-emerald-50 text-gray-800'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center">
        <div className={`mr-4 p-3 rounded-full ${isActive ? 'bg-white/20' : 'bg-emerald-100'}`}>
          <div className={isActive ? 'text-white' : 'text-emerald-600'}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-sm ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>{description}</p>
        </div>
      </div>
    </button>
  );
};
