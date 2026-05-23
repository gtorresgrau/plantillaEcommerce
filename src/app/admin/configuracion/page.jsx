'use client';
// src/app/admin/configuracion/page.jsx — El admin edita los datos de su tienda
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import {
  Building2, Phone, Mail, MapPin, CreditCard, Landmark,
  Instagram, Facebook, Youtube, Globe, Save, RefreshCw,
  Truck, Package, Banknote, FileText
} from 'lucide-react';

const SECTION = ({ title, icon: Icon, children }) => (
  <div className="card mb-6">
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
      <Icon size={18} className="text-brand-primary" />
      <h2 className="font-semibold text-brand-text">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, error, children, full }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-medium text-brand-text mb-1">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

const inputClass = (err) =>
  `w-full border rounded-lg px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

export default function AdminConfiguracionPage() {
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [configId, setConfigId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  // ── Cargar configuración existente ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/configuracion')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setConfigId(data._id);
          reset({
            // Empresa
            nombreEmpresa:    data.nombreEmpresa    || '',
            cuil:             data.cuil             || '',
            urlWWW:           data.urlWWW           || '',
            codigoPais:       data.codigoPais       || 54,
            // Contacto
            whatsappVentas:         data.whatsappVentas         || '',
            whatsappAdministracion: data.whatsappAdministracion || '',
            correoAdministracion:   data.correoAdministracion   || '',
            correoVentas:           data.correoVentas           || '',
            correoContacto:         data.correoContacto         || '',
            telefonoVentas:         data.telefonoVentas         || '',
            direccion:              data.direccion              || '',
            // Banco
            banco:         data.banco         || '',
            cbu:           data.cbu           || '',
            alias:         data.alias         || '',
            titularCuenta: data.titularCuenta || '',
            cuitBancario:  data.cuitBancario  || '',
            // Redes
            urlInstagram: data.urlInstagram || '',
            urlFacebook:  data.urlFacebook  || '',
            urlTwitter:   data.urlTwitter   || '',
            urlLinkedin:  data.urlLinkedin  || '',
            urlYoutube:   data.urlYoutube   || '',
            urlTiktok:    data.urlTiktok    || '',
            // Métodos de pago
            'metodasPago.mercadopago':   data.metodasPago?.mercadopago   ?? true,
            'metodasPago.transferencia': data.metodasPago?.transferencia ?? true,
            'metodasPago.efectivo':      data.metodasPago?.efectivo      ?? false,
            // Envíos
            'envios.pickit':      data.envios?.pickit      ?? true,
            'envios.retiroLocal': data.envios?.retiroLocal ?? true,
            'envios.costoEnvio':  data.envios?.costoEnvio  ?? 0,
            'envios.envioGratisDesdeMonto': data.envios?.envioGratisDesdeMonto ?? 0,
            // Políticas
            'politicas.privacidad':  data.politicas?.privacidad  || '',
            'politicas.terminos':    data.politicas?.terminos    || '',
            'politicas.devolucion':  data.politicas?.devolucion  || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Reconstruir objeto anidado desde campos planos
      const body = {
        nombreEmpresa:          data.nombreEmpresa,
        cuil:                   data.cuil,
        urlWWW:                 data.urlWWW,
        codigoPais:             Number(data.codigoPais),
        whatsappVentas:         data.whatsappVentas,
        whatsappAdministracion: data.whatsappAdministracion,
        correoAdministracion:   data.correoAdministracion,
        correoVentas:           data.correoVentas,
        correoContacto:         data.correoContacto,
        telefonoVentas:         data.telefonoVentas,
        direccion:              data.direccion,
        banco:         data.banco,
        cbu:           data.cbu,
        alias:         data.alias,
        titularCuenta: data.titularCuenta,
        cuitBancario:  data.cuitBancario,
        urlInstagram:  data.urlInstagram,
        urlFacebook:   data.urlFacebook,
        urlTwitter:    data.urlTwitter,
        urlLinkedin:   data.urlLinkedin,
        urlYoutube:    data.urlYoutube,
        urlTiktok:     data.urlTiktok,
        metodasPago: {
          mercadopago:   data['metodasPago.mercadopago'],
          transferencia: data['metodasPago.transferencia'],
          efectivo:      data['metodasPago.efectivo'],
        },
        envios: {
          pickit:      data['envios.pickit'],
          retiroLocal: data['envios.retiroLocal'],
          costoEnvio:  Number(data['envios.costoEnvio']),
          envioGratisDesdeMonto: Number(data['envios.envioGratisDesdeMonto']),
        },
        politicas: {
          privacidad: data['politicas.privacidad'],
          terminos:   data['politicas.terminos'],
          devolucion: data['politicas.devolucion'],
        },
      };

      const res = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar');

      Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Configuración actualizada correctamente.', timer: 2000, showConfirmButton: false });
      reset(data); // Limpiar isDirty
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Configuración de la tienda</h1>
          <p className="text-sm text-brand-muted mt-1">Datos de contacto, información bancaria, redes sociales y más.</p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 btn-primary px-5 py-2.5 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {isDirty && (
        <div className="mb-4 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center gap-2">
          <span>⚠️</span> Tenés cambios sin guardar.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Empresa ── */}
        <SECTION title="Datos de la empresa" icon={Building2}>
          <Field label="Nombre de la empresa" error={errors.nombreEmpresa}>
            <input className={inputClass(errors.nombreEmpresa)} placeholder="Mi Tienda SA"
              {...register('nombreEmpresa', { required: 'Requerido' })} />
          </Field>
          <Field label="CUIL / CUIT" error={errors.cuil}>
            <input className={inputClass(errors.cuil)} placeholder="20-12345678-9"
              {...register('cuil')} />
          </Field>
          <Field label="Sitio web" error={errors.urlWWW}>
            <input className={inputClass(errors.urlWWW)} placeholder="https://mitienda.com"
              {...register('urlWWW')} />
          </Field>
          <Field label="Código de país (WhatsApp)" error={errors.codigoPais}>
            <input type="number" className={inputClass(errors.codigoPais)} placeholder="54"
              {...register('codigoPais')} />
          </Field>
        </SECTION>

        {/* ── Contacto ── */}
        <SECTION title="Datos de contacto" icon={Phone}>
          <Field label="WhatsApp ventas" error={errors.whatsappVentas}>
            <input className={inputClass(errors.whatsappVentas)} placeholder="1112345678"
              {...register('whatsappVentas')} />
          </Field>
          <Field label="WhatsApp administración" error={errors.whatsappAdministracion}>
            <input className={inputClass(errors.whatsappAdministracion)} placeholder="1112345678"
              {...register('whatsappAdministracion')} />
          </Field>
          <Field label="Email de administración" error={errors.correoAdministracion}>
            <input type="email" className={inputClass(errors.correoAdministracion)} placeholder="admin@mitienda.com"
              {...register('correoAdministracion')} />
            <p className="text-xs text-brand-muted mt-1">Recibe notificaciones de nuevos pedidos</p>
          </Field>
          <Field label="Email de ventas" error={errors.correoVentas}>
            <input type="email" className={inputClass(errors.correoVentas)} placeholder="ventas@mitienda.com"
              {...register('correoVentas')} />
          </Field>
          <Field label="Email de contacto" error={errors.correoContacto}>
            <input type="email" className={inputClass(errors.correoContacto)} placeholder="contacto@mitienda.com"
              {...register('correoContacto')} />
          </Field>
          <Field label="Teléfono" error={errors.telefonoVentas}>
            <input className={inputClass(errors.telefonoVentas)} placeholder="(011) 4444-5555"
              {...register('telefonoVentas')} />
          </Field>
          <Field label="Dirección" error={errors.direccion}>
            <input className={inputClass(errors.direccion)} placeholder="Av. Corrientes 1234, Buenos Aires"
              {...register('direccion')} />
          </Field>
        </SECTION>

        {/* ── Banco ── */}
        <SECTION title="Información bancaria (transferencias)" icon={Landmark}>
          <Field label="Banco" error={errors.banco}>
            <input className={inputClass(errors.banco)} placeholder="Banco Galicia"
              {...register('banco')} />
          </Field>
          <Field label="CBU" error={errors.cbu}>
            <input className={inputClass(errors.cbu)} placeholder="0000000000000000000000"
              {...register('cbu')} />
          </Field>
          <Field label="Alias" error={errors.alias}>
            <input className={inputClass(errors.alias)} placeholder="MI.TIENDA.ALIAS"
              {...register('alias')} />
          </Field>
          <Field label="Titular de la cuenta" error={errors.titularCuenta}>
            <input className={inputClass(errors.titularCuenta)} placeholder="Juan Pérez"
              {...register('titularCuenta')} />
          </Field>
          <Field label="CUIT bancario" error={errors.cuitBancario}>
            <input className={inputClass(errors.cuitBancario)} placeholder="20-12345678-9"
              {...register('cuitBancario')} />
          </Field>
        </SECTION>

        {/* ── Métodos de pago ── */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <CreditCard size={18} className="text-brand-primary" />
            <h2 className="font-semibold text-brand-text">Métodos de pago habilitados</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'metodasPago.mercadopago',   label: 'MercadoPago',   desc: 'Tarjeta, efectivo, QR, etc.' },
              { key: 'metodasPago.transferencia', label: 'Transferencia', desc: 'Pago por CBU/alias' },
              { key: 'metodasPago.efectivo',      label: 'Efectivo',      desc: 'Pago al retirar/recibir' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-brand-primary" {...register(key)} />
                <div>
                  <p className="text-sm font-medium text-brand-text">{label}</p>
                  <p className="text-xs text-brand-muted">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Envíos ── */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <Truck size={18} className="text-brand-primary" />
            <h2 className="font-semibold text-brand-text">Envíos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-3">
              {[
                { key: 'envios.pickit',      label: 'Pickit',        desc: 'Envío a domicilio o punto de retiro Pickit' },
                { key: 'envios.retiroLocal', label: 'Retiro en local', desc: 'El cliente retira en tu dirección' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-brand-primary" {...register(key)} />
                  <div>
                    <p className="text-sm font-medium text-brand-text">{label}</p>
                    <p className="text-xs text-brand-muted">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Costo de envío ($)</label>
              <input type="number" min="0" className={inputClass()} placeholder="0 = gratis"
                {...register('envios.costoEnvio')} />
              <p className="text-xs text-brand-muted mt-1">Ingresar 0 para envío gratis siempre</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-1">Envío gratis desde ($)</label>
              <input type="number" min="0" className={inputClass()} placeholder="Ej: 50000"
                {...register('envios.envioGratisDesdeMonto')} />
              <p className="text-xs text-brand-muted mt-1">0 = no aplicar envío gratis automático</p>
            </div>
          </div>
        </div>

        {/* ── Redes sociales ── */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <Globe size={18} className="text-brand-primary" />
            <h2 className="font-semibold text-brand-text">Redes sociales</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'urlInstagram', label: 'Instagram',  placeholder: 'https://instagram.com/mitienda' },
              { key: 'urlFacebook',  label: 'Facebook',   placeholder: 'https://facebook.com/mitienda' },
              { key: 'urlYoutube',   label: 'YouTube',    placeholder: 'https://youtube.com/@mitienda' },
              { key: 'urlTiktok',    label: 'TikTok',     placeholder: 'https://tiktok.com/@mitienda' },
              { key: 'urlTwitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/mitienda' },
              { key: 'urlLinkedin',  label: 'LinkedIn',   placeholder: 'https://linkedin.com/company/mitienda' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-brand-text mb-1">{label}</label>
                <input className={inputClass()} placeholder={placeholder} {...register(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Políticas y textos legales ── */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <FileText size={18} className="text-brand-primary" />
            <h2 className="font-semibold text-brand-text">Políticas y textos legales</h2>
          </div>
          <p className="text-xs text-brand-muted mb-5">
            Estos textos se muestran en las páginas <strong>/politica-privacidad</strong>, <strong>/terminos</strong> y en el proceso de devoluciones.
            Podés usar Markdown para dar formato (ej: <code>## Título</code>, <code>**negrita**</code>).
          </p>
          <div className="space-y-5">
            {[
              { key: 'politicas.privacidad', label: 'Política de Privacidad', hint: '/politica-privacidad' },
              { key: 'politicas.terminos',   label: 'Términos y Condiciones', hint: '/terminos' },
              { key: 'politicas.devolucion', label: 'Política de Devoluciones', hint: 'Mostrado en /terminos y checkout' },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-brand-text">{label}</label>
                  <span className="text-xs text-brand-muted">{hint}</span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`Escribí aquí el texto de ${label}...`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono resize-y"
                  {...register(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Botón bottom ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button type="submit" disabled={saving || !isDirty}
            className="flex items-center gap-2 btn-primary px-6 py-2.5 disabled:opacity-50">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
