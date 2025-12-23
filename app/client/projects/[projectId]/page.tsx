/**
 * Client Project Page
 * 
 * Main entry point for client-facing project view.
 * Shows project overview, deliverables, and review/approval flow.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ClientProjectView from './ClientProjectView';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params;
  
  return {
    title: 'Project Portal | AJ247 Studios',
    description: 'View and review your project deliverables',
  };
}

export default async function ClientProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  
  if (!projectId) {
    notFound();
  }
  
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ClientProjectView projectId={projectId} />
    </Suspense>
  );
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="animate-pulse mb-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
        
        {/* Deliverables grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-4/3 bg-slate-200 dark:bg-slate-800" />
              <div className="p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
