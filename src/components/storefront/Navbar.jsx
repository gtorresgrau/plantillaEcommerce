'use client';
// src/components/storefront/Navbar.jsx
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { href: '/productos',   label: 'Tienda',    scroll: null },
  { href: '/#nosotros',   label: 'Nosotros',  scroll: 'nosotros' },
  { href: '/#faq',        label: 'FAQ',        scroll: 'faq' },
  { href: '/contacto',    label: 'Contacto',  scroll: null },
];

export default function Navbar({ branding }) {
  const pathname = usePathname();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { totalItems }   = useCart();
  const { user, logout } = useAuth();

  const navColor = branding?.colores?.nav     || 'var(--color-nav)';
  const navText  = branding?.colores?.navText || 'var(--color-nav-text)';
  const nombre   = branding?.nombreTienda     || 'Mi Tienda';
  const logoUrl  = branding?.logoUrl          || null;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Si estamos en el home, los anchors hacen scroll suave; si no, navegan
  const resolveHref = (link) => {
    if (link.scroll && pathname === '/') return `#${link.scroll}`;
    return link.href;
  };

  const handleAnchorClick = (e, link) => {
    if (link.scroll && pathname === '/') {
      e.preventDefault();
      document.getElementById(link.scroll)?.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <header style={{ backgroundColor: navColor }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={nombre} className="h-9 object-contain" />
            ) : (
              <span className="font-bold text-xl" style={{ color: navText }}>{nombre}</span>
            )}
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={resolveHref(link)}
                onClick={(e) => handleAnchorClick(e, link)}
                className="text-sm font-medium px-3 py-2 rounded-lg transition-all hover:bg-white/10"
                style={{ color: navText }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: navText }}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Usuario — desktop */}
            {user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  style={{ color: navText }}
                >
                  <User size={16} />
                  <span className="max-w-[110px] truncate">{user.nombre}</span>
                  <ChevronDown size={14} className={`transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-brand-muted">Hola,</p>
                      <p className="text-sm font-semibold text-brand-text truncate">{user.nombre} {user.apellido}</p>
                    </div>
                    <Link href="/mi-cuenta" onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-text hover:bg-gray-50 transition-colors">
                      <Package size={14} /> Mis pedidos
                    </Link>
                    {(user.rol === 'admin' || user.rol === 'vendedor' || user.rol === 'superAdmin') && (
                      <Link href="/admin" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-brand-text hover:bg-gray-50 transition-colors">
                        <Settings size={14} /> Panel admin
                      </Link>
                    )}
                    {user.rol === 'superAdmin' && (
                      <Link href="/super-admin" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors">
                        <Settings size={14} /> Super Admin
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { logout(); setUserDropdown(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors border border-white/30"
                style={{ color: navText }}
              >
                <User size={16} /> Ingresar
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: navText }}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menú"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-0.5 border-t border-white/20 pt-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={resolveHref(link)}
                onClick={(e) => handleAnchorClick(e, link)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                style={{ color: navText }}
              >
                {link.label}
              </a>
            ))}

            <hr className="border-white/20 my-2" />

            {user ? (
              <>
                <div className="px-3 py-1">
                  <p className="text-xs opacity-60" style={{ color: navText }}>Hola, {user.nombre}</p>
                </div>
                <Link href="/mi-cuenta" style={{ color: navText }}
                  className="block px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  <Package size={14} className="inline mr-2" />Mis pedidos
                </Link>
                {(user.rol === 'admin' || user.rol === 'vendedor' || user.rol === 'superAdmin') && (
                  <Link href="/admin" style={{ color: navText }}
                    className="block px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setMenuOpen(false)}>
                    <Settings size={14} className="inline mr-2" />Panel admin
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 w-full text-left text-red-400 transition-colors"
                >
                  <LogOut size={14} className="inline mr-2" />Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1 px-3">
                <Link href="/login"
                  className="block py-2.5 text-center text-sm font-medium rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                  style={{ color: navText }}
                  onClick={() => setMenuOpen(false)}>
                  Iniciar sesión
                </Link>
                <Link href="/register"
                  className="block py-2.5 text-center text-sm font-bold rounded-lg bg-brand-accent text-white hover:opacity-90 transition-opacity"
                  onClick={() => setMenuOpen(false)}>
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
