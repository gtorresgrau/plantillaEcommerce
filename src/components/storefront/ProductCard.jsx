'use client';
// src/components/storefront/ProductCard.jsx
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ producto, textos }) {
  const precioFinal = producto.descuento > 0
    ? Math.round(producto.precio * (1 - producto.descuento / 100))
    : producto.precio;

  return (
    <Link href={`/productos/${producto.cod_producto}`}
      className="card group hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden rounded-brand bg-gray-100 mb-3">
        {producto.foto_1_1 ? (
          <Image
            src={producto.foto_1_1}
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
        {/* Badge destacado */}
        {producto.novedad && (
          <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Nuevo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        {producto.marca && (
          <p className="text-xs text-brand-muted mb-0.5">{producto.marca}</p>
        )}
        <p className="text-sm font-semibold text-brand-text line-clamp-2 mb-1 flex-1">
          {producto.titulo_de_producto || producto.nombre}
        </p>

        {/* Precio */}
        <div className="mt-auto">
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
