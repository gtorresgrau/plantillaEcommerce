// src/app/api/pedidos/export/route.js — Exportar pedidos a CSV (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCSV(fields) {
  return fields.map(escapeCSV).join(',');
}

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

    const pedidos = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    // Encabezados
    const headers = [
      'N° Pedido', 'Fecha', 'Estado',
      'Nombre', 'Apellido', 'Email', 'Teléfono',
      'Localidad', 'Provincia', 'CP',
      'Método de pago', 'Tipo de envío',
      'Subtotal', 'Costo envío', 'Descuento cupón', 'Total',
      'Cupón', 'Productos', 'Notas admin',
    ];

    const rows = pedidos.map(p => {
      const dir    = p.customerInfo?.direccion || {};
      const items  = (p.items || []).map(i => `${i.nombre} x${i.quantity}`).join(' | ');
      const fecha  = p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '';

      return rowToCSV([
        p.orderId,
        fecha,
        p.orderStatus,
        p.customerInfo?.nombre     || '',
        p.customerInfo?.apellido   || '',
        p.customerInfo?.email      || '',
        p.customerInfo?.telefono   || '',
        dir.localidad    || '',
        dir.provincia    || '',
        dir.codigoPostal || '',
        p.metodoPago    || '',
        p.tipoEnvio     || '',
        p.subtotal      ?? 0,
        p.costoEnvio    ?? 0,
        p.descuentoCupon ?? 0,
        p.total         ?? 0,
        p.cupon?.codigo || '',
        items,
        p.notasAdmin    || '',
      ]);
    });

    const csv = [
      rowToCSV(headers),
      ...rows,
    ].join('\n');

    const fecha = new Date().toISOString().slice(0, 10);
    return new Response('﻿' + csv, {   // BOM para Excel
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-${fecha}.csv"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/pedidos/export]', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
