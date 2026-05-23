// src/app/api/seguimiento/[orderId]/route.js
// Endpoint PÚBLICO — devuelve info de seguimiento sin datos sensibles
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

// Mapa de estados con iconos y descripción
const ESTADOS = {
  pendiente:   { label: 'Pedido recibido',        desc: 'Tu pedido fue recibido y está siendo procesado.' },
  pagado:      { label: 'Pago confirmado',         desc: 'El pago fue acreditado exitosamente.' },
  preparando:  { label: 'En preparación',          desc: 'Estamos preparando tu pedido.' },
  enviado:     { label: 'En camino',               desc: 'Tu pedido está en camino.' },
  entregado:   { label: 'Entregado',               desc: '¡Tu pedido fue entregado!' },
  cancelado:   { label: 'Cancelado',               desc: 'Este pedido fue cancelado.' },
};

export async function GET(request, { params }) {
  try {
    await connectDB();
    const order = await Order.findOne({ orderId: params.orderId }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
    }

    // Retornar solo los campos necesarios para el tracking (sin email, tel, dirección completa)
    const tracking = {
      orderId:     order.orderId,
      orderStatus: order.orderStatus,
      estadoInfo:  ESTADOS[order.orderStatus] || { label: order.orderStatus, desc: '' },
      createdAt:   order.createdAt,
      updatedAt:   order.updatedAt,

      // Nombre del cliente (sin datos de contacto)
      clienteNombre: `${order.customerInfo?.nombre || ''} ${order.customerInfo?.apellido || ''}`.trim(),

      // Items (nombre + cantidad + foto, sin precio si se prefiere)
      items: (order.items || []).map(i => ({
        nombre:   i.nombre,
        quantity: i.quantity,
        foto1:    i.foto1 || '',
      })),

      // Totales
      subtotal:       order.subtotal,
      costoEnvio:     order.costoEnvio,
      descuentoCupon: order.descuentoCupon || 0,
      total:          order.total,

      // Envío
      tipoEnvio:  order.tipoEnvio,
      metodoPago: order.metodoPago,

      // Tracking Pickit (si existe)
      pickitTracking: order.pickitInfo?.trackingNumber || null,
      pickitLabel:    order.pickitInfo?.labelUrl       || null,
      pickitStatus:   order.pickitInfo?.status         || null,

      // Notas del admin (puede dejar un mensaje visible al cliente)
      notasAdmin: order.notasAdmin || '',

      // Historial de estados (para timeline)
      historialEstados: (order.historialEstados || []).map(h => ({
        estado: h.estado,
        fecha:  h.fecha,
        nota:   h.nota || '',
      })),
    };

    return NextResponse.json({ success: true, data: tracking });
  } catch (error) {
    console.error('[GET /api/seguimiento]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
