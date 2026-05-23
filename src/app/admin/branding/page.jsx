'use client';
// src/app/admin/branding/page.jsx
// ─── Panel de personalización para el admin ────────────────────────────────────
// El admin puede editar: banner, textos UI, secciones visibles, testimonios.
// NO puede acceder a: colores, logos, tipografía (eso es del superAdmin).
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Upload, Trash2, Plus, Star, Sparkles, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Upload de imagen (mismo patrón que super-admin) ──────────────────────────
function ImageUpload({ label, currentUrl, onUpload, description }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'branding');
      fd.append('tipo', 'branding');
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
    <div className="py-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-brand-text">{label}</p>
          {description && <p className="text-xs text-brand-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-muted text-xs rounded-lg transition-colors"
        >
          <Upload size={13} />
          {uploading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      </div>
      {currentUrl && (
        <div className="mt-1">
          <img src={currentUrl} alt={label} className="h-16 object-contain rounded border border-gray-100" />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// ─── Componente para editar testimonios ───────────────────────────────────────
function TestimoniEditor({ testimonios, onChange }) {
  const add = () => onChange([...testimonios, { nombre: '', texto: '', estrellas: 5, cargo: '' }]);
  const remove = (i) => onChange(testimonios.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const arr = [...testimonios];
    arr[i] = { ...arr[i], [field]: val };
    onChange(arr);
  };

  return (
    <div>
      <div className="space-y-4">
        {testimonios.map((t, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Nombre</label>
                <input
                  value={t.nombre}
                  onChange={e => update(i, 'nombre', e.target.value)}
                  placeholder="María García"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Cargo / Descripción</label>
                <input
                  value={t.cargo || ''}
                  onChange={e => update(i, 'cargo', e.target.value)}
                  placeholder="Cliente frecuente"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-brand-muted mb-1 block">Testimonio</label>
                <textarea
                  value={t.texto}
                  onChange={e => update(i, 'texto', e.target.value)}
                  rows={2}
                  placeholder="Excelente atención y productos de calidad..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Estrellas</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update(i, 'estrellas', n)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        fill={n <= (t.estrellas ?? 5) ? '#F59E0B' : 'none'}
                        stroke={n <= (t.estrellas ?? 5) ? '#F59E0B' : '#D1D5DB'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonios.length < 6 && (
        <button
          type="button"
          onClick={add}
          className="mt-3 flex items-center gap-2 text-sm text-brand-primary hover:underline"
        >
          <Plus size={14} /> Agregar testimonio
        </button>
      )}
    </div>
  );
}

// ─── Editor de FAQs ──────────────────────────────────────────────────────────
function FAQEditor({ faqs, onChange }) {
  const add    = () => onChange([...faqs, { pregunta: '', respuesta: '', orden: faqs.length }]);
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const arr = [...faqs];
    arr[i] = { ...arr[i], [field]: val };
    onChange(arr);
  };

  return (
    <div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
            <button type="button" onClick={() => remove(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
            <div className="space-y-3 pr-6">
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Pregunta</label>
                <input
                  value={faq.pregunta}
                  onChange={e => update(i, 'pregunta', e.target.value)}
                  placeholder="¿Cuál es el plazo de entrega?"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Respuesta</label>
                <textarea
                  value={faq.respuesta}
                  onChange={e => update(i, 'respuesta', e.target.value)}
                  rows={2}
                  placeholder="Los pedidos se entregan en 3 a 5 días hábiles..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {faqs.length < 12 && (
        <button type="button" onClick={add} className="mt-3 flex items-center gap-2 text-sm text-brand-primary hover:underline">
          <Plus size={14} /> Agregar pregunta
        </button>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminBrandingPage() {
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [bannerImg,    setBannerImg]    = useState('');
  const [testimonios,  setTestimonios]  = useState([]);
  const [faqs,         setFaqs]         = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetch('/api/admin/branding')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          reset({
            banner:   data.banner   || {},
            textos:   data.textos   || {},
            secciones: data.secciones || {},
          });
          setBannerImg(data.banner?.imagen || '');
          setTestimonios(data.testimonios || []);
          setFaqs(data.faqs || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      // Solo enviamos los campos que el admin puede editar
      const payload = {
        banner: { ...formData.banner, imagen: bannerImg },
        textos: formData.textos,
        secciones: formData.secciones,
        testimonios,
        faqs,
      };
      const res = await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      Swal.fire({ icon: 'success', title: '¡Guardado!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Sparkles className="text-brand-accent" size={22} />
            Personalización de la tienda
          </h1>
          <p className="text-brand-muted text-sm mt-0.5">Editá el banner, textos y secciones del home</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"
        >
          <Save size={15} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-brand-text mb-4 text-lg">🎯 Banner promocional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {[
              { field: 'banner.titulo',    label: 'Título', placeholder: '¡Oferta especial!' },
              { field: 'banner.subtitulo', label: 'Subtítulo', placeholder: 'Descubrí nuestras promociones.' },
              { field: 'banner.ctaTexto',  label: 'Texto del botón', placeholder: 'Ver ofertas' },
              { field: 'banner.ctaLink',   label: 'Link del botón', placeholder: '/productos?descuento=1' },
              { field: 'banner.bgColor',   label: 'Color de fondo (si no hay imagen)', placeholder: '#1E40AF' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="text-xs text-brand-muted mb-1 block">{label}</label>
                <input
                  {...register(field)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
            ))}
          </div>
          <ImageUpload
            label="Imagen de fondo"
            description="Recomendado: 1920×600 px"
            currentUrl={bannerImg}
            onUpload={setBannerImg}
          />
        </div>

        {/* ── Textos UI ───────────────────────────────────────────────────── */}
        <div className="card">
          <h2 className="font-semibold text-brand-text mb-4 text-lg">✏️ Textos del hero</h2>
          <div className="space-y-3">
            {[
              { field: 'textos.textoBienvenida', label: 'Título principal (hero)', ph: 'Bienvenido a nuestra tienda' },
              { field: 'textos.textoHero',       label: 'Subtítulo del hero',      ph: 'Los mejores productos al mejor precio' },
              { field: 'textos.textoCTA',        label: 'Botón CTA del hero',      ph: 'Ver productos' },
              { field: 'textos.textoNosotros',   label: 'Título "Nosotros"',        ph: 'Sobre nosotros' },
              { field: 'textos.mensajeWhatsapp', label: 'Mensaje WhatsApp',         ph: 'Hola, quiero consultar sobre: ' },
            ].map(({ field, label, ph }) => (
              <div key={field}>
                <label className="text-xs text-brand-muted mb-1 block">{label}</label>
                <input
                  {...register(field)}
                  placeholder={ph}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-brand-muted mb-1 block">Descripción "Nosotros"</label>
              <textarea
                {...register('textos.descripcionNosotros')}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none resize-none"
                placeholder="Somos una tienda comprometida..."
              />
            </div>
          </div>
        </div>

        {/* ── Secciones visibles ──────────────────────────────────────────── */}
        <div className="card">
          <h2 className="font-semibold text-brand-text mb-4 text-lg">👁️ Secciones del home</h2>
          <p className="text-brand-muted text-sm mb-4">Activá o desactivá secciones del home</p>
          {[
            { field: 'secciones.mostrarDestacados',  label: 'Productos destacados' },
            { field: 'secciones.mostrarCategorias',  label: 'Grilla de categorías' },
            { field: 'secciones.mostrarNovedades',   label: 'Novedades' },
            { field: 'secciones.mostrarBanner',      label: 'Banner promocional' },
            { field: 'secciones.mostrarTestimonios', label: 'Testimonios de clientes' },
            { field: 'secciones.mostrarNosotros',    label: 'Sección Nosotros' },
            { field: 'secciones.mostrarFAQ',         label: 'Preguntas frecuentes (FAQ)' },
            { field: 'secciones.mostrarNewsletter',  label: 'Newsletter' },
            { field: 'secciones.mostrarContacto',    label: 'Formulario de contacto' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center justify-between py-2.5 border-b border-gray-100 cursor-pointer last:border-0">
              <span className="text-sm text-brand-text">{label}</span>
              <input
                type="checkbox"
                {...register(field)}
                className="w-4 h-4 rounded accent-brand-primary"
              />
            </label>
          ))}
        </div>

        {/* ── Testimonios ─────────────────────────────────────────────────── */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-brand-text mb-4 text-lg">⭐ Testimonios de clientes</h2>
          <p className="text-brand-muted text-sm mb-4">
            Agregá hasta 6 testimonios. Si no agregás ninguno, se mostrarán ejemplos por defecto.
            Activá la sección "Testimonios" en el panel de arriba para que se muestren en el home.
          </p>
          <TestimoniEditor testimonios={testimonios} onChange={setTestimonios} />
        </div>

        {/* ── FAQs editables ──────────────────────────────────────────────── */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-brand-text mb-2 text-lg flex items-center gap-2">
            <HelpCircle size={20} className="text-brand-primary" />
            Preguntas frecuentes (FAQ)
          </h2>
          <p className="text-brand-muted text-sm mb-4">
            Personalizá las preguntas y respuestas que se muestran en la sección FAQ del home.
            Si no agregás ninguna, se mostrarán las preguntas de ejemplo por defecto.
          </p>
          <FAQEditor faqs={faqs} onChange={setFaqs} />
        </div>

      </div>

      {/* Guardar sticky bottom */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar todos los cambios'}
        </button>
      </div>
    </form>
  );
}
