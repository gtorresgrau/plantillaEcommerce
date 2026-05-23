// src/app/api/newsletter/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import Suscripcion from '@/models/Suscripcion';

// ── DELETE — dar de baja suscriptor ──────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    await Suscripcion.findByIdAndUpdate(id, { activo: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PATCH — reactivar suscriptor ─────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    await Suscripcion.findByIdAndUpdate(id, { activo: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
