'use client';
// src/components/storefront/NewsletterSection.jsx
import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function NewsletterSection({ titulo, subtitulo }) {
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [mensaje,  setMensaje]  = useState('');
  const [exito,    setExito]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMensaje('');
    try {
      const res  = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setExito(true);
        setMensaje(data.message || '¡Te suscribiste correctamente!');
        setEmail('');
      } else {
        setMensaje(data.error || 'Ocurrió un error.');
      }
    } catch {
      setMensaje('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-accent)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-white/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          {titulo || '¡Suscribite a nuestras novedades!'}
        </h2>
        <p className="text-white/80 mb-8">
          {subtitulo || 'Recibí ofertas exclusivas, lanzamientos y novedades directo en tu email.'}
        </p>

        {exito ? (
          <div className="flex items-center justify-center gap-3 text-white">
            <CheckCircle className="w-7 h-7" />
            <p className="text-lg font-semibold">{mensaje}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-3 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white rounded-lg font-semibold text-sm hover:bg-white/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ color: 'var(--color-accent)' }}
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : null}
              {loading ? 'Enviando...' : 'Suscribirme'}
            </button>
          </form>
        )}

        {mensaje && !exito && (
          <p className="mt-3 text-sm text-white/80">{mensaje}</p>
        )}

        <p className="text-xs text-white/60 mt-4">
          Sin spam. Podés darte de baja cuando quieras.
        </p>
      </div>
    </section>
  );
}
