'use client';
// src/app/super-admin/pedidos/page.jsx — Vista global de pedidos
import { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CFG = {
  pendiente:  { label: 'Pendiente',  color: 'text-yellow-300 bg-yellow-900/30 border-yellow-700' },
  pagado:     { label: 'Pagado',     color: 'text-blue-300 bg-blue-900/30 border-blue-700' },
  preparando: { label: 'Preparando', color: 'text-indigo-300 bg-indigo-900/30 border-indigo-700' },
  enviado:    { label: 'Enviado',    color: 'text-purple-300 bg-purple-900/30 border-purple-700' },
  entregado:  { label: 'Entregado',  color: 'text-green-300 bg-green-900/30 border-green-700' },
  cancelado:  { label: 'Cancelado',  color: 'text-red-300 bg-red-900/30 border-red-700' },
};

function PedidoRow({ pedido }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[pedido.orderStatus] || { label: pedido.orderStatus, color: 'text-gray-400 bg-gray-800 border-gray-700' };

  return (
    <>
      <tr className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => setOpen(o => !o)}>
        <td className="px-4 py-3">
          <p className="font-mono text-xs text-gray-400">{pedido.orderId}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-gray-200 text-sm">{pedido.cliente?.nombre} {pedido.cliente?.apellido}</p>
          <p className="text-xs text-gray-500">{pedido.cliente?.email}</p>
        </td>
        <td className="px-4 py-3 text-right">
          <p className="font-semibold text-white">${pedido.total?.toLocaleString('es-AR')}</p>
        </td>
        <td className="px-4 py-3 text-center hidden sm:table-cell">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
            {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
          {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
        </td>
        <td className="px-4 py-3 text-center">
          {open ? <ChevronUp size={14} className="text-gray-400 mx-auto" /> : <ChevronDown size={14} className="text-gray-400 mx-auto" />}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="px-4 py-3 bg-gray-800/40 border-b border-gray-800">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Productos</p>
                {pedido.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-300 mb-1">
                    <span className="line-clamp-1">{item.nombre || item.titulo_de_producto} ×{item.quantity}</span>
                    <span className="text-gray-400 flex-shrink-0 ml-3">${((item.precioFinal || item.precio) * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Envío</p>
                <p className="text-gray-300">{pedido.envio?.tipo || '—'}</p>
                {pedido.envio?.direccion && <p className="text-gray-500 text-xs mt-1">{pedido.envio.direccion}</p>}
                <p className="text-gray-400 text-xs mt-2">Método de pago: <span className="text-gray-300">{pedido.metodoPago || '—'}</span></p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SuperAdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('todos');
  const [totales, setTotales] = useState({ total: 0, ingresos: 0 });

  const cargar = () => {
    setLoading(true);
    fetch('/api/pedidos?limit=100')
      .then(r => r.json())
      .then(d => {
        const data = d.data || [];
        setPedidos(data);
        const pagados = data.filter(p => ['pagado', 'enviado', 'entregado'].includes(p.orderStatus));
        setTotales({
          total:    data.length,
          ingresos: pagados.reduce((acc, p) => acc + (p.total || 0), 0),
        });
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = pedidos.filter(p => {
    const matchSearch = !search || [p.orderId, p.cliente?.email, p.cliente?.nombre].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'todos' || p.orderStatus === status;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="text-purple-400" />
            Todos los pedidos
          </h1>
          <p className="text-gray-400 mt-1">{totales.total} pedidos · ${totales.ingresos.toLocaleString('es-AR')} en ingresos</p>
        </div>
        <button onClick={cargar} className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID, email o cliente..."
            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-500"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingCart size={40} className="text-gray-700" />
            <p className="text-gray-500">Sin pedidos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Cliente</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Total</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Estado</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Fecha</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtrados.map(p => <PedidoRow key={p._id || p.orderId} pedido={p} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
