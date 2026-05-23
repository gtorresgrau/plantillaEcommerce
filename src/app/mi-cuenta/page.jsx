'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, FileText, User, LogOut, ChevronDown, ChevronUp, Lock, Eye, EyeOff, Truck } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
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
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">

          {/* Stepper de progreso del pedido */}
          {pedido.orderStatus !== 'cancelado' && (() => {
            const STEPS = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado'];
            const currentIdx = STEPS.indexOf(pedido.orderStatus);
            return (
              <div className="flex items-center gap-0 mb-1">
                {STEPS.map((step, i) => {
                  const done    = i <= currentIdx;
                  const current = i === currentIdx;
                  const LABELS  = { pendiente: 'Pendiente', pagado: 'Pagado', preparando: 'Preparando', enviado: 'Enviado', entregado: 'Entregado' };
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            done ? 'text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                          style={done ? { backgroundColor: 'var(--color-primary)' } : {}}
                        >
                          {done && i < currentIdx ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] mt-0.5 text-center leading-tight hidden sm:block ${current ? 'font-semibold text-brand-text' : 'text-brand-muted'}`}>
                          {LABELS[step]}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1" style={{ backgroundColor: i < currentIdx ? 'var(--color-primary)' : '#e5e7eb' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Productos */}
          <div>
            <h4 className="text-sm font-medium text-brand-text mb-2">Productos</h4>
            <div className="space-y-1.5">
              {pedido.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-brand-muted">{item.nombre || item.titulo_de_producto} ×{item.quantity}</span>
                  <span className="text-brand-text font-medium">${((item.precioFinal || item.precio) * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            {pedido.subtotal > 0 && pedido.subtotal !== pedido.total && (
              <div className="flex justify-between text-sm text-brand-muted">
                <span>Subtotal</span>
                <span>${pedido.subtotal?.toLocaleString('es-AR')}</span>
              </div>
            )}
            {pedido.costoEnvio > 0 && (
              <div className="flex justify-between text-sm text-brand-muted">
                <span>Envío</span>
                <span>${pedido.costoEnvio.toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-brand-text pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>${pedido.total?.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Info adicional */}
          {(pedido.metodoPago || pedido.tipoEnvio) && (
            <div className="text-xs text-brand-muted bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
              {pedido.metodoPago && (
                <p><span className="font-medium">Pago:</span> {
                  { mercadopago: 'MercadoPago', transferencia: 'Transferencia', efectivo: 'Efectivo' }[pedido.metodoPago] || pedido.metodoPago
                }</p>
              )}
              {pedido.tipoEnvio && (
                <p><span className="font-medium">Entrega:</span> {pedido.tipoEnvio === 'retiroLocal' ? 'Retiro en local' : 'Envío a domicilio'}</p>
              )}
              {pedido.notasAdmin && (
                <p className="mt-1 pt-1 border-t border-gray-200"><span className="font-medium">Nota:</span> {pedido.notasAdmin}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={descargarPDF} className="flex items-center gap-2 text-sm text-brand-primary hover:underline">
              <FileText size={14} /> Descargar comprobante PDF
            </button>
            <Link href={`/pedido/${pedido.orderId}`} className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary transition-colors">
              <Truck size={14} /> Rastrear pedido
            </Link>
          </div>
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

// ─── Tab: Seguridad / Cambiar contraseña ─────────────────────────────────────
function TabSeguridad({ user }) {
  const [actual,       setActual]       = useState('');
  const [nueva,        setNueva]        = useState('');
  const [confirmar,    setConfirmar]    = useState('');
  const [showActual,   setShowActual]   = useState(false);
  const [showNueva,    setShowNueva]    = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [saving,       setSaving]       = useState(false);

  // Si el usuario se autenticó con Google/OAuth no tiene contraseña propia
  const esGoogleUser = auth.currentUser?.providerData?.some(p => p.providerId === 'google.com');

  const handleCambiar = async (e) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      return Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas nuevas no coinciden.' });
    }
    if (nueva.length < 6) {
      return Swal.fire({ icon: 'error', title: 'Error', text: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    setSaving(true);
    try {
      const fireUser = auth.currentUser;
      if (!fireUser) throw new Error('No hay sesión activa.');

      // Re-autenticar con contraseña actual
      const cred = EmailAuthProvider.credential(fireUser.email, actual);
      await reauthenticateWithCredential(fireUser, cred);
      await updatePassword(fireUser, nueva);

      Swal.fire({ icon: 'success', title: '¡Contraseña actualizada!', timer: 2000, showConfirmButton: false });
      setActual(''); setNueva(''); setConfirmar('');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password'
        ? 'La contraseña actual es incorrecta.'
        : err.code === 'auth/too-many-requests'
        ? 'Demasiados intentos. Intentá en unos minutos.'
        : err.code === 'auth/requires-recent-login'
        ? 'Por seguridad, cerrá sesión y volvé a ingresar antes de cambiar la contraseña.'
        : 'No se pudo actualizar la contraseña.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (esGoogleUser) {
    return (
      <div className="card max-w-md flex flex-col items-center text-center gap-3 py-8">
        <div className="p-4 bg-blue-50 rounded-full">
          <Lock size={28} className="text-blue-400" />
        </div>
        <h3 className="font-semibold text-brand-text">Cuenta de Google</h3>
        <p className="text-sm text-brand-muted">Tu cuenta usa Google para autenticarse. Gestioná tu contraseña directamente desde tu cuenta de Google.</p>
        <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer"
          className="btn-primary text-sm px-4 py-2 mt-2">
          Ir a seguridad de Google
        </a>
      </div>
    );
  }

  return (
    <div className="card max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-primary/10 rounded-lg">
          <Lock size={18} className="text-brand-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-text">Cambiar contraseña</h3>
          <p className="text-xs text-brand-muted">Usá al menos 6 caracteres</p>
        </div>
      </div>

      <form onSubmit={handleCambiar} className="space-y-4">
        {/* Contraseña actual */}
        <div>
          <label className="block text-xs text-brand-muted mb-1">Contraseña actual</label>
          <div className="relative">
            <input
              type={showActual ? 'text' : 'password'}
              value={actual}
              onChange={e => setActual(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
              placeholder="Tu contraseña actual"
            />
            <button type="button" onClick={() => setShowActual(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showActual ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="block text-xs text-brand-muted mb-1">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showNueva ? 'text' : 'password'}
              value={nueva}
              onChange={e => setNueva(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
            />
            <button type="button" onClick={() => setShowNueva(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNueva ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirmar */}
        <div>
          <label className="block text-xs text-brand-muted mb-1">Confirmá la nueva contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              minLength={6}
              className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm text-brand-text focus:outline-none ${
                confirmar && nueva !== confirmar ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand-primary'
              }`}
              placeholder="Repetí la nueva contraseña"
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {confirmar && nueva !== confirmar && (
            <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || (confirmar && nueva !== confirmar)}
          className="btn-primary w-full py-2.5 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? 'Actualizando...' : 'Cambiar contraseña'}
        </button>
      </form>
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
    { key: 'activos',   label: 'Pedidos activos' },
    { key: 'historial', label: 'Historial' },
    { key: 'perfil',    label: 'Mi perfil' },
    { key: 'seguridad', label: 'Seguridad' },
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
        {tab === 'seguridad' && <TabSeguridad user={user} />}
      </div>

      <Footer />
    </div>
  );
}
