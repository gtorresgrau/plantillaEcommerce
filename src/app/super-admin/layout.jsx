// src/app/super-admin/layout.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Palette, Settings, Users, LayoutDashboard,
  Package, ShoppingCart, LogOut, Store
} from 'lucide-react';

const navItems = [
  { href: '/super-admin',                icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/branding',       icon: Palette,         label: 'Branding & Colores' },
  { href: '/super-admin/configuracion',  icon: Settings,        label: 'Configuración' },
  { href: '/super-admin/usuarios',       icon: Users,           label: 'Usuarios' },
  { href: '/super-admin/productos',      icon: Package,         label: 'Productos' },
  { href: '/super-admin/pedidos',        icon: ShoppingCart,    label: 'Pedidos' },
];

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">SuperAdmin</p>
              <p className="text-xs text-gray-400">Panel de control</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/super-admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
