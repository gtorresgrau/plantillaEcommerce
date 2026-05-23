'use client';
// src/app/reset-password/page.jsx — Recuperar contraseña via Firebase
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [enviado,  setEnviado]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (err) {
      const msg = {
        'auth/user-not-found':     'No existe una cuenta con ese email.',
        'auth/invalid-email':      'El email ingresado no es válido.',
        'auth/too-many-requests':  'Demasiados intentos. Esperá unos minutos.',
      }[err.code] || 'Ocurrió un error. Intentá nuevamente.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary transition-colors mb-5">
            <ArrowLeft size={14} /> Volver al login
          </Link>
          <h1 className="text-3xl font-bold text-brand-text">Recuperar contraseña</h1>
          <p className="text-brand-muted mt-2 text-sm">
            Ingresá tu email y te enviamos un link para restablecer tu contraseña.
          </p>
        </div>

        <div className="card p-8">
          {enviado ? (
            /* ── Éxito ── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-brand-text">¡Email enviado!</h2>
              <p className="text-brand-muted text-sm">
                Revisá tu bandeja de entrada (y spam) en{' '}
                <span className="font-semibold text-brand-text">{getValues('email')}</span>.
                El link expira en 1 hora.
              </p>
              <Link
                href="/login"
                className="block mt-4 btn-primary py-2.5 text-center"
              >
                Volver al login
              </Link>
            </div>
          ) : (
            /* ── Formulario ── */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Email de tu cuenta
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@email.com"
                    className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {errorMsg && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                    Enviando...
                  </>
                ) : 'Enviar link de recuperación'}
              </button>

              <p className="text-center text-xs text-brand-muted">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-brand-primary hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
