// src/lib/email.js — Envío de emails transaccionales con Nodemailer
// Requiere: npm install nodemailer
// Variables de entorno: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
import nodemailer from 'nodemailer';

// ── Crear transporter (se reutiliza por request) ──────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT   === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const fromAddress = () =>
  process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@mitienda.com';

// ── Helper: enviar email genérico (exportado para uso en otros módulos) ───────
export async function sendMail({ to, subject, html, text }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER / EMAIL_PASS no configurados — email no enviado.');
    return null;
  }
  const transporter = getTransporter();
  return transporter.sendMail({
    from:    fromAddress(),
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });
}

// ── Template base ─────────────────────────────────────────────────────────────
function wrapTemplate({ titulo, contenido, nombreTienda = 'Mi Tienda', colorPrimary = '#3B82F6' }) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:32px 16px;">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr><td style="background:${colorPrimary};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${nombreTienda}</h1>
            </td></tr>
            <!-- Título -->
            <tr><td style="padding:28px 32px 0;">
              <h2 style="margin:0;color:#111827;font-size:20px;">${titulo}</h2>
            </td></tr>
            <!-- Contenido -->
            <tr><td style="padding:16px 32px 28px;color:#374151;font-size:15px;line-height:1.6;">
              ${contenido}
            </td></tr>
            <!-- Footer -->
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
  `;
}

// ── Email: confirmación de pedido al cliente ──────────────────────────────────
export async function enviarConfirmacionPedido({ order, nombreTienda = 'Mi Tienda', colorPrimary }) {
  const { customerInfo, items, orderId, total, costoEnvio, subtotal, metodoPago, tipoEnvio } = order;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;">${item.nombre || item.titulo_de_producto}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151;">×${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;color:#374151;font-weight:600;">$${(item.precioFinal * item.quantity).toLocaleString('es-AR')}</td>
    </tr>
  `).join('');

  const metodoLabel = { mercadopago: 'MercadoPago', transferencia: 'Transferencia bancaria', efectivo: 'Efectivo' }[metodoPago] || metodoPago;
  const envioLabel  = tipoEnvio === 'retiroLocal' ? 'Retiro en local' : 'Envío a domicilio';

  const contenido = `
    <p>Hola <strong>${customerInfo.nombre}</strong>, ¡gracias por tu compra!</p>
    <p>Tu pedido fue registrado correctamente. A continuación encontrás el resumen:</p>

    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Número de pedido</p>
      <p style="margin:0;font-family:monospace;font-size:16px;font-weight:700;color:#111827;">${orderId}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:600;">Producto</th>
          <th style="text-align:center;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:600;">Cant.</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:600;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;color:#374151;font-size:14px;">$${subtotal?.toLocaleString('es-AR')}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Envío</td>
        <td style="padding:4px 0;text-align:right;color:#374151;font-size:14px;">${costoEnvio === 0 ? 'Gratis' : '$' + costoEnvio?.toLocaleString('es-AR')}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#111827;font-size:16px;font-weight:700;border-top:2px solid #e5e7eb;">Total</td>
        <td style="padding:8px 0;text-align:right;color:#111827;font-size:16px;font-weight:700;border-top:2px solid #e5e7eb;">$${total?.toLocaleString('es-AR')}</td>
      </tr>
    </table>

    <div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;font-size:13px;color:#166534;">
      <strong>Método de pago:</strong> ${metodoLabel}<br>
      <strong>Entrega:</strong> ${envioLabel}
    </div>

    <p style="margin-top:16px;font-size:14px;color:#6b7280;">
      ${metodoPago === 'transferencia'
        ? 'Para completar tu pedido, realizá la transferencia y envianos el comprobante por WhatsApp o al email de la tienda.'
        : metodoPago === 'efectivo'
          ? 'Coordiná el pago contra entrega al momento de la entrega.'
          : 'Tu pago está siendo procesado por MercadoPago.'
      }
    </p>

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/pedido/${orderId}"
         style="display:inline-block;background:${colorPrimary};color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Rastrear mi pedido
      </a>
    </div>
  `;

  return sendMail({
    to:      customerInfo.email,
    subject: `✅ Pedido confirmado #${orderId} — ${nombreTienda}`,
    html:    wrapTemplate({ titulo: '¡Tu pedido fue recibido!', contenido, nombreTienda, colorPrimary }),
  });
}

