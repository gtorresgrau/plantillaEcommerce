// src/lib/pickit.js
// ─── Integración con la API de Pickit ─────────────────────────────────────────

const PICKIT_URLS = {
  ar: 'https://api.pickit.net',
  uy: 'https://api.pickit.com.uy',
  mx: 'https://api.pickit.com.mx',
  co: 'https://api.pickit.com.co',
  cl: 'https://api.pickit.cl',
  pe: 'https://api.pickit.com.pe',
};

function getPickitBaseUrl() {
  const env = process.env.PICKIT_ENVIRONMENT || 'sandbox';
  const country = process.env.PICKIT_COUNTRY || 'ar';
  if (env === 'production') return PICKIT_URLS[country] || PICKIT_URLS.ar;
  return 'https://api.uat.pickit.com.ar';
}

function getPickitHeaders() {
  return {
    'Content-Type': 'application/json',
    'apiKey': process.env.PICKIT_API_KEY,
    'token': process.env.PICKIT_TOKEN,
  };
}

// ─── Crear envío ───────────────────────────────────────────────────────────────
export async function pickitCreateShipment(orderData) {
  const url = `${getPickitBaseUrl()}/index.php/apiV2.1/transaction`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getPickitHeaders(),
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Pickit error ${res.status}`);
  return data;
}

// ─── Generar etiqueta PDF ──────────────────────────────────────────────────────
export async function pickitGenerateLabel(arrayTransactionId) {
  const url = `${getPickitBaseUrl()}/index.php/apiV2.1/label`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getPickitHeaders(),
    body: JSON.stringify({ arrayTransactionId: arrayTransactionId.map(String) }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Pickit label error ${res.status}`);
  }
  // La API devuelve un PDF binario
  return res.arrayBuffer();
}

// ─── Cambiar estado de envío ───────────────────────────────────────────────────
export async function pickitChangeState(transactionId, newState, additional = {}) {
  const url = `${getPickitBaseUrl()}/index.php/apiV2.1/transaction/${transactionId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: getPickitHeaders(),
    body: JSON.stringify({ newState, ...additional }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Pickit error ${res.status}`);
  return data;
}

// ─── Cancelar envío ───────────────────────────────────────────────────────────
export async function pickitCancelShipment(transactionId) {
  const url = `${getPickitBaseUrl()}/index.php/apiV2.1/transaction/${transactionId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getPickitHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Pickit error ${res.status}`);
  return data;
}

// ─── Crear envío + etiqueta en un paso ────────────────────────────────────────
export async function pickitCreateWithLabel(orderData) {
  const shipment = await pickitCreateShipment(orderData);
  const transactionId = shipment?.transaction?.id || shipment?.id;
  if (!transactionId) throw new Error('No se obtuvo transactionId de Pickit');
  const labelBuffer = await pickitGenerateLabel([transactionId]);
  return { shipment, transactionId, labelBuffer };
}

// ─── Formatear datos de orden → payload Pickit ────────────────────────────────
export function formatOrderForPickit(order) {
  const { customerInfo, items, total, orderId } = order;
  const dir = customerInfo.direccion;
  return {
    externalId: orderId,
    recipient: {
      name:         `${customerInfo.nombre} ${customerInfo.apellido}`,
      email:        customerInfo.email,
      phone:        customerInfo.telefono,
      document:     customerInfo.documento || '',
      address: {
        street:     dir.calle,
        number:     dir.numero,
        floor:      dir.piso || '',
        apartment:  dir.depto || '',
        city:       dir.localidad,
        state:      dir.provincia || 'Buenos Aires',
        postalCode: dir.codigoPostal,
        country:    'AR',
        reference:  dir.referencia || '',
      },
    },
    packages: items.map((item, i) => ({
      id:          i + 1,
      description: item.nombre,
      quantity:    item.quantity,
      weight:      0.5,  // kg por defecto, ajustar según producto
      height:      10,
      width:       10,
      depth:       10,
    })),
    declaredValue: total,
    observations:  customerInfo.observaciones || '',
  };
}
