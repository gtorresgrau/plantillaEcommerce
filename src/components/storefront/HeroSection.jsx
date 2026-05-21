'use client';
// src/components/storefront/HeroSection.jsx
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function HeroSection({ titulo, subtitulo, ctaText, heroBg }) {
  const scrollToProductos = (e) => {
    e.preventDefault();
    const el = document.getElementById('productos-destacados');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = '/productos';
  };

  return (
    <section
      className="relative py-28 md:py-36 px-4 overflow-hidden flex items-center justify-center"
      style={{
        background: heroBg
          ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${heroBg}) center/cover no-repeat`
          : 'var(--color-primary)',
      }}
    >
      {/* Overlay decorativo cuando no hay imagen */}
      {!heroBg && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
          </div>
        </>
      )}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 leading-tight"
        >
          {titulo}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {subtitulo}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/productos"
            className="px-8 py-3.5 rounded-brand bg-brand-accent text-white font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-black/20"
          >
            {ctaText || 'Ver productos'}
          </Link>

          <a
            href="#nosotros"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 rounded-brand border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-all"
          >
            Conocer más
          </a>
        </motion.div>
      </div>

      {/* Indicador scroll suave */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={scrollToProductos}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white/90 transition-colors animate-bounce"
        aria-label="Desplazarse hacia abajo"
      >
        <ArrowDown size={24} />
      </motion.button>
    </section>
  );
}
