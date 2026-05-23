// src/app/api/pedidos/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import { getAuthUser } from '@/lib/auth';
import { notificarCambioEstado } from '@/lib/email';

// ─── GET: Obtener pedido por orderId ──────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const order = await Order.findOne({ orderId: params.id }).lean();
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    // Clientes solo pueden ver sus propios pedidos
    if (user.rol === 'cliente' && order.userId?.toString() !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── PUT: Actualizar estado del pedido (admin) ────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const allowedFields = ['orderStatus', 'notasAdmin', 'nroComprobante', 'mercadoPagoInfo', 'pickitInfo', 'pagoNotificado'];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Leer el pedido antes de actualizar para detectar cambio de estado
    const pedidoAntes = await Order.findOne({ orderId: params.id }).lean();

    // Agregar entrada al historial si cambia el estado
    const mongoUpdate = { $set: updateData };
    if (updateData.orderStatus && updateData.orderStatus !== pedidoAntes?.orderStatus) {
      mongoUpdate.$push = {
        historialEstados: {
          estado:    updateData.orderStatus,
          fecha:     new Date(),
          nota:      body.notaHistorial || '',
          usuarioId: user.id,
        },
      };
    }

    const order = await Order.findOneAndUpdate(
      { orderId: params.id },
      mongoUpdate,
      { new: true }
    );
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    // ── Restaurar stock si se cancela ──────────────────────────────────────────
    const seEstasCancelando =
      updateData.orderStatus === 'cancelado' &&
      pedidoAntes?.orderStatus !== 'cancelado';

    if (seEstasCancelando && pedidoAntes?.items?.length) {
      await Promise.allSettled(
        pedidoAntes.items.map(item =>
          Producto.updateOne(
            { cod_producto: item.cod_producto },
            { $inc: { stock: item.quantity } }
          )
        )
      );
    }

    // ── Notificar al cliente si cambió el estado ──────────────────────────────
    const estadoCambio = updateData.orderStatus && updateData.orderStatus !== pedidoAntes?.orderStatus;
    if (estadoCambio) {
      try {
        const branding = await BrandingConfig.findOne({ activo: true }, { nombreTienda: 1, colores: 1 }).lean();
        await notificarCambioEstado({
          order:        order.toObject(),
          nuevoEstado:  updateData.orderStatus,
          nombreTienda: branding?.nombreTienda    || 'Mi Tienda',
          colorPrimary: branding?.colores?.primary || '#3B82F6',
        });
      } catch (emailErr) {
        console.error('[Estado Email Error]', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
