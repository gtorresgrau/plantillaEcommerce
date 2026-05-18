'use client';
// src/components/storefront/Navbar.jsx
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';

export default function Navbar({ branding }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navColor  = branding?.colores?.nav     || 'var(--color-nav)';
  const navText   = branding?.colores?.navText || 'var(--color-nav-text)';
  const nombre    = branding?.nombreTienda     || 'Mi Tienda';
  const logoUrl   = branding?.logoUrl          || null;

  return (
    <header style={{ backgroundColor: navColor }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={nombre} className="h-8 object-contain" />
            ) : (
              <span className="font-bold text-xl" style={{ color: navText }}>{nombre}</span>
            )}
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: '/productos', label: 'Productos' },
              { href: '/contacto',  label: 'Contacto' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: navText }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: navText }}>
              <ShoppingCart size={20} />
            </Link>
            <Link href="/login" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-colors" style={{ color: navText }}>
              <User size={16} /> Ingresar
            </Link>
            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: navText }}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {[
              { href: '/productos', label: 'Productos' },
              { href: '/contacto',  label: 'Contacto' },
              { href: '/login',     label: 'Ingresar' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="block px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                style={{ color: navText }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
