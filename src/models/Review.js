// src/models/Review.js — Reseñas de productos por clientes
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Producto reseñado (referencia por cod_producto para ser flexible)
  cod_producto: { type: String, required: true, index: true },

  // Usuario que reseña
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:     { type: String, required: true },       // nombre visible (desnormalizado)

  // Contenido
  rating:       { type: Number, required: true, min: 1, max: 5 },
  titulo:       { type: String, default: '' },
  comentario:   { type: String, required: true, maxlength: 1000 },

  // Moderación
  aprobado:     { type: Boolean, default: false },       // admin debe aprobar
  destacado:    { type: Boolean, default: false },       // admin puede destacar

  // Verificación de compra
  compradorVerificado: { type: Boolean, default: false },
}, { timestamps: true });

// Índice único: un usuario solo puede reseñar un producto una vez
reviewSchema.index({ cod_producto: 1, userId: 1 }, { unique: true });

export default mongoose.models.Review
  || mongoose.model('Review', reviewSchema);
