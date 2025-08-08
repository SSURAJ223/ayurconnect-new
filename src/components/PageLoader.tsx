import React from 'react';
import { Spinner } from './Spinner';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[300px] text-center p-8">
      <Spinner className="h-10 w-10 text-emerald-600" />
      <p className="mt-4 text-lg font-semibold text-emerald-700">Loading...</p>
    </div>
  );
};
