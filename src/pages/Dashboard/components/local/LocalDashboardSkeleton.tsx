export function LocalDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando dashboard da loja">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-80 rounded-2xl border border-gray-100 bg-white p-6">
            <div className="h-11 w-11 rounded-xl bg-gray-100" />
            <div className="mt-5 h-8 w-40 rounded bg-gray-100" />
            <div className="mt-3 h-3 w-56 rounded bg-gray-50" />
            <div className="mt-6 h-2.5 w-full rounded-full bg-gray-100" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((__, item) => (
                <div key={item} className="h-16 rounded-xl bg-gray-50" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="h-96 rounded-2xl border border-gray-100 bg-white p-6">
        <div className="h-11 w-11 rounded-xl bg-gray-100" />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-64 rounded-xl bg-gray-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
