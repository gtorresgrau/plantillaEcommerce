// src/app/productos/layout.jsx — Metadata para el listado de productos
import { connectDB } from '@/lib/mongodb';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';

export async function generateMetadata() {
  try {
    await connectDB();
    const [branding, config] = await Promise.all([
      BrandingConfig.findOne({ activo: true }, { nombreTienda: 1, seo: 1, ogImageUrl: 1 }).lean(),
      Configuracion.findOne({ activo: true }, { urlHttps: 1, urlWWW: 1 }).lean(),
    ]);

    const siteUrl = (config?.urlHttps || config?.urlWWW || 'https://mitienda.com').replace(/\/$/, '');
    const tienda  = branding?.nombreTienda || 'Mi Tienda';
    const titulo  = `Productos | ${tienda}`;
    const descripcion = branding?.seo?.descripcion
      ? `Todos los productos de ${tienda}. ${branding.seo.descripcion}`
      : `Explorá todos los productos de ${tienda}. Los mejores precios y la mejor calidad.`;

    return {
      title: titulo,
      description: descripcion,
      keywords: branding?.seo?.keywords || tienda,
      openGraph: {
        title: titulo,
        description: descripcion,
        url: `${siteUrl}/productos`,
        siteName: tienda,
        ...(branding?.ogImageUrl && { images: [{ url: branding.ogImageUrl, width: 1200, height: 630, alt: tienda }] }),
        type: 'website',
        locale: 'es_AR',
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: descripcion,
        ...(branding?.ogImageUrl && { images: [branding.ogImageUrl] }),
      },
      alternates: {
        canonical: `${siteUrl}/productos`,
      },
    };
  } catch {
    return { title: 'Productos', description: 'Catálogo de productos.' };
  }
}

export default function ProductosLayout({ children }) {
  return children;
}
