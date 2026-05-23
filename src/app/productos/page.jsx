'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, ShoppingCart, Star } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

// ── ProductCard inline ────────────────────────────────────────────────────────
function ProductCard({ producto }) {
  const { addItem } = useCart();
  const precioFinal = producto.precioFinal ?? (producto.descuento > 0
    ? Math.round(producto.precio * (1 - producto.descuento / 100))
    : producto.precio);
  const sinStock = producto.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (sinStock) return;
    addItem({ ...producto, precioFinal });
    Swal.fire({ icon: 'success', title: 'Agregado al carrito', timer: 1200, showConfirmButton: false, position: 'top-end', toast: true });
  };

  return (
    <Link href={`/productos/${producto.cod_producto}`} className="card group hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
        {producto.foto1 ? (
          <Image
            src={producto.foto1}
            alt={producto.titulo_de_producto}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
        )}
        {producto.descuento > 0 && (
          <span className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{producto.descuento}%
          </span>
        )}
        {producto.novedad && (
          <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}
        {sinStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-500">Sin stock</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <p className="text-xs text-brand-muted mb-1">{producto.marca || producto.categoria}</p>
        <h3 className="text-sm font-medium text-brand-text line-clamp-2 flex-1">{producto.titulo_de_producto}</h3>

        {/* Rating */}
        {producto.cantResenas > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={9}
                  className={i <= Math.round(producto.promedio)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-[10px] text-brand-muted">{producto.promedio?.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-brand-text">${precioFinal.toLocaleString('es-AR')}</span>
          {producto.descuento > 0 && (
            <span className="text-xs text-brand-muted line-through">${producto.precio.toLocaleString('es-AR')}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={sinStock}
          className="mt-3 btn-primary py-1.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {sinStock ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </Link>
  );
}

// ── Componente de filtros ─────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-sm font-semibold text-brand-text mb-2">
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtros dinámicos desde la DB
  const [categoriasList, setCategoriasList] = useState([]);
  const [marcasList,     setMarcasList]     = useState([]);

  // Filtros locales
  const [busqueda,  setBusqueda]  = useState(searchParams.get('q') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [marca,     setMarca]     = useState(searchParams.get('marca') || '');
  const [ordenar,   setOrdenar]   = useState(searchParams.get('ordenar') || 'reciente');
  const [soloDesc,  setSoloDesc]  = useState(searchParams.get('descuento') === '1');
  const [soloStock, setSoloStock] = useState(searchParams.get('stock') === '1');
  const [precioMin, setPrecioMin] = useState(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState(searchParams.get('precioMax') || '');

  const LIMIT = 12;

  const fetchProductos = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pg);
      params.set('limit', LIMIT);
      if (busqueda)  params.set('busqueda', busqueda);
      if (categoria) params.set('categoria', categoria);
      if (marca)     params.set('marca', marca);
      if (ordenar)   params.set('ordenar', ordenar);
      if (soloDesc)  params.set('descuento', '1');
      if (soloStock) params.set('stock', '1');
      if (precioMin) params.set('precioMin', precioMin);
      if (precioMax) params.set('precioMax', precioMax);

      const res = await fetch(`/api/productos?${params}`);
      const data = await res.json();
      setProductos(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [busqueda, categoria, marca, ordenar, soloDesc, soloStock, precioMin, precioMax]);

  // Cargar categorías y marcas disponibles al montar
  useEffect(() => {
    fetch('/api/productos/filtros')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setCategoriasList(data.categorias || []);
          setMarcasList(data.marcas || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProductos(1);
  }, [fetchProductos]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchProductos(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setBusqueda(''); setCategoria(''); setMarca(''); setOrdenar('reciente');
    setSoloDesc(false); setSoloStock(false); setPrecioMin(''); setPrecioMax('');
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = busqueda || categoria || marca || soloDesc || soloStock || precioMin || precioMax;

  const Sidebar = () => (
    <aside className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-text">Filtros</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-brand-primary hover:underline flex items-center gap-1">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {categoriasList.length > 0 && (
        <FilterSection title="Categoría">
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {categoriasList.map(cat => (
              <label key={cat} className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                <input type="radio" name="categoria" value={cat} checked={categoria === cat} onChange={() => setCategoria(cat === categoria ? '' : cat)} className="accent-brand-primary" />
                {cat}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {marcasList.length > 0 && (
        <FilterSection title="Marca">
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {marcasList.map(m => (
              <label key={m} className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                <input type="radio" name="marca" value={m} checked={marca === m} onChange={() => setMarca(m === marca ? '' : m)} className="accent-brand-primary" />
                {m}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Precio">
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Mín" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary" />
          <span className="text-brand-muted">—</span>
          <input type="number" placeholder="Máx" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary" />
        </div>
      </FilterSection>

      <FilterSection title="Otros" defaultOpen={false}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
            <input type="checkbox" checked={soloDesc} onChange={e => setSoloDesc(e.target.checked)} className="accent-brand-primary" />
            Solo con descuento
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
            <input type="checkbox" checked={soloStock} onChange={e => setSoloStock(e.target.checked)} className="accent-brand-primary" />
            Solo con stock
          </label>
        </div>
      </FilterSection>
    </aside>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Productos</h1>
            <p className="text-sm text-brand-muted">{total} resultado{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 flex gap-3 sm:justify-end flex-wrap">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
              />
            </div>
            {/* Ordenar */}
            <select value={ordenar} onChange={e => setOrdenar(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white">
              <option value="reciente">Más recientes</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre_asc">Nombre A-Z</option>
              <option value="rating">Mejor valorados</option>
            </select>
            {/* Toggle sidebar mobile */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sm:hidden flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text bg-white">
              <SlidersHorizontal size={15} /> Filtros
            </button>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {busqueda && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                Búsqueda: {busqueda}
                <button onClick={() => setBusqueda('')}><X size={10} /></button>
              </span>
            )}
            {categoria && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                {categoria}
                <button onClick={() => setCategoria('')}><X size={10} /></button>
              </span>
            )}
            {marca && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                {marca}
                <button onClick={() => setMarca('')}><X size={10} /></button>
              </span>
            )}
            {(precioMin || precioMax) && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                Precio: {precioMin ? `$${precioMin}` : ''}{precioMin && precioMax ? ' — ' : ''}{precioMax ? `$${precioMax}` : ''}
                <button onClick={() => { setPrecioMin(''); setPrecioMax(''); }}><X size={10} /></button>
              </span>
            )}
            {soloDesc && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                Con descuento
                <button onClick={() => setSoloDesc(false)}><X size={10} /></button>
              </span>
            )}
            {soloStock && (
              <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
                Con stock
                <button onClick={() => setSoloStock(false)}><X size={10} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-brand-muted hover:text-brand-danger underline">
              Limpiar todos
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <div className="hidden sm:block w-56 flex-shrink-0">
            <div className="card sticky top-20"><Sidebar /></div>
          </div>

          {/* Sidebar mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 sm:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
                <button onClick={() => setSidebarOpen(false)} className="mb-4 text-brand-muted"><X size={20} /></button>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2 mt-2" />
                  </div>
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-brand-muted">No se encontraron productos con esos filtros.</p>
                <button onClick={clearFilters} className="mt-4 btn-secondary text-sm">Limpiar filtros</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productos.map(p => <ProductCard key={p.cod_producto || p._id} producto={p} />)}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-brand-text disabled:opacity-40 hover:bg-gray-50">
                      ← Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => handlePageChange(p)}
                        className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${p === page ? 'bg-brand-primary text-white border-brand-primary' : 'border-gray-200 text-brand-text hover:bg-gray-50'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-brand-text disabled:opacity-40 hover:bg-gray-50">
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" /></div>}>
      <ProductosContent />
    </Suspense>
  );
}
