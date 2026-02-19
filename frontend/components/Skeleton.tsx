"use client";

// Enhanced Skeleton Animations
const skeletonStyles = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  .shimmer-effect {
    background: linear-gradient(
      90deg,
      rgba(226, 232, 240, 0.2) 0%,
      rgba(226, 232, 240, 0.4) 20%,
      rgba(226, 232, 240, 0.6) 40%,
      rgba(226, 232, 240, 0.4) 60%,
      rgba(226, 232, 240, 0.2) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
  }
  .pulse-glow {
    animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
`;

export function Skeleton({ className }: { className?: string }) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div 
        className={`relative overflow-hidden bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg shimmer-effect ${className}`}
        style={{ backgroundSize: '200% 100%' }}
      />
    </>
  );
}

// Modern Dashboard Skeleton with Cyan Theme
export function DashboardSkeleton() {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-12">
        {/* Header with Gradient */}
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="relative">
              <Skeleton className="h-10 w-56" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur" />
            </div>
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </div>

        {/* 3 Modern Stats Cards with Hover Effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="relative group bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 float-animation"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex gap-4">
                <div className="relative">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl blur-sm" />
                </div>
                <div className="space-y-2.5 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart Card with Gradient Border */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white p-8 rounded-2xl border border-slate-200/60 shadow-md h-96">
              <Skeleton className="h-7 w-40 mb-6" />
              <div className="relative h-full">
                <Skeleton className="h-full w-full rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg" />
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200/60 h-96">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/40 shadow-sm">
                  <Skeleton className="h-24 w-full mb-3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Modern History Detail Skeleton
export function HistorySkeleton() {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div className="max-w-7xl mx-auto space-y-10 p-6 md:p-12">
        {/* Header with Score Badge */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="relative">
              <Skeleton className="h-12 w-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg blur" />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg" />
            <div className="relative bg-white p-6 rounded-2xl border border-slate-200/60 shadow-md">
              <Skeleton className="h-24 w-32" />
            </div>
          </div>
        </div>

        {/* Two Column Essay Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Original Text */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-300/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-[500px] bg-white p-8 rounded-2xl border border-slate-200/60 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-3/4' : 'w-full'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Corrected Text */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-50" />
            <div className="relative h-[500px] bg-gradient-to-br from-cyan-50/50 to-blue-50/50 p-8 rounded-2xl border border-cyan-200/60 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className={`h-4 ${i % 4 === 0 ? 'w-2/3' : 'w-full'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Analysis Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-md">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/40">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}