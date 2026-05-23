// src/app/productos/[id]/page.jsx — Server wrapper con generateMetadata
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';
import ProductoDetalle from './ProductoDetalle';

// ── Metadata dinámica ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    await connectDB();
    const [producto, branding, config] = await Promise.all([
      Producto.findOne({
        $or: [{ cod_producto: id }, { slug: id }],
        activo: true,
      }).lean(),
      BrandingConfig.findOne({ activo: true }, { nombreTienda: 1, seo: 1, ogImageUrl: 1 }).lean(),
      Configuracion.findOne({ activo: true }, { urlHttps: 1, urlWWW: 1 }).lean(),
    ]);

    if (!producto) {
      return { title: 'Producto no encontrado', description: 'Este producto no existe o fue removido.' };
    }

    const siteUrl = (config?.urlHttps || config?.urlWWW || 'https://mitienda.com').replace(/\/$/, '');
    const tienda  = branding?.nombreTienda || 'Mi Tienda';
    const titulo  = `${producto.titulo_de_producto} | ${tienda}`;
    const precioFinal = producto.descuento > 0
      ? Math.round(producto.precio * (1 - producto.descuento / 100))
      : producto.precio;

    const descripcion = producto.descripcion
      ? producto.descripcion.slice(0, 155)
      : `Comprá ${producto.titulo_de_producto} en ${tienda}. Precio: $${precioFinal?.toLocaleString('es-AR')}.`;

    const imagenOG = producto.foto1 || branding?.ogImageUrl || null;

    return {
      title: titulo,
      description: descripcion,
      keywords: [producto.titulo_de_producto, producto.categoria, producto.marca, tienda]
        .filter(Boolean).join(', '),
      openGraph: {
        title: titulo,
        description: descripcion,
        url: `${siteUrl}/productos/${id}`,
        siteName: tienda,
        ...(imagenOG && { images: [{ url: imagenOG, width: 800, height: 800, alt: producto.titulo_de_producto }] }),
        type: 'website',
        locale: 'es_AR',
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: descripcion,
        ...(imagenOG && { images: [imagenOG] }),
      },
      alternates: {
        canonical: `${siteUrl}/productos/${id}`,
      },
    };
  } catch {
    return { title: 'Producto', description: 'Detalle de producto.' };
  }
}

// ── Página ─────────────────────────────────────────────────────────────────────
export default async function ProductoDetallePage({ params }) {
  const { id } = await params;
  return <ProductoDetalle id={id} />;
}
