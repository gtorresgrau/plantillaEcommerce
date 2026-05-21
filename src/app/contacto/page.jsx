// src/app/contacto/page.jsx — Página de contacto (Server Component)
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import BrandingConfig from '@/models/BrandingConfig';
import ContactSection from '@/components/storefront/ContactSection';

export const metadata = {
  title: 'Contacto',
  description: 'Contactate con nosotros para consultas, pedidos y más.',
};

async function getData() {
  await connectDB();
  const [branding, config] = await Promise.all([
    BrandingConfig.findOne({ activo: true }).lean(),
    Configuracion.findOne({ activo: true }).lean(),
  ]);
  return { branding, config };
}

export default async function ContactoPage() {
  const { branding, config } = await getData();

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar branding={branding} />
      <main className="flex-1">
        <ContactSection config={config} />
      </main>
      <Footer branding={branding} />
    </div>
  );
}
