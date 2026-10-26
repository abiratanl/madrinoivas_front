export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-7 w-32 rounded bg-gray-100" />
            <div className="mt-3 h-3 w-40 rounded bg-gray-50" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-80 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="h-10 w-48 rounded bg-gray-100" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((__, row) => (
                <div key={row} className="h-10 rounded bg-gray-50" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
