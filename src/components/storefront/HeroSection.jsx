'use client';
// src/components/storefront/HeroSection.jsx
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection({ titulo, subtitulo, ctaText, logoUrl }) {
  return (
    <section className="relative bg-brand-primary py-20 px-4 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/20 skew-x-12 transform origin-top-right" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-4"
        >
          {titulo}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
        >
          {subtitulo}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/productos"
            className="inline-block px-8 py-3 rounded-brand bg-brand-accent text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            {ctaText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
