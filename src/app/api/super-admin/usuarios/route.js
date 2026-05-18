// src/app/api/super-admin/usuarios/route.js — CRUD completo de usuarios (superAdmin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    await requireRole(['superAdmin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const rol    = searchParams.get('rol');
    const activo = searchParams.get('activo');
    const page   = parseInt(searchParams.get('page') || '1');
    const limit  = parseInt(searchParams.get('limit') || '50');

    const filter = {};
    if (rol)    filter.rol    = rol;
    if (activo !== null) filter.activo = activo !== 'false';

    const total   = await User.countDocuments(filter);
    const usuarios = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: usuarios, pagination: { page, limit, total } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request) {
  try {
    await requireRole(['superAdmin']);
    await connectDB();

    const body = await request.json();
    if (!body.email || !body.nombre || !body.apellido) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const exists = await User.findOne({ email: body.email.toLowerCase() });
    if (exists) return NextResponse.json({ error: 'Email ya existe' }, { status: 409 });

    const user = await User.create(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
