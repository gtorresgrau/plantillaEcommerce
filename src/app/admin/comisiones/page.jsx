'use client';
// src/app/admin/comisiones/page.jsx — Gestión de comisiones de vendedores
import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Users, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  pendiente:  'text-yellow-700 bg-yellow-50',
  pagado:     'text-blue-700 bg-blue-50',
  preparando: 'text-indigo-700 bg-indigo-50',
  enviado:    'text-purple-700 bg-purple-50',
  entregado:  'text-green-700 bg-green-50',
  cancelado:  'text-red-700 bg-red-50',
};

export default function ComisionesAdminPage() {
  const [resumen,      setResumen]      = useState([]);
  const [pedidos,      setPedidos]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [vendedorSel,  setVendedorSel]  = useState(null); // vendedorId seleccionado
  const [desde,        setDesde]        = useState('');
  const [hasta,        setHasta]        = useState('');
  const [expandidos,   setExpandidos]   = useState({});

  const cargar = useCallback(async (vId = vendedorSel) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      if (vId)   params.set('vendedorId', vId);

      const res = await fetch(`/api/comisiones?${params}`);
      const d   = await res.json();
      if (d.success) {
        setResumen(d.data.resumen || []);
        setPedidos(d.data.pedidos || []);
      }
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [desde, hasta, vendedorSel]);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleVendedor = (id) => {
    const next = vendedorSel === id ? null : id;
    setVendedorSel(next);
    cargar(next);
  };

  const toggleExpand = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const totalComisiones = resumen.reduce((acc, v) => acc + (v.totalComisiones || 0), 0);
  const totalVentas     = resumen.reduce((acc, v) => acc + (v.totalVentas     || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <DollarSign size={22} className="text-brand-primary" />
            Comisiones de vendedores
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Resumen de ventas y comisiones por vendedor
          </p>
        </div>
        <button onClick={() => cargar()} className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filtros de fecha */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label text-xs mb-1 block">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="label text-xs mb-1 block">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="input text-sm" />
          </div>
          <button onClick={() => cargar()} className="btn-primary text-sm px-4 py-2">Aplicar</button>
          <button onClick={() => { setDesde(''); setHasta(''); setVendedorSel(null); }}
            className="btn-secondary text-sm px-4 py-2">Limpiar</button>
        </div>
      </div>

      {/* Totales globales */}
      {!loading && resumen.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-xs text-brand-muted mb-1">Total vendido</p>
            <p className="text-xl font-bold text-brand-text">${totalVentas.toLocaleString('es-AR')}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-brand-muted mb-1">Total comisiones</p>
            <p className="text-xl font-bold text-brand-primary">${totalComisiones.toLocaleString('es-AR')}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-brand-muted mb-1">Vendedores activos</p>
            <p className="text-xl font-bold text-brand-text">{resumen.length}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Tabla de vendedores */}
      {!loading && resumen.length === 0 && (
        <div className="card text-center py-16 text-brand-muted">
          <Users size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No hay pedidos con vendedores asignados en el período seleccionado.</p>
        </div>
      )}

      {!loading && resumen.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Vendedor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">Comisión</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Ventas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Comisión total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden md:table-cell">Pedidos</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {resumen.map(v => {
                const isSelected = vendedorSel === String(v._id);
                return (
                  <>
                    <tr key={v._id}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary/5' : ''}`}
                      onClick={() => toggleVendedor(String(v._id))}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-text">{v.nombre}</p>
                        <p className="text-xs text-brand-muted">{v.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                          {v.porcentaje}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-brand-text">
                        ${v.totalVentas?.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-brand-primary">
                        ${v.totalComisiones?.toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-center text-brand-muted hidden md:table-cell">
                        {v.cantidadPedidos}
                        {v.pedidosCancelados > 0 && (
                          <span className="text-[10px] text-red-500 ml-1">({v.pedidosCancelados} cancelados)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSelected ? <ChevronDown size={14} className="text-brand-primary mx-auto" /> : <ChevronRight size={14} className="text-brand-muted mx-auto" />}
                      </td>
                    </tr>

                    {/* Detalle de pedidos del vendedor */}
                    {isSelected && pedidos.length > 0 && (
                      <tr key={`detail-${v._id}`}>
                        <td colSpan={6} className="px-4 pb-4 bg-gray-50/80">
                          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-2 mt-3">
                            Últimos pedidos ({pedidos.length})
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-1.5 pr-4 font-medium text-brand-muted">N° Pedido</th>
                                  <th className="text-left py-1.5 pr-4 font-medium text-brand-muted">Cliente</th>
                                  <th className="text-left py-1.5 pr-4 font-medium text-brand-muted">Fecha</th>
                                  <th className="text-center py-1.5 pr-4 font-medium text-brand-muted">Estado</th>
                                  <th className="text-right py-1.5 pr-4 font-medium text-brand-muted">Total</th>
                                  <th className="text-right py-1.5 font-medium text-brand-muted">Comisión</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pedidos.map(p => (
                                  <tr key={p.orderId} className="border-b border-gray-100">
                                    <td className="py-1.5 pr-4 font-mono">{p.orderId}</td>
                                    <td className="py-1.5 pr-4">{p.customerInfo?.nombre} {p.customerInfo?.apellido}</td>
                                    <td className="py-1.5 pr-4 text-brand-muted">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                                    <td className="py-1.5 pr-4 text-center">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.orderStatus] || ''}`}>
                                        {p.orderStatus}
                                      </span>
                                    </td>
                                    <td className="py-1.5 pr-4 text-right">${p.total?.toLocaleString('es-AR')}</td>
                                    <td className="py-1.5 text-right text-brand-primary font-medium">
                                      ${p.vendedor?.comisionTotal?.toLocaleString('es-AR') || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
