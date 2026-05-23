// src/app/api/reportes/newsletter-csv/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Suscripcion from '@/models/Suscripcion';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('activos') !== 'false'; // por defecto solo activos

    const filter = soloActivos ? { activo: true } : {};
    const suscriptores = await Suscripcion.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Generar CSV manualmente (sin dependencia extra)
    const headers = ['Email', 'Nombre', 'Activo', 'Fuente', 'Fecha de alta'];
    const rows = suscriptores.map(s => [
      s.email || '',
      s.nombre || '',
      s.activo ? 'Sí' : 'No',
      s.fuente || 'web',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-AR') : '',
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ];
    const csv = '﻿' + csvLines.join('\n'); // BOM para que Excel detecte UTF-8

    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="suscriptores-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
