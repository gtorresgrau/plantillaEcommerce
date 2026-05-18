// src/lib/mercadopago.js
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const getClient = () => new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ─── Crear preferencia de pago ─────────────────────────────────────────────────
export async function crearPreferencia({ order, nombreTienda }) {
  const client = getClient();
  const preference = new Preference(client);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const body = {
    external_reference: order.orderId,
    items: order.items.map((item) => ({
      id:          item.cod_producto,
      title:       item.nombre,
      description: item.descripcion || item.nombre,
      quantity:    item.quantity,
      unit_price:  item.precioFinal || item.precio,
      currency_id: 'ARS',
    })),
    payer: {
      name:    order.customerInfo.nombre,
      surname: order.customerInfo.apellido,
      email:   order.customerInfo.email,
      phone:   { area_code: '54', number: order.customerInfo.telefono },
    },
    back_urls: {
      success: `${baseUrl}/checkout/exito?orderId=${order.orderId}`,
      failure: `${baseUrl}/checkout/error?orderId=${order.orderId}`,
      pending: `${baseUrl}/checkout/pendiente?orderId=${order.orderId}`,
    },
    auto_return: 'approved',
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    statement_descriptor: nombreTienda || 'Mi Tienda',
    payment_methods: {
      excluded_payment_types: [],
      installments: 12,
    },
  };

  const result = await preference.create({ body });
  return result;
}

// ─── Obtener info de un pago ───────────────────────────────────────────────────
export async function obtenerPago(paymentId) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
