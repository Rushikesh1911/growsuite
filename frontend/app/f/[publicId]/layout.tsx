"use client";

import { ReactNode } from "react";
import "../../globals.css";

export default function PublicFormLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent w-full">
      {children}
    </div>
  );
}
