// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nombre:   { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false }, // null si usa Firebase
  telefono: { type: String, trim: true },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  // ── Roles ──────────────────────────────────────────────────────────────────
  // superAdmin → puede editar branding y configuración técnica (es el desarrollador/vendedor)
  // admin      → dueño de la tienda, gestiona productos, pedidos, usuarios
  // vendedor   → puede cargar productos y ver sus ventas
  // cliente    → comprador
  rol: {
    type: String,
    enum: ['superAdmin', 'admin', 'vendedor', 'cliente'],
    default: 'cliente',
    required: true,
  },

  // ── Datos adicionales ──────────────────────────────────────────────────────
  documento: { type: String, trim: true },
  direccion: {
    calle:        { type: String },
    numero:       { type: String },
    localidad:    { type: String },
    provincia:    { type: String },
    codigoPostal: { type: String },
  },

  // ── Estado ─────────────────────────────────────────────────────────────────
  activo: { type: Boolean, default: true, required: true },

  // ── Vendedor: comisiones ────────────────────────────────────────────────────
  porcentajeComision: { type: Number, default: 10, min: 0, max: 100 },
  totalVentas:        { type: Number, default: 0 },

  // ── Historial de pedidos (para clientes) ───────────────────────────────────
  pedidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],

}, { timestamps: true });

// Hash del password antes de guardar
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// No devolver el password en las respuestas JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
