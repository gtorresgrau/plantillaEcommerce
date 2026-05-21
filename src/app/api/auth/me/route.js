// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const user = await User.findById(auth.id).lean();
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    delete user.password;
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { nombre, apellido, telefono } = await request.json();

    await connectDB();
    const user = await User.findByIdAndUpdate(
      auth.id,
      { $set: { nombre, apellido, telefono } },
      { new: true }
    ).lean();
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    delete user.password;
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
