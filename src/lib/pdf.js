// src/lib/pdf.js
// ─── Generación de PDFs con PDFKit ────────────────────────────────────────────
import PDFDocument from 'pdfkit';

// ─── PDF de una orden/pedido ──────────────────────────────────────────────────
export function generarPDFOrden(order, branding = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { nombreTienda = 'Mi Tienda', primaryColor = '#3B82F6' } = branding;

    // ── Encabezado ──────────────────────────────────────────────────────────────
    doc.fontSize(20).fillColor(primaryColor).text(nombreTienda, { align: 'center' });
    doc.fontSize(12).fillColor('#111827').text(`Comprobante de pedido`, { align: 'center' });
    doc.moveDown();

    // ── Línea divisoria ─────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#D1D5DB');
    doc.moveDown();

    // ── Datos del pedido ────────────────────────────────────────────────────────
    doc.fontSize(11).fillColor('#374151');
    doc.text(`N° Pedido: ${order.orderId}`, { continued: false });
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-AR')}`);
    doc.text(`Estado: ${order.orderStatus.toUpperCase()}`);
    doc.text(`Método de pago: ${order.metodoPago}`);
    doc.moveDown();

    // ── Datos del cliente ───────────────────────────────────────────────────────
    doc.fontSize(12).fillColor(primaryColor).text('Datos del cliente');
    doc.fontSize(11).fillColor('#374151');
    const ci = order.customerInfo;
    doc.text(`${ci.nombre} ${ci.apellido}`);
    doc.text(`Email: ${ci.email}`);
    doc.text(`Teléfono: ${ci.telefono}`);
    const dir = ci.direccion;
    doc.text(`Dirección: ${dir.calle} ${dir.numero}${dir.piso ? `, Piso ${dir.piso}` : ''} - ${dir.localidad}, ${dir.provincia} (${dir.codigoPostal})`);
    doc.moveDown();

    // ── Productos ───────────────────────────────────────────────────────────────
    doc.fontSize(12).fillColor(primaryColor).text('Detalle del pedido');
    doc.fontSize(11).fillColor('#374151');
    doc.moveDown(0.3);

    // Tabla de items
    const colX = [50, 280, 370, 460];
    doc.fontSize(10).fillColor('#6B7280');
    doc.text('Producto',    colX[0], doc.y, { width: 220 });
    doc.text('Precio unit.', colX[1], doc.y - doc.currentLineHeight(), { width: 80 });
    doc.text('Cant.',       colX[2], doc.y - doc.currentLineHeight(), { width: 80 });
    doc.text('Subtotal',    colX[3], doc.y - doc.currentLineHeight(), { width: 80 });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#D1D5DB');
    doc.moveDown(0.3);

    doc.fontSize(10).fillColor('#111827');
    for (const item of order.items) {
      const precio = item.precioFinal || item.precio;
      const subtotal = precio * item.quantity;
      const yPos = doc.y;
      doc.text(item.nombre, colX[0], yPos, { width: 220 });
      doc.text(`$${precio.toLocaleString('es-AR')}`, colX[1], yPos, { width: 80 });
      doc.text(`${item.quantity}`, colX[2], yPos, { width: 80 });
      doc.text(`$${subtotal.toLocaleString('es-AR')}`, colX[3], yPos, { width: 80 });
      doc.moveDown();
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#D1D5DB');
    doc.moveDown(0.5);

    // ── Totales ─────────────────────────────────────────────────────────────────
    const totY = doc.y;
    doc.fontSize(11).fillColor('#374151');
    doc.text('Subtotal:', 380, totY);
    doc.text(`$${order.subtotal.toLocaleString('es-AR')}`, 460, totY);
    doc.moveDown(0.3);
    doc.text('Envío:', 380, doc.y);
    doc.text(order.costoEnvio > 0 ? `$${order.costoEnvio.toLocaleString('es-AR')}` : 'Gratis', 460, doc.y - doc.currentLineHeight());
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor(primaryColor);
    doc.text('TOTAL:', 380, doc.y);
    doc.text(`$${order.total.toLocaleString('es-AR')}`, 460, doc.y - doc.currentLineHeight());

    // ── Footer ──────────────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(9).fillColor('#9CA3AF').text(`Generado por ${nombreTienda}`, { align: 'center' });

    doc.end();
  });
}

// ─── PDF de listado de pedidos (reporte) ──────────────────────────────────────
export function generarPDFReportePedidos(orders, branding = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { nombreTienda = 'Mi Tienda', primaryColor = '#3B82F6' } = branding;

    doc.fontSize(16).fillColor(primaryColor).text(`${nombreTienda} — Reporte de Pedidos`, { align: 'center' });
    doc.fontSize(10).fillColor('#6B7280').text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
    doc.moveDown();

    // Cabecera de tabla
    const cols = [40, 150, 280, 390, 460, 570, 640];
    doc.fontSize(9).fillColor('#6B7280');
    ['N° Pedido','Cliente','Email','Método Pago','Estado','Total','Fecha'].forEach((h, i) => {
      doc.text(h, cols[i], doc.y, { width: cols[i + 1] ? cols[i + 1] - cols[i] : 100 });
    });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(780, doc.y).stroke('#D1D5DB');
    doc.moveDown(0.2);

    doc.fontSize(8).fillColor('#111827');
    for (const order of orders) {
      const ci = order.customerInfo;
      const y = doc.y;
      doc.text(order.orderId.slice(-8), cols[0], y, { width: 100 });
      doc.text(`${ci.nombre} ${ci.apellido}`, cols[1], y, { width: 120 });
      doc.text(ci.email, cols[2], y, { width: 100 });
      doc.text(order.metodoPago, cols[3], y, { width: 60 });
      doc.text(order.orderStatus, cols[4], y, { width: 60 });
      doc.text(`$${order.total.toLocaleString('es-AR')}`, cols[5], y, { width: 70 });
      doc.text(new Date(order.createdAt).toLocaleDateString('es-AR'), cols[6], y, { width: 80 });
      doc.moveDown();
    }

    doc.end();
  });
}
