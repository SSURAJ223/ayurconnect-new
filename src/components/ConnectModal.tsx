import React, { useState, useCallback } from 'react';
import { contactExpert } from '../services/geminiService';
import type { ContactDetails } from '../types';
import { Spinner } from './Spinner';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ConnectModalProps {
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ onClose }) => {
  const [details, setDetails] = useState<ContactDetails>({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await contactExpert(details);
      setSuccessMessage(response.message);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [details]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 relative animate-fade-in" role="document">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          {successMessage ? (
            <div className="text-center space-y-4">
               <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800">Request Sent!</h2>
              <p className="text-gray-600">{successMessage}</p>
              <button
                onClick={onClose}
                className="w-full mt-4 flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect with an Expert</h2>
              <p className="text-gray-600 mb-6">Fill out the form below, and an Ayurvedic expert will get in touch with you shortly.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={details.name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={details.email}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={details.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                  />
                </div>
                 {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
                >
                  {isLoading ? <Spinner /> : <><MailIcon className="w-5 h-5 mr-2" /> Submit Request</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
