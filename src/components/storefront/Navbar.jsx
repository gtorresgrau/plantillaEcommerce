'use client';
// src/components/storefront/Navbar.jsx
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut, Package, Settings, Search, Heart } from 'lucide-react';
import { useCart }     from '@/contexts/CartContext';
import { useAuth }     from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import useDebounce from '@/hooks/useDebounce';

const NAV_LINKS = [
  { href: '/productos',   label: 'Tienda',    scroll: null },
  { href: '/#nosotros',   label: 'Nosotros',  scroll: 'nosotros' },
  { href: '/#faq',        label: 'FAQ',        scroll: 'faq' },
  { href: '/contacto',    label: 'Contacto',  scroll: null },
];

export default function Navbar({ branding }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [userDropdown,  setUserDropdown]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef  = useRef(null);
  const searchRef    = useRef(null);
  const searchInputRef = useRef(null);

  const { totalItems }   = useCart();
  const { user, logout } = useAuth();
  const { count: wishCount } = useWishlist();

  const navColor = branding?.colores?.nav     || 'var(--color-nav)';
  const navText  = branding?.colores?.navText || 'var(--color-nav-text)';
  const nombre   = branding?.nombreTienda     || 'Mi Tienda';
  const logoUrl  = branding?.logoUrl          || null;

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    fetch(`/api/productos?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then(r => r.json())
      .then(data => setSearchResults(data.data || []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  // Abrir search → foco automático
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Cerrar dropdowns al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ESC cierra todo
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setUserDropdown(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleResultClick = () => {
    setSearchOpen(false);
    setSearchQuery('');
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

            {/* Búsqueda */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(o => !o)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: navText }}
                aria-label="Buscar productos"
              >
                <Search size={20} />
              </button>

              {/* Dropdown de búsqueda */}
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-gray-100">
                    <Search size={16} className="ml-3 text-gray-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="flex-1 px-3 py-3 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    )}
                  </form>

                  {/* Resultados */}
                  {searchLoading && (
                    <div className="flex items-center justify-center py-6">
                      <span className="animate-spin h-5 w-5 border-2 border-brand-primary border-t-transparent rounded-full" />
                    </div>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {searchResults.map(p => {
                        const precio = p.precioFinal ?? (p.descuento > 0
                          ? Math.round(p.precio * (1 - p.descuento / 100))
                          : p.precio);
                        return (
                          <li key={p._id}>
                            <Link
                              href={`/productos/${p.cod_producto}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {p.foto1
                                  ? <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-cover" sizes="40px" />
                                  : <span className="text-lg flex items-center justify-center w-full h-full">📦</span>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium line-clamp-1">{p.titulo_de_producto}</p>
                                <p className="text-xs text-gray-500">{p.categoria}</p>
                              </div>
                              <span className="text-sm font-bold text-brand-primary flex-shrink-0">
                                ${precio?.toLocaleString('es-AR')}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {!searchLoading && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="py-6 text-center text-sm text-gray-400">
                      Sin resultados para &quot;{debouncedQuery}&quot;
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-2">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs text-brand-primary font-medium hover:underline"
                      >
                        Ver todos los resultados →
                      </button>
                    </div>
                  )}

                  {!debouncedQuery && (
                    <div className="py-5 text-center text-sm text-gray-400">
                      Escribí para buscar productos...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Favoritos */}
            <Link
              href="/favoritos"
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: navText }}
              aria-label="Favoritos"
            >
              <Heart size={20} className={wishCount > 0 ? 'fill-current text-red-400' : ''} />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

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

            {/* Búsqueda mobile */}
            <form onSubmit={handleSearchSubmit} className="px-3 pb-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <Search size={15} style={{ color: navText }} className="opacity-70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder-white/50"
                  style={{ color: navText }}
                />
              </div>
            </form>

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
