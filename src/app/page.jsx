// src/app/page.jsx — Home público de la tienda
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import HeroSection from '@/components/storefront/HeroSection';
import ProductosDestacados from '@/components/storefront/ProductosDestacados';
import CategoriasSection from '@/components/storefront/CategoriasSection';
import NovedadesSection from '@/components/storefront/NovedadesSection';
import BannerSection from '@/components/storefront/BannerSection';
import TestimoniosSection from '@/components/storefront/TestimoniosSection';
import AboutSection from '@/components/storefront/AboutSection';
import FAQSection from '@/components/storefront/FAQSection';
import ContactSection from '@/components/storefront/ContactSection';
import NewsletterSection from '@/components/storefront/NewsletterSection';
import WhatsAppButton from '@/components/storefront/WhatsAppButton';
import { PRODUCTOS_PRUEBA } from '@/data/productosDePrueba';

async function getData() {
  await connectDB();

  const [branding, config, destacados, novedades, catAggregate] = await Promise.all([
    BrandingConfig.findOne({ activo: true }).lean(),
    Configuracion.findOne({ activo: true }).lean(),
    Producto.find({ activo: true, visible: true, destacado: true }).limit(8).lean(),
    Producto.find({ activo: true, visible: true, novedad: true  }).limit(12).lean(),
    Producto.aggregate([
      { $match: { activo: true, visible: true, categoria: { $exists: true, $ne: '' } } },
      { $group: { _id: '$categoria', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
    ]),
  ]);

  // Fallback a productos de prueba si la BD está vacía
  const productosPrueba = PRODUCTOS_PRUEBA.map(p => ({
    ...p,
    precioFinal: p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio,
  }));

  const productosDestacados = destacados.length > 0
    ? destacados
    : productosPrueba.filter(p => p.activo && p.visible && p.destacado).slice(0, 8);

  const productosNovedades = novedades.length > 0
    ? novedades
    : productosPrueba.filter(p => p.activo && p.visible && p.novedad).slice(0, 12);

  const categorias = catAggregate.length > 0
    ? catAggregate.map(r => ({ nombre: r._id, cantidad: r.cantidad }))
    : [...new Set(PRODUCTOS_PRUEBA.map(p => p.categoria))].slice(0, 8).map(c => ({
        nombre: c,
        cantidad: PRODUCTOS_PRUEBA.filter(p => p.categoria === c).length,
      }));

  return { branding, config, productosDestacados, productosNovedades, categorias };
}

export default async function HomePage() {
  const { branding, config, productosDestacados, productosNovedades, categorias } = await getData();
  const secciones = branding?.secciones || {};
  const textos    = branding?.textos    || {};

  return (
    <>
      <Navbar branding={branding} />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <HeroSection
          titulo={textos.textoBienvenida || 'Bienvenido a nuestra tienda'}
          subtitulo={textos.textoHero    || 'Los mejores productos al mejor precio'}
          ctaText={textos.textoCTA       || 'Ver productos'}
          heroBg={branding?.heroBg       || null}
        />

        {/* ── Categorías ───────────────────────────────────────────────── */}
        {secciones.mostrarCategorias !== false && categorias.length > 0 && (
          <CategoriasSection categorias={categorias} />
        )}

        {/* ── Productos destacados ─────────────────────────────────────── */}
        {secciones.mostrarDestacados !== false && productosDestacados.length > 0 && (
          <div id="productos-destacados">
            <ProductosDestacados productos={productosDestacados} textos={textos} />
          </div>
        )}

        {/* ── Banner promocional ───────────────────────────────────────── */}
        {secciones.mostrarBanner !== false && (
          <BannerSection branding={branding} />
        )}

        {/* ── Novedades ────────────────────────────────────────────────── */}
        {secciones.mostrarNovedades !== false && productosNovedades.length > 0 && (
          <NovedadesSection
            productos={productosNovedades}
            titulo="Novedades"
            subtitulo="Lo último que llegó a la tienda"
          />
        )}

        {/* ── Testimonios ──────────────────────────────────────────────── */}
        {secciones.mostrarTestimonios === true && (
          <TestimoniosSection branding={branding} />
        )}

        {/* ── Sobre nosotros ───────────────────────────────────────────── */}
        {secciones.mostrarNosotros !== false && (
          <AboutSection branding={branding} />
        )}

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        {secciones.mostrarFAQ !== false && (
          <FAQSection faqs={branding?.faqs?.filter(f => f.pregunta && f.respuesta) || []} />
        )}

        {/* ── Newsletter ───────────────────────────────────────────────── */}
        {secciones.mostrarNewsletter !== false && (
          <NewsletterSection
            titulo={textos.tituloNewsletter}
            subtitulo={textos.subtituloNewsletter}
          />
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
        mensaje={textos.mensajeWhatsapp || '¡Hola! Quiero consultar sobre un producto.'}
      />
    </>
  );
}
