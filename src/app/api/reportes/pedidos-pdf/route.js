// src/app/api/reportes/pedidos-pdf/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import BrandingConfig from '@/models/BrandingConfig';
import { generarPDFReportePedidos } from '@/lib/pdf';
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

    const orders  = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const branding = await BrandingConfig.findOne({ activo: true }).lean();

    const pdfBuffer = await generarPDFReportePedidos(orders, {
      nombreTienda: branding?.nombreTienda || 'Mi Tienda',
      primaryColor: branding?.colores?.primary || '#3B82F6',
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-pedidos-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
