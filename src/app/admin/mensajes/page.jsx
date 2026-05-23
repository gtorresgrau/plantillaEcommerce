'use client';
// src/app/admin/mensajes/page.jsx — Bandeja de mensajes del formulario de contacto
import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, RefreshCw, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (days > 0)  return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (mins > 0)  return `hace ${mins} min`;
  return 'ahora';
}

export default function MensajesPage() {
  const [mensajes,  setMensajes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [filtro,    setFiltro]    = useState('todos'); // todos | noLeidos | leidos

  const cargar = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/contacto');
      const data = await res.json();
      setMensajes(data.data || []);
    } catch {
      // silenciar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const marcarLeido = async (id) => {
    try {
      await fetch(`/api/contacto/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: true }),
      });
      setMensajes(prev => prev.map(m => m._id === id ? { ...m, leido: true } : m));
    } catch { /* silenciar */ }
  };

  const eliminar = (id) => {
    Swal.fire({
      title: '¿Eliminar mensaje?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await fetch(`/api/contacto/${id}`, { method: 'DELETE' });
          setMensajes(prev => prev.filter(m => m._id !== id));
          if (selected?._id === id) setSelected(null);
          Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false });
        } catch {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.' });
        }
      }
    });
  };

  const filtrados = mensajes.filter(m => {
    if (filtro === 'noLeidos') return !m.leido;
    if (filtro === 'leidos')   return  m.leido;
    return true;
  });

  const noLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <MessageSquare size={24} className="text-brand-primary" />
            Mensajes de contacto
            {noLeidos > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-brand-primary text-white">
                {noLeidos} nuevos
              </span>
            )}
          </h1>
          <p className="text-sm text-brand-muted mt-1">Mensajes recibidos desde el formulario de contacto.</p>
        </div>
        <button onClick={cargar} disabled={loading}
          className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'todos',    label: `Todos (${mensajes.length})` },
          { key: 'noLeidos', label: `No leídos (${noLeidos})` },
          { key: 'leidos',   label: `Leídos (${mensajes.length - noLeidos})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFiltro(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === key
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-gray-200 text-brand-text hover:bg-gray-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card text-center py-16">
          <MessageSquare size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-brand-muted">No hay mensajes en esta categoría.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Lista */}
          <div className="lg:col-span-2 space-y-2">
            {filtrados.map((m) => (
              <div
                key={m._id}
                onClick={() => { setSelected(m); if (!m.leido) marcarLeido(m._id); }}
                className={`card cursor-pointer transition-all hover:shadow-md border-l-4 ${
                  selected?._id === m._id ? 'border-l-brand-primary bg-brand-primary/5' : 'border-l-transparent'
                } ${!m.leido ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {m.leido
                      ? <MailOpen size={15} className="text-brand-muted mt-0.5 flex-shrink-0" />
                      : <Mail     size={15} className="text-brand-primary mt-0.5 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!m.leido ? 'font-semibold text-brand-text' : 'font-medium text-brand-text'}`}>
                        {m.nombre}
                      </p>
                      <p className="text-xs text-brand-muted truncate">{m.email}</p>
                      <p className="text-xs text-brand-muted truncate mt-1">{m.mensaje}</p>
                    </div>
                  </div>
                  <span className="text-xs text-brand-muted whitespace-nowrap">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detalle */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="card sticky top-4">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-brand-text text-lg">{selected.nombre}</h2>
                    <a href={`mailto:${selected.email}`} className="text-sm text-brand-primary hover:underline">
                      {selected.email}
                    </a>
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(selected.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${selected.email}?subject=Re: Tu consulta`}
                      className="flex items-center gap-1.5 text-sm btn-primary px-3 py-1.5"
                    >
                      <Mail size={14} /> Responder
                    </a>
                    <button
                      onClick={() => eliminar(selected._id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{selected.mensaje}</p>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center h-48 text-center">
                <Mail size={36} className="text-gray-200 mb-3" />
                <p className="text-brand-muted text-sm">Seleccioná un mensaje para verlo</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
