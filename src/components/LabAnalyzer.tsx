
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeLabReport } from '../services/geminiService';
import type { LabAnalysisResult } from '../types';
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
      // remove the "data:mime/type;base64," part
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });

const formatLabResultForSharing = (query: {text: string, fileName: string | null}, result: LabAnalysisResult | null): string => {
  if (!result) return 'No analysis available.';
  if (result.error) return `AyurConnect AI: ${result.error}`;
  
  let text = `AyurConnect AI Lab Report Analysis\n`;
  if (query.text) text += `For text: "${query.text}"\n`;
  if (query.fileName) text += `For file: ${query.fileName}\n`;
  text += `------------------------\n\n`;

  if (!result.findings || result.findings.length === 0) {
    text += 'Based on the provided data, all markers appear to be within normal ranges.';
  } else {
    text += 'Analysis & Suggestions:\n\n';
    result.findings.forEach((finding, index) => {
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
          text += `  - ${item.suggestion}:\n`;
          text += `    Details: ${item.details}\n`;
          text += `    Duration: ${item.duration}\n`;
          text += `    Source: ${item.source}\n\n`;
        });
      }
      if (result.findings && index < result.findings.length - 1) {
        text += '---\n\n';
      }
    });
  }
  text += '\n\nDisclaimer: This tool provides information for educational purposes only and is not a substitute for professional medical advice. More info at ' + window.location.href;
  return text.trim();
};


const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const ACCEPTED_FILE_TYPES_STRING = 'image/png, image/jpeg, application/pdf';


export const LabAnalyzer: React.FC = () => {
  const [reportData, setReportData] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<LabAnalysisResult | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<{ text: string; fileName: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function to abort fetch on component unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if ((result || error) && !isLoading) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, error, isLoading]);
  
  const handleReset = () => {
    setReportData('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResult(null);
    setSubmittedQuery(null);
    setError(null);
    setIsLoading(false);
    if(abortControllerRef.current){
      abortControllerRef.current.abort();
    }
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setError("Invalid file type. Please upload an image (PNG, JPG) or a PDF.");
            if(fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
            if(fileInputRef.current) fileInputRef.current.value = '';
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const queryText = reportData.trim();
    if (!queryText && !selectedFile) {
      setError('Please paste your lab report data or upload a file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSubmittedQuery({ text: queryText, fileName: selectedFile?.name ?? null });

    try {
      let imagePart = null;
      if (selectedFile) {
          const base64Data = await fileToBase64(selectedFile);
          imagePart = {
              mimeType: selectedFile.type,
              data: base64Data,
          };
      }

      const analysis = await analyzeLabReport({
          text: queryText ? queryText : undefined,
          image: imagePart || undefined
      }, signal);

      if (analysis === null) {
        console.log("Lab analysis request was cancelled.");
        return;
      }
      
      if (analysis && analysis.error) {
        setError(analysis.error);
        setResult(null);
      } else {
        setResult(analysis);
      }
      
    } catch (err) {
       if ((err as Error).name !== 'AbortError') {
         setError((err as Error).message || 'Failed to analyze the report. Please try again.');
         console.error(err);
       }
    } finally {
      setIsLoading(false);
    }
  }, [reportData, selectedFile]);

  const showResults = (result || error) && submittedQuery && !isLoading;
  
  return (
    <div className="space-y-6">
       {!showResults && (
        <>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Analyse Lab Report</h2>
          <p className="text-gray-600 mt-1">
            Paste your lab report data or upload an image/PDF file to get insights and Ayurvedic suggestions.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={reportData}
            onChange={(e) => {
              setReportData(e.target.value);
              if(selectedFile) setSelectedFile(null);
              if(fileInputRef.current) fileInputRef.current.value = '';
            }}
            placeholder="Paste your lab report here. For example:&#10;Total Cholesterol: 240 mg/dL&#10;HDL: 35 mg/dL&#10;LDL: 160 mg/dL&#10;Triglycerides: 200 mg/dL"
            className={`w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition ${selectedFile ? 'bg-gray-100' : 'bg-white'}`}
            disabled={isLoading || !!selectedFile}
          />

          <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">OR</span>
              </div>
          </div>

          {selectedFile ? (
              <div className="p-3 border-2 border-dashed border-green-300 bg-green-50 rounded-lg text-center">
                  <p className="font-semibold text-gray-700">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                  <button
                      type="button"
                      onClick={() => {
                          setSelectedFile(null);
                          if(fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                      disabled={isLoading}
                  >
                      Remove file
                  </button>
              </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex justify-center px-6 pt-5 pb-6 border-2 ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'} border-dashed rounded-md transition-colors`}
            >
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                        >
                            <span>Upload a file</span>
                            <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ACCEPTED_FILE_TYPES_STRING} disabled={isLoading}/>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to {MAX_FILE_SIZE_MB}MB</p>
                </div>
            </div>
          )}


          <button
            type="submit"
            disabled={isLoading || (!reportData.trim() && !selectedFile)}
            className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors duration-200"
          >
            {isLoading ? <Spinner /> : <ClipboardCheckIcon className="w-5 h-5 mr-2" />}
            Analyze
          </button>
        </form>
        )}
      
      <div ref={resultsRef} aria-live="polite">
        {isLoading && <div className="text-center p-4"><p className="text-emerald-700">Analyzing report, please wait...</p></div>}
        
        {showResults && (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-700">Analysis For: <span className="font-bold text-emerald-700">{submittedQuery.fileName || 'Pasted Text'}</span></h3>
                <div className="flex items-center gap-2">
                  {result && <ShareButton textToShare={formatLabResultForSharing(submittedQuery, result)} shareTitle="AyurConnect AI: Lab Report Analysis" />}
                   <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-800">Start New</button>
                </div>
              </div>

              {submittedQuery.text && (
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 whitespace-pre-wrap font-mono">
                  {submittedQuery.text}
                </div>
              )}

              {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg mt-4">{error}</div>}

              {result && result.findings && (
                <div className="mt-4 space-y-6">
                  {result.findings.length > 0 ? (
                    result.findings.map((finding, index) => (
                      <div key={index} className="bg-green-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-start mb-3">
                          <AlertTriangleIcon className="w-6 h-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-xl font-bold text-emerald-800">{finding.parameter}</h4>
                            <p className="font-semibold text-orange-600">{finding.status}</p>
                          </div>
                        </div>
                        <div className="pl-9">
                          <p className="text-gray-700 mb-4">{finding.summary}</p>
                          
                          <h5 className="font-semibold text-gray-800 mb-3 mt-4">Complementary Herb Suggestions:</h5>
                          <div className="space-y-4">
                            {finding.herbSuggestions.map((item, subIndex) => (
                              <ResultCard key={subIndex} suggestion={item} />
                            ))}
                          </div>

                          {finding.lifestyleSuggestions && finding.lifestyleSuggestions.length > 0 && (
                              <>
                                  <h5 className="font-semibold text-gray-800 mb-3 mt-4">Lifestyle Recommendations:</h5>
                                  <div className="space-y-3">
                                      {finding.lifestyleSuggestions.map((item, subIndex) => (
                                          <LifestyleCard key={subIndex} suggestion={item} />
                                      ))}
                                  </div>
                              </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center mt-4">
                      <p>Based on the provided data, all markers appear to be within normal ranges. No specific herb suggestions are needed at this time.</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
