'use client';
// src/components/storefront/CompareBar.jsx
// Barra flotante de comparación — aparece cuando hay ≥ 1 producto en comparación
import { useCompare } from '@/contexts/CompareContext';
import Image from 'next/image';
import Link from 'next/link';
import { X, GitCompare } from 'lucide-react';

export default function CompareBar() {
  const { items, remove, clear, count } = useCompare();

  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl border-t border-gray-200 animate-slide-in"
      style={{ backgroundColor: 'var(--color-card-bg, #fff)' }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-text shrink-0">
          <GitCompare size={16} className="text-brand-primary" />
          Comparar ({count}/3)
        </div>

        {/* Slots */}
        <div className="flex gap-3 flex-1 flex-wrap">
          {items.map(p => {
            const precio = p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio);
            return (
              <div key={p.cod_producto} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                {p.foto1 && (
                  <div className="relative w-8 h-8 rounded overflow-hidden bg-white border border-gray-100 shrink-0">
                    <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-contain" sizes="32px" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-brand-text line-clamp-1 max-w-[120px]">
                    {p.titulo_de_producto || p.nombre}
                  </p>
                  <p className="text-xs text-brand-primary font-bold">${precio?.toLocaleString('es-AR')}</p>
                </div>
                <button onClick={() => remove(p.cod_producto)} className="text-gray-300 hover:text-red-400 transition-colors ml-1 shrink-0">
                  <X size={12} />
                </button>
              </div>
            );
          })}

          {/* Slots vacíos */}
          {Array.from({ length: 3 - count }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center justify-center w-28 h-12 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-300">
              + Producto
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} className="text-xs text-brand-muted hover:text-brand-danger transition-colors">
            Limpiar
          </button>
          {count >= 2 && (
            <Link
              href={`/comparar?ids=${items.map(p => p.cod_producto).join(',')}`}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <GitCompare size={13} /> Comparar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
