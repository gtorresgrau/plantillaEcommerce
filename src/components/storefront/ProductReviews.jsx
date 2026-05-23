'use client';
// src/components/storefront/ProductReviews.jsx — Reseñas en el detalle de producto
import { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

// ── Estrellitas ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 20, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
          aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className="transition-colors"
            fill={(hover || value) >= i ? '#F59E0B' : 'none'}
            stroke={(hover || value) >= i ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );
}

// ── Barra de distribución de ratings ─────────────────────────────────────────
function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-right text-brand-muted">{label}★</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#F59E0B' }}
        />
      </div>
      <span className="w-6 text-brand-muted">{count}</span>
    </div>
  );
}

// ── Tarjeta de reseña individual ──────────────────────────────────────────────
function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 py-5 last:border-0 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-brand-text text-sm">{review.userName}</span>
            {review.compradorVerificado && (
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <CheckCircle size={12} /> Compra verificada
              </span>
            )}
            {review.destacado && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                <ThumbsUp size={10} /> Destacada
              </span>
            )}
          </div>
          <StarRating value={review.rating} readonly size={14} />
        </div>
        <span className="text-xs text-brand-muted flex-shrink-0">
          {new Date(review.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      {review.titulo && (
        <p className="font-medium text-brand-text text-sm mb-1">{review.titulo}</p>
      )}
      <p className="text-brand-muted text-sm leading-relaxed">{review.comentario}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ProductReviews({ cod_producto }) {
  const { user } = useAuth();

  const [reviews,   setReviews]   = useState([]);
  const [promedio,  setPromedio]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);

  // Form state
  const [rating,     setRating]     = useState(0);
  const [titulo,     setTitulo]     = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando,   setEnviando]   = useState(false);

  useEffect(() => {
    if (!cod_producto) return;
    fetch(`/api/reviews?cod_producto=${encodeURIComponent(cod_producto)}`)
      .then(r => r.json())
      .then(d => {
        setReviews(d.data || []);
        setPromedio(d.promedio);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cod_producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      Swal.fire({ icon: 'warning', title: 'Seleccioná una puntuación', timer: 1800, showConfirmButton: false });
      return;
    }
    if (!comentario.trim()) {
      Swal.fire({ icon: 'warning', title: 'Escribí un comentario', timer: 1800, showConfirmButton: false });
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cod_producto, rating, titulo, comentario }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Error al enviar');

      Swal.fire({
        icon:  'success',
        title: '¡Reseña enviada!',
        text:  'Tu reseña está pendiente de aprobación. Gracias por tu opinión.',
        timer: 2500,
        showConfirmButton: false,
      });
      setShowForm(false);
      setRating(0);
      setTitulo('');
      setComentario('');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setEnviando(false);
    }
  };

  // Distribución de ratings
  const dist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  if (loading) {
    return (
      <div className="mt-10 border-t border-gray-100 pt-8">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-bold text-brand-text">
            Reseñas
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-brand-muted">({reviews.length})</span>
            )}
          </h2>
          {user && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <Star size={14} /> Dejar reseña
            </button>
          )}
          {!user && (
            <a href="/login" className="text-sm text-brand-primary hover:underline">
              Iniciá sesión para dejar una reseña
            </a>
          )}
        </div>

        {/* Resumen de ratings */}
        {reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-text">{promedio}</p>
              <StarRating value={Math.round(parseFloat(promedio))} readonly size={18} />
              <p className="text-xs text-brand-muted mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {dist.map(({ n, count }) => (
                <RatingBar key={n} label={n} count={count} total={reviews.length} />
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 border border-brand-primary/20">
            <h3 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
              <Star size={16} className="text-brand-primary" /> Tu reseña
            </h3>

            <div className="mb-4">
              <label className="label text-sm mb-1 block">Puntuación *</label>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>

            <div className="mb-3">
              <label className="label text-sm">Título (opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Excelente producto"
                maxLength={100}
                className="input mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="label text-sm">Comentario *</label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Contá tu experiencia con este producto..."
                rows={4}
                maxLength={1000}
                required
                className="input mt-1 resize-none"
              />
              <p className="text-xs text-brand-muted mt-1 text-right">{comentario.length}/1000</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm px-4 py-2">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {enviando
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send size={14} />
                }
                Enviar reseña
              </button>
            </div>

            <p className="text-xs text-brand-muted mt-3">
              Tu reseña será revisada antes de publicarse.
            </p>
          </form>
        )}

        {/* Lista de reseñas */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-brand-muted">
            <Star size={40} className="mx-auto mb-3 text-gray-200" />
            <p>Todavía no hay reseñas para este producto.</p>
            {user && !showForm && (
              <button onClick={() => setShowForm(true)} className="text-brand-primary hover:underline text-sm mt-2">
                Sé el primero en reseñarlo
              </button>
            )}
          </div>
        ) : (
          <div>
            {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
