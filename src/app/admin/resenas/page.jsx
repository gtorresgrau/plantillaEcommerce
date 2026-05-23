'use client';
// src/app/admin/resenas/page.jsx — Moderación de reseñas
import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, Trash2, ThumbsUp, RefreshCw, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? '#F59E0B' : 'none'}
          stroke={i <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

const FILTROS = [
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'aprobadas',  label: 'Aprobadas' },
  { key: 'todas',      label: 'Todas' },
];

export default function ResenasAdminPage() {
  const [resenas,   setResenas]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState('pendientes');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      // Cargamos TODOS los productos con reseñas — usando el query ?all=true en distintos cod_producto
      // Para simplificar, creamos un endpoint que devuelve todas las reseñas (admin)
      const res  = await fetch('/api/reviews/admin');
      const data = await res.json();
      setResenas(data.data || []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar las reseñas.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleAprobado = async (id, actual) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ aprobado: !actual }),
      });
      if (!res.ok) throw new Error();
      setResenas(prev => prev.map(r => r._id === id ? { ...r, aprobado: !actual } : r));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la reseña.' });
    }
  };

  const toggleDestacado = async (id, actual) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ destacado: !actual }),
      });
      if (!res.ok) throw new Error();
      setResenas(prev => prev.map(r => r._id === id ? { ...r, destacado: !actual } : r));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la reseña.' });
    }
  };

  const eliminar = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar reseña?',
      icon:  'warning',
      showCancelButton:   true,
      confirmButtonText:  'Sí, eliminar',
      cancelButtonText:   'Cancelar',
      confirmButtonColor: '#EF4444',
    });
    if (!isConfirmed) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setResenas(prev => prev.filter(r => r._id !== id));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al eliminar' });
    }
  };

  const filtradas = resenas.filter(r => {
    if (filtro === 'pendientes') return !r.aprobado;
    if (filtro === 'aprobadas')  return r.aprobado;
    return true;
  });

  const pendientesCount = resenas.filter(r => !r.aprobado).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Star size={22} className="text-brand-primary" />
            Reseñas
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">Moderá las reseñas antes de que sean visibles</p>
        </div>
        <button onClick={cargar} className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
          <RefreshCw size={14} /> Recargar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-brand-text">{resenas.length}</p>
          <p className="text-xs text-brand-muted mt-0.5">Total</p>
        </div>
        <div className="card text-center py-4 border-l-4 border-yellow-400">
          <p className="text-2xl font-bold text-yellow-600">{pendientesCount}</p>
          <p className="text-xs text-brand-muted mt-0.5">Pendientes</p>
        </div>
        <div className="card text-center py-4 border-l-4 border-green-400">
          <p className="text-2xl font-bold text-green-600">{resenas.filter(r => r.aprobado).length}</p>
          <p className="text-xs text-brand-muted mt-0.5">Aprobadas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f.key ? 'text-white' : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
            }`}
            style={filtro === f.key ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {f.label}
            {f.key === 'pendientes' && pendientesCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {pendientesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <Star size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No hay reseñas {filtro === 'pendientes' ? 'pendientes' : filtro === 'aprobadas' ? 'aprobadas' : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(r => (
            <div key={r._id} className={`card border-l-4 transition-all ${r.aprobado ? 'border-green-400' : 'border-yellow-400'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <StarDisplay rating={r.rating} />
                    <span className="text-sm font-medium text-brand-text">{r.userName}</span>
                    {r.compradorVerificado && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={11} /> Verificado
                      </span>
                    )}
                    {r.destacado && (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">⭐ Destacada</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.aprobado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.aprobado ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mb-1">
                    Producto: <span className="font-mono">{r.cod_producto}</span> · {new Date(r.createdAt).toLocaleDateString('es-AR')}
                  </p>
                  {r.titulo && <p className="font-medium text-brand-text text-sm mb-1">{r.titulo}</p>}
                  <p className="text-brand-muted text-sm leading-relaxed">{r.comentario}</p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAprobado(r._id, r.aprobado)}
                    title={r.aprobado ? 'Quitar aprobación' : 'Aprobar'}
                    className={`p-2 rounded-lg transition-colors ${r.aprobado ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-brand-muted hover:bg-green-50 hover:text-green-600'}`}
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => toggleDestacado(r._id, r.destacado)}
                    title={r.destacado ? 'Quitar destacado' : 'Destacar'}
                    className={`p-2 rounded-lg transition-colors ${r.destacado ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-brand-muted hover:bg-yellow-50 hover:text-yellow-600'}`}
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    onClick={() => eliminar(r._id)}
                    title="Eliminar"
                    className="p-2 rounded-lg bg-gray-100 text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
