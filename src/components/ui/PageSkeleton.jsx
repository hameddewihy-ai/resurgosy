function Bone({ className = '' }) {
  return (
    <div className={`bg-navy/8 rounded-xl animate-pulse ${className}`} />
  );
}

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-cream" aria-hidden="true">
      {/* Hero bar */}
      <div className="h-64 bg-navy/12 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Title block */}
        <div className="space-y-3 max-w-md">
          <Bone className="h-4 w-24" />
          <Bone className="h-8 w-80" />
          <Bone className="h-4 w-56" />
        </div>

        {/* Card grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-navy/8 overflow-hidden">
              <Bone className="h-44 rounded-none" />
              <div className="p-5 space-y-3">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-2/3" />
                <div className="flex gap-2 pt-1">
                  <Bone className="h-6 w-16 rounded-full" />
                  <Bone className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
