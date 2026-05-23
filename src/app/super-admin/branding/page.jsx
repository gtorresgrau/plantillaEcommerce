'use client';
// src/app/super-admin/branding/page.jsx
// ─── Panel de edición de branding: colores, logos, tipografía, textos ─────────
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Upload, RefreshCw, Eye, Save, Palette } from 'lucide-react';

// ─── Sección de color picker con preview ──────────────────────────────────────
function ColorField({ label, name, value, onChange, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800">
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-400">{value}</span>
        <div className="relative">
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-700 cursor-pointer shadow-inner"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title={`Elegir ${label}`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Upload de imagen con preview ─────────────────────────────────────────────
function ImageUpload({ label, currentUrl, onUpload, folder = 'branding', tipo = 'logo', description }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      fd.append('tipo', tipo);
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpload(data.data.url);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="py-3 border-b border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-200">{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-lg transition-colors"
        >
          <Upload size={13} />
          {uploading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      </div>
      {currentUrl && (
        <div className="mt-2">
          <img src={currentUrl} alt={label} className="h-12 object-contain rounded" />
          <p className="text-xs text-gray-500 mt-1 truncate">{currentUrl}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function BrandingPage() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [preview, setPreview]     = useState(false);
  const [branding, setBranding]   = useState(null);
  const { register, handleSubmit, watch, setValue, reset } = useForm();

  // Colores con estado local para el picker en tiempo real
  const [colores, setColores] = useState({
    primary:    '#3B82F6', secondary:  '#1E40AF', accent:     '#F59E0B',
    bg:         '#F9FAFB', surface:    '#FFFFFF', text:       '#111827',
    textMuted:  '#6B7280', nav:        '#1E40AF', navText:    '#FFFFFF',
    footer:     '#111827', footerText: '#D1D5DB', danger:     '#EF4444',
    success:    '#10B981', warning:    '#F59E0B',
  });

  // Imágenes
  const [logos, setLogos] = useState({ logoUrl: '', logoBlanco: '', faviconUrl: '', ogImageUrl: '', heroBg: '', bannerImg: '' });

  useEffect(() => {
    fetch('/api/super-admin/branding')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setBranding(data);
          reset({
            nombreTienda: data.nombreTienda,
            slogan:       data.slogan,
            descripcion:  data.descripcion,
            seo:          data.seo,
            textos:       data.textos,
            tipografia:   data.tipografia,
            secciones:    data.secciones,
          });
          if (data.colores)   setColores(c => ({ ...c, ...data.colores }));
          setLogos({
            logoUrl:    data.logoUrl          || '',
            logoBlanco: data.logoBlanco       || '',
            faviconUrl: data.faviconUrl       || '',
            ogImageUrl: data.ogImageUrl       || '',
            heroBg:     data.heroBg           || '',
            bannerImg:  data.banner?.imagen   || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Preview: aplica colores a CSS vars en tiempo real
  useEffect(() => {
    if (!preview) return;
    const root = document.documentElement;
    Object.entries(colores).forEach(([key, val]) => {
      const varName = key === 'textMuted' ? '--color-text-muted'
        : key === 'navText' ? '--color-nav-text'
        : key === 'footerText' ? '--color-footer-text'
        : `--color-${key}`;
      root.style.setProperty(varName, val);
    });
  }, [colores, preview]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        colores,
        logoUrl:    logos.logoUrl,
        logoBlanco: logos.logoBlanco,
        faviconUrl: logos.faviconUrl,
        ogImageUrl: logos.ogImageUrl,
        heroBg:     logos.heroBg,
        banner: {
          ...formData.banner,
          imagen: logos.bannerImg,
        },
      };
      const res = await fetch('/api/super-admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'El branding fue actualizado. Los cambios se verán en la tienda.',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Resetear branding?',
      text: 'Se volverá a los colores y textos por defecto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    });
    if (!isConfirmed) return;
    await fetch('/api/super-admin/branding', { method: 'DELETE' });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    );
  }

  const coloresConfig = [
    { name: 'primary',    label: 'Color primario',          description: 'Botones, links, elementos destacados' },
    { name: 'secondary',  label: 'Color secundario',        description: 'Hover, variantes del primario' },
    { name: 'accent',     label: 'Color de acento',         description: 'Badges, precios, CTA secundario' },
    { name: 'bg',         label: 'Fondo general',           description: 'Color de fondo de la página' },
    { name: 'surface',    label: 'Superficie (cards)',       description: 'Fondo de tarjetas y modales' },
    { name: 'text',       label: 'Texto principal',         description: 'Color del texto general' },
    { name: 'textMuted',  label: 'Texto secundario',        description: 'Subtítulos, placeholders' },
    { name: 'nav',        label: 'Fondo del navbar',        description: 'Color de fondo de la barra de navegación' },
    { name: 'navText',    label: 'Texto del navbar',        description: 'Color de los links del navbar' },
    { name: 'footer',     label: 'Fondo del footer',        description: 'Color de fondo del pie de página' },
    { name: 'footerText', label: 'Texto del footer',        description: 'Color del texto del footer' },
    { name: 'danger',     label: 'Color de error/peligro',  description: 'Alertas de error, botones destructivos' },
    { name: 'success',    label: 'Color de éxito',          description: 'Confirmaciones, pagos aprobados' },
    { name: 'warning',    label: 'Color de advertencia',    description: 'Alertas informativas' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Palette className="text-purple-400" />
            Branding & Identidad Visual
          </h1>
          <p className="text-gray-400 mt-1">Personalizá colores, logos, tipografía y textos de la tienda</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
              preview
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Eye size={15} />
            {preview ? 'Preview activo' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <RefreshCw size={15} />
            Resetear
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors font-semibold"
          >
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Identidad ─────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">🏪 Identidad de la tienda</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre de la tienda</label>
              <input
                {...register('nombreTienda')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Mi Tienda Online"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Slogan</label>
              <input
                {...register('slogan')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Los mejores productos, los mejores precios"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Descripción corta</label>
              <textarea
                {...register('descripcion')}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Descripción de la tienda"
              />
            </div>
          </div>
        </div>

        {/* ── SEO ────────────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">🔍 SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Título SEO (pestaña del navegador)</label>
              <input
                {...register('seo.titulo')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Meta descripción</label>
              <textarea
                {...register('seo.descripcion')}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Keywords (separadas por comas)</label>
              <input
                {...register('seo.keywords')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── Imágenes / Logos ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">🖼️ Logos e imágenes</h2>
          <ImageUpload
            label="Logo principal"
            description="Se muestra en el navbar sobre fondo de color"
            currentUrl={logos.logoUrl}
            onUpload={(url) => setLogos(l => ({ ...l, logoUrl: url }))}
            tipo="logo" folder="branding"
          />
          <ImageUpload
            label="Logo blanco"
            description="Se usa en el footer y sobre fondos oscuros"
            currentUrl={logos.logoBlanco}
            onUpload={(url) => setLogos(l => ({ ...l, logoBlanco: url }))}
            tipo="logo" folder="branding"
          />
          <ImageUpload
            label="Favicon"
            description="Ícono de la pestaña del navegador (32x32 o 64x64 px)"
            currentUrl={logos.faviconUrl}
            onUpload={(url) => setLogos(l => ({ ...l, faviconUrl: url }))}
            tipo="favicon" folder="branding"
          />
          <ImageUpload
            label="Imagen Open Graph"
            description="Imagen para compartir en redes sociales (1200x630 px)"
            currentUrl={logos.ogImageUrl}
            onUpload={(url) => setLogos(l => ({ ...l, ogImageUrl: url }))}
            tipo="branding" folder="branding"
          />
          <ImageUpload
            label="Imagen de fondo del Hero"
            description="Fondo de la sección principal del home (recomendado 1920x1080 px)"
            currentUrl={logos.heroBg}
            onUpload={(url) => setLogos(l => ({ ...l, heroBg: url }))}
            tipo="branding" folder="branding"
          />
        </div>

        {/* ── Tipografía ─────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">🔤 Tipografía & bordes</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Nombre de la fuente (Google Fonts)</label>
              <input
                {...register('tipografia.fuente')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Inter"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: Inter, Roboto, Poppins, Montserrat</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">URL Google Fonts</label>
              <input
                {...register('tipografia.fuenteURL')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none font-mono text-xs"
                placeholder="https://fonts.googleapis.com/css2?family=Inter..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Radio de bordes (botones & cards)</label>
              <input
                {...register('tipografia.borderRadius')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="0.5rem"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: 0rem (cuadrado) | 0.5rem (redondeado) | 1.5rem (muy redondeado)</p>
            </div>
          </div>
        </div>

        {/* ── Colores ────────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4 text-lg">🎨 Paleta de colores</h2>
          <p className="text-gray-400 text-sm mb-4">
            Hacé clic en el cuadro de color para abrir el selector. Con "Preview" activo, los cambios se ven en tiempo real.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {coloresConfig.map(({ name, label, description }) => (
              <ColorField
                key={name}
                label={label}
                name={name}
                description={description}
                value={colores[name] || '#000000'}
                onChange={(val) => setColores(c => ({ ...c, [name]: val }))}
              />
            ))}
          </div>
        </div>

        {/* ── Textos UI ──────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4 text-lg">✏️ Textos de la interfaz</h2>

          {/* Botones y Hero */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Hero & Botones</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { field: 'textos.textoBienvenida', label: 'Título del hero' },
              { field: 'textos.textoHero',       label: 'Subtítulo del hero' },
              { field: 'textos.textoCTA',        label: 'Texto del CTA principal' },
              { field: 'textos.botonComprar',    label: 'Botón comprar' },
              { field: 'textos.botonCarrito',    label: 'Botón agregar al carrito' },
              { field: 'textos.botonContacto',   label: 'Botón de contacto' },
              { field: 'textos.mensajeWhatsapp', label: 'Mensaje predefinido WhatsApp' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input
                  {...register(field)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Sección Destacados */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Sección Destacados</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { field: 'textos.textoDestacados',     label: 'Título sección destacados' },
              { field: 'textos.subtituloDestacados',  label: 'Subtítulo sección destacados' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input
                  {...register(field)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Sección Nosotros */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Sección Nosotros</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título Nosotros</label>
              <input
                {...register('textos.textoNosotros')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500 mb-1 block">Descripción Nosotros</label>
              <textarea
                {...register('textos.descripcionNosotros')}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Newsletter */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Sección Newsletter</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: 'textos.tituloNewsletter',    label: 'Título newsletter' },
              { field: 'textos.subtituloNewsletter',  label: 'Subtítulo newsletter' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input
                  {...register(field)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Banner promocional ────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4 text-lg">🎯 Banner promocional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título del banner</label>
              <input
                {...register('banner.titulo')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="¡Oferta especial!"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subtítulo del banner</label>
              <input
                {...register('banner.subtitulo')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Descubrí nuestras promociones exclusivas."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Texto del botón CTA</label>
              <input
                {...register('banner.ctaTexto')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Ver ofertas"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Link del botón CTA</label>
              <input
                {...register('banner.ctaLink')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none font-mono text-xs"
                placeholder="/productos?descuento=1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color de fondo (si no hay imagen)</label>
              <div className="relative flex items-center gap-2">
                <input
                  {...register('banner.bgColor')}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>
          <ImageUpload
            label="Imagen de fondo del banner"
            description="Imagen de fondo (recomendado 1920x600 px)"
            currentUrl={logos.bannerImg || ''}
            onUpload={(url) => setLogos(l => ({ ...l, bannerImg: url }))}
            tipo="branding" folder="branding"
          />
        </div>

        {/* ── Secciones visibles ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">👁️ Secciones del home</h2>
          <p className="text-gray-400 text-sm mb-4">Activá o desactivá secciones del home</p>
          {[
            { field: 'secciones.mostrarDestacados',  label: 'Productos destacados' },
            { field: 'secciones.mostrarCategorias',  label: 'Grilla de categorías' },
            { field: 'secciones.mostrarNovedades',   label: 'Novedades / Nuevos productos' },
            { field: 'secciones.mostrarBanner',      label: 'Banner promocional' },
            { field: 'secciones.mostrarNosotros',    label: 'Sección Nosotros' },
            { field: 'secciones.mostrarFAQ',         label: 'Sección FAQ' },
            { field: 'secciones.mostrarNewsletter',  label: 'Sección Newsletter' },
            { field: 'secciones.mostrarContacto',    label: 'Sección Contacto' },
            { field: 'secciones.mostrarTestimonios', label: 'Sección de testimonios' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center justify-between py-2.5 border-b border-gray-800 cursor-pointer">
              <span className="text-sm text-gray-300">{label}</span>
              <input
                type="checkbox"
                {...register(field)}
                className="w-4 h-4 rounded accent-purple-500"
              />
            </label>
          ))}
        </div>

        {/* ── Preview de colores ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 text-lg">🖥️ Vista previa de colores</h2>
          <div className="rounded-xl overflow-hidden border border-gray-700 text-sm">
            {/* Navbar simulado */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: colores.nav }}>
              <div className="w-6 h-6 bg-white/20 rounded" />
              <span style={{ color: colores.navText }} className="font-semibold">Mi Tienda</span>
              <div className="ml-auto flex gap-2">
                <span style={{ color: colores.navText }} className="opacity-70 text-xs">Productos</span>
                <span style={{ color: colores.navText }} className="opacity-70 text-xs">Contacto</span>
              </div>
            </div>
            {/* Body simulado */}
            <div className="p-4" style={{ backgroundColor: colores.bg }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: colores.text }}>Productos destacados</h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-lg p-3 border" style={{ backgroundColor: colores.surface, borderColor: `${colores.text}20` }}>
                    <div className="h-12 rounded mb-2 bg-gray-200" />
                    <p className="text-xs font-medium" style={{ color: colores.text }}>Producto {i}</p>
                    <p className="text-xs" style={{ color: colores.accent }}>$12.999</p>
                    <button className="mt-2 w-full text-xs py-1 rounded font-medium text-white" style={{ backgroundColor: colores.primary, borderRadius: '0.25rem' }}>
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer simulado */}
            <div className="px-4 py-2" style={{ backgroundColor: colores.footer }}>
              <p className="text-xs" style={{ color: colores.footerText }}>© Mi Tienda — Todos los derechos reservados</p>
            </div>
          </div>
        </div>

      </div>

      {/* Botón guardar sticky bottom */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-base bg-purple-600 hover:bg-purple-500 text-white transition-colors font-semibold shadow-lg"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar todos los cambios'}
        </button>
      </div>
    </form>
  );
}
