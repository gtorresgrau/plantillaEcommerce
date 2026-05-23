// src/app/layout.jsx
import './globals.css';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { AuthProvider }     from '@/contexts/AuthContext';
import { CartProvider }     from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CompareProvider }  from '@/contexts/CompareContext';
import CompareBar           from '@/components/storefront/CompareBar';
import { connectDB } from '@/lib/mongodb';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion  from '@/models/Configuracion';

// Carga el branding y config desde DB en cada request (Server Component)
async function getBrandingAndConfig() {
  try {
    await connectDB();
    const [branding, config] = await Promise.all([
      BrandingConfig.findOne({ activo: true }).lean(),
      Configuracion.findOne({ activo: true }, { urlHttps: 1, urlWWW: 1 }).lean(),
    ]);
    return { branding: branding || null, config: config || null };
  } catch {
    return { branding: null, config: null };
  }
}

// Compatibilidad: alias para usos que solo necesitan branding
async function getBranding() {
  const { branding } = await getBrandingAndConfig();
  return branding;
}

export async function generateMetadata() {
  const { branding, config } = await getBrandingAndConfig();
  const siteUrl = (config?.urlHttps || config?.urlWWW || 'https://mitienda.com').replace(/\/$/, '');
  const titulo      = branding?.seo?.titulo      || 'Mi Tienda Online';
  const descripcion = branding?.seo?.descripcion || 'La mejor tienda online.';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default:  titulo,
      template: `%s | ${branding?.nombreTienda || 'Mi Tienda'}`,
    },
    description: descripcion,
    keywords:    branding?.seo?.keywords || '',
    icons: {
      icon:    branding?.faviconUrl || '/favicon.ico',
      apple:   branding?.faviconUrl || '/favicon.ico',
    },
    openGraph: {
      title:       titulo,
      description: descripcion,
      url:         siteUrl,
      siteName:    branding?.nombreTienda || 'Mi Tienda',
      images:      branding?.ogImageUrl
        ? [{ url: branding.ogImageUrl, width: 1200, height: 630, alt: titulo }]
        : [],
      locale: 'es_AR',
      type:   'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       titulo,
      description: descripcion,
      images:      branding?.ogImageUrl ? [branding.ogImageUrl] : [],
    },
    robots: {
      index:  true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }) {
  const branding = await getBranding();

  return (
    <html lang="es">
      <head>
        {/* Fuente de Google Fonts dinámica */}
        {branding?.tipografia?.fuenteURL && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={branding.tipografia.fuenteURL} rel="stylesheet" />
          </>
        )}
        {/* CSS vars inyectadas server-side para evitar flash */}
        {branding && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary:     ${branding.colores?.primary     || '#3B82F6'};
                --color-secondary:   ${branding.colores?.secondary   || '#1E40AF'};
                --color-accent:      ${branding.colores?.accent      || '#F59E0B'};
                --color-bg:          ${branding.colores?.bg          || '#F9FAFB'};
                --color-surface:     ${branding.colores?.surface     || '#FFFFFF'};
                --color-text:        ${branding.colores?.text        || '#111827'};
                --color-text-muted:  ${branding.colores?.textMuted   || '#6B7280'};
                --color-nav:         ${branding.colores?.nav         || '#1E40AF'};
                --color-nav-text:    ${branding.colores?.navText     || '#FFFFFF'};
                --color-footer:      ${branding.colores?.footer      || '#111827'};
                --color-footer-text: ${branding.colores?.footerText  || '#D1D5DB'};
                --color-danger:      ${branding.colores?.danger      || '#EF4444'};
                --color-success:     ${branding.colores?.success     || '#10B981'};
                --color-warning:     ${branding.colores?.warning     || '#F59E0B'};
                --border-radius:     ${branding.tipografia?.borderRadius || '0.5rem'};
                --font-brand:        '${branding.tipografia?.fuente || 'Inter'}', sans-serif;
              }
            `
          }} />
        )}
      </head>
      <body>
        <BrandingProvider branding={branding}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  {children}
                  <CompareBar />
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
