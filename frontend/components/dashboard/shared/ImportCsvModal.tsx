"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Papa from "papaparse";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  type: "leads" | "clients";
}

export function ImportCsvModal({ isOpen, onClose, onImport, type }: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (droppedFile && droppedFile.type === "text/csv") {
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
        
        // Basic validation: check if 'Name' or 'contactName' exists
        const headers = results.meta.fields || [];
        const hasName = headers.some(h => h.toLowerCase() === 'name' || h.toLowerCase() === 'contactname');
        
        if (!hasName) {
          setError(`Missing required column: 'Name'. Found columns: ${headers.join(", ")}`);
          setData([]);
          return;
        }

        setData(results.data);
      },
      error: (err) => {
        setError(`Failed to read file: ${err.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setIsUploading(true);
    setError(null);
    
    try {
      await onImport(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import data. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--gs-surface-raised)] border border-[var(--gs-border-strong)] shadow-2xl rounded-[12px] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--gs-border)] bg-[var(--gs-surface)]">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--gs-fg)] tracking-tight">Import {type === 'leads' ? 'Leads' : 'Clients'}</h2>
            <p className="text-[11px] text-[var(--gs-muted)]">Upload a CSV file to bulk import records.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--gs-muted)] hover:text-[var(--gs-fg)] p-1.5 rounded-[6px] hover:bg-[var(--gs-bg-alt)] transition-colors outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[12px] p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
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
              <div className="h-12 w-12 rounded-full bg-[var(--gs-bg)] border border-[var(--gs-border)] flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-[var(--gs-muted)]" />
              </div>
              <span className="text-[14px] font-semibold text-[var(--gs-fg)] mb-1">Click to upload or drag and drop</span>
              <span className="text-[12px] text-[var(--gs-muted)] max-w-[250px]">
                Ensure your CSV has standard headers like Name, Email, Phone, Company.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center p-4 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[8px]">
                <div className="h-10 w-10 rounded-[6px] bg-[var(--gs-bg-alt)] flex items-center justify-center shrink-0 mr-4">
                  <FileText className="h-5 w-5 text-[var(--gs-muted)]" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-[var(--gs-fg)] truncate">{file.name}</span>
                  <span className="text-[11px] text-[var(--gs-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  onClick={() => { setFile(null); setData([]); setError(null); }}
                  className="p-2 text-[var(--gs-muted)] hover:text-[var(--gs-fg)] hover:bg-[var(--gs-bg-alt)] rounded-[6px] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error ? (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-[12px] font-medium leading-relaxed">{error}</span>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-[8px] text-green-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-[12px] font-medium leading-relaxed">
                    Successfully parsed <strong>{data.length}</strong> records. Ready to import.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--gs-border)] bg-[var(--gs-surface)] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-[13px] font-medium text-[var(--gs-muted)] hover:text-[var(--gs-fg)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || !!error || data.length === 0 || isUploading}
            className="bg-[var(--gs-fg)] hover:bg-[#FFFFFF] text-[#000000] px-4 py-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-3 w-3 border-2 border-[#000000]/20 border-t-[#000000] rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              "Import Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