// ── Email: notificación de nuevo pedido al admin ──────────────────────────────
export async function notificarAdminNuevoPedido({ order, nombreTienda = 'Mi Tienda', adminEmail, colorPrimary }) {
  if (!adminEmail) return null;

  const { customerInfo, items, orderId, total, metodoPago } = order;

  const itemsList = items.map(i => `• ${i.nombre || i.titulo_de_producto} ×${i.quantity} = $${(i.precioFinal * i.quantity).toLocaleString('es-AR')}`).join('<br>');
  const metodoLabel = { mercadopago: 'MercadoPago', transferencia: 'Transferencia', efectivo: 'Efectivo' }[metodoPago] || metodoPago;

  const contenido = `
    <p>Se recibió un nuevo pedido en <strong>${nombreTienda}</strong>.</p>

    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:12px 0;">
      <strong>N° Pedido:</strong> <span style="font-family:monospace;">${orderId}</span><br>
      <strong>Cliente:</strong> ${customerInfo.nombre} ${customerInfo.apellido}<br>
      <strong>Email:</strong> ${customerInfo.email}<br>
      <strong>Teléfono:</strong> ${customerInfo.telefono || '—'}<br>
      <strong>Total:</strong> $${total?.toLocaleString('es-AR')}<br>
      <strong>Método de pago:</strong> ${metodoLabel}
    </div>

    <p><strong>Productos:</strong><br>${itemsList}</p>
  `;

  return sendMail({
    to:      adminEmail,
    subject: `🛒 Nuevo pedido #${orderId} — $${total?.toLocaleString('es-AR')}`,
    html:    wrapTemplate({ titulo: 'Nuevo pedido recibido', contenido, nombreTienda, colorPrimary }),
  });
}

// ── Email: cambio de estado del pedido ────────────────────────────────────────
export async function notificarCambioEstado({ order, nuevoEstado, nombreTienda = 'Mi Tienda', colorPrimary }) {
  const ESTADOS = {
    pagado:     { label: 'Pago confirmado',      emoji: '✅', msg: 'Tu pago fue confirmado y estamos preparando tu pedido.' },
    preparando: { label: 'En preparación',        emoji: '📦', msg: 'Estamos preparando tu pedido. Pronto lo enviaremos.' },
    enviado:    { label: 'Enviado',               emoji: '🚚', msg: 'Tu pedido está en camino. Pronto lo recibirás.' },
    entregado:  { label: 'Entregado',             emoji: '🎉', msg: '¡Tu pedido fue entregado! Esperamos que lo disfrutes.' },
    cancelado:  { label: 'Pedido cancelado',      emoji: '❌', msg: 'Tu pedido fue cancelado. Si tenés dudas, contactanos.' },
  };

  const info = ESTADOS[nuevoEstado];
  if (!info) return null;

  const contenido = `
    <p>Hola <strong>${order.customerInfo?.nombre}</strong>,</p>
    <p>${info.msg}</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:12px 0;">
      <strong>N° Pedido:</strong> <span style="font-family:monospace;">${order.orderId}</span><br>
      <strong>Estado:</strong> ${info.emoji} ${info.label}
    </div>
    <p style="font-size:13px;color:#6b7280;">Si tenés alguna consulta, no dudes en contactarnos.</p>
  `;

  return sendMail({
    to:      order.customerInfo?.email,
    subject: `${info.emoji} Pedido ${info.label.toLowerCase()} #${order.orderId} — ${nombreTienda}`,
    html:    wrapTemplate({ titulo: info.label, contenido, nombreTienda, colorPrimary }),
  });
}
