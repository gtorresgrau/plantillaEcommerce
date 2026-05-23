'use client';
// src/app/vendedor/layout.jsx — Panel exclusivo del rol vendedor
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBranding } from '@/contexts/BrandingContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store, Layers } from 'lucide-react';

const navItems = [
  { href: '/vendedor',           icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { href: '/vendedor/productos', icon: Package,         label: 'Mis productos' },
  { href: '/vendedor/pedidos',   icon: ShoppingCart,    label: 'Mis ventas' },
  { href: '/admin/stock',        icon: Layers,          label: 'Stock rápido' },
];

export default function VendedorLayout({ children }) {
  const pathname = usePathname();
  const branding = useBranding();
  const navColor = branding?.colores?.nav     || '#1E40AF';
  const navText  = branding?.colores?.navText || '#FFFFFF';
  const logoUrl  = branding?.logoUrl          || null;
  const nombre   = branding?.nombreTienda     || 'Mi Tienda';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col" style={{ backgroundColor: navColor }}>
        <div className="p-5 border-b border-white/10">
          {logoUrl ? (
            <img src={logoUrl} alt={nombre} className="h-8 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <Store size={18} style={{ color: navText }} />
              <span className="font-bold text-sm" style={{ color: navText }}>{nombre}</span>
            </div>
          )}
          <p className="text-xs mt-1 opacity-60" style={{ color: navText }}>Panel Vendedor</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: navText,
                  opacity: active ? 1 : 0.75,
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 opacity-70"
            style={{ color: navText }}>
            <Store size={15} /> Ver tienda
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left hover:bg-red-500/20 transition-colors opacity-70"
            style={{ color: navText }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
