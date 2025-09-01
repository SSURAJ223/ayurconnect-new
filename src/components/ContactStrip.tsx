
import React from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { EmailIcon } from './icons/EmailIcon';

const WHATSAPP_NUMBER = '918248197406';
const EMAIL_ADDRESS = 'hi@ayurconnectai.in';

export const ContactStrip: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-fade-in border border-gray-200/80 text-center">
      <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        Have Questions? Reach Out to Us!
      </h3>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors duration-200 shadow-md w-full sm:w-auto"
        >
          <WhatsAppIcon className="w-5 h-5 mr-2" />
          WhatsApp: +91-8248197406
        </a>
        <a
          href={`mailto:${EMAIL_ADDRESS}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors duration-200 shadow-md w-full sm:w-auto"
        >
          <EmailIcon className="w-5 h-5 mr-2" />
          Email: hi@ayurconnectai.in
        </a>
      </div>
    </div>
  );
};
