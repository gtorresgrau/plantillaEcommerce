// src/app/api/contacto/[id]/route.js — Operaciones sobre un mensaje individual
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  nombre:  { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  mensaje: { type: String, required: true, trim: true },
  leido:   { type: Boolean, default: false },
}, { timestamps: true });

const Mensaje = mongoose.models.MensajeContacto
  || mongoose.model('MensajeContacto', mensajeSchema);

// ── PATCH — marcar leído/no leído ─────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id }  = await params;
    const body    = await request.json();
    const mensaje = await Mensaje.findByIdAndUpdate(id, { leido: body.leido }, { new: true });
    if (!mensaje) return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: mensaje });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── DELETE — eliminar mensaje ──────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const { id } = await params;
    await Mensaje.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Mensaje eliminado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
