// src/app/api/contacto/route.js
// Recibe el formulario de contacto del storefront.
// Por defecto guarda el mensaje en la BD y (opcionalmente) envía email.
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import mongoose from 'mongoose';

// ── Modelo liviano para guardar mensajes de contacto ──────────────────────────
const mensajeSchema = new mongoose.Schema({
  nombre:  { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true, lowercase: true },
  mensaje: { type: String, required: true, trim: true },
  leido:   { type: Boolean, default: false },
}, { timestamps: true });

const Mensaje = mongoose.models.MensajeContacto
  || mongoose.model('MensajeContacto', mensajeSchema);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, mensaje } = body;

    // Validación básica
    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: 'Todos los campos son requeridos.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }
    if (mensaje.length < 10) {
      return NextResponse.json({ error: 'El mensaje es muy corto.' }, { status: 400 });
    }

    await connectDB();

    // Guardar en la BD
    await Mensaje.create({ nombre, email, mensaje });

    // Aquí se podría integrar nodemailer/resend para notificar al admin.
    // La config de email está en Configuracion.correoContacto
    // const config = await Configuracion.findOne({ activo: true }).lean();
    // await sendEmail({ to: config.correoContacto, ... });

    return NextResponse.json({ success: true, message: 'Mensaje recibido. Te respondemos a la brevedad.' });
  } catch (error) {
    console.error('[API contacto]', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// ── GET → solo para admin: listar mensajes ────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const mensajes = await Mensaje.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: mensajes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
