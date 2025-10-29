"use client";

import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-lg">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10" />
              <div>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        <div className="p-8 mb-8 bg-white border border-gray-100 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-5 border border-gray-200 bg-white rounded-xl">
                <Skeleton className="h-8 w-8 mb-3" />
                <Skeleton className="h-4 w-40 mb-2" />
                <SkeletonText lines={2} />
                <div className="flex items-center justify-between mt-3">
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white border border-gray-100 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
