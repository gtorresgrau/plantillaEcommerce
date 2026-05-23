// src/models/Cupon.js — Cupones de descuento
import mongoose from 'mongoose';

const cuponSchema = new mongoose.Schema({
  codigo:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  tipo:        { type: String, enum: ['porcentaje', 'monto'], required: true },
  valor:       { type: Number, required: true, min: 0 },    // % o $ según tipo
  descripcion: { type: String, default: '' },

  // Restricciones
  montoMinimo: { type: Number, default: 0 },               // monto mínimo de compra
  usoMaximo:   { type: Number, default: null },             // null = ilimitado
  usosActuales:{ type: Number, default: 0 },

  // Vigencia
  vencimiento: { type: Date, default: null },               // null = no vence

  activo:      { type: Boolean, default: true },
}, { timestamps: true });

// Pre-save: normalizar código a uppercase
cuponSchema.pre('save', function (next) {
  this.codigo = this.codigo.toUpperCase().replace(/\s+/g, '');
  next();
});

export default mongoose.models.Cupon
  || mongoose.model('Cupon', cuponSchema);
