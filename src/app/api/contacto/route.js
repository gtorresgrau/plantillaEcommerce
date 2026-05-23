// src/app/api/contacto/route.js
// Recibe el formulario de contacto del storefront.
// Guarda el mensaje en la BD y envía email de notificación al admin.
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Configuracion from '@/models/Configuracion';
import BrandingConfig from '@/models/BrandingConfig';
import { requireRole } from '@/lib/auth';
import { sendMail } from '@/lib/email';
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
    await Mensaje.create({ nombre, email, mensaje });

    // ── Notificar al admin (no bloqueante) ────────────────────────────────────
    try {
      const [config, branding] = await Promise.all([
        Configuracion.findOne({ activo: true }, { correoAdministracion: 1, nombreEmpresa: 1 }).lean(),
        BrandingConfig.findOne({ activo: true }, { nombreTienda: 1, colores: 1 }).lean(),
      ]);
      const adminEmail   = config?.correoAdministracion;
      const nombreTienda = branding?.nombreTienda || config?.nombreEmpresa || 'Mi Tienda';
      const color        = branding?.colores?.primary || '#3B82F6';

      if (adminEmail) {
        await sendMail({
          to:      adminEmail,
          subject: `💬 Nuevo mensaje de ${nombre} — ${nombreTienda}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f4f4f5;padding:32px 16px;">
              <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <div style="background:${color};padding:20px 28px;">
                  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">${nombreTienda}</h1>
                </div>
                <div style="padding:24px 28px;">
                  <h2 style="color:#111827;font-size:17px;margin:0 0 16px;">Nuevo mensaje de contacto</h2>
                  <div style="background:#f9fafb;border-radius:8px;padding:14px;margin-bottom:16px;font-size:14px;color:#374151;">
                    <strong>Nombre:</strong> ${nombre}<br>
                    <strong>Email:</strong> <a href="mailto:${email}" style="color:${color};">${email}</a>
                  </div>
                  <div style="background:#f0f9ff;border-left:4px solid ${color};border-radius:4px;padding:14px;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${mensaje.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
                  <p style="margin-top:20px;">
                    <a href="mailto:${email}?subject=Re: Tu consulta en ${nombreTienda}"
                       style="background:${color};color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                      Responder
                    </a>
                  </p>
                </div>
                <div style="background:#f9fafb;padding:12px 28px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;">
                  Mensaje recibido desde el formulario de contacto de ${nombreTienda}
                </div>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('[Contacto Email Error]', emailErr.message);
    }

    return NextResponse.json({ success: true, message: 'Mensaje recibido. Te respondemos a la brevedad.' });
  } catch (error) {
    console.error('[API contacto POST]', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// ── GET → solo para admin: listar mensajes ────────────────────────────────────
export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const mensajes = await Mensaje.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: mensajes });
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}
