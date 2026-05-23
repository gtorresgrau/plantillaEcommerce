'use client';
// src/components/storefront/RecentlyViewed.jsx
import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock, Star } from 'lucide-react';

function MiniCard({ p }) {
  const precio = p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio);
  return (
    <Link href={`/productos/${p.cod_producto}`}
      className="card flex-shrink-0 w-40 flex flex-col group hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
        {p.foto1
          ? <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-contain p-1 group-hover:scale-105 transition-transform duration-200" sizes="160px" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        }
        {p.descuento > 0 && (
          <span className="absolute top-1 left-1 bg-brand-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{p.descuento}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-brand-text line-clamp-2 mb-1 flex-1">{p.titulo_de_producto}</p>
      {p.cantResenas > 0 && (
        <div className="flex items-center gap-0.5 mb-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={8}
              className={i <= Math.round(p.promedio) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
            />
          ))}
        </div>
      )}
      <p className="text-sm font-bold text-brand-primary">${precio?.toLocaleString('es-AR')}</p>
    </Link>
  );
}

export default function RecentlyViewed({ excludeId }) {
  const { items } = useRecentlyViewed();

  // Excluir el producto actual si se pasa
  const filtered = items.filter(p => p.cod_producto !== excludeId);

  if (filtered.length === 0) return null;

  return (
    <section className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-brand-text flex items-center gap-2 mb-4">
          <Clock size={18} className="text-brand-primary" />
          Vistos recientemente
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filtered.map(p => (
            <MiniCard key={p.cod_producto} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
