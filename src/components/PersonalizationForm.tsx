import React from 'react';
import type { PersonalizationData } from '../types';

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
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Personalize Recommendations</h2>
      <p className="text-gray-600 mb-6">Provide some details to help us tailor the results to you. This is optional but highly recommended for better accuracy.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            name="age"
            id="age"
            value={data.age}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
            placeholder="e.g., 35"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            id="gender"
            value={data.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">Allergies or Symptoms (optional)</label>
          <textarea
            name="context"
            id="context"
            rows={3}
            value={data.context}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
            placeholder="e.g., Pollen allergy, occasional headaches, acid reflux"
          />
        </div>
      </div>
    </div>
  );
};
