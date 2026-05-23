// src/components/storefront/BannerSection.jsx
// Server Component (sin 'use client') — recibe branding del server
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BannerSection({ branding }) {
  const banner = branding?.banner || {};
  const titulo    = banner.titulo    || '¡Oferta especial!';
  const subtitulo = banner.subtitulo || 'Descubrí nuestras promociones exclusivas.';
  const ctaTexto  = banner.ctaTexto  || 'Ver ofertas';
  const ctaLink   = banner.ctaLink   || '/productos?descuento=1';
  const imagen    = banner.imagen    || null;
  const bgColor   = banner.bgColor   || null;

  const sectionStyle = imagen
    ? {
        backgroundImage: `url(${imagen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : bgColor
    ? { backgroundColor: bgColor }
    : { backgroundColor: 'var(--color-secondary)' };

  return (
    <section className="relative py-16 px-4 overflow-hidden" style={sectionStyle}>
      {/* Overlay oscuro si hay imagen */}
      {imagen && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* Decoración geométrica */}
      {!imagen && (
        <>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10 bg-white" />
        </>
      )}

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Label */}
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/70 mb-3 px-3 py-1 rounded-full border border-white/20">
          Promoción especial
        </span>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          {titulo}
        </h2>

        <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto">
          {subtitulo}
        </p>

        <Link
          href={ctaLink}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:gap-3 hover:shadow-lg"
          style={{ backgroundColor: 'var(--color-accent)', color: '#111' }}
        >
          {ctaTexto}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
