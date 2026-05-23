// src/app/api/setup/route.js
// ─────────────────────────────────────────────────────────────────────────────
// Ruta de inicialización — crea el superAdmin en el primer deploy.
// Solo funciona si:
//   1. No existe ningún usuario con rol superAdmin en la BD
//   2. Se provee la variable SETUP_SECRET en el body (coincide con process.env.SETUP_SECRET)
//
// Uso (una sola vez tras el primer deploy):
//   POST /api/setup
//   Body: { "secret": "<SETUP_SECRET>" }
//
// Después del primer uso, esta ruta devuelve 409 porque ya existe un superAdmin.
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';

export async function POST(request) {
  try {
    await connectDB();

    // Verificar que no exista ya un superAdmin
    const superAdminExiste = await User.findOne({ rol: 'superAdmin' });
    if (superAdminExiste) {
      return NextResponse.json(
        { error: 'El setup ya fue realizado. Ya existe un superAdmin en la base de datos.' },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { secret } = body;

    // Verificar el secreto de setup
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
      return NextResponse.json(
        { error: 'SETUP_SECRET no está definido en las variables de entorno.' },
        { status: 500 }
      );
    }
    if (secret !== setupSecret) {
      return NextResponse.json(
        { error: 'Secreto de setup inválido.' },
        { status: 401 }
      );
    }

    // Leer credenciales del .env
    const email    = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;
    const nombre   = process.env.SUPERADMIN_NOMBRE   || 'Super';
    const apellido = process.env.SUPERADMIN_APELLIDO || 'Admin';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD deben estar en las variables de entorno.' },
        { status: 500 }
      );
    }

    // Crear el superAdmin
    const superAdmin = await User.create({
      nombre,
      apellido,
      email: email.toLowerCase().trim(),
      password,
      rol:    'superAdmin',
      activo: true,
    });

    // Crear configuración de branding inicial si no existe
    const brandingExiste = await BrandingConfig.findOne({ activo: true });
    if (!brandingExiste) {
      await BrandingConfig.create({ activo: true });
    }

    // Crear configuración de tienda inicial si no existe
    const configExiste = await Configuracion.findOne({ activo: true });
    if (!configExiste) {
      await Configuracion.create({
        activo:    true,
        urlHttps:  process.env.NEXT_PUBLIC_BASE_URL || 'https://mitienda.com',
      });
    }

    return NextResponse.json({
      success: true,
      message:  'Setup completado. SuperAdmin creado correctamente.',
      superAdmin: {
        id:    superAdmin._id,
        email: superAdmin.email,
        nombre: `${superAdmin.nombre} ${superAdmin.apellido}`,
        rol:   superAdmin.rol,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Setup Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — estado del setup (¿ya fue inicializado?)
export async function GET() {
  try {
    await connectDB();
    const superAdminExiste = await User.findOne({ rol: 'superAdmin' }, { _id: 1 });
    return NextResponse.json({
      setupCompletado: !!superAdminExiste,
      message: superAdminExiste
        ? 'El sistema ya fue inicializado.'
        : 'El sistema necesita ser inicializado. Hacé POST /api/setup con el secreto.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
