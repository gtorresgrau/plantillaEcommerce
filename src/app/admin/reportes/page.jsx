'use client';
// src/app/admin/reportes/page.jsx — Descarga de reportes PDF y CSV con filtros de fecha
import { useState } from 'react';
import { FileText, Table, Download, Loader, Calendar, Users } from 'lucide-react';
import Swal from 'sweetalert2';

function DownloadCard({ title, description, icon: Icon, color, children }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-text">{title}</h3>
          <p className="text-xs text-brand-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ReportesPage() {
  const [loading, setLoading] = useState({});
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const downloadFile = async (url, filename) => {
    setLoading(l => ({ ...l, [filename]: true }));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al generar el archivo');
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(l => ({ ...l, [filename]: false }));
    }
  };

  // Construye la URL con los parámetros de fecha y estado opcionales
  const buildUrl = (base, status = '') => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (desde)  params.set('desde', desde);
    if (hasta)  params.set('hasta', hasta);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const Btn = ({ label, url, filename }) => (
    <button
      onClick={() => downloadFile(url, filename)}
      disabled={loading[filename]}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm btn-primary"
    >
      {loading[filename] ? <Loader size={13} className="animate-spin" /> : <Download size={13} />}
      {label}
    </button>
  );

  const ts = () => new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Reportes</h1>
      <p className="text-brand-muted mb-6">Descargá reportes en PDF (imprimible) o CSV (Excel compatible).</p>

      {/* ── Filtros de fecha ── */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-brand-primary" />
          <h2 className="font-semibold text-brand-text text-sm">Filtrar pedidos por período</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-brand-muted mb-1">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white" />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white" />
          </div>
          {(desde || hasta) && (
            <button onClick={() => { setDesde(''); setHasta(''); }}
              className="text-sm text-brand-primary hover:underline pb-1">
              Limpiar fechas
            </button>
          )}
        </div>
        {(desde || hasta) && (
          <p className="text-xs text-brand-muted mt-3 bg-blue-50 border border-blue-100 rounded px-3 py-2">
            📅 Los reportes de pedidos incluirán solo los del período seleccionado.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pedidos PDF */}
        <DownloadCard
          title="Pedidos — PDF"
          description="Reporte completo de pedidos, listo para imprimir"
          icon={FileText}
          color="bg-red-500"
        >
          <div className="flex flex-wrap gap-2">
            <Btn label="Todos" url={buildUrl('/api/reportes/pedidos-pdf')} filename={`pedidos-todos-${ts()}.pdf`} />
            <Btn label="Pendientes" url={buildUrl('/api/reportes/pedidos-pdf', 'pendiente')} filename={`pedidos-pendientes-${ts()}.pdf`} />
            <Btn label="Pagados" url={buildUrl('/api/reportes/pedidos-pdf', 'pagado')} filename={`pedidos-pagados-${ts()}.pdf`} />
            <Btn label="Enviados" url={buildUrl('/api/reportes/pedidos-pdf', 'enviado')} filename={`pedidos-enviados-${ts()}.pdf`} />
          </div>
        </DownloadCard>

        {/* Pedidos CSV */}
        <DownloadCard
          title="Pedidos — CSV / Excel"
          description="Listado de pedidos exportable a Excel"
          icon={Table}
          color="bg-green-600"
        >
          <div className="flex flex-wrap gap-2">
            <Btn label="Todos" url={buildUrl('/api/reportes/pedidos-csv')} filename={`pedidos-todos-${ts()}.csv`} />
            <Btn label="Pendientes" url={buildUrl('/api/reportes/pedidos-csv', 'pendiente')} filename={`pedidos-pendientes-${ts()}.csv`} />
            <Btn label="Pagados" url={buildUrl('/api/reportes/pedidos-csv', 'pagado')} filename={`pedidos-pagados-${ts()}.csv`} />
            <Btn label="Cancelados" url={buildUrl('/api/reportes/pedidos-csv', 'cancelado')} filename={`pedidos-cancelados-${ts()}.csv`} />
          </div>
        </DownloadCard>

        {/* Productos CSV */}
        <DownloadCard
          title="Productos — CSV / Excel"
          description="Inventario completo de productos para importar/exportar"
          icon={Table}
          color="bg-blue-600"
        >
          <div className="flex flex-wrap gap-2">
            <Btn label="Exportar inventario" url="/api/reportes/productos-csv" filename={`productos-${ts()}.csv`} />
          </div>
        </DownloadCard>

        {/* Suscriptores CSV */}
        <DownloadCard
          title="Newsletter — Suscriptores"
          description="Lista de suscriptores activos para campañas de email"
          icon={Users}
          color="bg-pink-500"
        >
          <div className="flex flex-wrap gap-2">
            <Btn label="Exportar suscriptores" url="/api/reportes/newsletter-csv" filename={`suscriptores-${ts()}.csv`} />
          </div>
        </DownloadCard>
      </div>
    </div>
  );
}
