'use client';
// src/app/admin/reportes/page.jsx — Descarga de reportes PDF y CSV
import { useState } from 'react';
import { FileText, Table, Download, Loader } from 'lucide-react';
import Swal from 'sweetalert2';

function DownloadCard({ title, description, icon: Icon, color, buttons }) {
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
      <div className="flex flex-wrap gap-2">
        {buttons}
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const [loading, setLoading] = useState({});

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

  const btn = (label, url, filename) => (
    <button
      key={filename}
      onClick={() => downloadFile(url, filename)}
      disabled={loading[filename]}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm btn-primary"
    >
      {loading[filename] ? <Loader size={13} className="animate-spin" /> : <Download size={13} />}
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Reportes</h1>
      <p className="text-brand-muted mb-6">Descargá reportes en PDF (imprimible) o CSV (Excel compatible)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DownloadCard
          title="Pedidos — PDF"
          description="Reporte completo de pedidos, listo para imprimir"
          icon={FileText}
          color="bg-red-500"
          buttons={[
            btn('Todos los pedidos', '/api/reportes/pedidos-pdf', `pedidos-${Date.now()}.pdf`),
            btn('Solo pendientes', '/api/reportes/pedidos-pdf?status=pendiente', `pendientes-${Date.now()}.pdf`),
            btn('Solo pagados', '/api/reportes/pedidos-pdf?status=pagado', `pagados-${Date.now()}.pdf`),
          ]}
        />

        <DownloadCard
          title="Pedidos — CSV / Excel"
          description="Listado de pedidos exportable a Excel"
          icon={Table}
          color="bg-green-600"
          buttons={[
            btn('Todos', '/api/reportes/pedidos-csv', `pedidos-${Date.now()}.csv`),
            btn('Pendientes', '/api/reportes/pedidos-csv?status=pendiente', `pendientes-${Date.now()}.csv`),
            btn('Pagados', '/api/reportes/pedidos-csv?status=pagado', `pagados-${Date.now()}.csv`),
          ]}
        />

        <DownloadCard
          title="Productos — CSV / Excel"
          description="Inventario completo de productos"
          icon={Table}
          color="bg-blue-600"
          buttons={[
            btn('Exportar productos', '/api/reportes/productos-csv', `productos-${Date.now()}.csv`),
          ]}
        />
      </div>
    </div>
  );
}
