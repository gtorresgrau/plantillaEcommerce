// src/app/api/pickit/createShipment/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { pickitCreateShipment, formatOrderForPickit } from '@/lib/pickit';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });

    await connectDB();
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    const payload = formatOrderForPickit(order);
    const result  = await pickitCreateShipment(payload);

    const transactionId = result?.transaction?.id || result?.id;

    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          'pickitInfo.shipmentId':  transactionId?.toString() || '',
          'pickitInfo.status':      'created',
          'pickitInfo.createdAt':   new Date(),
          orderStatus: 'preparando',
        },
      }
    );

    return NextResponse.json({ success: true, data: result, transactionId });
  } catch (error) {
    console.error('[Pickit createShipment]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
