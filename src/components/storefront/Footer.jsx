'use client';
// src/components/storefront/Footer.jsx
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer({ branding, config }) {
  const footerBg   = branding?.colores?.footer     || 'var(--color-footer)';
  const footerText = branding?.colores?.footerText  || 'var(--color-footer-text)';
  const nombre     = branding?.nombreTienda         || 'Mi Tienda';
  const slogan     = branding?.slogan               || '';
  const logoBlanco = branding?.logoBlanco           || null;

  // Redes desde branding (super-admin) o config (admin)
  const redes = {
    instagram: branding?.urlInstagram || config?.urlInstagram,
    facebook:  branding?.urlFacebook  || config?.urlFacebook,
    youtube:   branding?.urlYoutube   || config?.urlYoutube,
    tiktok:    branding?.urlTiktok    || config?.urlTiktok,
  };

  const email    = config?.correoContacto  || config?.correoVentas  || '';
  const telefono = config?.whatsappVentas  || config?.telefonoVentas || '';
  const direccion = config?.direccion || '';

  return (
    <footer style={{ backgroundColor: footerBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Columna 1 — Marca */}
          <div>
            {logoBlanco ? (
              <img src={logoBlanco} alt={nombre} className="h-10 object-contain mb-3" />
            ) : (
              <p className="text-xl font-bold mb-2" style={{ color: footerText }}>{nombre}</p>
            )}
            {slogan && (
              <p className="text-sm mb-4 opacity-70" style={{ color: footerText }}>{slogan}</p>
            )}

            {/* Redes sociales */}
            <div className="flex gap-3 mt-2">
              {redes.instagram && (
                <a href={redes.instagram} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                  style={{ color: footerText }} aria-label="Instagram">
                  <Instagram size={20} />
                </a>
              )}
              {redes.facebook && (
                <a href={redes.facebook} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                  style={{ color: footerText }} aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              )}
              {redes.youtube && (
                <a href={redes.youtube} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                  style={{ color: footerText }} aria-label="YouTube">
                  <Youtube size={20} />
                </a>
              )}
              {redes.tiktok && (
                <a href={redes.tiktok} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                  style={{ color: footerText }} aria-label="TikTok">
                  {/* TikTok SVG */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.25 8.25 0 004.84 1.56V6.79a4.84 4.84 0 01-1.07-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Columna 2 — Navegación */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: footerText }}>
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/',            label: 'Inicio' },
                { href: '/productos',   label: 'Tienda' },
                { href: '/#nosotros',   label: 'Nosotros' },
                { href: '/#faq',        label: 'Preguntas frecuentes' },
                { href: '/contacto',    label: 'Contacto' },
                { href: '/mi-cuenta',   label: 'Mi cuenta' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity block"
                    style={{ color: footerText }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Contacto */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: footerText }}>
              Contacto
            </h3>
            <ul className="space-y-3">
              {email && (
                <li className="flex items-center gap-2 text-sm opacity-80" style={{ color: footerText }}>
                  <Mail size={15} className="flex-shrink-0" />
                  <a href={`mailto:${email}`} className="hover:opacity-100 transition-opacity">{email}</a>
                </li>
              )}
              {telefono && (
                <li className="flex items-center gap-2 text-sm opacity-80" style={{ color: footerText }}>
                  <Phone size={15} className="flex-shrink-0" />
                  <a
                    href={`https://wa.me/${config?.codigoPais || 54}${telefono.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="hover:opacity-100 transition-opacity"
                  >
                    {telefono}
                  </a>
                </li>
              )}
              {direccion && (
                <li className="flex items-start gap-2 text-sm opacity-80" style={{ color: footerText }}>
                  <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{direccion}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-50" style={{ color: footerText }}>
            © {new Date().getFullYear()} {nombre}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {[
              { href: '/politica-privacidad', label: 'Privacidad' },
              { href: '/terminos',            label: 'Términos' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: footerText }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
