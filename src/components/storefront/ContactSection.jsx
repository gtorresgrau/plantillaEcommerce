'use client';
// src/components/storefront/ContactSection.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Mail, Phone, Send, CheckCircle } from 'lucide-react';

export default function ContactSection({ config }) {
  const email    = config?.correoContacto  || config?.correoVentas  || '';
  const telefono = config?.whatsappVentas  || config?.telefonoVentas || '';
  const direccion = config?.direccion || '';
  const cod      = config?.codigoPais || 54;

  const [enviado, setEnviado] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEnviado(true);
        reset();
      }
    } catch {
      // silenciar — el usuario puede intentar de nuevo
    }
  };

  return (
    <section id="contacto" className="py-16 px-4 bg-brand-nav">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-white uppercase tracking-wide">
          Contacto
        </h2>

        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* Info */}
          <div className="text-white space-y-6">
            <p className="text-white/80 text-lg leading-relaxed">
              Completá el formulario o escribinos directamente. Respondemos a la brevedad.
            </p>

            {direccion && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/90">{direccion}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-accent flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-white/90 hover:text-white underline underline-offset-2 transition-colors">
                  {email}
                </a>
              </div>
            )}
            {telefono && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-accent flex-shrink-0" />
                <a
                  href={`https://wa.me/${cod}${telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/90 hover:text-white underline underline-offset-2 transition-colors"
                >
                  +{cod} {telefono}
                </a>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {enviado ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-brand-text">¡Mensaje enviado!</h3>
                <p className="text-brand-muted">Te respondemos a la brevedad.</p>
                <button
                  onClick={() => setEnviado(false)}
                  className="btn-secondary text-sm"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
                    {...register('nombre', { required: 'Requerido' })}
                  />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">Mensaje</label>
                  <textarea
                    rows={4}
                    placeholder="¿En qué podemos ayudarte?"
                    className={`w-full border rounded-lg px-3 py-2.5 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors resize-none ${errors.mensaje ? 'border-red-400' : 'border-gray-200'}`}
                    {...register('mensaje', { required: 'El mensaje es requerido', minLength: { value: 10, message: 'Mínimo 10 caracteres' } })}
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
