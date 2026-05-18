// src/app/admin/page.jsx — Dashboard del admin
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Producto from '@/models/Product';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

async function getStats() {
  await connectDB();
  const [totalClientes, totalProductos, totalPedidos] = await Promise.all([
    User.countDocuments({ rol: 'cliente' }),
    Producto.countDocuments({ activo: true }),
    Order.countDocuments({}),
  ]);
  const [pendientes, pagados, cancelados, ingresosBrutos] = await Promise.all([
    Order.countDocuments({ orderStatus: 'pendiente' }),
    Order.countDocuments({ orderStatus: { $in: ['pagado', 'enviado', 'entregado'] } }),
    Order.countDocuments({ orderStatus: 'cancelado' }),
    Order.aggregate([
      { $match: { orderStatus: { $in: ['pagado', 'enviado', 'entregado'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);
  const ultimosPedidos = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    totalClientes, totalProductos, totalPedidos,
    pedidosPendientes: pendientes,
    pedidosPagados: pagados,
    pedidosCancelados: cancelados,
    ingresosTotales: ingresosBrutos[0]?.total || 0,
    ultimosPedidos,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: 'Clientes', value: stats.totalClientes,   icon: Users,         href: '/admin/usuarios',  color: 'text-blue-500' },
    { label: 'Productos', value: stats.totalProductos, icon: Package,       href: '/admin/productos', color: 'text-green-500' },
    { label: 'Pedidos',  value: stats.totalPedidos,    icon: ShoppingCart,  href: '/admin/pedidos',   color: 'text-yellow-500' },
    {
      label: 'Ingresos',
      value: `$${stats.ingresosTotales.toLocaleString('es-AR')}`,
      icon: TrendingUp, href: '/admin/reportes', color: 'text-purple-500',
    },
  ];

  const statusColor = {
    pendiente:  'text-yellow-600 bg-yellow-50',
    pagado:     'text-green-600 bg-green-50',
    preparando: 'text-blue-600 bg-blue-50',
    enviado:    'text-indigo-600 bg-indigo-50',
    entregado:  'text-green-700 bg-green-100',
    cancelado:  'text-red-600 bg-red-50',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card hover:shadow-md transition-shadow">
            <Icon size={22} className={color} />
            <p className="text-2xl font-bold text-brand-text mt-2">{value}</p>
            <p className="text-brand-muted text-sm">{label}</p>
          </Link>
        ))}
      </div>

      {/* Estado de pedidos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-3">
          <Clock size={20} className="text-yellow-500" />
          <div>
            <p className="font-bold text-brand-text">{stats.pedidosPendientes}</p>
            <p className="text-xs text-brand-muted">Pendientes</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <div>
            <p className="font-bold text-brand-text">{stats.pedidosPagados}</p>
            <p className="text-xs text-brand-muted">Pagados/Enviados</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <XCircle size={20} className="text-red-500" />
          <div>
            <p className="font-bold text-brand-text">{stats.pedidosCancelados}</p>
            <p className="text-xs text-brand-muted">Cancelados</p>
          </div>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-brand-text">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-brand-primary hover:underline">Ver todos →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-brand-muted font-normal">N° Pedido</th>
                <th className="text-left py-2 text-brand-muted font-normal">Cliente</th>
                <th className="text-left py-2 text-brand-muted font-normal">Total</th>
                <th className="text-left py-2 text-brand-muted font-normal">Estado</th>
                <th className="text-left py-2 text-brand-muted font-normal">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.ultimosPedidos.map((p) => (
                <tr key={p.orderId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 font-mono text-xs text-brand-muted">{p.orderId.slice(-10)}</td>
                  <td className="py-2.5 text-brand-text">{p.customerInfo.nombre} {p.customerInfo.apellido}</td>
                  <td className="py-2.5 font-semibold text-brand-text">${p.total.toLocaleString('es-AR')}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.orderStatus] || 'text-gray-600 bg-gray-100'}`}>
                      {p.orderStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-brand-muted text-xs">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
