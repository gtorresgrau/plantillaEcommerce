'use client';
// src/app/comparar/page.jsx — Tabla de comparación de productos
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import { useCompare } from '@/contexts/CompareContext';
import { ArrowLeft, ShoppingCart, Star, Check, X, GitCompare } from 'lucide-react';
import Swal from 'sweetalert2';

// Atributos a mostrar en la tabla de comparación
const ATRIBUTOS = [
  { key: 'precio_display', label: 'Precio' },
  { key: 'marca',          label: 'Marca' },
  { key: 'categoria',      label: 'Categoría' },
  { key: 'subcategoria',   label: 'Subcategoría' },
  { key: 'modelo',         label: 'Modelo' },
  { key: 'medidas',        label: 'Medidas' },
  { key: 'stock_display',  label: 'Stock' },
  { key: 'rating_display', label: 'Valoración' },
  { key: 'descuento',      label: 'Descuento' },
  { key: 'novedad',        label: 'Novedad' },
  { key: 'destacado',      label: 'Destacado' },
];

function getCellValue(producto, key) {
  switch (key) {
    case 'precio_display': {
      const p = producto.precioFinal ?? (producto.descuento > 0 ? Math.round(producto.precio * (1 - producto.descuento / 100)) : producto.precio);
      return `$${p?.toLocaleString('es-AR')}`;
    }
    case 'stock_display':
      return producto.stock > 0 ? `${producto.stock} unidades` : 'Sin stock';
    case 'rating_display':
      return producto.cantResenas > 0 ? `${producto.promedio?.toFixed(1)} (${producto.cantResenas} reseñas)` : '—';
    case 'descuento':
      return producto.descuento > 0 ? `${producto.descuento}%` : '—';
    case 'novedad':
    case 'destacado':
      return producto[key] ? '✓' : '—';
    default:
      return producto[key] || '—';
  }
}

function isHighlight(productos, key, idx) {
  // Resaltar el mejor valor para precio (más bajo) y stock (más alto)
  if (key === 'precio_display') {
    const precios = productos.map(p => p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio));
    return precios[idx] === Math.min(...precios);
  }
  if (key === 'stock_display') {
    const stocks = productos.map(p => p.stock || 0);
    return stocks[idx] === Math.max(...stocks);
  }
  if (key === 'rating_display') {
    const promedios = productos.map(p => p.promedio || 0);
    return promedios[idx] === Math.max(...promedios) && promedios[idx] > 0;
  }
  return false;
}

function ComparadorContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { addItem }  = useCart();
  const { clear }    = useCompare();

  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          ids.map(id => fetch(`/api/productos/${id}`).then(r => r.json()).then(d => d.data).catch(() => null))
        );
        setProductos(results.filter(Boolean));
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleAdd = (producto) => {
    const precioFinal = producto.precioFinal ?? (producto.descuento > 0 ? Math.round(producto.precio * (1 - producto.descuento / 100)) : producto.precio);
    addItem({ ...producto, precioFinal });
    Swal.fire({ icon: 'success', title: '¡Agregado!', timer: 1200, showConfirmButton: false, position: 'top-end', toast: true });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Link href="/productos" className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary transition-colors">
            <ArrowLeft size={14} /> Volver
          </Link>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <GitCompare size={22} className="text-brand-primary" />
            Comparador de productos
          </h1>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && ids.length < 2 && (
          <div className="card text-center py-16">
            <GitCompare size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-brand-muted mb-4">Necesitás al menos 2 productos para comparar.</p>
            <Link href="/productos" className="btn-primary inline-block px-6 py-2.5 text-sm">Ir al catálogo</Link>
          </div>
        )}

        {!loading && productos.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Headers con imagen */}
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase w-32 bg-gray-50 border-b border-gray-100">
                    Atributo
                  </th>
                  {productos.map(p => {
                    const precio = p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio);
                    return (
                      <th key={p.cod_producto} className="px-4 py-3 text-center bg-gray-50 border-b border-gray-100 min-w-[180px]">
                        {/* Imagen */}
                        <div className="relative w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden bg-white border border-gray-100">
                          {p.foto1
                            ? <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-contain p-1" sizes="80px" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          }
                        </div>
                        <Link href={`/productos/${p.cod_producto}`} className="text-xs font-semibold text-brand-text line-clamp-2 hover:text-brand-primary transition-colors block mb-2">
                          {p.titulo_de_producto}
                        </Link>
                        <button
                          onClick={() => handleAdd(p)}
                          disabled={p.stock === 0}
                          className="btn-primary text-[10px] px-3 py-1.5 flex items-center gap-1 mx-auto disabled:opacity-50"
                        >
                          <ShoppingCart size={10} /> {p.stock === 0 ? 'Sin stock' : 'Agregar'}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {ATRIBUTOS.map((attr, attrIdx) => (
                  <tr key={attr.key} className={attrIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 text-xs font-medium text-brand-muted border-r border-gray-100">
                      {attr.label}
                    </td>
                    {productos.map((p, pIdx) => {
                      const val     = getCellValue(p, attr.key);
                      const highlight = isHighlight(productos, attr.key, pIdx);
                      return (
                        <td key={p.cod_producto} className={`px-4 py-3 text-center text-sm border-r border-gray-100 last:border-r-0 ${highlight ? 'text-green-700 font-semibold bg-green-50/50' : 'text-brand-text'}`}>
                          {val === '✓' ? <Check size={14} className="mx-auto text-green-500" /> :
                           val === '—' ? <span className="text-gray-300">—</span> :
                           val}
                          {highlight && (
                            <span className="ml-1 text-[9px] text-green-600 font-bold">✓ mejor</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Descripción */}
                <tr className="bg-white border-t border-gray-200">
                  <td className="px-4 py-3 text-xs font-medium text-brand-muted border-r border-gray-100 align-top">Descripción</td>
                  {productos.map(p => (
                    <td key={p.cod_producto} className="px-4 py-3 text-xs text-brand-muted border-r border-gray-100 last:border-r-0 align-top">
                      {p.descripcion ? (
                        <p className="line-clamp-4">{p.descripcion}</p>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Botón limpiar comparación */}
        {productos.length >= 2 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => { clear(); router.push('/productos'); }}
              className="text-sm text-brand-muted hover:text-brand-danger transition-colors"
            >
              Limpiar comparación
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CompararPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ComparadorContent />
    </Suspense>
  );
}
