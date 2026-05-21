// src/app/page.jsx — Home público de la tienda
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import HeroSection from '@/components/storefront/HeroSection';
import ProductosDestacados from '@/components/storefront/ProductosDestacados';
import AboutSection from '@/components/storefront/AboutSection';
import FAQSection from '@/components/storefront/FAQSection';
import ContactSection from '@/components/storefront/ContactSection';
import WhatsAppButton from '@/components/storefront/WhatsAppButton';
import { PRODUCTOS_PRUEBA } from '@/data/productosDePrueba';

async function getData() {
  await connectDB();
  const [branding, config, destacados] = await Promise.all([
    BrandingConfig.findOne({ activo: true }).lean(),
    Configuracion.findOne({ activo: true }).lean(),
    Producto.find({ activo: true, visible: true, destacado: true }).limit(8).lean(),
  ]);

  // Fallback a productos de prueba si la BD está vacía
  const productosFinales = destacados.length > 0
    ? destacados
    : PRODUCTOS_PRUEBA
        .filter(p => p.activo && p.visible && p.destacado)
        .slice(0, 8)
        .map(p => ({
          ...p,
          precioFinal: p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio,
        }));

  return { branding, config, destacados: productosFinales };
}

export default async function HomePage() {
  const { branding, config, destacados } = await getData();
  const secciones = branding?.secciones || {};
  const textos    = branding?.textos    || {};

  return (
    <>
      <Navbar branding={branding} />

      <main>
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <HeroSection
          titulo={textos.textoBienvenida || 'Bienvenido a nuestra tienda'}
          subtitulo={textos.textoHero    || 'Los mejores productos al mejor precio'}
          ctaText={textos.textoCTA       || 'Ver productos'}
          heroBg={branding?.heroBg       || null}
        />

        {/* ── Productos destacados ─────────────────────────────────────── */}
        {secciones.mostrarDestacados !== false && destacados.length > 0 && (
          <div id="productos-destacados">
            <ProductosDestacados productos={destacados} textos={textos} />
          </div>
        )}

        {/* ── Sobre nosotros ───────────────────────────────────────────── */}
        {secciones.mostrarNosotros !== false && (
          <AboutSection branding={branding} />
        )}

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        {secciones.mostrarFAQ !== false && (
          <FAQSection />
        )}

        {/* ── Contacto ─────────────────────────────────────────────────── */}
        {secciones.mostrarContacto !== false && (
          <ContactSection config={config} />
        )}
      </main>

      <Footer branding={branding} config={config} />

      {/* ── Botón flotante WhatsApp ──────────────────────────────────── */}
      <WhatsAppButton
        numero={config?.whatsappVentas}
        codigoPais={config?.codigoPais || 54}
        mensaje={textos.mensajeWhatsApp || '¡Hola! Quiero consultar sobre un producto.'}
      />
    </>
  );
}
