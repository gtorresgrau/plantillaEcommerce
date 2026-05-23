// src/app/api/admin/usuarios/[id]/route.js
// El admin solo puede cambiar el rol entre cliente/vendedor, y activar/desactivar.
// No puede promover a admin ni tocar superAdmins.
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

const ROLES_PERMITIDOS = ['cliente', 'vendedor'];

// ── GET — obtener usuario ─────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id).select('-password').lean();
    if (!user || !ROLES_PERMITIDOS.includes(user.rol)) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT — actualizar usuario (rol y activo únicamente) ────────────────────────
export async function PUT(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    const body   = await request.json();

    const user = await User.findById(id);
    if (!user || !ROLES_PERMITIDOS.includes(user.rol)) {
      return NextResponse.json({ error: 'Usuario no encontrado o no permitido' }, { status: 404 });
    }

    // Solo se permiten estos campos
    const permitidos = {};
    if (body.activo !== undefined) permitidos.activo = body.activo;
    if (body.rol !== undefined) {
      if (!ROLES_PERMITIDOS.includes(body.rol)) {
        return NextResponse.json({ error: 'Rol no permitido' }, { status: 400 });
      }
      permitidos.rol = body.rol;
    }
    // El admin puede editar datos básicos del usuario también
    if (body.nombre    !== undefined) permitidos.nombre    = body.nombre;
    if (body.apellido  !== undefined) permitidos.apellido  = body.apellido;
    if (body.telefono  !== undefined) permitidos.telefono  = body.telefono;
    if (body.porcentajeComision !== undefined && body.rol === 'vendedor') {
      permitidos.porcentajeComision = body.porcentajeComision;
    }

    const updated = await User.findByIdAndUpdate(id, { $set: permitidos }, { new: true }).select('-password');
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE — no se elimina, solo se desactiva ────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user || !ROLES_PERMITIDOS.includes(user.rol)) {
      return NextResponse.json({ error: 'No permitido' }, { status: 404 });
    }
    await User.findByIdAndUpdate(id, { activo: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
