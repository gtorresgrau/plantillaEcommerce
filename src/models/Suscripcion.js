// src/models/Suscripcion.js — Suscriptores al newsletter
import mongoose from 'mongoose';

const suscripcionSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  nombre:   { type: String, default: '', trim: true },   // opcional, por si se pide en el form
  activo:   { type: Boolean, default: true },
  fuente:   {
    type: String,
    enum: ['web', 'admin', 'importacion'],
    default: 'web',
  },
  // IP de origen para detectar suscripciones masivas / spam
  ipOrigen: { type: String, default: '' },
}, { timestamps: true });

// Índice para búsquedas rápidas
suscripcionSchema.index({ activo: 1, createdAt: -1 });

export default mongoose.models.Suscripcion
  || mongoose.model('Suscripcion', suscripcionSchema);
