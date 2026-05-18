// src/models/Product.js
import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  // ── Identificación ─────────────────────────────────────────────────────────
  cod_producto:      { type: String, required: true, unique: true },
  titulo_de_producto:{ type: String, required: true },
  nombre:            { type: String, required: true },
  descripcion:       { type: String, required: true },
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
  foto_1_1: { type: String },
  foto_1_2: { type: String },
  foto_1_3: { type: String },
  foto_1_4: { type: String },

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

  // ── Relaciones ─────────────────────────────────────────────────────────────
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Atributos extra (para categorías específicas) ──────────────────────────
  atributosExtra: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

// El _id es el cod_producto para búsquedas rápidas
productoSchema.pre('save', function (next) {
  if (!this._id) this._id = this.cod_producto;
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
