// src/app/api/newsletter/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import Suscripcion from '@/models/Suscripcion';
import BrandingConfig from '@/models/BrandingConfig';
import { sendMail } from '@/lib/email';

// ── POST — suscribirse (público) ──────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, nombre = '' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    await connectDB();

    // Extraer IP del header (compatible con Vercel / proxies)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '';

    const existente = await Suscripcion.findOne({ email });
    if (existente) {
      if (existente.activo) {
        return NextResponse.json({ success: true, message: 'Ya estás suscripto.' });
      }
      existente.activo   = true;
      existente.ipOrigen = ip;
      if (nombre) existente.nombre = nombre;
      await existente.save();

      // Email de reactivación (no bloqueante)
      try {
        const branding = await BrandingConfig.findOne({ activo: true }).lean();
        const nombreTienda = branding?.nombreTienda || 'Mi Tienda';
        const colorPrimary = branding?.colores?.primary || '#3B82F6';
        const n = existente.nombre || nombre || '';
        await sendMail({
          to:      email,
          subject: `¡Bienvenido/a de vuelta a ${nombreTienda}!`,
          html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr><td style="background:${colorPrimary};padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:22px;">${nombreTienda}</h1></td></tr>
          <tr><td style="padding:28px 32px 8px;"><h2 style="margin:0;color:#111827;font-size:20px;">¡Bienvenido/a de vuelta!</h2></td></tr>
          <tr><td style="padding:12px 32px 28px;color:#374151;font-size:15px;line-height:1.6;">
          <p>Hola${n ? ` <strong>${n}</strong>` : ''},</p>
          <p>Tu suscripción al newsletter de <strong>${nombreTienda}</strong> fue reactivada. Volvés a recibir nuestras novedades y ofertas.</p>
          </td></tr>
          <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Correo automático de ${nombreTienda}. No respondas este email.</p>
          </td></tr></table></td></tr></table></body></html>`,
        });
      } catch { /* silenciar */ }

      return NextResponse.json({ success: true, message: '¡Bienvenido de vuelta!' });
    }

    await Suscripcion.create({ email, nombre, fuente: 'web', ipOrigen: ip });

    // ── Email de bienvenida (no bloqueante) ───────────────────────────────────
    try {
      const branding = await BrandingConfig.findOne({ activo: true }).lean();
      const nombreTienda  = branding?.nombreTienda  || 'Mi Tienda';
      const colorPrimary  = branding?.colores?.primary || '#3B82F6';
      const nombreCliente = nombre ? `, <strong>${nombre}</strong>` : '';

      await sendMail({
        to:      email,
        subject: `¡Bienvenido/a al newsletter de ${nombreTienda}!`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:32px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <tr><td style="background:${colorPrimary};padding:24px 32px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${nombreTienda}</h1>
                  </td></tr>
                  <tr><td style="padding:28px 32px 8px;">
                    <h2 style="margin:0;color:#111827;font-size:20px;">¡Gracias por suscribirte!</h2>
                  </td></tr>
                  <tr><td style="padding:12px 32px 28px;color:#374151;font-size:15px;line-height:1.6;">
                    <p>Hola${nombreCliente},</p>
                    <p>Te confirmamos que tu email fue registrado correctamente en el newsletter de <strong>${nombreTienda}</strong>.</p>
                    <p>A partir de ahora vas a recibir nuestras novedades, ofertas y promociones exclusivas directamente en tu casilla.</p>
                    <p style="margin-top:20px;font-size:13px;color:#9ca3af;">
                      Si no solicitaste esta suscripción podés ignorar este email.
                    </p>
                  </td></tr>
                  <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                      Este es un correo automático de ${nombreTienda}. Por favor no respondas este email.
                    </p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (emailErr) {
      console.warn('[Newsletter] Email de bienvenida no enviado:', emailErr.message);
    }

    return NextResponse.json({ success: true, message: '¡Te suscribiste correctamente!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── GET — listar suscriptores (solo admin/superAdmin) ─────────────────────────
export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const suscriptores = await Suscripcion
      .find({ activo: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: suscriptores, total: suscriptores.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
