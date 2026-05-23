// src/components/storefront/TestimoniosSection.jsx
// Server Component — recibe testimonios desde BrandingConfig
import { Star } from 'lucide-react';

const TESTIMONIOS_DEFAULT = [
  {
    nombre:    'María García',
    texto:     'Excelente atención y productos de primera calidad. Llegó todo muy bien embalado y en tiempo récord.',
    estrellas: 5,
    avatar:    '',
    cargo:     'Cliente frecuente',
  },
  {
    nombre:    'Carlos Rodríguez',
    texto:     'Compré varias veces y siempre quedo satisfecho. Los precios son muy competitivos.',
    estrellas: 5,
    avatar:    '',
    cargo:     'Comprador verificado',
  },
  {
    nombre:    'Laura Martínez',
    texto:     'La tienda online es muy fácil de usar y el seguimiento del pedido en tiempo real es muy útil.',
    estrellas: 4,
    avatar:    '',
    cargo:     'Cliente nueva',
  },
];

function StarsDisplay({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < count ? 'var(--color-accent)' : 'none'}
          stroke={i < count ? 'var(--color-accent)' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

function Initials({ nombre }) {
  const parts = nombre.trim().split(' ');
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {initials}
    </div>
  );
}

export default function TestimoniosSection({ branding }) {
  const lista = branding?.testimonios?.filter(t => t.nombre && t.texto) || [];
  const testimonios = lista.length > 0 ? lista : TESTIMONIOS_DEFAULT;

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Opiniones reales de compradores verificados
          </p>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.slice(0, 3).map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-4 border"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
              }}
            >
              {/* Estrellas */}
              <StarsDisplay count={t.estrellas ?? 5} />

              {/* Texto */}
              <p className="text-sm leading-relaxed flex-1 italic" style={{ color: 'var(--color-text)' }}>
                &ldquo;{t.texto}&rdquo;
              </p>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-2 border-t"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                {t.avatar ? (
                  <img src={t.avatar} alt={t.nombre} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <Initials nombre={t.nombre} />
                )}
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t.nombre}</p>
                  {t.cargo && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.cargo}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
