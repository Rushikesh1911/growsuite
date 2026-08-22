"use client";
import { useState, useEffect } from "react";
import { Toast, ToastProps } from "./toast";

export function EventToast() {
  const [toast, setToast] = useState<{ message: string, type: ToastProps['type'], isOpen: boolean }>({ message: "", type: "info", isOpen: false });

  useEffect(() => {
    const handleShowToast = (e: any) => {
      setToast({
        message: e.detail.message,
        type: e.detail.type || "info",
        isOpen: true,
      });
    };
    window.addEventListener("showToast", handleShowToast);
    return () => window.removeEventListener("showToast", handleShowToast);
  }, []);

  return (
    <Toast 
      isOpen={toast.isOpen} 
      onClose={() => setToast(prev => ({ ...prev, isOpen: false }))} 
      message={toast.message} 
      type={toast.type} 
    />
  );
}
