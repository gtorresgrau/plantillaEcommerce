'use client';
// src/components/storefront/CategoriasSection.jsx
import Link from 'next/link';
import Image from 'next/image';

// Íconos emoji por defecto para categorías comunes
const EMOJI_MAP = {
  'ropa':        '👕', 'indumentaria': '👔', 'calzado':    '👟',
  'electrónica': '📱', 'tecnología':   '💻', 'computacion':'🖥️',
  'hogar':       '🏠', 'muebles':      '🛋️', 'decoracion': '🪴',
  'alimentos':   '🛒', 'bebidas':      '🥤', 'comida':     '🍽️',
  'deportes':    '⚽',  'fitness':      '🏋️', 'outdoor':    '🏕️',
  'juguetes':    '🧸', 'juegos':       '🎮', 'kids':       '👶',
  'belleza':     '💄', 'cosmética':    '✨', 'cuidado':    '🧴',
  'libros':      '📚', 'música':       '🎵', 'arte':       '🎨',
  'mascotas':    '🐾', 'automotor':    '🚗', 'herramientas':'🔧',
};

function getEmoji(cat) {
  const lower = cat.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🏷️';
}

export default function CategoriasSection({ categorias = [] }) {
  if (!categorias.length) return null;

  return (
    <section className="py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Explorá por categoría
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Encontrá lo que buscás más rápido
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categorias.map((cat) => (
            <Link
              key={cat.nombre}
              href={`/productos?categoria=${encodeURIComponent(cat.nombre)}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)',
              }}
            >
              {cat.imagen ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                  <Image src={cat.imagen} alt={cat.nombre} fill className="object-cover" sizes="56px" />
                </div>
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  {getEmoji(cat.nombre)}
                </div>
              )}
              <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--color-text)' }}>
                {cat.nombre}
              </span>
              {cat.cantidad > 0 && (
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
