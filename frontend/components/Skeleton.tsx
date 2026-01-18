export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
  );
}

// Skeleton riêng cho Dashboard (Giả lập 3 card + Chart + List)
export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-12 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[1, 2, 3].map((i) => (
             <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex gap-4">
                 <Skeleton className="h-12 w-12 rounded-xl" />
                 <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-20" />
                     <Skeleton className="h-8 w-16" />
                 </div>
             </div>
         ))}
      </div>

      {/* Main Grid: Chart + AI Path */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl h-80">
              <Skeleton className="h-6 w-32 mb-6" />
              <Skeleton className="h-full w-full rounded-xl" />
          </div>
          <div className="bg-slate-900/5 p-6 rounded-2xl h-80">
               <Skeleton className="h-6 w-32 mb-6" />
               <div className="space-y-4">
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-10 w-full" />
               </div>
          </div>
      </div>
    </div>
  );
}

// Skeleton riêng cho History Detail (Giả lập bài văn 2 cột)
export function HistorySkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 p-6 md:p-12">
            {/* Header */}
            <div className="flex justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-20 w-32 rounded-xl" />
            </div>

            {/* 2 Cột Essay */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="h-96 bg-white p-6 rounded-2xl border border-slate-100">
                     <Skeleton className="h-6 w-40 mb-4" />
                     <div className="space-y-3">
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-4 w-full" />
                     </div>
                </div>
                <div className="h-96 bg-slate-900/5 p-6 rounded-2xl">
                     <Skeleton className="h-6 w-40 mb-4" />
                     <div className="space-y-3">
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                     </div>
                </div>
            </div>
        </div>
    )
}