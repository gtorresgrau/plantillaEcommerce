'use client';
// src/app/vendedor/page.jsx — Dashboard del vendedor
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function VendedorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ productos: 0, ventas: 0, ingresos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/productos?limit=1').then(r => r.json()),
      fetch('/api/pedidos?limit=1').then(r => r.json()),
    ]).then(([prods, peds]) => {
      setStats({
        productos: prods.total || 0,
        ventas:    peds.total  || 0,
        ingresos:  0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Mis productos',  value: stats.productos, icon: Package,      href: '/vendedor/productos', color: 'text-blue-600 bg-blue-50' },
    { label: 'Ventas totales', value: stats.ventas,    icon: ShoppingCart, href: '/vendedor/pedidos',   color: 'text-green-600 bg-green-50' },
    { label: 'Ingresos',       value: `$${stats.ingresos.toLocaleString('es-AR')}`, icon: TrendingUp, href: '/vendedor/pedidos', color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">
          Hola, {user?.nombre} 👋
        </h1>
        <p className="text-brand-muted mt-1">Este es tu panel de vendedor.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-brand-muted">{label}</p>
              {loading
                ? <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                : <p className="text-2xl font-bold text-brand-text">{value}</p>
              }
            </div>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="card">
        <h2 className="font-semibold text-brand-text mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/vendedor/productos?nuevo=1"
            className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm">
            <Plus size={16} /> Nuevo producto
          </Link>
          <Link href="/vendedor/pedidos"
            className="flex items-center gap-2 btn-secondary px-4 py-2.5 text-sm">
            <ShoppingCart size={16} /> Ver ventas
          </Link>
        </div>
      </div>
    </div>
  );
}
