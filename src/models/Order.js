// src/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // ── Identificación ─────────────────────────────────────────────────────────
  orderId:   { type: String, required: true, unique: true },

  // ── Cliente ────────────────────────────────────────────────────────────────
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    nombre:       { type: String, required: true },
    apellido:     { type: String, required: true },
    email:        { type: String, required: true },
    telefono:     { type: String, required: true },
    documento:    { type: String },
    direccion: {
      calle:        { type: String, required: true },
      numero:       { type: String, required: true },
      piso:         { type: String },
      depto:        { type: String },
      localidad:    { type: String, required: true },
      provincia:    { type: String, default: 'Buenos Aires' },
      codigoPostal: { type: String, required: true },
      entreCalles:  { type: String },
      referencia:   { type: String },
    },
    observaciones: { type: String, default: '' },
  },

  // ── Productos ──────────────────────────────────────────────────────────────
  items: [{
    cod_producto: { type: String, required: true },
    nombre:       { type: String, required: true },
    descripcion:  { type: String },
    precio:       { type: Number, required: true },
    precioFinal:  { type: Number },          // con descuento
    quantity:     { type: Number, required: true, default: 1 },
    foto_1_1:     { type: String },
  }],

  // ── Totales ────────────────────────────────────────────────────────────────
  subtotal:     { type: Number, required: true },
  costoEnvio:   { type: Number, default: 0 },
  total:        { type: Number, required: true },

  // ── Pago ───────────────────────────────────────────────────────────────────
  metodoPago: {
    type: String,
    enum: ['mercadopago', 'transferencia', 'efectivo'],
    required: true,
  },
  mercadoPagoInfo: {
    preferenceId: { type: String },
    paymentId:    { type: String },
    collectionId: { type: String },
    status:       { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    statusDetail: { type: String },
    paymentType:  { type: String },
    externalReference: { type: String },
    initPoint:    { type: String },
    transactionAmount: { type: Number },
    dateApproved: { type: Date },
  },

  // ── Envío (Pickit) ─────────────────────────────────────────────────────────
  tipoEnvio: {
    type: String,
    enum: ['pickit', 'retiroLocal', 'otro'],
    default: 'pickit',
  },
  pickitInfo: {
    trackingNumber: { type: String, default: '' },
    labelUrl:       { type: String, default: '' },
    shipmentId:     { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending','created','availableForDrop','readyForPickup',
             'pickedUp','inTransit','onTheWay','delivered','completed',
             'failed','cancelled','rejected','unknown'],
      default: 'pending',
    },
    createdAt:    { type: Date },
    deliveredAt:  { type: Date },
  },

  // ── Estado del pedido ──────────────────────────────────────────────────────
  orderStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente',
  },

  // ── Vendedor (si aplica comisión) ──────────────────────────────────────────
  vendedor: {
    vendedorId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nombre:             { type: String },
    email:              { type: String },
    porcentajeComision: { type: Number, default: 0 },
    comisionTotal:      { type: Number, default: 0 },
  },

  // ── Comprobante ────────────────────────────────────────────────────────────
  nroComprobante:   { type: String },
  pagoNotificado:   { type: Boolean, default: false },
  notasAdmin:       { type: String, default: '' },

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
