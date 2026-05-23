// src/app/sitemap.js — Sitemap XML dinámico
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import Configuracion from '@/models/Configuracion';

export default async function sitemap() {
  let siteUrl = 'https://mitienda.com';

  try {
    await connectDB();
    const config = await Configuracion.findOne({ activo: true }).lean();
    siteUrl = config?.urlHttps || config?.urlWWW || siteUrl;
  } catch { /* usa default */ }

  // Eliminar barra final si la tiene
  siteUrl = siteUrl.replace(/\/$/, '');

  // ── Páginas estáticas ────────────────────────────────────────────────────────
  const staticRoutes = [
    { path: '',              priority: 1.0,  changeFrequency: 'daily'   },
    { path: '/productos',    priority: 0.9,  changeFrequency: 'daily'   },
    { path: '/contacto',     priority: 0.6,  changeFrequency: 'monthly' },
    { path: '/politica-privacidad', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terminos',     priority: 0.3,  changeFrequency: 'yearly'  },
  ];

  const staticEntries = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // ── Productos dinámicos ──────────────────────────────────────────────────────
  let productEntries = [];
  try {
    const productos = await Producto.find(
      { activo: true, visible: true },
      { cod_producto: 1, slug: 1, updatedAt: 1 }
    ).lean();

    productEntries = productos.map((p) => ({
      url: `${siteUrl}/productos/${p.cod_producto}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch { /* si falla, continúa sin productos */ }

  return [...staticEntries, ...productEntries];
}
