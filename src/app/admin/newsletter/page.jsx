'use client';
// src/app/admin/newsletter/page.jsx
import { useState, useEffect } from 'react';
import { Mail, Download, Trash2, RefreshCw, Users, Send } from 'lucide-react';
import Swal from 'sweetalert2';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export default function NewsletterAdminPage() {
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [tab,          setTab]          = useState('lista'); // 'lista' | 'enviar'
  const [asunto,       setAsunto]       = useState('');
  const [contenido,    setContenido]    = useState('');
  const [enviando,     setEnviando]     = useState(false);

  const cargar = () => {
    setLoading(true);
    fetch('/api/newsletter')
      .then(r => r.json())
      .then(d => setSuscriptores(d.data || []))
      .catch(() => setSuscriptores([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleBaja = async (id, email) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Dar de baja?',
      text: `${email} dejará de recibir emails.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    });
    if (!isConfirmed) return;

    await fetch(`/api/newsletter/${id}`, { method: 'DELETE' });
    setSuscriptores(prev => prev.filter(s => s._id !== id));
    Swal.fire({ icon: 'success', title: 'Dado de baja', timer: 1200, showConfirmButton: false });
  };

  const descargarCSV = () => {
    const filtrados = suscriptoresFiltrados;
    if (!filtrados.length) return;
    const rows = ['email,fecha_suscripcion,fuente'];
    filtrados.forEach(s => {
      rows.push(`${s.email},${new Date(s.createdAt).toLocaleDateString('es-AR')},${s.fuente || 'web'}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const suscriptoresFiltrados = suscriptores.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnviarMasivo = async () => {
    if (!asunto.trim() || !contenido.trim()) {
      Swal.fire('Campos incompletos', 'Completá el asunto y el contenido.', 'warning');
      return;
    }
    const conf = await Swal.fire({
      title: '¿Enviar newsletter?',
      html: `Se enviará a <strong>${suscriptores.length}</strong> suscriptores activos.<br><br><em>Asunto: ${asunto}</em>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
    });
    if (!conf.isConfirmed) return;

    setEnviando(true);
    try {
      const res = await fetch('/api/newsletter/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asunto, contenido }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || 'Error al enviar');
      Swal.fire({
        icon: d.errores > 0 ? 'warning' : 'success',
        title: '¡Newsletter enviado!',
        html: `<p>Enviado a <strong>${d.enviados}</strong> suscriptores.</p>${d.errores > 0 ? `<p class="text-sm text-gray-500">${d.errores} errores.</p>` : ''}`,
      });
      setAsunto('');
      setContenido('');
      setTab('lista');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Mail className="text-brand-primary" size={24} />
            Newsletter
          </h1>
          <p className="text-brand-muted text-sm mt-0.5">Suscriptores activos al newsletter</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
            <RefreshCw size={14} /> Actualizar
          </button>
          <button onClick={descargarCSV} disabled={!suscriptoresFiltrados.length}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-50">
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => setTab(t => t === 'enviar' ? 'lista' : 'enviar')}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Send size={14} /> Enviar newsletter
          </button>
        </div>
      </div>

      {/* Panel de envío masivo */}
      {tab === 'enviar' && (
        <div className="card p-6 mb-6 border-l-4" style={{ borderColor: 'var(--color-primary)' }}>
          <h2 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
            <Send size={16} className="text-brand-primary" />
            Enviar email a {suscriptores.length} suscriptores activos
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label text-sm">Asunto *</label>
              <input
                type="text"
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                placeholder="Ej: ¡Novedad de temporada! 🎉"
                className="input mt-1"
              />
            </div>
            <div>
              <label className="label text-sm">Contenido *</label>
              <textarea
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                placeholder="Escribí el cuerpo del email aquí. Podés usar saltos de línea."
                rows={7}
                className="input mt-1 resize-none"
              />
              <p className="text-xs text-brand-muted mt-1">El texto se envía tal como lo escribís. Los saltos de línea se convierten automáticamente.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setTab('lista')} className="btn-secondary text-sm px-4 py-2">
                Cancelar
              </button>
              <button
                onClick={handleEnviarMasivo}
                disabled={enviando || !asunto.trim() || !contenido.trim()}
                className="btn-primary flex items-center gap-2 text-sm px-5 py-2 disabled:opacity-50"
              >
                {enviando ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando…</>
                ) : (
                  <><Send size={14} /> Enviar a {suscriptores.length} suscriptores</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center py-5">
          <p className="text-3xl font-bold text-brand-primary">{suscriptores.length}</p>
          <p className="text-sm text-brand-muted mt-1">Suscriptores activos</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-3xl font-bold text-brand-text">
            {suscriptores.filter(s => {
              const d = new Date(s.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </p>
          <p className="text-sm text-brand-muted mt-1">Este mes</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-3xl font-bold text-brand-text">
            {suscriptores.filter(s => {
              const d = new Date(s.createdAt);
              return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
          <p className="text-sm text-brand-muted mt-1">Esta semana</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card mb-4">
        <input
          type="search"
          placeholder="Buscar por email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
          </div>
        ) : suscriptoresFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={48} className="text-gray-200" />
            <p className="text-brand-muted">
              {search ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay suscriptores.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Email</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium hidden sm:table-cell">Fuente</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium hidden md:table-cell">Suscripto</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suscriptoresFiltrados.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="text-brand-primary hover:underline font-medium">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-brand-muted px-2 py-0.5 rounded-full">{s.fuente || 'web'}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted hidden md:table-cell">
                    {timeAgo(s.createdAt)} · {new Date(s.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleBaja(s._id, s.email)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Dar de baja">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {suscriptoresFiltrados.length > 0 && (
        <p className="text-xs text-brand-muted mt-3 text-right">
          {suscriptoresFiltrados.length} suscriptor{suscriptoresFiltrados.length !== 1 ? 'es' : ''}
        </p>
      )}
    </div>
  );
}
