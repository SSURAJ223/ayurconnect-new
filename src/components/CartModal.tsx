import React from 'react';
import type { HerbSuggestion } from '../types';
import { XIcon } from './icons/XIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: HerbSuggestion[];
  onRemoveItem: (itemId: string) => void;
}

// TODO: **IMPORTANT** Replace this with your actual WhatsApp business number, including the country code without the '+'.
const WHATSAPP_NUMBER = '910000000000'; // Example for India. Use your own number.

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onRemoveItem }) => {
  if (!isOpen) return null;

  const handlePlaceOrder = () => {
    const header = "Hello! I'd like to place an order for the following Ayurvedic herbs from AyurConnect AI:\n\n";
    const itemList = cartItems.map(item => `- ${item.name}`).join('\n');
    const fullMessage = encodeURIComponent(header + itemList);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${fullMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div className="bg-gray-50 w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in" role="document">
        <header className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <ShoppingCartIcon className="w-6 h-6 mr-3 text-emerald-600" />
            <h2 className="font-display text-xl font-bold text-gray-800">Your Cart</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close cart">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-5">
          {cartItems.length > 0 ? (
            <ul className="space-y-4">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.form}</p>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="p-2 text-gray-400 hover:text-red-500" aria-label={`Remove ${item.name} from cart`}>
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 pt-16">
              <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300" />
              <p className="mt-4 font-semibold">Your cart is empty</p>
              <p className="text-sm">Add items from the suggestion cards.</p>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="p-5 border-t border-gray-200 bg-white">
            <button
              onClick={handlePlaceOrder}
              className="w-full flex items-center justify-center px-6 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <WhatsAppIcon className="w-6 h-6 mr-3" />
              Place Order on WhatsApp
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">You will be redirected to WhatsApp to confirm your order.</p>
          </footer>
        )}
      </div>
      <style>{`.animate-slide-in { animation: slideIn 0.3s ease-out; } @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
};
