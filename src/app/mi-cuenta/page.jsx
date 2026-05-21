'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, FileText, User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock },
  pagado:     { label: 'Pagado',     color: 'text-blue-700 bg-blue-50 border-blue-200',       icon: CheckCircle },
  preparando: { label: 'Preparando', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Package },
  enviado:    { label: 'Enviado',    color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Package },
  entregado:  { label: 'Entregado',  color: 'text-green-700 bg-green-50 border-green-200',    icon: CheckCircle },
  cancelado:  { label: 'Cancelado',  color: 'text-red-700 bg-red-50 border-red-200',          icon: XCircle },
};

function PedidoCard({ pedido }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[pedido.orderStatus] || { label: pedido.orderStatus, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Package };
  const Icon = cfg.icon;

  const descargarPDF = async () => {
    try {
      const res = await fetch(`/api/pedidos/${pedido.orderId}/pdf`);
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `pedido-${pedido.orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo descargar el comprobante.' });
    }
  };

  return (
    <div className="card border border-gray-100">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${cfg.color}`}>
            <Icon size={16} />
          </div>
          <div>
            <p className="font-mono text-xs text-brand-muted">{pedido.orderId}</p>
            <p className="font-semibold text-brand-text text-sm">${pedido.total?.toLocaleString('es-AR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
          <span className="text-xs text-brand-muted">{new Date(pedido.createdAt).toLocaleDateString('es-AR')}</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-brand-text mb-2">Productos</h4>
          <div className="space-y-1.5 mb-3">
            {pedido.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-brand-muted">{item.titulo_de_producto} ×{item.quantity}</span>
                <span className="text-brand-text">${((item.precioFinal || item.precio) * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          {pedido.costoEnvio > 0 && (
            <div className="flex justify-between text-sm text-brand-muted border-t border-gray-100 pt-2">
              <span>Envío</span>
              <span>${pedido.costoEnvio.toLocaleString('es-AR')}</span>
            </div>
          )}
          <button onClick={descargarPDF} className="mt-3 flex items-center gap-2 text-sm text-brand-primary hover:underline">
            <FileText size={14} /> Descargar comprobante PDF
          </button>
        </div>
      )}
    </div>
  );
}

function TabPedidos({ filter }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pedidos?limit=50')
      .then(r => r.json())
      .then(d => {
        let data = d.data || [];
        if (filter === 'activos') data = data.filter(p => !['entregado', 'cancelado'].includes(p.orderStatus));
        if (filter === 'historial') data = data.filter(p => ['entregado', 'cancelado'].includes(p.orderStatus));
        setPedidos(data);
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto" /></div>;

  if (pedidos.length === 0) return (
    <div className="text-center py-12">
      <Package size={48} className="text-gray-200 mx-auto mb-3" />
      <p className="text-brand-muted">No tenés pedidos {filter === 'activos' ? 'activos' : 'en el historial'}</p>
      <Link href="/productos" className="btn-primary mt-4 inline-block text-sm">Ver productos</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {pedidos.map(p => <PedidoCard key={p.orderId} pedido={p} />)}
    </div>
  );
}

function TabPerfil({ user }) {
  const [editing, setEditing]   = useState(false);
  const [nombre, setNombre]     = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [saving, setSaving]     = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, telefono }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEditing(false);
      Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-text">Mis datos</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-brand-primary hover:underline">Editar</button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-brand-muted mb-0.5">Nombre</label>
          {editing
            ? <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-brand-text" />
            : <p className="text-brand-text text-sm">{nombre || '—'}</p>
          }
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-0.5">Apellido</label>
          {editing
            ? <input value={apellido} onChange={e => setApellido(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-brand-text" />
            : <p className="text-brand-text text-sm">{apellido || '—'}</p>
          }
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-0.5">Email</label>
          <p className="text-brand-text text-sm">{user?.email}</p>
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-0.5">Teléfono</label>
          {editing
            ? <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-brand-text" />
            : <p className="text-brand-text text-sm">{telefono || '—'}</p>
          }
        </div>
      </div>

      {editing && (
        <div className="flex gap-2 mt-4">
          <button onClick={save} disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default function MiCuentaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('activos');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { key: 'activos',  label: 'Pedidos activos' },
    { key: 'historial',label: 'Historial' },
    { key: 'perfil',   label: 'Mi perfil' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Mi cuenta</h1>
            <p className="text-brand-muted text-sm">{user.nombre} {user.apellido} · {user.email}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:underline">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {tab === 'activos'   && <TabPedidos filter="activos" />}
        {tab === 'historial' && <TabPedidos filter="historial" />}
        {tab === 'perfil'    && <TabPerfil user={user} />}
      </div>

      <Footer />
    </div>
  );
}
