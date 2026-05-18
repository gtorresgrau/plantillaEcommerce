// src/app/api/reportes/productos-csv/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import { generarCSVProductos } from '@/lib/excel';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const productos = await Producto.find({}).sort({ createdAt: -1 }).lean();
    const csv       = generarCSVProductos(productos);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="productos-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
