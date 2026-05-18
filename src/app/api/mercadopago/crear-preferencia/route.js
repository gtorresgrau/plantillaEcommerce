// src/app/api/mercadopago/crear-preferencia/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import BrandingConfig from '@/models/BrandingConfig';
import { crearPreferencia } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 });

    await connectDB();
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    const branding = await BrandingConfig.findOne({ activo: true }).lean();
    const nombreTienda = branding?.nombreTienda || 'Mi Tienda';

    const preference = await crearPreferencia({ order, nombreTienda });

    // Guardar preferenceId en la orden
    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          'mercadoPagoInfo.preferenceId': preference.id,
          'mercadoPagoInfo.initPoint':    preference.init_point,
        },
      }
    );

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      initPoint:    preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('[MP crear-preferencia]', error);
    return NextResponse.json({ error: error.message || 'Error con MercadoPago' }, { status: 500 });
  }
}
