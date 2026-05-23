// src/app/admin/page.jsx — Dashboard del admin
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Producto from '@/models/Product';
import Suscripcion from '@/models/Suscripcion';
import Link from 'next/link';
import { Package, ShoppingCart, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Bell } from 'lucide-react';

async function getStats() {
  await connectDB();

  const ahora     = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [
    totalClientes,
    totalProductos,
    totalPedidos,
    totalSuscriptores,
    pendientes,
    pagados,
    cancelados,
    ingresosTotalesArr,
    ingresosMesArr,
    ultimosPedidos,
    bajoStock,
  ] = await Promise.all([
    User.countDocuments({ rol: 'cliente' }),
    Producto.countDocuments({ activo: true }),
    Order.countDocuments({}),
    Suscripcion.countDocuments({ activo: true }),
    Order.countDocuments({ orderStatus: 'pendiente' }),
    Order.countDocuments({ orderStatus: { $in: ['pagado', 'enviado', 'entregado'] } }),
    Order.countDocuments({ orderStatus: 'cancelado' }),
    Order.aggregate([
      { $match: { orderStatus: { $in: ['pagado', 'enviado', 'entregado'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $in: ['pagado', 'enviado', 'entregado'] }, createdAt: { $gte: inicioMes } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Producto.find({ activo: true, stock: { $gt: 0, $lte: 5 } }, { cod_producto: 1, titulo_de_producto: 1, stock: 1 })
      .sort({ stock: 1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalClientes,
    totalProductos,
    totalPedidos,
    totalSuscriptores,
    pedidosPendientes:  pendientes,
    pedidosPagados:     pagados,
    pedidosCancelados:  cancelados,
    ingresosTotales:    ingresosTotalesArr[0]?.total || 0,
    ingresosMes:        ingresosMesArr[0]?.total || 0,
    ultimosPedidos,
    bajoStock,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const mesActual = MESES[new Date().getMonth()];

  const statCards = [
    { label: 'Clientes',      value: stats.totalClientes,    icon: Users,        href: '/admin/usuarios',  color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { label: 'Productos',     value: stats.totalProductos,   icon: Package,      href: '/admin/productos', color: 'text-green-500',  bg: 'bg-green-50'  },
    { label: 'Pedidos',       value: stats.totalPedidos,     icon: ShoppingCart, href: '/admin/pedidos',   color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Suscriptores',  value: stats.totalSuscriptores,icon: Bell,         href: '/admin/newsletter',color: 'text-pink-500',   bg: 'bg-pink-50'   },
  ];

  const statusColor = {
    pendiente:  'text-yellow-700 bg-yellow-50',
    pagado:     'text-green-700 bg-green-50',
    preparando: 'text-blue-700 bg-blue-50',
    enviado:    'text-indigo-700 bg-indigo-50',
    entregado:  'text-green-800 bg-green-100',
    cancelado:  'text-red-700 bg-red-50',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="card hover:shadow-md transition-shadow">
            <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
            <p className="text-brand-muted text-sm">{label}</p>
          </Link>
        ))}
      </div>

      {/* Ingresos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-purple-500" />
            <p className="text-sm text-brand-muted">Ingresos totales</p>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            ${stats.ingresosTotales.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-brand-muted mt-1">Pedidos pagados, enviados y entregados</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-brand-primary" />
            <p className="text-sm text-brand-muted">Ingresos de {mesActual}</p>
          </div>
          <p className="text-3xl font-bold text-brand-text">
            ${stats.ingresosMes.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-brand-muted mt-1">Solo el mes en curso</p>
        </div>
      </div>

      {/* Estado de pedidos */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link href="/admin/pedidos?status=pendiente" className="card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="p-2 bg-yellow-50 rounded-xl"><Clock size={18} className="text-yellow-500" /></div>
          <div>
            <p className="font-bold text-brand-text text-lg">{stats.pedidosPendientes}</p>
            <p className="text-xs text-brand-muted">Pendientes</p>
          </div>
        </Link>
        <Link href="/admin/pedidos?status=pagado" className="card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="p-2 bg-green-50 rounded-xl"><CheckCircle size={18} className="text-green-500" /></div>
          <div>
            <p className="font-bold text-brand-text text-lg">{stats.pedidosPagados}</p>
            <p className="text-xs text-brand-muted">Pagados/Enviados</p>
          </div>
        </Link>
        <Link href="/admin/pedidos?status=cancelado" className="card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="p-2 bg-red-50 rounded-xl"><XCircle size={18} className="text-red-500" /></div>
          <div>
            <p className="font-bold text-brand-text text-lg">{stats.pedidosCancelados}</p>
            <p className="text-xs text-brand-muted">Cancelados</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos pedidos */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-text">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-brand-primary hover:underline">Ver todos →</Link>
          </div>
          {stats.ultimosPedidos.length === 0 ? (
            <p className="text-center text-brand-muted py-8 text-sm">No hay pedidos aún</p>
          ) : (
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
                      <td className="py-2.5 text-brand-text">{p.customerInfo?.nombre} {p.customerInfo?.apellido}</td>
                      <td className="py-2.5 font-semibold text-brand-text">${p.total?.toLocaleString('es-AR')}</td>
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
          )}
        </div>

        {/* Alertas bajo stock */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="font-semibold text-brand-text">Stock bajo</h2>
          </div>
          {stats.bajoStock.length === 0 ? (
            <p className="text-center text-brand-muted text-sm py-6">Todo el stock está OK ✓</p>
          ) : (
            <div className="space-y-3">
              {stats.bajoStock.map((p) => (
                <div key={p.cod_producto} className="flex items-center justify-between">
                  <p className="text-sm text-brand-text line-clamp-1 flex-1 mr-2">{p.titulo_de_producto}</p>
                  <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.stock} uds.
                  </span>
                </div>
              ))}
              <Link href="/admin/productos" className="block text-xs text-brand-primary hover:underline mt-2">
                Ver inventario →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
