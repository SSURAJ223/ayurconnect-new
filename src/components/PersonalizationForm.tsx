import React from 'react';
import type { PersonalizationData } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PersonalizationFormProps {
  data: PersonalizationData;
  setData: React.Dispatch<React.SetStateAction<PersonalizationData>>;
}

export const PersonalizationForm: React.FC<PersonalizationFormProps> = ({ data, setData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl shadow-xl p-4 sm:p-8 text-white overflow-hidden animate-fade-in">
       <SparklesIcon className="absolute -bottom-8 -right-8 w-32 h-32 text-white/10 transform rotate-12" />
       <SparklesIcon className="absolute top-4 left-4 w-12 h-12 text-white/10" />
      <div className="relative z-10">
        <h2 className="font-display text-xl sm:text-3xl font-bold mb-2">Better results, just for you.</h2>
        <p className="text-emerald-100 mb-4 sm:mb-6 max-w-2xl text-sm sm:text-base">This is optional, but providing these details helps us tailor recommendations to your unique needs.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-bold text-white mb-1">Age</label>
            <input
              type="number"
              name="age"
              id="age"
              value={data.age}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white transition placeholder:text-emerald-200"
              placeholder="e.g., 35"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-bold text-white mb-1">Gender</label>
            <select
              name="gender"
              id="gender"
              value={data.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white transition text-white"
            >
              <option value="" className="text-black">Select...</option>
              <option value="Male" className="text-black">Male</option>
              <option value="Female" className="text-black">Female</option>
              <option value="Other" className="text-black">Other</option>
              <option value="Prefer not to say" className="text-black">Prefer not to say</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="context" className="block text-sm font-bold text-white mb-1">Allergies or Symptoms</label>
            <input
              type="text"
              name="context"
              id="context"
              value={data.context}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white transition placeholder:text-emerald-200"
              placeholder="e.g., Pollen allergy, headaches"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
