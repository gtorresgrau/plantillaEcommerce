// src/app/robots.js — Genera robots.txt dinámicamente
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';

export default async function robots() {
  let siteUrl = 'https://mitienda.com';
  try {
    await connectDB();
    const config = await Configuracion.findOne({ activo: true }).lean();
    siteUrl = config?.urlHttps || config?.urlWWW || siteUrl;
  } catch { /* usa default */ }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/super-admin/',
          '/vendedor/',
          '/api/',
          '/checkout/',
          '/mi-cuenta/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
