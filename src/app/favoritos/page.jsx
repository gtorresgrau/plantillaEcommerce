'use client';
// src/app/favoritos/page.jsx — Lista de productos favoritos del usuario
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react';
import Swal from 'sweetalert2';

function WishlistCard({ producto }) {
  const { remove }  = useWishlist();
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addItem({ ...producto, precioFinal: producto.precioFinal });
    Swal.fire({
      icon: 'success', title: '¡Agregado!',
      timer: 1200, showConfirmButton: false,
      position: 'top-end', toast: true,
    });
  };

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow">
      {/* Imagen */}
      <Link href={`/productos/${producto.cod_producto}`}>
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
          {producto.foto1 ? (
            <Image
              src={producto.foto1}
              alt={producto.titulo_de_producto}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}
          {producto.descuento > 0 && (
            <span className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{producto.descuento}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        {producto.marca && <p className="text-xs text-brand-muted mb-0.5">{producto.marca}</p>}
        <Link href={`/productos/${producto.cod_producto}`}>
          <p className="text-sm font-semibold text-brand-text line-clamp-2 mb-1 hover:text-brand-primary transition-colors">
            {producto.titulo_de_producto}
          </p>
        </Link>

        {/* Rating */}
        {producto.cantResenas > 0 && (
          <div className="flex items-center gap-1 mb-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10}
                className={i <= Math.round(producto.promedio)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-200 fill-gray-200'}
              />
            ))}
            <span className="text-[10px] text-brand-muted">{producto.promedio?.toFixed(1)}</span>
          </div>
        )}

        {/* Precio */}
        <div className="mt-auto pt-2">
          {producto.descuento > 0 && (
            <p className="text-xs text-brand-muted line-through">
              ${Number(producto.precio).toLocaleString('es-AR')}
            </p>
          )}
          <p className="text-lg font-bold text-brand-primary">
            ${Number(producto.precioFinal || producto.precio).toLocaleString('es-AR')}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAdd}
            className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5"
          >
            <ShoppingCart size={13} /> Agregar
          </button>
          <button
            onClick={() => remove(producto.cod_producto)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-brand-muted hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            title="Quitar de favoritos"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FavoritosPage() {
  const { items, clear, count } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
              <Heart size={22} className="text-red-500 fill-red-500" />
              Mis favoritos
            </h1>
            <p className="text-sm text-brand-muted mt-0.5">
              {count === 0 ? 'No hay productos guardados' : `${count} producto${count !== 1 ? 's' : ''} guardado${count !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/productos" className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary transition-colors">
              <ArrowLeft size={14} /> Ver catálogo
            </Link>
            {count > 0 && (
              <button
                onClick={() => clear()}
                className="text-sm text-brand-muted hover:text-red-500 transition-colors"
              >
                Limpiar lista
              </button>
            )}
          </div>
        </div>

        {/* Vacío */}
        {count === 0 ? (
          <div className="card text-center py-20">
            <Heart size={48} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-lg font-semibold text-brand-text mb-2">Todavía no guardaste favoritos</h2>
            <p className="text-sm text-brand-muted mb-6">
              Hacé clic en el corazón de cualquier producto para guardarlo aquí.
            </p>
            <Link href="/productos" className="btn-primary inline-block px-6 py-2.5 text-sm">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(p => (
              <WishlistCard key={p.cod_producto} producto={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
