// src/app/api/super-admin/usuarios/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { rol, porcentajeComision } = await request.json();
    const update = {};
    if (rol)                update.rol = rol;
    if (porcentajeComision !== undefined) update.porcentajeComision = porcentajeComision;

    const user = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean();
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    delete user.password;
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole(['superAdmin']);
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
