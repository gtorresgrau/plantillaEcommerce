// src/app/api/pedidos/count/route.js
// Devuelve conteo de pedidos pendientes (para badge del sidebar admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

const Order = mongoose.models.Order
  || mongoose.model('Order', new mongoose.Schema({
    orderStatus: { type: String, default: 'pendiente' },
  }, { timestamps: true }));

export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin', 'vendedor']);
    await connectDB();
    const pendientes = await Order.countDocuments({ orderStatus: 'pendiente' });
    return NextResponse.json({ success: true, pendientes });
  } catch {
    return NextResponse.json({ success: false, pendientes: 0 });
  }
}
