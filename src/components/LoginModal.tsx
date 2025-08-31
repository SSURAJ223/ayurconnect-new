
import React, { useState, useEffect } from 'react';
import type { LoginDetails } from '../types';
import { sendOtp, verifyOtp } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { Spinner } from './Spinner';
import { SendIcon } from './icons/SendIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type LoginStep = 'details' | 'otp';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<LoginStep>('details');
  const [details, setDetails] = useState<LoginDetails>({ email: '', phone: '' });
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal is opened/closed
    if (!isOpen) {
      setTimeout(() => {
        setStep('details');
        setDetails({ email: '', phone: '' });
        setOtp('');
        setError(null);
        setMessage(null);
        setIsLoading(false);
      }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Allow only numbers and limit to 10 digits
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setDetails(prev => ({ ...prev, phone: numericValue }));
      }
    } else {
      setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.email || !details.phone) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await sendOtp(details);
      setMessage(response.message);
      setStep('otp');
    } catch (err) {
      setError((err as Error).message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await verifyOtp(details.email, otp);
      setMessage('Verification successful!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError((err as Error).message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 relative animate-fade-in" role="document">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10" aria-label="Close">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h2>
          
          {step === 'details' && (
            <>
              <p className="text-gray-600 mb-6 text-sm">Enter your details to receive a one-time password (OTP) via SMS.</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" id="email" value={details.email} onChange={handleDetailsChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Mobile Number (India)</label>
                   <div className="mt-1 flex rounded-lg shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            +91
                        </span>
                        <input 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            value={details.phone} 
                            onChange={handleDetailsChange} 
                            required 
                            pattern="\d{10}"
                            title="Please enter a valid 10-digit mobile number"
                            maxLength={10}
                            placeholder="9876543210"
                            className="w-full flex-1 min-w-0 block px-4 py-2 border border-gray-300 rounded-none rounded-r-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none">
                  {isLoading ? <Spinner /> : <><SendIcon className="w-5 h-5 mr-2" /> Send OTP</>}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
             <>
              <p className="text-gray-600 mb-6 text-sm">
                An OTP has been sent via SMS to <span className="font-bold">+91 {details.phone}</span>. Please enter it below.
                <br />
                <span className="text-xs">(An email with the OTP has also been sent as a backup.)</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                  <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} name="otp" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required className="mt-1 w-full text-center tracking-[0.5em] font-bold text-xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none">
                   {isLoading ? <Spinner /> : <><CheckCircleIcon className="w-5 h-5 mr-2" /> Verify & Continue</>}
                </button>
                <button type="button" onClick={() => setStep('details')} className="w-full text-sm text-gray-500 hover:text-emerald-600 text-center">Back</button>
              </form>
            </>
          )}
          
          {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
          {message && !error && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
};
