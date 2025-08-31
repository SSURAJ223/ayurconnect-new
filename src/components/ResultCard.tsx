import React from 'react';
import type { HerbSuggestion } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface ResultCardProps {
  suggestion: HerbSuggestion;
  cart: HerbSuggestion[];
  onAddToCart: (item: HerbSuggestion) => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-start text-sm">
        <div className="text-emerald-700/80 mt-0.5 mr-2 flex-shrink-0">{icon}</div>
        <div>
            <p className="font-semibold text-gray-500">{label}</p>
            <p className="text-gray-700">{value}</p>
        </div>
    </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ suggestion, cart, onAddToCart }) => {
  const isInCart = cart.some(item => item.id === suggestion.id);
  
  return (
    <div className="border border-green-200/80 bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex items-start mb-3">
          <div className="bg-emerald-100 p-2 rounded-full mr-3 flex-shrink-0">
            <LeafIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-display text-lg font-bold text-emerald-800 break-words">{suggestion.name}</h4>
        </div>

        <p className="text-gray-600 mb-5 text-sm">{suggestion.summary}</p>
        
        <div className="space-y-3">
          <InfoRow icon={<BookOpenIcon className="w-4 h-4"/>} label="Dosage & Form" value={`${suggestion.dosage} (${suggestion.form})`} />
          <InfoRow icon={<AlertTriangleIcon className="w-4 h-4"/>} label="Side Effects" value={suggestion.sideEffects} />
        </div>
      </div>
       <div className="bg-gray-50 p-4 mt-auto">
        <button
          onClick={() => onAddToCart(suggestion)}
          disabled={isInCart}
          className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            isInCart
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isInCart ? 'Added to Cart ✓' : (
            <>
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};
