// src/app/api/auth/google/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin (si no está ya inicializado)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request) {
  try {
    const { idToken, nombre, apellido, email } = await request.json();
    if (!idToken) return NextResponse.json({ error: 'Token requerido' }, { status: 400 });

    // Verificar el token de Firebase
    const decoded = await getAuth().verifyIdToken(idToken);
    if (decoded.email !== email) {
      return NextResponse.json({ error: 'Email no coincide' }, { status: 400 });
    }

    await connectDB();

    // Buscar o crear usuario
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        nombre:      nombre || 'Usuario',
        apellido:    apellido || '',
        email:       decoded.email,
        password:    `firebase_${Math.random().toString(36)}`, // contraseña aleatoria
        rol:         'cliente',
        firebaseUid: decoded.uid,
      });
    } else if (!user.firebaseUid) {
      // Vincular cuenta existente con Google
      user.firebaseUid = decoded.uid;
      await user.save();
    }

    const token = await createToken({ id: user._id.toString(), rol: user.rol, email: user.email });
    const response = NextResponse.json({
      success: true,
      user: { id: user._id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol },
    });
    return setAuthCookie(response, token);
  } catch (err) {
    console.error('[POST /api/auth/google]', err);
    return NextResponse.json({ error: 'Error al autenticar con Google' }, { status: 500 });
  }
}
