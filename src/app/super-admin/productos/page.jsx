'use client';
// src/app/super-admin/productos/page.jsx — Vista global de productos
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Search, RefreshCw, Star, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function SuperAdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  const cargar = (p = 1, q = search) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: LIMIT, admin: 'true' });
    if (q) params.set('q', q);
    fetch(`/api/productos?${params}`)
      .then(r => r.json())
      .then(d => {
        setProductos(d.data || []);
        setTotal(d.total || 0);
        setPage(p);
      })
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-purple-400" />
            Todos los productos
          </h1>
          <p className="text-gray-400 mt-1">{total} productos en el sistema</p>
        </div>
        <button onClick={() => cargar(1)} className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 flex gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cargar(1, search)}
            placeholder="Buscar por nombre, código o categoría..."
            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-500"
          />
        </div>
        <button onClick={() => cargar(1, search)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
          Buscar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Categoría</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Precio</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Stock</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Flags</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {productos.map(p => {
                const precio = p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio;
                return (
                  <tr key={p._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          {p.foto1
                            ? <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-cover" sizes="40px" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-200 line-clamp-1">{p.titulo_de_producto}</p>
                          <p className="text-xs text-gray-500 font-mono">{p.cod_producto}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{p.categoria}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-white">${precio?.toLocaleString('es-AR')}</p>
                      {p.descuento > 0 && (
                        <p className="text-xs text-gray-500 line-through">${p.precio?.toLocaleString('es-AR')}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`text-xs font-medium ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.destacado && <span title="Destacado"><Star size={12} className="text-yellow-400" fill="#FBBF24" /></span>}
                        {p.novedad   && <span title="Novedad"><Sparkles size={12} className="text-blue-400" /></span>}
                        {p.descuento > 0 && <span className="text-[10px] font-bold text-orange-400">-{p.descuento}%</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.activo && p.visible
                        ? <Eye size={14} className="text-green-400 mx-auto" title="Visible" />
                        : <EyeOff size={14} className="text-gray-600 mx-auto" title="Oculto" />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => cargar(page - 1)} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-40 hover:bg-gray-800 transition-colors">
            ← Anterior
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-400">{page} / {totalPages}</span>
          <button onClick={() => cargar(page + 1)} disabled={page >= totalPages}
            className="px-3 py-1.5 border border-gray-700 rounded-lg text-sm text-gray-400 disabled:opacity-40 hover:bg-gray-800 transition-colors">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
