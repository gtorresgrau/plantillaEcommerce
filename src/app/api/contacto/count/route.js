// src/app/api/contacto/count/route.js
// Devuelve solo el conteo de mensajes no leídos (para el badge del sidebar)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

const Mensaje = mongoose.models.MensajeContacto
  || mongoose.model('MensajeContacto', new mongoose.Schema({
    leido: { type: Boolean, default: false },
  }, { timestamps: true }));

export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const noLeidos = await Mensaje.countDocuments({ leido: false });
    return NextResponse.json({ success: true, noLeidos });
  } catch (error) {
    // Si no está autenticado, devolver 0 (no mostrar badge)
    return NextResponse.json({ success: false, noLeidos: 0 });
  }
}
