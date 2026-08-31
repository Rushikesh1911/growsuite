"use client";

import { useState, useRef, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, TableProperties } from "lucide-react";
import Papa from "papaparse";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  type: "leads" | "clients";
}

type Step = "UPLOAD" | "MAP" | "REVIEW";

export function ImportCsvModal({ isOpen, onClose, onImport, type }: ImportCsvModalProps) {
  const [step, setStep] = useState<Step>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Mapping: Destination Field -> Source Header
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define destination fields based on type
  const targetFields = type === "leads" 
    ? [
        { id: "contactName", label: "Contact Name", required: true },
        { id: "company", label: "Company Name", required: false },
        { id: "email", label: "Email Address", required: false },
        { id: "phone", label: "Phone Number", required: false },
      ]
    : [
        { id: "name", label: "Client/Contact Name", required: true },
        { id: "company", label: "Company Name", required: false },
        { id: "email", label: "Email Address", required: false },
        { id: "phone", label: "Phone Number", required: false },
        { id: "address", label: "Address", required: false },
      ];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("UPLOAD");
      setFile(null);
      setRawHeaders([]);
      setRawData([]);
      setColumnMap({});
      setError(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      processFile(droppedFile);
    } else {
      setError("Please upload a valid CSV file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        
        const headers = results.meta.fields || [];
        if (headers.length === 0) {
           setError("No headers found in the CSV file.");
           return;
        }

        setRawHeaders(headers);
        setRawData(results.data);
        
        // Auto-guess mapping based on exact/partial matches
        const initialMap: Record<string, string> = {};
        targetFields.forEach(field => {
          const matchedHeader = headers.find(h => 
            h.toLowerCase() === field.id.toLowerCase() || 
            h.toLowerCase() === field.label.toLowerCase() ||
            h.toLowerCase().includes(field.id.toLowerCase())
          );
          if (matchedHeader) {
            initialMap[field.id] = matchedHeader;
          }
        });
        setColumnMap(initialMap);
        setStep("MAP");
      },
      error: (err) => {
        setError(`Failed to read file: ${err.message}`);
      }
    });
  };

  const handleImport = async () => {
    setIsUploading(true);
    setError(null);
    
    // Transform raw data based on mapping
    const transformedData = rawData.map(row => {
      const newRow: any = {};
      Object.keys(columnMap).forEach(targetField => {
         const sourceHeader = columnMap[targetField];
         if (sourceHeader && row[sourceHeader] !== undefined) {
            newRow[targetField] = row[sourceHeader];
         }
      });
      return newRow;
    });

    try {
      await onImport(transformedData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import data. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Validate mapping before proceeding to review
  const canProceedToReview = () => {
    // Check if all required target fields have a mapping
    const missingRequired = targetFields.filter(f => f.required && !columnMap[f.id]);
    return missingRequired.length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] shadow-2xl rounded-[16px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--gs-border)] bg-[var(--gs-surface)] shrink-0">
          <div>
            <h2 className="text-[18px] font-medium text-[var(--gs-fg)] tracking-tight">Import {type === 'leads' ? 'Leads' : 'Clients'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[12px] font-medium ${step === 'UPLOAD' ? 'text-[var(--gs-fg)]' : 'text-[var(--gs-muted)]'}`}>1. Upload</span>
              <ChevronRightIcon className="h-3 w-3 text-[var(--gs-border-strong)]" />
              <span className={`text-[12px] font-medium ${step === 'MAP' ? 'text-[var(--gs-fg)]' : 'text-[var(--gs-muted)]'}`}>2. Map Columns</span>
              <ChevronRightIcon className="h-3 w-3 text-[var(--gs-border-strong)]" />
              <span className={`text-[12px] font-medium ${step === 'REVIEW' ? 'text-[var(--gs-fg)]' : 'text-[var(--gs-muted)]'}`}>3. Review</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] p-2 rounded-[8px] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[var(--gs-bg)]">
          
          {error && (
            <div className="flex items-start gap-3 p-3 mb-5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-500 shrink-0">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="text-[13px] font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {step === "UPLOAD" && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[12px] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-[var(--gs-fg)] bg-[var(--gs-bg-alt)]' 
                  : 'border-[var(--gs-border-strong)] bg-[var(--gs-surface)] hover:bg-[var(--gs-bg-alt)] hover:border-[var(--gs-muted)]'
              }`}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />
              <div className="h-14 w-14 rounded-full bg-[var(--gs-bg-alt)] border border-[var(--gs-border)] flex items-center justify-center mb-5">
                <UploadCloud className="h-6 w-6 text-[var(--gs-muted)]" />
              </div>
              <span className="text-[15px] font-medium text-[var(--gs-fg)] mb-2 tracking-tight">Click to upload or drag and drop</span>
              <span className="text-[13px] text-[var(--gs-muted)] max-w-[280px] leading-relaxed">
                Upload a .CSV file containing your {type === 'leads' ? 'lead' : 'client'} records.
              </span>
            </div>
          )}

          {step === "MAP" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 p-4 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px]">
                <div className="h-10 w-10 rounded-[8px] bg-[#FAFAF8] dark:bg-[#1A1A1A] border border-[var(--gs-border)] flex items-center justify-center shrink-0">
                  <TableProperties className="h-5 w-5 text-[var(--gs-fg)]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] font-medium text-[var(--gs-fg)] truncate tracking-tight">{file?.name}</span>
                  <span className="text-[12px] text-[var(--gs-muted)] mt-0.5">
                    {rawData.length} rows found
                  </span>
                </div>
                <button 
                  onClick={() => setStep("UPLOAD")}
                  className="px-3 py-1.5 text-[12px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] border border-[var(--gs-border)] rounded-[6px] hover:bg-[var(--gs-bg-alt)] transition-colors"
                >
                  Change file
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[14px] font-medium text-[var(--gs-fg)] tracking-tight">Map Columns</h3>
                <p className="text-[13px] text-[var(--gs-muted)] mb-2">Match the columns from your CSV to GrowSuite fields.</p>
                
                <div className="bg-[var(--gs-surface)] border border-[var(--gs-border-strong)] rounded-[10px] overflow-hidden">
                  <div className="grid grid-cols-2 px-4 py-3 bg-[var(--gs-bg-alt)] border-b border-[var(--gs-border)]">
                    <span className="text-[12px] font-medium text-[var(--gs-muted)] uppercase tracking-wider">GrowSuite Field</span>
                    <span className="text-[12px] font-medium text-[var(--gs-muted)] uppercase tracking-wider pl-4">Your CSV Column</span>
                  </div>
                  <div className="flex flex-col divide-y divide-[var(--gs-border)]">
                    {targetFields.map(field => (
                      <div key={field.id} className="grid grid-cols-2 items-center p-4 hover:bg-[var(--gs-bg-alt)]/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[var(--gs-fg)]">{field.label}</span>
                          {field.required && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>}
                        </div>
                        <div className="pl-4">
                          <select
                            value={columnMap[field.id] || ""}
                            onChange={(e) => setColumnMap({ ...columnMap, [field.id]: e.target.value })}
                            className={`w-full h-9 px-3 text-[13px] font-medium bg-[var(--gs-bg)] border rounded-[6px] focus:outline-none focus:border-[var(--gs-fg)] transition-colors ${!columnMap[field.id] && field.required ? 'border-red-500/50 text-red-500' : 'border-[var(--gs-border)] text-[var(--gs-fg)]'}`}
                          >
                            <option value="">-- Ignore this field --</option>
                            {rawHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "REVIEW" && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
               <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                 <CheckCircle2 className="h-8 w-8 text-green-500" />
               </div>
               <h3 className="text-[20px] font-medium text-[var(--gs-fg)] tracking-tight mb-2">Ready to Import</h3>
               <p className="text-[14px] text-[var(--gs-muted)] max-w-[300px] leading-relaxed">
                 You are about to import <strong className="text-[var(--gs-fg)] font-medium">{rawData.length}</strong> {type === 'leads' ? 'leads' : 'clients'} into your workspace.
               </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--gs-border)] bg-[var(--gs-surface)] flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-2">
            {step === "MAP" && (
              <button
                onClick={() => setStep("REVIEW")}
                disabled={!canProceedToReview()}
                className="bg-[var(--gs-fg)] hover:opacity-90 text-[var(--gs-bg)] px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 outline-none"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            
            {step === "REVIEW" && (
              <button
                onClick={() => setStep("MAP")}
                disabled={isUploading}
                className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] border border-[var(--gs-border)] rounded-[8px] transition-colors disabled:opacity-50 bg-[var(--gs-bg)] mr-2"
              >
                Back to Mapping
              </button>
            )}
            
            {step === "REVIEW" && (
              <button
                onClick={handleImport}
                disabled={isUploading}
                className="bg-[#007CF0] hover:bg-[#006DE0] text-white px-5 py-2 rounded-[8px] text-[13px] font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 outline-none"
              >
                {isUploading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Data"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
