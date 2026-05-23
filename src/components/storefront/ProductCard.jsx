'use client';
// src/components/storefront/ProductCard.jsx
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart, GitCompare } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare }  from '@/contexts/CompareContext';

// ─── Mini componente de estrellas (readonly, compacto) ────────────────────────
function MiniStars({ promedio = 0, cant = 0 }) {
  if (!cant) return null;
  const llenas  = Math.floor(promedio);
  const media   = promedio - llenas >= 0.5;
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={10}
            className={
              i <= llenas
                ? 'text-yellow-400 fill-yellow-400'
                : i === llenas + 1 && media
                  ? 'text-yellow-400 fill-yellow-200'
                  : 'text-gray-200 fill-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-[10px] text-brand-muted">
        {promedio.toFixed(1)} <span className="opacity-60">({cant})</span>
      </span>
    </div>
  );
}

export default function ProductCard({ producto, textos }) {
  const { toggle, has }                       = useWishlist();
  const { toggle: compareToggle, has: compareHas, isFull } = useCompare();
  const enFavoritos  = has(producto.cod_producto);
  const enComparador = compareHas(producto.cod_producto);

  const precioFinal = producto.descuento > 0
    ? Math.round(producto.precio * (1 - producto.descuento / 100))
    : producto.precio;

  return (
    <Link href={`/productos/${producto.cod_producto}`}
      className="card group hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden rounded-brand bg-gray-100 mb-3">
        {producto.foto1 ? (
          <Image
            src={producto.foto1}
            alt={producto.nombre}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-brand-muted">
            <ShoppingCart size={32} className="opacity-30" />
          </div>
        )}
        {/* Badge descuento */}
        {producto.descuento > 0 && (
          <span className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{producto.descuento}%
          </span>
        )}
        {/* Badge novedad */}
        {producto.novedad && (
          <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}
        {/* Botones de favorito + comparar */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <button
            onClick={(e) => { e.preventDefault(); toggle(producto); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
              ${enFavoritos
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 text-gray-400 hover:text-red-400 hover:bg-white'
              }`}
            title={enFavoritos ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={11} className={enFavoritos ? 'fill-white' : ''} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); if (!isFull || enComparador) compareToggle(producto); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
              ${enComparador
                ? 'bg-brand-primary text-white scale-110'
                : isFull
                  ? 'bg-white/60 text-gray-300 cursor-not-allowed'
                  : 'bg-white/90 text-gray-400 hover:text-brand-primary hover:bg-white'
              }`}
            title={enComparador ? 'Quitar del comparador' : isFull ? 'Máximo 3 productos' : 'Agregar al comparador'}
          >
            <GitCompare size={11} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        {producto.marca && (
          <p className="text-xs text-brand-muted mb-0.5">{producto.marca}</p>
        )}
        <p className="text-sm font-semibold text-brand-text line-clamp-2 mb-1 flex-1">
          {producto.titulo_de_producto || producto.nombre}
        </p>

        {/* Rating */}
        <MiniStars promedio={producto.promedio || 0} cant={producto.cantResenas || 0} />

        {/* Precio */}
        <div className="mt-2">
          {producto.descuento > 0 && (
            <p className="text-xs text-brand-muted line-through">
              ${Number(producto.precio).toLocaleString('es-AR')}
            </p>
          )}
          <p className="text-lg font-bold text-brand-primary">
            ${precioFinal.toLocaleString('es-AR')}
            {producto.usd && <span className="text-xs text-brand-muted ml-1">USD</span>}
          </p>
        </div>

        {/* Sin stock */}
        {producto.sinStock && (
          <p className="text-xs text-brand-danger font-medium mt-1">Sin stock</p>
        )}
      </div>
    </Link>
  );
}
