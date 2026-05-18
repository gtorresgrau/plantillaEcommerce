'use client';
// src/components/storefront/Footer.jsx
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook, faTwitter, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export default function Footer({ branding }) {
  const footerBg   = branding?.colores?.footer     || 'var(--color-footer)';
  const footerText = branding?.colores?.footerText || 'var(--color-footer-text)';
  const nombre     = branding?.nombreTienda        || 'Mi Tienda';
  const logoBlanco = branding?.logoBlanco          || null;
  const redes      = {
    instagram: branding?.urlInstagram,
    facebook:  branding?.urlFacebook,
    twitter:   branding?.urlTwitter,
    youtube:   branding?.urlYoutube,
    tiktok:    branding?.urlTiktok,
    whatsapp:  branding?.whatsappVentas,
  };

  const iconMap = {
    instagram: faInstagram,
    facebook:  faFacebook,
    twitter:   faTwitter,
    youtube:   faYoutube,
    tiktok:    faTiktok,
    whatsapp:  faWhatsapp,
  };

  const redesActivas = Object.entries(redes).filter(([, url]) => !!url);

  return (
    <footer style={{ backgroundColor: footerBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marca */}
          <div>
            {logoBlanco ? (
              <img src={logoBlanco} alt={nombre} className="h-10 object-contain mb-3" />
            ) : (
              <p className="text-xl font-bold mb-3" style={{ color: footerText }}>{nombre}</p>
            )}
            {branding?.slogan && (
              <p className="text-sm opacity-70" style={{ color: footerText }}>{branding.slogan}</p>
            )}
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm" style={{ color: footerText }}>Navegación</h3>
            {[
              { href: '/',          label: 'Inicio' },
              { href: '/productos', label: 'Productos' },
              { href: '/contacto',  label: 'Contacto' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="block text-sm mb-1.5 opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: footerText }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Redes */}
          {redesActivas.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: footerText }}>Redes sociales</h3>
              <div className="flex gap-3">
                {redesActivas.map(([red, url]) => {
                  const href = red === 'whatsapp'
                    ? `https://wa.me/${url.replace(/\D/g, '')}`
                    : url;
                  return (
                    <a key={red} href={href} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                      style={{ color: footerText }}
                    >
                      <FontAwesomeIcon icon={iconMap[red]} className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-xs opacity-50" style={{ color: footerText }}>
            © {new Date().getFullYear()} {nombre}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
