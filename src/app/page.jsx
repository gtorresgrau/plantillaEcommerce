// src/app/page.jsx — Home público de la tienda
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import HeroSection from '@/components/storefront/HeroSection';
import ProductosDestacados from '@/components/storefront/ProductosDestacados';

async function getData() {
  await connectDB();
  const [branding, destacados] = await Promise.all([
    BrandingConfig.findOne({ activo: true }).lean(),
    Producto.find({ activo: true, visible: true, destacado: true }).limit(8).lean(),
  ]);
  return { branding, destacados };
}

export default async function HomePage() {
  const { branding, destacados } = await getData();
  const secciones = branding?.secciones || {};
  const textos    = branding?.textos    || {};

  return (
    <>
      <Navbar branding={branding} />
      <main>
        {/* Hero */}
        <HeroSection
          titulo={textos.textoBienvenida || 'Bienvenido a nuestra tienda'}
          subtitulo={textos.textoHero    || 'Los mejores productos al mejor precio'}
          ctaText={textos.textoCTA       || 'Ver productos'}
          logoUrl={branding?.logoUrl}
        />

        {/* Productos destacados */}
        {secciones.mostrarDestacados !== false && destacados.length > 0 && (
          <ProductosDestacados
            productos={destacados}
            textos={textos}
          />
        )}
      </main>
      <Footer branding={branding} />
    </>
  );
}
