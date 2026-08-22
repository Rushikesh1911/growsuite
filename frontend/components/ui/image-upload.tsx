"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { EventToast } from "./event-toast";

interface ImageUploadProps {
  token: string;
  workspaceId?: number;
  endpoint: string; // e.g., "/api/uploads/workspace-logo" or "/api/uploads/avatar"
  currentImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ImageUpload({ token, workspaceId, endpoint, currentImageUrl, onUploadSuccess, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "File must be less than 5MB", type: "error" } }));
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (workspaceId) {
      headers["x-workspace-id"] = workspaceId.toString();
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadSuccess(data.url);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Uploaded successfully!", type: "success" } }));
      } else {
        const errorData = await res.json();
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: errorData.error || "Upload failed", type: "error" } }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: "Network error during upload", type: "error" } }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative w-20 h-20 rounded-full border border-[var(--gs-border)] overflow-hidden bg-[var(--gs-surface)] flex flex-shrink-0 items-center justify-center group">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-[var(--gs-muted)]" />
        )}
        
        {/* Hover Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Upload className="w-5 h-5 text-white" />}
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-[13px] font-semibold text-[var(--gs-fg)] hover:underline flex items-center gap-1.5 outline-none"
        >
          {isUploading ? "Uploading..." : "Change Image"}
        </button>
        <span className="text-[11px] text-[var(--gs-muted)]">JPG, PNG or GIF. Max size of 5MB.</span>
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
    </div>
  );
}
