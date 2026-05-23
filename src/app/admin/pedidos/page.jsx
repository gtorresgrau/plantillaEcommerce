'use client';
import { useState, useEffect } from 'react';
import { Search, FileText, Truck, ChevronDown, X, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import usePickit from '@/hooks/usePickit';

const STATUS_OPTIONS = ['pendiente','pagado','preparando','enviado','entregado','cancelado'];
const STATUS_COLORS = {
  pendiente:  'text-yellow-700 bg-yellow-50',
  pagado:     'text-blue-700 bg-blue-50',
  preparando: 'text-indigo-700 bg-indigo-50',
  enviado:    'text-purple-700 bg-purple-50',
  entregado:  'text-green-700 bg-green-50',
  cancelado:  'text-red-700 bg-red-50',
};

function PedidoRow({ pedido, onStatusChange }) {
  const [open, setOpen]       = useState(false);
  const [status, setStatus]   = useState(pedido.orderStatus);
  const [updating, setUpdating] = useState(false);
  const { generateLabel, pickitLoading: labelLoading } = usePickit();

  const updateStatus = async (newStatus) => {
    // Pedir nota opcional para el historial
    const { value: notaHistorial, isConfirmed } = await Swal.fire({
      title: 'Cambiar estado',
      html: `<p style="margin-bottom:8px;font-size:14px;color:#6b7280;">Nuevo estado: <strong>${newStatus}</strong></p>
             <textarea id="swal-nota" class="swal2-textarea" placeholder="Nota opcional (visible al cliente)..." style="height:80px;font-size:13px;"></textarea>`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
      preConfirm: () => document.getElementById('swal-nota')?.value || '',
    });
    if (!isConfirmed) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/pedidos/${pedido.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus, notaHistorial }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setStatus(newStatus);
      onStatusChange(pedido.orderId, newStatus);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
    } finally {
      setUpdating(false);
    }
  };

  const descargarPDF = async () => {
    try {
      const res = await fetch(`/api/pedidos/${pedido.orderId}/pdf`);
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `pedido-${pedido.orderId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF.' });
    }
  };

  const handlePickitLabel = async () => {
    if (!pedido.pickitInfo?.shipmentId) {
      Swal.fire({ icon: 'warning', title: 'Sin envío', text: 'Este pedido no tiene un envío de Pickit creado todavía.' });
      return;
    }
    await generateLabel(pedido.pickitInfo.shipmentId);
  };

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <td className="py-3 px-2 font-mono text-xs text-brand-muted">{pedido.orderId?.slice(-10)}</td>
        <td className="py-3 px-2 text-brand-text text-sm">{pedido.customerInfo?.nombre} {pedido.customerInfo?.apellido}</td>
        <td className="py-3 px-2 text-brand-muted text-xs">{pedido.customerInfo?.email}</td>
        <td className="py-3 px-2 font-semibold text-brand-text">${pedido.total?.toLocaleString('es-AR')}</td>
        <td className="py-3 px-2">
          <select
            value={status}
            onClick={e => e.stopPropagation()}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer ${STATUS_COLORS[status] || 'text-gray-600 bg-gray-100'}`}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </td>
        <td className="py-3 px-2 text-brand-muted text-xs">{new Date(pedido.createdAt).toLocaleDateString('es-AR')}</td>
        <td className="py-3 px-2">
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button onClick={descargarPDF} title="Descargar PDF" className="text-brand-muted hover:text-brand-primary">
              <FileText size={15} />
            </button>
            {pedido.tipoEnvio === 'pickit' && (
              <button onClick={handlePickitLabel} disabled={labelLoading} title="Etiqueta Pickit" className="text-brand-muted hover:text-purple-600 disabled:opacity-40">
                <Truck size={15} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} className="bg-gray-50 px-4 py-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-brand-text mb-2">Productos</p>
                {pedido.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-brand-muted text-xs py-0.5">
                    <span>{item.nombre || item.titulo_de_producto} ×{item.quantity}</span>
                    <span>${((item.precioFinal || item.precio) * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}
                {pedido.costoEnvio > 0 && (
                  <div className="flex justify-between text-brand-muted text-xs py-0.5 border-t border-gray-200 mt-1 pt-1">
                    <span>Envío</span><span>${pedido.costoEnvio.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-brand-text mb-2">Datos del cliente</p>
                <p className="text-brand-muted text-xs">{pedido.customerInfo?.telefono && <>Tel: {pedido.customerInfo.telefono}<br /></>}</p>
                {pedido.customerInfo?.direccion?.calle && (
                  <p className="text-brand-muted text-xs">
                    {pedido.customerInfo.direccion.calle} {pedido.customerInfo.direccion.numero}{pedido.customerInfo.direccion.piso ? ` ${pedido.customerInfo.direccion.piso}` : ''},
                    {' '}{pedido.customerInfo.direccion.ciudad}, {pedido.customerInfo.direccion.provincia} {pedido.customerInfo.direccion.cp}
                  </p>
                )}
                <p className="text-brand-muted text-xs mt-1">Pago: {pedido.metodoPago} · Envío: {pedido.tipoEnvio}</p>
                {pedido.pickitInfo?.trackingNumber && (
                  <p className="text-brand-muted text-xs">Tracking Pickit: {pedido.pickitInfo.trackingNumber}</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage]   = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchPedidos = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (filterStatus) params.set('status', filterStatus);
      const res  = await fetch(`/api/pedidos?${params}`);
      const data = await res.json();
      setPedidos(data.data || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedidos(1); }, [filterStatus]);

  const onStatusChange = (orderId, newStatus) => {
    setPedidos(prev => prev.map(p => p.orderId === orderId ? { ...p, orderStatus: newStatus } : p));
  };

  const filtrados = busqueda
    ? pedidos.filter(p =>
        p.orderId?.includes(busqueda) ||
        `${p.customerInfo?.nombre} ${p.customerInfo?.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.customerInfo?.email?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : pedidos;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Pedidos</h1>
          {!loading && (
            <span className="text-sm text-brand-muted">
              {filtrados.length} de {total} pedido{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Botón exportar CSV */}
        <a
          href={`/api/pedidos/export${filterStatus ? `?status=${filterStatus}` : ''}`}
          download
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-gray-50 transition-colors"
        >
          <Download size={14} /> Exportar CSV
        </a>
      </div>

      {/* Búsqueda + tabs de estado */}
      <div className="mb-4 space-y-3">
        {/* Buscador */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por N°, cliente o email..."
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white w-full"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tabs de estado */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: '',           label: 'Todos' },
            { value: 'pendiente',  label: 'Pendientes' },
            { value: 'pagado',     label: 'Pagados' },
            { value: 'preparando', label: 'Preparando' },
            { value: 'enviado',    label: 'Enviados' },
            { value: 'entregado',  label: 'Entregados' },
            { value: 'cancelado',  label: 'Cancelados' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilterStatus(tab.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === tab.value
                  ? 'text-white'
                  : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
              }`}
              style={filterStatus === tab.value ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {tab.label}
              {tab.value === 'pendiente' && total > 0 && filterStatus !== 'pendiente' ? '' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-2 text-left text-brand-muted font-normal">N° Pedido</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Cliente</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Email</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Total</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Estado</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Fecha</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
              : filtrados.map(p => (
                <PedidoRow key={p.orderId} pedido={p} onStatusChange={onStatusChange} />
              ))
            }
            {!loading && filtrados.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-brand-muted">No se encontraron pedidos</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); fetchPedidos(p); }}
                className={`w-8 h-8 rounded text-sm font-medium ${p === page ? 'bg-brand-primary text-white' : 'border border-gray-200 text-brand-text hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
