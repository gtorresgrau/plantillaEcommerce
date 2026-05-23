// src/app/api/newsletter/enviar/route.js
// Envío masivo de email a todos los suscriptores activos (solo admin/superAdmin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import Suscripcion from '@/models/Suscripcion';
import BrandingConfig from '@/models/BrandingConfig';
import { sendMail } from '@/lib/email';

export async function POST(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { asunto, contenido } = await request.json();

    if (!asunto?.trim() || !contenido?.trim()) {
      return NextResponse.json({ error: 'Asunto y contenido son obligatorios.' }, { status: 400 });
    }

    // Obtener branding para el template
    const branding     = await BrandingConfig.findOne({ activo: true }).lean();
    const nombreTienda = branding?.nombreTienda  || 'Mi Tienda';
    const colorPrimary = branding?.colores?.primary || '#3B82F6';

    // Obtener suscriptores activos
    const suscriptores = await Suscripcion.find({ activo: true }).select('email nombre').lean();
    if (!suscriptores.length) {
      return NextResponse.json({ error: 'No hay suscriptores activos.' }, { status: 400 });
    }

    // HTML template base
    const buildHtml = (nombre) => `
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
              <tr><td style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
                ${nombre ? `<p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>` : ''}
                ${contenido.replace(/\n/g, '<br>')}
              </td></tr>
              <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                  Recibís este email porque estás suscripto al newsletter de ${nombreTienda}.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    // Enviar en lotes de 10 para no saturar el servidor SMTP
    let enviados = 0;
    let errores  = 0;
    const LOTE   = 10;

    for (let i = 0; i < suscriptores.length; i += LOTE) {
      const lote = suscriptores.slice(i, i + LOTE);
      await Promise.allSettled(
        lote.map(async (s) => {
          try {
            await sendMail({
              to:      s.email,
              subject: asunto,
              html:    buildHtml(s.nombre || ''),
            });
            enviados++;
          } catch {
            errores++;
          }
        })
      );
      // Pausa entre lotes para evitar rate limits
      if (i + LOTE < suscriptores.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return NextResponse.json({
      success: true,
      enviados,
      errores,
      total: suscriptores.length,
      message: `Email enviado a ${enviados} de ${suscriptores.length} suscriptores.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
