// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase(), activo: true });
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = await createToken({
      id:    user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      rol:   user.rol,
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
    });

    return setAuthCookie(token, response);
  } catch (error) {
    console.error('[Login]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
