// src/app/api/cupones/route.js — CRUD de cupones (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cupon from '@/models/Cupon';
import { requireRole } from '@/lib/auth';

// GET: listar todos los cupones
export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const cupones = await Cupon.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: cupones });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: crear nuevo cupón
export async function POST(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const body = await request.json();
    const { codigo, tipo, valor, descripcion, montoMinimo, usoMaximo, vencimiento, activo } = body;

    if (!codigo?.trim() || !tipo || valor === undefined) {
      return NextResponse.json({ error: 'Código, tipo y valor son obligatorios.' }, { status: 400 });
    }

    const cupon = await Cupon.create({
      codigo:      codigo.toUpperCase().trim(),
      tipo,
      valor:       parseFloat(valor),
      descripcion: descripcion || '',
      montoMinimo: parseFloat(montoMinimo || 0),
      usoMaximo:   usoMaximo ? parseInt(usoMaximo) : null,
      vencimiento: vencimiento || null,
      activo:      activo !== false,
    });

    return NextResponse.json({ success: true, data: cupon }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
