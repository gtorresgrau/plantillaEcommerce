// src/app/api/comisiones/route.js — Resumen de comisiones por vendedor (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const desde      = searchParams.get('desde');
    const hasta      = searchParams.get('hasta');
    const vendedorId = searchParams.get('vendedorId');

    const match = {
      'vendedor.vendedorId': { $exists: true, $ne: null },
    };

    if (desde || hasta) {
      match.createdAt = {};
      if (desde) match.createdAt.$gte = new Date(desde);
      if (hasta) match.createdAt.$lte = new Date(hasta);
    }
    if (vendedorId) {
      match['vendedor.vendedorId'] = vendedorId;
    }

    // Agrupar por vendedor
    const resumen = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id:               '$vendedor.vendedorId',
          nombre:            { $first: '$vendedor.nombre' },
          email:             { $first: '$vendedor.email' },
          porcentaje:        { $first: '$vendedor.porcentajeComision' },
          totalVentas:       { $sum: '$total' },
          totalComisiones:   { $sum: '$vendedor.comisionTotal' },
          cantidadPedidos:   { $sum: 1 },
          pedidosCancelados: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelado'] }, 1, 0] } },
        },
      },
      { $sort: { totalComisiones: -1 } },
    ]);

    // Pedidos detallados para el vendedor seleccionado
    let pedidos = [];
    if (vendedorId) {
      pedidos = await Order.find(match)
        .sort({ createdAt: -1 })
        .limit(100)
        .select('orderId createdAt orderStatus total vendedor customerInfo.nombre customerInfo.apellido')
        .lean();
    }

    return NextResponse.json({ success: true, data: { resumen, pedidos } });
  } catch (error) {
    console.error('[GET /api/comisiones]', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
