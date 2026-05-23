// src/app/api/cupones/[codigo]/route.js — Editar / eliminar cupón (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cupon from '@/models/Cupon';
import { requireRole } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const body = await request.json();
    const allowed = ['tipo', 'valor', 'descripcion', 'montoMinimo', 'usoMaximo', 'vencimiento', 'activo'];
    const update  = {};
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    const cupon = await Cupon.findOneAndUpdate(
      { codigo: params.codigo.toUpperCase() },
      { $set: update },
      { new: true }
    );
    if (!cupon) return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, data: cupon });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    await Cupon.findOneAndDelete({ codigo: params.codigo.toUpperCase() });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
