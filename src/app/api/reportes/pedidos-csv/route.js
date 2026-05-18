// src/app/api/reportes/pedidos-csv/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { generarCSVPedidos } from '@/lib/excel';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const desde  = searchParams.get('desde');
    const hasta  = searchParams.get('hasta');

    const filter = {};
    if (status) filter.orderStatus = status;
    if (desde || hasta) {
      filter.createdAt = {};
      if (desde) filter.createdAt.$gte = new Date(desde);
      if (hasta) filter.createdAt.$lte = new Date(hasta);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const csv    = generarCSVPedidos(orders);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
