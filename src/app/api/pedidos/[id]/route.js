// src/app/api/pedidos/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

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

    const order = await Order.findOneAndUpdate(
      { orderId: params.id },
      { $set: updateData },
      { new: true }
    );
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
