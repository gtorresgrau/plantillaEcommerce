// src/app/api/admin/usuarios/route.js
// El admin puede ver y gestionar clientes y vendedores.
// NO puede ver ni modificar usuarios con rol admin o superAdmin.
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

// Roles que el admin puede ver y modificar
const ROLES_PERMITIDOS = ['cliente', 'vendedor'];

// ── GET — listar usuarios (clientes y vendedores) ─────────────────────────────
export async function GET(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('q')    || '';
    const rol      = searchParams.get('rol')  || '';
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '50');

    const filter = { rol: { $in: ROLES_PERMITIDOS } };
    if (rol && ROLES_PERMITIDOS.includes(rol)) filter.rol = rol;
    if (busqueda) {
      filter.$or = [
        { nombre:   { $regex: busqueda, $options: 'i' } },
        { apellido: { $regex: busqueda, $options: 'i' } },
        { email:    { $regex: busqueda, $options: 'i' } },
      ];
    }

    const total    = await User.countDocuments(filter);
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

export async function POST() {
  return NextResponse.json({ error: 'No permitido' }, { status: 405 });
}
