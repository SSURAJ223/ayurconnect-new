import React from 'react';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface CartFABProps {
  cartItemCount: number;
  onClick: () => void;
}

export const CartFAB: React.FC<CartFABProps> = ({ cartItemCount, onClick }) => {
  if (cartItemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 animate-fade-in">
      <button
        onClick={onClick}
        className="relative flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 transition-all transform hover:scale-110"
        aria-label={`View cart with ${cartItemCount} items`}
      >
        <ShoppingCartIcon className="w-8 h-8" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-emerald-600">
            {cartItemCount}
          </span>
        )}
      </button>
    </div>
  );
};
