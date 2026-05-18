// src/lib/excel.js
// ─── Generación de archivos CSV/Excel con json2csv ────────────────────────────
import { Parser } from 'json2csv';

// ─── CSV de pedidos ────────────────────────────────────────────────────────────
export function generarCSVPedidos(orders) {
  const fields = [
    { label: 'N° Pedido',      value: 'orderId' },
    { label: 'Fecha',          value: (row) => new Date(row.createdAt).toLocaleDateString('es-AR') },
    { label: 'Nombre',         value: (row) => `${row.customerInfo.nombre} ${row.customerInfo.apellido}` },
    { label: 'Email',          value: (row) => row.customerInfo.email },
    { label: 'Teléfono',       value: (row) => row.customerInfo.telefono },
    { label: 'Localidad',      value: (row) => row.customerInfo.direccion?.localidad || '' },
    { label: 'Provincia',      value: (row) => row.customerInfo.direccion?.provincia || '' },
    { label: 'Método pago',    value: 'metodoPago' },
    { label: 'Estado',         value: 'orderStatus' },
    { label: 'Subtotal',       value: 'subtotal' },
    { label: 'Costo envío',    value: 'costoEnvio' },
    { label: 'Total',          value: 'total' },
    { label: 'Tipo envío',     value: 'tipoEnvio' },
    { label: 'Tracking',       value: (row) => row.pickitInfo?.trackingNumber || '' },
    { label: 'Estado envío',   value: (row) => row.pickitInfo?.status || '' },
    { label: 'N° Comprobante', value: 'nroComprobante' },
  ];

  const parser = new Parser({ fields, delimiter: ',', withBOM: true });
  return parser.parse(orders);
}

// ─── CSV de productos ──────────────────────────────────────────────────────────
export function generarCSVProductos(productos) {
  const fields = [
    { label: 'Código',        value: 'cod_producto' },
    { label: 'Nombre',        value: 'nombre' },
    { label: 'Título',        value: 'titulo_de_producto' },
    { label: 'Marca',         value: 'marca' },
    { label: 'Categoría',     value: 'categoria' },
    { label: 'Precio',        value: 'precio' },
    { label: 'Precio costo',  value: 'precio_costo' },
    { label: '% Ganancia',    value: 'porcentaje_ganancia' },
    { label: 'Descuento %',   value: 'descuento' },
    { label: 'Stock',         value: 'stock' },
    { label: 'Sin stock',     value: (row) => row.sinStock ? 'Sí' : 'No' },
    { label: 'Destacado',     value: (row) => row.destacado ? 'Sí' : 'No' },
    { label: 'Visible',       value: (row) => row.visible ? 'Sí' : 'No' },
    { label: 'Activo',        value: (row) => row.activo ? 'Sí' : 'No' },
    { label: 'Foto 1',        value: 'foto_1_1' },
    { label: 'Foto 2',        value: 'foto_1_2' },
    { label: 'Foto 3',        value: 'foto_1_3' },
    { label: 'Foto 4',        value: 'foto_1_4' },
    { label: 'Creado',        value: (row) => new Date(row.createdAt).toLocaleDateString('es-AR') },
  ];

  const parser = new Parser({ fields, delimiter: ',', withBOM: true });
  return parser.parse(productos);
}

// ─── CSV de clientes ───────────────────────────────────────────────────────────
export function generarCSVClientes(usuarios) {
  const fields = [
    { label: 'Nombre',         value: 'nombre' },
    { label: 'Apellido',       value: 'apellido' },
    { label: 'Email',          value: 'email' },
    { label: 'Teléfono',       value: 'telefono' },
    { label: 'Documento',      value: 'documento' },
    { label: 'Rol',            value: 'rol' },
    { label: 'Activo',         value: (row) => row.activo ? 'Sí' : 'No' },
    { label: 'Fecha registro', value: (row) => new Date(row.createdAt).toLocaleDateString('es-AR') },
  ];

  const parser = new Parser({ fields, delimiter: ',', withBOM: true });
  return parser.parse(usuarios);
}
