'use client';
// src/app/vendedor/productos/page.jsx — Gestión de productos del vendedor
// El vendedor solo ve sus propios productos (filtrado por vendedorId en el futuro)
// Por ahora, ve todos los productos activos y puede agregar nuevos.
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, RefreshCw, Package } from 'lucide-react';
import Swal from 'sweetalert2';

export default function VendedorProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [busqueda,  setBusqueda]  = useState('');

  const cargar = () => {
    setLoading(true);
    fetch('/api/productos?limit=50')
      .then(r => r.json())
      .then(d => { setProductos(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = productos.filter(p =>
    p.titulo_de_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cod_producto?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Mis productos</h1>
          <p className="text-sm text-brand-muted mt-1">{productos.length} productos en total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin text-brand-primary' : 'text-brand-muted'} />
          </button>
          <a href="/admin/productos" target="_blank"
            className="flex items-center gap-2 btn-primary px-4 py-2 text-sm">
            <Plus size={16} /> Ir a admin para agregar
          </a>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card text-center py-16">
          <Package size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-brand-muted">No hay productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map(p => {
            const precio = p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio);
            return (
              <div key={p._id} className="card hover:shadow-md transition-shadow">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {p.foto1 ? (
                    <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-cover" sizes="200px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {!p.activo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">Inactivo</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-brand-muted">{p.cod_producto}</p>
                <p className="text-sm font-medium text-brand-text line-clamp-2 mb-1">{p.titulo_de_producto}</p>
                <p className="text-base font-bold text-brand-primary">${precio?.toLocaleString('es-AR')}</p>
                <p className="text-xs text-brand-muted">Stock: {p.stock ?? '—'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
