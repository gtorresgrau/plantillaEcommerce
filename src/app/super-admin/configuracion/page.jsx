'use client';
// src/app/super-admin/configuracion/page.jsx
// Panel de configuración general: contacto, redes, pagos, envíos
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Settings, Save } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-white font-semibold mb-5 text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, name, register, type = 'text', placeholder, description }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
      />
      {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
    </div>
  );
}

function Toggle({ label, name, register, description }) {
  return (
    <label className="flex items-center justify-between py-2.5 border-b border-gray-800 cursor-pointer">
      <div>
        <span className="text-sm text-gray-300">{label}</span>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <input type="checkbox" {...register(name)} className="w-4 h-4 accent-purple-500" />
    </label>
  );
}

export default function ConfiguracionPage() {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetch('/api/configuracion')
      .then(r => r.json())
      .then(({ data }) => data && reset(data));
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      Swal.fire({ icon: 'success', title: '¡Guardado!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="text-blue-400" />
            Configuración de la tienda
          </h1>
          <p className="text-gray-400 mt-1">Contacto, redes sociales, pagos y envíos</p>
        </div>
        <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">
          <Save size={15} /> Guardar
        </button>
      </div>

      <Section title="🏢 Datos de la empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre de la empresa" name="nombreEmpresa" register={register} />
          <Field label="CUIL/CUIT" name="cuil" register={register} />
          <Field label="URL del sitio (sin https)" name="urlWWW" register={register} placeholder="mitienda.com" />
          <Field label="URL completa" name="urlHttps" register={register} placeholder="https://mitienda.com" />
          <Field label="Dirección física" name="direccion" register={register} placeholder="Av. Corrientes 1234, CABA" />
          <Field label="Código de país" name="codigoPais" register={register} type="number" placeholder="54" />
        </div>
      </Section>

      <Section title="📞 Información de contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="WhatsApp Administración" name="whatsappAdministracion" register={register} placeholder="2235000000" />
          <Field label="WhatsApp Ventas" name="whatsappVentas" register={register} placeholder="2235000000" />
          <Field label="Correo Administración" name="correoAdministracion" register={register} type="email" />
          <Field label="Correo Ventas" name="correoVentas" register={register} type="email" />
          <Field label="Correo Contacto (formulario)" name="correoContacto" register={register} type="email" />
          <Field label="Teléfono Administración" name="telefonoAdministracion" register={register} />
          <Field label="Teléfono Ventas" name="telefonoVentas" register={register} />
        </div>
      </Section>

      <Section title="🏦 Datos bancarios (para transferencias)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Banco" name="banco" register={register} placeholder="Banco Galicia" />
          <Field label="CBU" name="cbu" register={register} />
          <Field label="Alias" name="alias" register={register} />
          <Field label="Titular de la cuenta" name="titularCuenta" register={register} />
          <Field label="CUIT del titular" name="cuitBancario" register={register} />
        </div>
      </Section>

      <Section title="📱 Redes sociales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Instagram" name="urlInstagram" register={register} placeholder="https://instagram.com/mitienda" />
          <Field label="Facebook" name="urlFacebook" register={register} placeholder="https://facebook.com/mitienda" />
          <Field label="Twitter / X" name="urlTwitter" register={register} />
          <Field label="LinkedIn" name="urlLinkedin" register={register} />
          <Field label="YouTube" name="urlYoutube" register={register} />
          <Field label="TikTok" name="urlTiktok" register={register} />
        </div>
      </Section>

      <Section title="💳 Métodos de pago">
        <Toggle label="MercadoPago" name="metodasPago.mercadopago" register={register} description="Pagos con tarjeta y QR vía MercadoPago" />
        <Toggle label="Transferencia bancaria" name="metodasPago.transferencia" register={register} description="El cliente transfiere al CBU/alias configurado" />
        <Toggle label="Efectivo" name="metodasPago.efectivo" register={register} description="Pago en mano al recibir el pedido" />
      </Section>

      <Section title="🚚 Envíos">
        <Toggle label="Pickit" name="envios.pickit" register={register} description="Envíos a domicilio vía Pickit" />
        <Toggle label="Retiro en local" name="envios.retiroLocal" register={register} description="El cliente retira en el local" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field
            label="Costo de envío fijo ($)"
            name="envios.costoEnvio"
            register={register}
            type="number"
            description="0 = envío gratis siempre"
          />
          <Field
            label="Envío gratis desde monto ($)"
            name="envios.envioGratisDesdeMonto"
            register={register}
            type="number"
            description="0 = no aplica"
          />
        </div>
      </Section>

      <Section title="🔔 Notificaciones por email">
        <Toggle label="Pedido pendiente" name="notificaciones.pedidoPendiente" register={register} />
        <Toggle label="Pedido pagado" name="notificaciones.pedidoPagado" register={register} />
        <Toggle label="Pedido enviado" name="notificaciones.pedidoEnviado" register={register} />
        <Toggle label="Pedido entregado" name="notificaciones.pedidoEntregado" register={register} />
        <Toggle label="Pedido cancelado" name="notificaciones.pedidoCancelado" register={register} />
        <Toggle label="Enviar notificaciones por email" name="notificaciones.enviarEmail" register={register} />
      </Section>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base">
          <Save size={18} /> Guardar configuración
        </button>
      </div>
    </form>
  );
}
