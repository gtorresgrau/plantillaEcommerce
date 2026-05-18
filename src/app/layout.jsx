// src/app/layout.jsx
import './globals.css';
import { BrandingProvider } from '@/contexts/BrandingContext';
import { connectDB } from '@/lib/mongodb';
import BrandingConfig from '@/models/BrandingConfig';

// Carga el branding desde DB en cada request (Server Component)
async function getBranding() {
  try {
    await connectDB();
    const branding = await BrandingConfig.findOne({ activo: true }).lean();
    return branding || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const branding = await getBranding();
  return {
    title:       branding?.seo?.titulo       || 'Mi Tienda Online',
    description: branding?.seo?.descripcion  || 'La mejor tienda online.',
    keywords:    branding?.seo?.keywords     || '',
    icons: {
      icon: branding?.faviconUrl || '/favicon.ico',
    },
    openGraph: {
      title:       branding?.seo?.titulo      || 'Mi Tienda Online',
      description: branding?.seo?.descripcion || '',
      images:      branding?.ogImageUrl ? [branding.ogImageUrl] : [],
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
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}
