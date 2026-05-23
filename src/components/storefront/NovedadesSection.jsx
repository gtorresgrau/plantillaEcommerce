'use client';
// src/components/storefront/NovedadesSection.jsx
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

function NovedadCard({ producto }) {
  const { addItem } = useCart();
  const precio = producto.precioFinal ?? (
    producto.descuento > 0
      ? Math.round(producto.precio * (1 - producto.descuento / 100))
      : producto.precio
  );
  const sinStock = producto.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (sinStock) return;
    addItem({ ...producto, precioFinal: precio });
    Swal.fire({ icon: 'success', title: 'Agregado al carrito', timer: 1200, showConfirmButton: false, position: 'top-end', toast: true });
  };

  return (
    <Link
      href={`/productos/${producto.cod_producto}`}
      className="group flex-shrink-0 w-44 sm:w-52 flex flex-col rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-1"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {producto.foto1 ? (
          <Image
            src={producto.foto1}
            alt={producto.titulo_de_producto}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="208px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {/* Badge nuevo */}
        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          NUEVO
        </span>
        {producto.descuento > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            -{producto.descuento}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{producto.marca || producto.categoria}</p>
        <p className="text-xs font-medium line-clamp-2 flex-1" style={{ color: 'var(--color-text)' }}>
          {producto.titulo_de_producto}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              ${precio?.toLocaleString('es-AR')}
            </p>
            {producto.descuento > 0 && (
              <p className="text-[10px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                ${producto.precio?.toLocaleString('es-AR')}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={sinStock}
            className="p-1.5 rounded-lg transition-colors text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)' }}
            title="Agregar al carrito"
          >
            <ShoppingCart size={13} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function NovedadesSection({ productos = [], titulo = 'Novedades', subtitulo = 'Lo último que llegó' }) {
  if (!productos.length) return null;

  return (
    <section className="py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                {titulo}
              </h2>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{subtitulo}</p>
          </div>
          <Link
            href="/productos?novedad=true"
            className="text-sm font-medium hover:underline flex-shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver todos →
          </Link>
        </div>

        {/* Scroll horizontal */}
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent -mx-4 px-4">
          {productos.map(p => (
            <div key={p.cod_producto || p._id} className="snap-start">
              <NovedadCard producto={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
