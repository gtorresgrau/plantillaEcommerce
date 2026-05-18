// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { nombre, apellido, email, password, telefono } = await request.json();
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    await connectDB();

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const user = await User.create({
      nombre,
      apellido,
      email: email.toLowerCase(),
      password,
      telefono,
      rol: 'cliente',
    });

    const token = await createToken({
      id:     user._id.toString(),
      email:  user.email,
      nombre: user.nombre,
      rol:    user.rol,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id:      user._id,
        nombre:  user.nombre,
        apellido:user.apellido,
        email:   user.email,
        rol:     user.rol,
      },
    }, { status: 201 });

    return setAuthCookie(token, response);
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
