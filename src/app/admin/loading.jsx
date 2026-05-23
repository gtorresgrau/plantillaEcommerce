// src/app/admin/loading.jsx — Skeleton para el dashboard admin mientras cargan los datos del servidor
export default function AdminLoading() {
  return (
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse mb-3" />
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1.5" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Ingresos skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-9 w-40 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Estado pedidos skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card text-center py-4">
            <div className="h-7 w-10 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* Últimos pedidos skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="space-y-1">
                  <div className="h-3.5 w-36 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bajo stock skeleton */}
        <div className="card">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-8 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
