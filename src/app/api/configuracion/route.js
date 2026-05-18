// src/app/api/configuracion/route.js — Editable por el admin de la tienda
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let config = await Configuracion.findOne({ activo: true }).lean();
    if (!config) {
      config = await Configuracion.create({ activo: true });
      config = config.toObject();
    }
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const body = await request.json();

    let config = await Configuracion.findOne({ activo: true });
    if (!config) {
      config = await Configuracion.create({ ...body, activo: true });
    } else {
      config = await Configuracion.findByIdAndUpdate(config._id, body, { new: true, runValidators: true });
    }

    return NextResponse.json({ success: true, data: config, message: 'Configuración actualizada' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
