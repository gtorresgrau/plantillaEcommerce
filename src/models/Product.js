// src/models/Product.js
import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  // ── Identificación ─────────────────────────────────────────────────────────
  cod_producto:      { type: String, required: true, unique: true },
  titulo_de_producto:{ type: String, required: true },
  nombre:            { type: String },   // alias de titulo_de_producto, auto-poblado en pre-save
  slug:              { type: String, index: true },   // SEO: auto-generado desde titulo_de_producto
  descripcion:       { type: String, default: '' },
  modelo:            { type: String },
  marca:             { type: String },
  categoria:         { type: String },
  subcategoria:      { type: String },
  n_serie:           { type: String },
  n_electronica:     { type: String },
  medidas:           { type: String },

  // ── Precios ────────────────────────────────────────────────────────────────
  precio:           { type: Number, required: true, min: 0 },
  precio_costo:     { type: Number, min: 0 },
  porcentaje_ganancia: { type: Number, default: 30 },
  descuento:        { type: Number, default: 0, min: 0, max: 100 },
  usd:              { type: Boolean, default: false }, // precio en dólares

  // ── Imágenes (URLs de Cloudinary) ──────────────────────────────────────────
  foto1: { type: String },
  foto2: { type: String },
  foto3: { type: String },
  foto4: { type: String },

  // ── Stock ──────────────────────────────────────────────────────────────────
  stock:    { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 0 },
  sinStock: { type: Boolean, default: false },

  // ── Estado ─────────────────────────────────────────────────────────────────
  activo:      { type: Boolean, default: true },
  destacado:   { type: Boolean, default: false },
  novedad:     { type: Boolean, default: false },
  usado:       { type: Boolean, default: false },
  vendido:     { type: Boolean, default: false },
  visible:     { type: Boolean, default: true },

  // ── Reseñas (agregado, se recalcula al aprobar/rechazar) ─────────────────
  promedio:    { type: Number, default: 0, min: 0, max: 5 },
  cantResenas: { type: Number, default: 0, min: 0 },

  // ── Relaciones ─────────────────────────────────────────────────────────────
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Atributos extra (para categorías específicas) ──────────────────────────
  atributosExtra: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

// ── Helper: generar slug SEO desde el título ──────────────────────────────
function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')                       // descomponer acentos
    .replace(/[̀-ͯ]/g, '')        // eliminar diacríticos
    .replace(/[^a-z0-9\s-]/g, '')           // solo alfanuméricos
    .trim()
    .replace(/\s+/g, '-')                   // espacios → guiones
    .replace(/-+/g, '-');                   // colapsar guiones dobles
}

// El _id es el cod_producto para búsquedas rápidas + auto-slug + auto-nombre
productoSchema.pre('save', function (next) {
  if (!this._id) this._id = this.cod_producto;
  // nombre es un alias de titulo_de_producto (se usa en Order.items para consistencia)
  if (!this.nombre && this.titulo_de_producto) {
    this.nombre = this.titulo_de_producto;
  }
  if (!this.slug && this.titulo_de_producto) {
    this.slug = generarSlug(this.titulo_de_producto);
  }
  next();
});

// Auto-slug y auto-nombre en findOneAndUpdate (admin edits, CSV import)
productoSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const titulo = update?.$set?.titulo_de_producto || update?.titulo_de_producto;
  if (titulo) {
    if (update.$set) {
      if (!update.$set.slug)   update.$set.slug   = generarSlug(titulo);
      if (!update.$set.nombre) update.$set.nombre = titulo;
    } else {
      if (!update.slug)   update.slug   = generarSlug(titulo);
      if (!update.nombre) update.nombre = titulo;
    }
  }
  next();
});

// Precio con descuento calculado
productoSchema.virtual('precioFinal').get(function () {
  if (this.descuento > 0) {
    return Math.round(this.precio * (1 - this.descuento / 100));
  }
  return this.precio;
});

productoSchema.set('toJSON', { virtuals: true });

export default mongoose.models.producto || mongoose.model('producto', productoSchema);
