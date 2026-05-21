'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:   data.nombre,
          apellido: data.apellido,
          email:    data.email,
          password: data.password,
          telefono: data.telefono || '',
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrarse');

      await refreshUser();
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Tu cuenta fue creada con éxito.',
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      const idToken = await firebaseUser.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          nombre:   firebaseUser.displayName?.split(' ')[0] || 'Usuario',
          apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          email:    firebaseUser.email,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al registrarse con Google');

      await refreshUser();
      router.push('/');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5 text-sm text-brand-muted hover:text-brand-primary transition-colors">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-brand-text">Crear cuenta</h1>
          <p className="text-brand-muted mt-2">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-brand-primary hover:underline font-medium">
              Iniciá sesión
            </Link>
          </p>
        </div>

        <div className="card p-8 space-y-6">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors font-medium text-brand-text disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-brand-primary rounded-full" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Registrarse con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-brand-muted">
              <span className="bg-white px-3">o con tu email</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Nombre / Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">Nombre</label>
                <input
                  placeholder="Juan"
                  className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  {...register('nombre', { required: 'Requerido' })}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">Apellido</label>
                <input
                  placeholder="Pérez"
                  className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.apellido ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  {...register('apellido', { required: 'Requerido' })}
                />
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="nombre@email.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">
                Teléfono <span className="text-brand-muted font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                placeholder="+54 9 11 1234-5678"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                {...register('telefono')}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Repetir contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  {...register('confirm', {
                    required: 'Confirmá la contraseña',
                    validate: v => v === password || 'Las contraseñas no coinciden',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                  Creando cuenta...
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
