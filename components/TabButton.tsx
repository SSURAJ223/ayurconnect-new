import React from 'react';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center justify-center px-4 py-3 font-semibold text-sm rounded-t-lg focus:outline-none transition-colors duration-200";
  const activeClasses = "bg-green-100 text-emerald-700 border-b-2 border-emerald-500";
  const inactiveClasses = "text-gray-500 hover:bg-green-50 hover:text-emerald-600";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
};
