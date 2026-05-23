// src/app/politicas/page.jsx — Página pública de políticas de la tienda
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import BrandingConfig from '@/models/BrandingConfig';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import Link from 'next/link';
import { FileText, Shield, RotateCcw, ChevronRight } from 'lucide-react';

export const revalidate = 3600; // Revalidar cada hora

async function getPoliticas() {
  try {
    await connectDB();
    const [cfg, branding] = await Promise.all([
      Configuracion.findOne({ activo: true }).lean(),
      BrandingConfig.findOne({ activo: true }).lean(),
    ]);
    return {
      politicas: cfg?.politicas || {},
      nombreTienda: branding?.nombreTienda || cfg?.nombreTienda || 'Mi Tienda',
    };
  } catch {
    return { politicas: {}, nombreTienda: 'Mi Tienda' };
  }
}

const SECCIONES = [
  {
    id: 'privacidad',
    titulo: 'Política de Privacidad',
    icon: Shield,
    descripcionDefault: 'Esta tienda recopila datos personales únicamente para procesar pedidos y mejorar la experiencia de compra. Los datos no son compartidos con terceros sin consentimiento.',
  },
  {
    id: 'terminos',
    titulo: 'Términos y Condiciones',
    icon: FileText,
    descripcionDefault: 'Al realizar una compra en esta tienda, aceptás nuestros términos de servicio. Los precios pueden variar sin previo aviso. Las compras están sujetas a disponibilidad de stock.',
  },
  {
    id: 'devolucion',
    titulo: 'Política de Devoluciones',
    icon: RotateCcw,
    descripcionDefault: 'Aceptamos devoluciones dentro de los 30 días de recibido el producto, siempre que esté en su estado original y con el embalaje intacto. Contactanos para iniciar el proceso.',
  },
];

export default async function PoliticasPage() {
  const { politicas, nombreTienda } = await getPoliticas();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-muted mb-8">
          <Link href="/" className="hover:text-brand-primary transition-colors">Inicio</Link>
          <ChevronRight size={14} />
          <span className="text-brand-text">Políticas</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-brand-text mb-2">Políticas de {nombreTienda}</h1>
          <p className="text-brand-muted">
            Conocé nuestras políticas de privacidad, términos de uso y devoluciones.
          </p>
        </div>

        {/* Índice rápido */}
        <div className="card mb-8 p-5">
          <p className="text-sm font-semibold text-brand-text mb-3">Secciones</p>
          <div className="space-y-2">
            {SECCIONES.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
              >
                <s.icon size={14} />
                {s.titulo}
              </a>
            ))}
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-10">
          {SECCIONES.map(({ id, titulo, icon: Icon, descripcionDefault }) => {
            const texto = politicas[id] || descripcionDefault;
            return (
              <section key={id} id={id} className="scroll-mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-brand-text">{titulo}</h2>
                </div>
                <div className="card p-6">
                  <div className="text-brand-muted text-sm leading-relaxed whitespace-pre-line">
                    {texto}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA contacto */}
        <div className="mt-12 text-center">
          <p className="text-brand-muted text-sm mb-3">
            ¿Tenés alguna pregunta sobre nuestras políticas?
          </p>
          <Link href="/contacto" className="btn-primary inline-flex items-center gap-2">
            Contactanos
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
