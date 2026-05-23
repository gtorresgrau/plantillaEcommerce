'use client';
// src/app/vendedor/pedidos/page.jsx — Ventas del vendedor (vista de solo lectura)
import { useState, useEffect } from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS = {
  pendiente:  { label: 'Pendiente',  color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  pagado:     { label: 'Pagado',     color: 'text-blue-700 bg-blue-50 border-blue-200' },
  preparando: { label: 'Preparando', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  enviado:    { label: 'Enviado',    color: 'text-purple-700 bg-purple-50 border-purple-200' },
  entregado:  { label: 'Entregado',  color: 'text-green-700 bg-green-50 border-green-200' },
  cancelado:  { label: 'Cancelado',  color: 'text-red-700 bg-red-50 border-red-200' },
};

function PedidoRow({ pedido }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS[pedido.orderStatus] || { label: pedido.orderStatus, color: 'text-gray-600 bg-gray-50 border-gray-200' };

  return (
    <div className="card border border-gray-100 mb-2">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
          <div>
            <p className="font-mono text-xs text-brand-muted">{pedido.orderId}</p>
            <p className="text-sm font-semibold text-brand-text">${pedido.total?.toLocaleString('es-AR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-muted hidden sm:block">
            {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <p className="text-xs text-brand-muted">Cliente</p>
              <p className="font-medium text-brand-text">{pedido.datosCliente?.nombre} {pedido.datosCliente?.apellido}</p>
              <p className="text-brand-muted">{pedido.datosCliente?.email}</p>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Envío</p>
              <p className="font-medium text-brand-text capitalize">{pedido.tipoEnvio?.replace('Local', ' local') || '—'}</p>
              <p className="text-brand-muted capitalize">{pedido.metodoPago || '—'}</p>
            </div>
          </div>
          <div className="space-y-1">
            {pedido.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-brand-text">{item.nombre || item.titulo_de_producto} × {item.quantity}</span>
                <span className="font-medium text-brand-text">${(item.precioFinal * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendedorPedidosPage() {
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/pedidos?limit=50')
      .then(r => r.json())
      .then(d => { setPedidos(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Mis ventas</h1>
          <p className="text-sm text-brand-muted mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} ·
            Total: <span className="font-semibold text-brand-text">${total.toLocaleString('es-AR')}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card text-center py-16">
          <ShoppingCart size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-brand-muted">Todavía no hay ventas.</p>
        </div>
      ) : (
        <div>{pedidos.map(p => <PedidoRow key={p._id} pedido={p} />)}</div>
      )}
    </div>
  );
}
