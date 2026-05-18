// src/app/api/pickit/createShipmentWithLabel/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { pickitCreateWithLabel, formatOrderForPickit } from '@/lib/pickit';
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
    const { shipment, transactionId, labelBuffer } = await pickitCreateWithLabel(payload);

    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          'pickitInfo.shipmentId': transactionId.toString(),
          'pickitInfo.status':     'created',
          'pickitInfo.createdAt':  new Date(),
          orderStatus: 'preparando',
        },
      }
    );

    // Devolver el PDF directamente
    return new NextResponse(labelBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="etiqueta-${orderId}.pdf"`,
        'X-Transaction-Id':    transactionId.toString(),
      },
    });
  } catch (error) {
    console.error('[Pickit createWithLabel]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
