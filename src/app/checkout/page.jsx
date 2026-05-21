'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Landmark, Banknote, MapPin, User, Phone, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

const METODO_LABELS = {
  mercadopago:       { label: 'MercadoPago',    icon: CreditCard,  desc: 'Tarjeta, efectivo o transferencia vía MP' },
  transferencia:     { label: 'Transferencia',  icon: Landmark,    desc: 'CBU/alias — te enviamos los datos' },
  efectivo:          { label: 'Efectivo',        icon: Banknote,    desc: 'Pago en mano al recibir' },
};

const TIPO_ENVIO_LABELS = {
  pickit:        'Envío por Pickit (a domicilio o punto de retiro)',
  retiroLocal:   'Retiro en local (sin costo)',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [metodoPago, setMetodoPago]   = useState('mercadopago');
  const [tipoEnvio, setTipoEnvio]     = useState('pickit');
  const [loading, setLoading]         = useState(false);

  const COSTO_ENVIO = tipoEnvio === 'retiroLocal' ? 0 : 1500;
  const total = subtotal + COSTO_ENVIO;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nombre:    user?.nombre   || '',
      apellido:  user?.apellido || '',
      email:     user?.email    || '',
      telefono:  user?.telefono || '',
      calle:     '',
      numero:    '',
      piso:      '',
      ciudad:    '',
      provincia: '',
      cp:        '',
    },
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-xl font-semibold text-brand-text">No tenés productos en el carrito</p>
          <Link href="/productos" className="btn-primary">Ver productos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const customerInfo = {
        nombre:   formData.nombre,
        apellido: formData.apellido,
        email:    formData.email,
        telefono: formData.telefono,
        direccion: {
          calle:     formData.calle,
          numero:    formData.numero,
          piso:      formData.piso,
          ciudad:    formData.ciudad,
          provincia: formData.provincia,
          cp:        formData.cp,
        },
      };

      // 1. Crear el pedido
      const pedidoRes = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo,
          items: items.map(i => ({
            cod_producto:     i.cod_producto,
            titulo_de_producto: i.titulo_de_producto,
            precio:           i.precioFinal,
            precioFinal:      i.precioFinal,
            quantity:         i.quantity,
          })),
          metodoPago,
          tipoEnvio,
          costoEnvio: COSTO_ENVIO,
        }),
      });

      const pedidoData = await pedidoRes.json();
      if (!pedidoRes.ok) throw new Error(pedidoData.error || 'Error al crear el pedido');

      const orderId = pedidoData.data.orderId;

      // 2. Si es MercadoPago, crear preferencia y redirigir
      if (metodoPago === 'mercadopago') {
        const mpRes = await fetch('/api/mercadopago/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const mpData = await mpRes.json();
        if (!mpRes.ok) throw new Error(mpData.error || 'Error al crear la preferencia de pago');
        clearCart();
        window.location.href = mpData.init_point;
        return;
      }

      // 3. Para otros métodos de pago
      clearCart();
      router.push(`/checkout/exito?orderId=${orderId}`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-brand-text mb-6">Finalizar compra</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-5">
              {/* Datos personales */}
              <div className="card">
                <h2 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                  <User size={16} className="text-brand-primary" /> Datos personales
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-1">Nombre</label>
                    <input className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
                      {...register('nombre', { required: 'Requerido' })} />
                    {errors.nombre && <p className="text-red-500 text-xs mt-0.5">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-1">Apellido</label>
                    <input className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.apellido ? 'border-red-400' : 'border-gray-200'}`}
                      {...register('apellido', { required: 'Requerido' })} />
                    {errors.apellido && <p className="text-red-500 text-xs mt-0.5">{errors.apellido.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                    <input type="email" className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                      {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })} />
                    {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      {...register('telefono')} />
                  </div>
                </div>
              </div>

              {/* Tipo de envío */}
              <div className="card">
                <h2 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-brand-primary" /> Tipo de entrega
                </h2>
                <div className="space-y-2 mb-4">
                  {Object.entries(TIPO_ENVIO_LABELS).map(([key, label]) => (
                    <label key={key} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${tipoEnvio === key ? 'border-brand-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="tipoEnvio" value={key} checked={tipoEnvio === key} onChange={() => setTipoEnvio(key)} className="accent-brand-primary" />
                      <div>
                        <p className="text-sm font-medium text-brand-text">{label}</p>
                        <p className="text-xs text-brand-muted">{key === 'retiroLocal' ? 'Sin costo adicional' : `$${COSTO_ENVIO.toLocaleString('es-AR')}`}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {tipoEnvio === 'pickit' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-brand-text mb-1">Calle</label>
                      <input className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.calle ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="Av. Siempre Viva"
                        {...register('calle', { required: tipoEnvio === 'pickit' ? 'Requerido' : false })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Número</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="742" {...register('numero')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Piso/Depto (opcional)</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="3B" {...register('piso')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Ciudad</label>
                      <input className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.ciudad ? 'border-red-400' : 'border-gray-200'}`}
                        {...register('ciudad', { required: tipoEnvio === 'pickit' ? 'Requerido' : false })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Provincia</label>
                      <input className={`w-full border rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.provincia ? 'border-red-400' : 'border-gray-200'}`}
                        {...register('provincia', { required: tipoEnvio === 'pickit' ? 'Requerido' : false })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text mb-1">Código postal</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        {...register('cp')} />
                    </div>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div className="card">
                <h2 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-brand-primary" /> Método de pago
                </h2>
                <div className="space-y-2">
                  {Object.entries(METODO_LABELS).map(([key, { label, icon: Icon, desc }]) => (
                    <label key={key} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${metodoPago === key ? 'border-brand-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="metodoPago" value={key} checked={metodoPago === key} onChange={() => setMetodoPago(key)} className="accent-brand-primary" />
                      <Icon size={18} className={metodoPago === key ? 'text-brand-primary' : 'text-brand-muted'} />
                      <div>
                        <p className="text-sm font-medium text-brand-text">{label}</p>
                        <p className="text-xs text-brand-muted">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div>
              <div className="card sticky top-20">
                <h2 className="font-semibold text-brand-text mb-4">Resumen del pedido</h2>

                <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.cod_producto} className="flex justify-between text-sm">
                      <span className="text-brand-muted line-clamp-1 flex-1">{item.titulo_de_producto} ×{item.quantity}</span>
                      <span className="text-brand-text font-medium ml-2">${(item.precioFinal * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Envío</span>
                    <span>{COSTO_ENVIO === 0 ? <span className="text-brand-success">Gratis</span> : `$${COSTO_ENVIO.toLocaleString('es-AR')}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-brand-text text-base pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base disabled:opacity-60"
                >
                  {loading ? 'Procesando...' : metodoPago === 'mercadopago' ? 'Pagar con MercadoPago →' : 'Confirmar pedido →'}
                </button>

                <p className="text-xs text-brand-muted text-center mt-3">
                  Tu información está protegida y encriptada
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
