'use client';
// src/components/storefront/AboutSection.jsx
import { ShieldCheck, Truck, HeartHandshake, Star } from 'lucide-react';

const FEATURES_DEFAULT = [
  {
    icon: ShieldCheck,
    titulo: 'Compra segura',
    desc: 'Transacciones protegidas con los más altos estándares de seguridad.',
  },
  {
    icon: Truck,
    titulo: 'Envíos a todo el país',
    desc: 'Despachamos a todo Argentina con seguimiento en tiempo real.',
  },
  {
    icon: HeartHandshake,
    titulo: 'Atención personalizada',
    desc: 'Nuestro equipo está disponible para ayudarte en cada paso.',
  },
  {
    icon: Star,
    titulo: 'Calidad garantizada',
    desc: 'Todos nuestros productos pasan por un riguroso control de calidad.',
  },
];

export default function AboutSection({ branding }) {
  const titulo  = branding?.textos?.textoNosotros      || 'Sobre nosotros';
  const desc    = branding?.textos?.descripcionNosotros || 'Somos una tienda comprometida con brindar los mejores productos y la mejor experiencia de compra online. Cada pedido es preparado con dedicación para que llegue a vos en perfectas condiciones.';

  return (
    <section id="nosotros" className="py-16 px-4 bg-brand-surface">
      <div className="max-w-6xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-primary uppercase tracking-wide mb-4">
            {titulo}
          </h2>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DEFAULT.map(({ icon: Icon, titulo, desc }) => (
            <div
              key={titulo}
              className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-white"
            >
              <div className="p-3 rounded-xl bg-brand-primary/10 mb-4">
                <Icon className="w-7 h-7 text-brand-primary" />
              </div>
              <h3 className="font-bold text-brand-text mb-2">{titulo}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
