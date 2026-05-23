'use client';
// src/app/admin/layout.jsx — Panel del dueño de la tienda
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Settings, BarChart2, LogOut, Store, MessageSquare, Mail, Sparkles, Layers, Star, Tag, DollarSign
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Dashboard',        exact: true },
  { href: '/admin/productos',     icon: Package,         label: 'Productos' },
  { href: '/admin/stock',         icon: Layers,          label: 'Stock' },
  { href: '/admin/pedidos',       icon: ShoppingCart,    label: 'Pedidos',           badge: 'pedidos' },
  { href: '/admin/usuarios',      icon: Users,           label: 'Clientes' },
  { href: '/admin/mensajes',      icon: MessageSquare,   label: 'Mensajes',          badge: 'mensajes' },
  { href: '/admin/resenas',       icon: Star,            label: 'Reseñas',           badge: 'resenas' },
  { href: '/admin/newsletter',    icon: Mail,            label: 'Newsletter' },
  { href: '/admin/cupones',        icon: Tag,             label: 'Cupones' },
  { href: '/admin/comisiones',     icon: DollarSign,      label: 'Comisiones' },
  { href: '/admin/branding',      icon: Sparkles,        label: 'Personalización' },
  { href: '/admin/reportes',      icon: BarChart2,       label: 'Reportes' },
  { href: '/admin/configuracion', icon: Settings,        label: 'Configuración' },
];

export default function AdminLayout({ children }) {
  const pathname  = usePathname();
  const branding  = useBranding();
  const navColor  = branding?.colores?.nav      || '#1E40AF';
  const navText   = branding?.colores?.navText  || '#FFFFFF';
  const logoUrl   = branding?.logoUrl           || null;
  const nombre    = branding?.nombreTienda      || 'Mi Tienda';

  // ── Contadores para badges ───────────────────────────────────────────────────
  const [noLeidos,         setNoLeidos]         = useState(0);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [resenasPendientes, setResenasPendientes] = useState(0);

  useEffect(() => {
    const cargarBadges = () => {
      fetch('/api/contacto/count')
        .then(r => r.json())
        .then(({ noLeidos }) => { if (typeof noLeidos === 'number') setNoLeidos(noLeidos); })
        .catch(() => {});
      fetch('/api/pedidos/count')
        .then(r => r.json())
        .then(({ pendientes }) => { if (typeof pendientes === 'number') setPedidosPendientes(pendientes); })
        .catch(() => {});
      fetch('/api/reviews/count')
        .then(r => r.json())
        .then(({ pendientes }) => { if (typeof pendientes === 'number') setResenasPendientes(pendientes); })
        .catch(() => {});
    };
    cargarBadges();
    const interval = setInterval(cargarBadges, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Limpia badges al visitar la sección correspondiente
  useEffect(() => {
    if (pathname === '/admin/mensajes')                setNoLeidos(0);
    if (pathname.startsWith('/admin/pedidos'))         setPedidosPendientes(0);
    if (pathname.startsWith('/admin/resenas'))         setResenasPendientes(0);
  }, [pathname]);

  const badges = { mensajes: noLeidos, pedidos: pedidosPendientes, resenas: resenasPendientes };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col" style={{ backgroundColor: navColor }}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          {logoUrl ? (
            <img src={logoUrl} alt={nombre} className="h-8 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <Store size={20} style={{ color: navText }} />
              <span className="font-bold text-sm" style={{ color: navText }}>{nombre}</span>
            </div>
          )}
          <p className="text-xs mt-1 opacity-60" style={{ color: navText }}>Panel Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact, badge }) => {
            const active     = exact ? pathname === href : pathname.startsWith(href);
            const badgeCount = badge ? badges[badge] : 0;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: navText,
                  opacity: active ? 1 : 0.75,
                }}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {badgeCount > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1"
            style={{ color: navText, opacity: 0.7 }}
          >
            <Store size={15} /> Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-red-500/20 transition-colors"
            style={{ color: navText, opacity: 0.7 }}
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
