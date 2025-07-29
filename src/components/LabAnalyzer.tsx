import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeLabReport } from '../services/geminiService';
import type { LabAnalysisResult, PersonalizationData, HerbSuggestion } from '../types';
import { ResultCard } from './ResultCard';
import { Spinner } from './Spinner';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { UploadIcon } from './icons/UploadIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { LifestyleCard } from './LifestyleCard';
import { ShareButton } from './ShareButton';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });

const formatLabResultForSharing = (results: LabAnalysisResult): string => {
  let text = `AyurConnect AI Analysis\n------------------------\n\n`;
  if (!results || results.length === 0) {
    text += 'Based on the provided data, all markers appear to be within normal ranges.';
  } else {
    text += 'Analysis & Suggestions:\n\n';
    results.forEach((finding, index) => {
      text += `Finding: ${finding.parameter} (${finding.status})\n`;
      text += `Summary: ${finding.summary}\n\n`;
      if (finding.herbSuggestions?.length > 0) {
        text += '  Complementary Herb Suggestions:\n';
        finding.herbSuggestions.forEach(herb => {
          text += `  - ${herb.name}:\n`;
          text += `    Summary: ${herb.summary}\n`;
          text += `    Dosage: ${herb.dosage}\n`;
          text += `    Form: ${herb.form}\n`;
          text += `    Side Effects: ${herb.sideEffects}\n\n`;
        });
      }
      if (finding.lifestyleSuggestions?.length > 0) {
        text += '  Lifestyle Recommendations:\n';
        finding.lifestyleSuggestions.forEach(item => {
          text += `  - ${item.suggestion} (Source: ${item.source})\n`;
        });
        text += '\n';
      }
      if (index < results.length - 1) {
        text += '---\n\n';
      }
    });
  }
  text += '\n\nDisclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.';
  return text.trim();
};

const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const ACCEPTED_FILE_TYPES_STRING = 'image/png, image/jpeg, application/pdf';

interface LabAnalyzerProps {
  personalizationData: PersonalizationData;
  cart: HerbSuggestion[];
  onAddToCart: (item: HerbSuggestion) => void;
}

export const LabAnalyzer: React.FC<LabAnalyzerProps> = ({ personalizationData, cart, onAddToCart }) => {
  const [reportData, setReportData] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<LabAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setError("Invalid file type. Please upload an image (PNG, JPG) or a PDF.");
            e.target.value = '';
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = '';
            return;
        }
        setSelectedFile(file);
        setReportData('');
        setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (ACCEPTED_FILE_TYPES.includes(file.type)) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                 setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
                 return;
            }
            setSelectedFile(file);
            setReportData('');
            setError(null);
        } else {
            setError("Invalid file type. Please upload an image (PNG, JPG) or a PDF.");
        }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.trim() && !selectedFile) {
      setError('Please paste your lab report data or upload a file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      let imagePart = null;
      if (selectedFile) {
          const base64Data = await fileToBase64(selectedFile);
          imagePart = { mimeType: selectedFile.type, data: base64Data };
      }

      const analysis = await analyzeLabReport({
          text: reportData.trim() || undefined,
          image: imagePart || undefined
      }, personalizationData);

      setResults(analysis);
      
      setReportData('');
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError('Failed to analyze the report. Please check the data or file and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [reportData, selectedFile, personalizationData]);
  

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mt-1">Paste your lab report data or upload an image/PDF to get insights and Ayurvedic suggestions.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={reportData}
          onChange={(e) => { setReportData(e.target.value); if(selectedFile) setSelectedFile(null); }}
          placeholder="Paste your lab report here. For example:&#10;Total Cholesterol: 240 mg/dL&#10;HDL: 35 mg/dL"
          className={`w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition ${selectedFile ? 'bg-gray-100' : 'bg-white'}`}
          disabled={isLoading || !!selectedFile}
        />

        <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white/80 backdrop-blur-sm px-2 text-sm text-gray-500">OR</span></div>
        </div>

        {selectedFile ? (
            <div className="p-4 border-2 border-dashed border-green-400 bg-green-50 rounded-xl text-center">
                <p className="font-semibold text-gray-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                <button type="button" onClick={() => { setSelectedFile(null); const fileInput = document.getElementById('file-upload') as HTMLInputElement; if (fileInput) fileInput.value = ''; }} className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold" disabled={isLoading}>Remove file</button>
            </div>
        ) : (
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`flex justify-center px-6 pt-5 pb-6 border-2 ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'} border-dashed rounded-xl transition-colors`}>
              <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ACCEPTED_FILE_TYPES_STRING} disabled={isLoading}/>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to {MAX_FILE_SIZE_MB}MB</p>
              </div>
          </div>
        )}

        <button type="submit" disabled={isLoading || (!reportData.trim() && !selectedFile)} className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none">
          {isLoading ? <Spinner /> : <><ClipboardCheckIcon className="w-5 h-5 mr-2" />Analyze Report</>}
        </button>
      </form>
      
      {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
      {isLoading && <div className="text-center p-4"><p className="text-emerald-700 font-semibold">Analyzing report, please wait...</p></div>}
      
      {results && (
        <div className="space-y-8 animate-fade-in" ref={resultsRef}>
           <div className="flex justify-between items-center mt-4">
              <h3 className="font-display text-xl font-bold text-gray-700">Analysis & Suggestions</h3>
              <ShareButton textToShare={formatLabResultForSharing(results)} shareTitle="AyurConnect AI: Lab Report Analysis" />
            </div>
          {results.length > 0 ? (
            results.map((finding) => (
              <div key={finding.parameter} className="bg-orange-50/50 p-4 sm:p-5 rounded-2xl border border-orange-200/80">
                <div className="flex items-start mb-3">
                  <div className="p-2 bg-orange-100 rounded-full mr-4"><AlertTriangleIcon className="w-6 h-6 text-orange-500" /></div>
                  <div>
                    <h4 className="font-display text-xl font-bold text-gray-800">{finding.parameter}</h4>
                    <p className="font-semibold text-orange-600">{finding.status}</p>
                  </div>
                </div>
                <div className="pl-0 sm:pl-16 space-y-4">
                  <p className="text-gray-700">{finding.summary}</p>
                  
                   {finding.herbSuggestions && finding.herbSuggestions.length > 0 && (
                    <div>
                      <h5 className="font-display font-bold text-gray-800 mb-2 mt-4">Herb Suggestions</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {finding.herbSuggestions.map((item) => ( <ResultCard key={item.id} suggestion={item} cart={cart} onAddToCart={onAddToCart} /> ))}
                      </div>
                    </div>
                   )}
                   {finding.lifestyleSuggestions && finding.lifestyleSuggestions.length > 0 && (
                    <div>
                      <h5 className="font-display font-bold text-gray-800 mb-2 mt-4">Lifestyle Recommendations</h5>
                      <div className="space-y-3">
                        {finding.lifestyleSuggestions.map((item, subIndex) => ( <LifestyleCard key={subIndex} suggestion={item} />))}
                      </div>
                    </div>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
              <p>Based on the provided data, all markers appear to be within normal ranges. No specific herb suggestions are needed at this time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
