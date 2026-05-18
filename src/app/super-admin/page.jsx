// src/app/super-admin/page.jsx — Dashboard del superAdmin
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Link from 'next/link';
import { Palette, Users, Package, ShoppingCart, TrendingUp, Settings } from 'lucide-react';

async function getStats() {
  await connectDB();
  const [usuarios, productos, pedidos, branding] = await Promise.all([
    User.countDocuments({}),
    Producto.countDocuments({}),
    Order.countDocuments({}),
    BrandingConfig.findOne({ activo: true }).lean(),
  ]);
  const ingresos = await Order.aggregate([
    { $match: { orderStatus: { $in: ['pagado', 'enviado', 'entregado'] } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  return {
    usuarios,
    productos,
    pedidos,
    ingresos: ingresos[0]?.total || 0,
    nombreTienda: branding?.nombreTienda || 'Sin configurar',
    colores: branding?.colores,
  };
}

export default async function SuperAdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Usuarios', value: stats.usuarios, icon: Users, href: '/super-admin/usuarios', color: 'text-blue-400' },
    { label: 'Productos', value: stats.productos, icon: Package, href: '/super-admin/productos', color: 'text-green-400' },
    { label: 'Pedidos', value: stats.pedidos, icon: ShoppingCart, href: '/super-admin/pedidos', color: 'text-yellow-400' },
    { label: 'Ingresos', value: `$${stats.ingresos.toLocaleString('es-AR')}`, icon: TrendingUp, href: '/super-admin/pedidos', color: 'text-purple-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Panel SuperAdmin</h1>
        <p className="text-gray-400 mt-1">
          Tienda: <span className="text-purple-400 font-semibold">{stats.nombreTienda}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-600 transition-colors"
          >
            <Icon size={22} className={color} />
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/super-admin/branding"
          className="bg-gradient-to-br from-purple-900/50 to-gray-900 border border-purple-700 rounded-xl p-6 hover:border-purple-500 transition-colors group"
        >
          <Palette size={28} className="text-purple-400 mb-3" />
          <h3 className="text-white font-semibold text-lg">Branding & Colores</h3>
          <p className="text-gray-400 text-sm mt-1">
            Editá el logo, colores, tipografía y textos de la tienda
          </p>
        </Link>

        <Link href="/super-admin/configuracion"
          className="bg-gradient-to-br from-blue-900/50 to-gray-900 border border-blue-700 rounded-xl p-6 hover:border-blue-500 transition-colors group"
        >
          <Settings size={28} className="text-blue-400 mb-3" />
          <h3 className="text-white font-semibold text-lg">Configuración</h3>
          <p className="text-gray-400 text-sm mt-1">
            Datos de contacto, redes sociales, pagos y envíos
          </p>
        </Link>
      </div>

      {/* Preview de colores */}
      {stats.colores && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Paleta de colores actual</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.colores).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-700"
                  style={{ backgroundColor: value }}
                  title={value}
                />
                <div>
                  <p className="text-xs text-gray-400">{key}</p>
                  <p className="text-xs text-gray-500 font-mono">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
