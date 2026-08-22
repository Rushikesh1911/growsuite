import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--gs-border)] rounded-[6px]",
        className
      )}
      {...props}
    />
  );
}

// Table / Directory View Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full pt-8 pb-12 animate-fade">
      {/* Header controls skeleton */}
      <div className="flex justify-between items-center w-full mb-2">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      
      {/* Table block skeleton */}
      <div className="flex flex-col border border-[var(--gs-border)] rounded-[10px] overflow-hidden bg-[var(--gs-surface)]">
        {/* Table Head */}
        <div className="h-10 border-b border-[var(--gs-border)] bg-[var(--gs-bg-alt)] flex items-center px-4 gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {/* Table Rows */}
        <div className="flex flex-col divide-y divide-[var(--gs-border)]">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-16 flex items-center px-4 gap-4">
              <Skeleton className="h-4 w-1/4 opacity-70" />
              <Skeleton className="h-4 w-1/4 opacity-70" />
              <Skeleton className="h-4 w-1/4 opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Kanban Board Skeleton (Projects, Pipeline)
export function BoardSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-6 overflow-x-auto w-full pt-8 pb-12 animate-fade">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="w-[300px] shrink-0 flex flex-col gap-4">
          <Skeleton className="h-8 w-1/2 rounded-[6px]" />
          <div className="h-32 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-4 flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4 opacity-80" />
            <Skeleton className="h-3 w-1/2 opacity-50" />
            <div className="mt-auto flex justify-between items-center">
              <Skeleton className="h-5 w-16 rounded-[4px] opacity-60" />
              <Skeleton className="h-6 w-6 rounded-full opacity-60" />
            </div>
          </div>
          <div className="h-32 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-4 flex flex-col gap-3 opacity-70">
            <Skeleton className="h-4 w-3/4 opacity-80" />
            <Skeleton className="h-3 w-1/2 opacity-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings / Form Skeleton (Profile, Workspace)
export function FormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pt-8 pb-12 animate-fade">
      <div className="flex flex-col gap-2 border-b border-[var(--gs-border)] pb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 opacity-60" />
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="h-32 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] flex items-center p-6 gap-6">
           <Skeleton className="h-20 w-20 rounded-full" />
           <div className="flex flex-col gap-2 flex-1">
             <Skeleton className="h-5 w-48" />
             <Skeleton className="h-4 w-64 opacity-50" />
           </div>
        </div>
        
        <div className="h-64 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-6 flex flex-col gap-6">
           <Skeleton className="h-5 w-48" />
           <div className="grid gap-4">
             <Skeleton className="h-10 w-full opacity-70" />
             <Skeleton className="h-10 w-full opacity-70" />
           </div>
           <div className="mt-auto flex justify-end">
             <Skeleton className="h-9 w-32" />
           </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard / Overview Skeleton
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full pt-8 pb-12 animate-fade">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 opacity-70" />
              <Skeleton className="h-6 w-6 rounded-[6px]" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-5 flex flex-col gap-4">
           <Skeleton className="h-5 w-48 opacity-80" />
           <div className="flex-1 flex items-end gap-2 pt-8">
             {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className={`w-full rounded-t-[4px] ${i % 3 === 0 ? 'h-full' : i % 2 === 0 ? 'h-1/2' : 'h-3/4'}`} />
             ))}
           </div>
        </div>
        <div className="lg:col-span-1 h-80 bg-[var(--gs-surface)] border border-[var(--gs-border)] rounded-[10px] p-5 flex flex-col gap-4">
           <Skeleton className="h-5 w-48 opacity-80" />
           <div className="flex flex-col gap-4 mt-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2 opacity-50" />
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
