// src/app/api/pedidos/[id]/pdf/route.js — Descarga el comprobante de un pedido
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import BrandingConfig from '@/models/BrandingConfig';
import { generarPDFOrden } from '@/lib/pdf';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const order = await Order.findOne({ orderId: params.id }).lean();
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });

    // Solo admins o el dueño del pedido pueden descargarlo
    if (user.rol === 'cliente' && order.userId?.toString() !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const branding = await BrandingConfig.findOne({ activo: true }).lean();
    const pdfBuffer = await generarPDFOrden(order, {
      nombreTienda: branding?.nombreTienda || 'Mi Tienda',
      primaryColor: branding?.colores?.primary || '#3B82F6',
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
