// src/app/api/mercadopago/webhook/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Producto from '@/models/Product';
import { obtenerPago } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[MP Webhook]', JSON.stringify(body));

    // MercadoPago envía topic=payment y id=paymentId
    const { type, data } = body;
    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;
    const payment = await obtenerPago(paymentId);

    const externalRef = payment.external_reference;
    if (!externalRef) return NextResponse.json({ received: true });

    await connectDB();
    const order = await Order.findOne({ orderId: externalRef });
    if (!order) {
      console.error('[MP Webhook] Orden no encontrada:', externalRef);
      return NextResponse.json({ received: true });
    }

    const mpStatus = payment.status; // approved | rejected | pending | cancelled
    let orderStatus = order.orderStatus;

    if (mpStatus === 'approved') {
      orderStatus = 'pagado';
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      orderStatus = 'cancelado';
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: externalRef },
      {
        $set: {
          orderStatus,
          pagoNotificado: true,
          'mercadoPagoInfo.paymentId':   paymentId.toString(),
          'mercadoPagoInfo.status':       mpStatus,
          'mercadoPagoInfo.statusDetail': payment.status_detail,
          'mercadoPagoInfo.paymentType':  payment.payment_type_id,
          'mercadoPagoInfo.dateApproved': payment.date_approved,
          'mercadoPagoInfo.transactionAmount': payment.transaction_amount,
        },
      },
      { new: false } // nos interesa el estado ANTERIOR para detectar transiciones
    );

    // ── Restaurar stock si el pago fue rechazado/cancelado ────────────────────
    const eraActivo = updatedOrder?.orderStatus &&
      !['cancelado'].includes(updatedOrder.orderStatus);
    const ahoraCancelado = orderStatus === 'cancelado';

    if (eraActivo && ahoraCancelado && updatedOrder?.items?.length) {
      await Promise.allSettled(
        updatedOrder.items.map(item =>
          Producto.updateOne(
            { cod_producto: item.cod_producto },
            { $inc: { stock: item.quantity } }
          )
        )
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[MP Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// MercadoPago también envía GETs para validar el endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
