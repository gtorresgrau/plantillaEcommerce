// src/models/Configuracion.js
// ─── Modelo editable por el Admin del ecommerce ────────────────────────────────
// Datos de contacto, info bancaria, redes sociales, notificaciones.
import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
  // ── Datos de la Empresa ────────────────────────────────────────────────────
  nombreEmpresa:    { type: String, default: 'Mi Tienda', trim: true },
  cuil:             { type: String, trim: true },
  urlWWW:           { type: String, trim: true },
  urlHttps:         { type: String, trim: true },
  codigoPais:       { type: Number, default: 54 },

  // ── Contacto ───────────────────────────────────────────────────────────────
  whatsappAdministracion: { type: String, trim: true },
  whatsappVentas:         { type: String, trim: true },
  correoAdministracion:   { type: String, trim: true, lowercase: true },
  correoVentas:           { type: String, trim: true, lowercase: true },
  correoContacto:         { type: String, trim: true, lowercase: true },
  telefonoAdministracion: { type: String, trim: true },
  telefonoVentas:         { type: String, trim: true },
  direccion:              { type: String, trim: true },

  // ── Información Bancaria ───────────────────────────────────────────────────
  banco:          { type: String, trim: true },
  cbu:            { type: String, trim: true },
  alias:          { type: String, trim: true },
  titularCuenta:  { type: String, trim: true },
  cuitBancario:   { type: String, trim: true },

  // ── Redes Sociales ─────────────────────────────────────────────────────────
  urlFacebook:   { type: String, trim: true, default: '' },
  urlInstagram:  { type: String, trim: true, default: '' },
  urlTwitter:    { type: String, trim: true, default: '' },
  urlLinkedin:   { type: String, trim: true, default: '' },
  urlYoutube:    { type: String, trim: true, default: '' },
  urlTiktok:     { type: String, trim: true, default: '' },

  // ── Métodos de pago habilitados ────────────────────────────────────────────
  metodasPago: {
    mercadopago:  { type: Boolean, default: true },
    transferencia:{ type: Boolean, default: true },
    efectivo:     { type: Boolean, default: false },
  },

  // ── Envíos ─────────────────────────────────────────────────────────────────
  envios: {
    pickit:       { type: Boolean, default: true },
    retiroLocal:  { type: Boolean, default: true },
    costoEnvio:   { type: Number, default: 0 },    // 0 = gratis
    envioGratisDesdeMonto: { type: Number, default: 0 },
  },

  // ── Notificaciones ─────────────────────────────────────────────────────────
  notificaciones: {
    pedidoPendiente: { type: Boolean, default: true },
    pedidoPagado:    { type: Boolean, default: true },
    pedidoEnviado:   { type: Boolean, default: true },
    pedidoEntregado: { type: Boolean, default: true },
    pedidoCancelado: { type: Boolean, default: true },
    enviarEmail:     { type: Boolean, default: true },
  },

  // ── Políticas (textos legales editables) ───────────────────────────────────
  politicas: {
    devolucion:   { type: String, default: '' },
    privacidad:   { type: String, default: '' },
    terminos:     { type: String, default: '' },
  },

  activo: { type: Boolean, default: true },

}, { timestamps: true });

configuracionSchema.pre('save', async function (next) {
  if (this.activo) {
    await mongoose.model('Configuracion').updateMany(
      { _id: { $ne: this._id } },
      { activo: false }
    );
  }
  next();
});

export default mongoose.models.Configuracion || mongoose.model('Configuracion', configuracionSchema);
