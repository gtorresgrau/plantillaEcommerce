// src/models/BrandingConfig.js
// ─── Modelo exclusivo del SuperAdmin ───────────────────────────────────────────
// Controla toda la identidad visual de la tienda.
// El admin del ecommerce NO puede acceder a este modelo.
import mongoose from 'mongoose';

const brandingConfigSchema = new mongoose.Schema({
  // ── Identidad ──────────────────────────────────────────────────────────────
  nombreTienda: { type: String, default: 'Mi Tienda', trim: true },
  slogan:       { type: String, default: '', trim: true },
  descripcion:  { type: String, default: '', trim: true },

  // ── Logos (URLs de Cloudinary) ─────────────────────────────────────────────
  logoUrl:         { type: String, default: '' },
  logoBlanco:      { type: String, default: '' },
  faviconUrl:      { type: String, default: '' },
  ogImageUrl:      { type: String, default: '' },  // Open Graph

  // ── Paleta de colores ──────────────────────────────────────────────────────
  colores: {
    primary:     { type: String, default: '#3B82F6' },  // Azul
    secondary:   { type: String, default: '#1E40AF' },  // Azul oscuro
    accent:      { type: String, default: '#F59E0B' },  // Amarillo
    bg:          { type: String, default: '#F9FAFB' },  // Fondo general
    surface:     { type: String, default: '#FFFFFF' },  // Cards, modales
    text:        { type: String, default: '#111827' },  // Texto principal
    textMuted:   { type: String, default: '#6B7280' },  // Texto secundario
    nav:         { type: String, default: '#1E40AF' },  // Fondo navbar
    navText:     { type: String, default: '#FFFFFF' },  // Texto navbar
    footer:      { type: String, default: '#111827' },  // Fondo footer
    footerText:  { type: String, default: '#D1D5DB' },  // Texto footer
    danger:      { type: String, default: '#EF4444' },
    success:     { type: String, default: '#10B981' },
    warning:     { type: String, default: '#F59E0B' },
  },

  // ── Tipografía ─────────────────────────────────────────────────────────────
  tipografia: {
    fuente:        { type: String, default: 'Inter' },  // Google Font o sistema
    fuenteURL:     { type: String, default: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
    borderRadius:  { type: String, default: '0.5rem' }, // bordes botones/cards
  },

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: {
    titulo:      { type: String, default: 'Mi Tienda Online' },
    descripcion: { type: String, default: 'La mejor tienda online.' },
    keywords:    { type: String, default: '' },
  },

  // ── Textos UI personalizables ──────────────────────────────────────────────
  textos: {
    botonComprar:         { type: String, default: 'Comprar ahora' },
    botonCarrito:         { type: String, default: 'Agregar al carrito' },
    botonContacto:        { type: String, default: '¡Contáctanos!' },
    textoBienvenida:      { type: String, default: 'Bienvenido a nuestra tienda' },
    textoHero:            { type: String, default: 'Los mejores productos al mejor precio' },
    textoCTA:             { type: String, default: 'Ver productos' },
    mensajeWhatsapp:      { type: String, default: 'Hola, me gustaría consultar sobre: ' },
    // Sección Nosotros
    textoNosotros:        { type: String, default: 'Sobre nosotros' },
    descripcionNosotros:  { type: String, default: 'Somos una tienda comprometida con brindar los mejores productos y la mejor experiencia de compra online.' },
    // Sección Destacados
    textoDestacados:      { type: String, default: 'Productos destacados' },
    subtituloDestacados:  { type: String, default: 'Los favoritos de nuestros clientes' },
  },

  // ── Secciones visibles en home ─────────────────────────────────────────────
  secciones: {
    mostrarDestacados:  { type: Boolean, default: true },
    mostrarCategorias:  { type: Boolean, default: true },
    mostrarNovedades:   { type: Boolean, default: true },
    mostrarBanner:      { type: Boolean, default: true },
    mostrarTestimonios: { type: Boolean, default: false },
    mostrarNosotros:    { type: Boolean, default: true },
    mostrarFAQ:         { type: Boolean, default: true },
    mostrarContacto:    { type: Boolean, default: true },
  },

  // ── Estado ─────────────────────────────────────────────────────────────────
  activo: { type: Boolean, default: true },

}, { timestamps: true });

// Solo una configuración activa a la vez
brandingConfigSchema.pre('save', async function (next) {
  if (this.activo && this.isModified('activo')) {
    await mongoose.model('BrandingConfig').updateMany(
      { _id: { $ne: this._id } },
      { activo: false }
    );
  }
  next();
});

export default mongoose.models.BrandingConfig || mongoose.model('BrandingConfig', brandingConfigSchema);
