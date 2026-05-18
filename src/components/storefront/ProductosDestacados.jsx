'use client';
// src/components/storefront/ProductosDestacados.jsx
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function ProductosDestacados({ productos, textos }) {
  return (
    <section className="py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">
          Productos destacados
        </h2>
        <p className="text-brand-muted mb-8">Los más vendidos y mejor valorados</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <ProductCard key={p.cod_producto} producto={p} textos={textos} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/productos" className="btn-secondary px-8 py-3 text-sm font-semibold">
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  );
}
