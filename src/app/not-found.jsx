// src/app/not-found.jsx — Página 404 global con Navbar y Footer
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import NotFoundClient from './NotFoundClient';

export const metadata = {
  title: '404 — Página no encontrada',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">

        {/* Número grande decorativo */}
        <div className="relative mb-8 select-none">
          <span
            className="text-[10rem] font-extrabold leading-none"
            style={{ color: 'var(--color-primary)', opacity: 0.08 }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-3">
          Página no encontrada
        </h1>
        <p className="text-brand-muted text-lg mb-10 max-w-md">
          La página que buscás no existe, fue movida o está temporalmente no disponible.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-brand font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Home size={18} />
            Ir al inicio
          </Link>

          <Link
            href="/productos"
            className="flex items-center gap-2 px-6 py-3 rounded-brand font-semibold border transition-all hover:bg-brand-primary/5"
            style={{
              color:       'var(--color-primary)',
              borderColor: 'var(--color-primary)',
            }}
          >
            <Search size={18} />
            Ver productos
          </Link>
        </div>

        {/* Botón volver (client) */}
        <NotFoundClient />
      </div>

      <Footer />
    </div>
  );
}
