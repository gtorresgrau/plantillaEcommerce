// src/app/api/pedidos/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Producto from '@/models/Product';
import BrandingConfig from '@/models/BrandingConfig';
import Configuracion from '@/models/Configuracion';
import { getAuthUser } from '@/lib/auth';
import { enviarConfirmacionPedido, notificarAdminNuevoPedido } from '@/lib/email';
import Cupon from '@/models/Cupon';
function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// ─── GET: Listar pedidos (admin ve todos, cliente ve los suyos) ────────────────
export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')  || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const desde  = searchParams.get('desde');
    const hasta  = searchParams.get('hasta');

    const filter = {};

    // Clientes solo ven sus pedidos
    if (user.rol === 'cliente') {
      filter.userId = user.id;
    }

    if (status) filter.orderStatus = status;
    if (desde || hasta) {
      filter.createdAt = {};
      if (desde) filter.createdAt.$gte = new Date(desde);
      if (hasta) filter.createdAt.$lte = new Date(hasta);
    }

    const total   = await Order.countDocuments(filter);
    const pedidos = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: pedidos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/pedidos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── POST: Crear pedido ────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await getAuthUser();

    const { customerInfo, items, metodoPago, tipoEnvio, costoEnvio = 0, vendedorId, cupon: codigoCupon, descuentoCupon = 0 } = body;

    if (!customerInfo || !items?.length || !metodoPago) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 });
    }

    // ── Normalizar campos de dirección (el checkout usa ciudad/cp, el modelo usa localidad/codigoPostal) ──
    const dir = customerInfo.direccion || {};
    const direccionNormalizada = {
      calle:        dir.calle        || '',
      numero:       dir.numero       || '',
      piso:         dir.piso         || '',
      depto:        dir.depto        || '',
      localidad:    dir.localidad    || dir.ciudad     || '',
      provincia:    dir.provincia    || 'Buenos Aires',
      codigoPostal: dir.codigoPostal || dir.cp         || '',
      entreCalles:  dir.entreCalles  || '',
      referencia:   dir.referencia   || '',
    };

    const customerInfoNorm = {
      ...customerInfo,
      direccion: direccionNormalizada,
    };

    // ── Normalizar items (titulo_de_producto → nombre si falta) ───────────────
    const itemsNorm = items.map(item => ({
      cod_producto:       item.cod_producto,
      nombre:             item.nombre || item.titulo_de_producto || '',
      descripcion:        item.descripcion || '',
      precio:             item.precio      || item.precioFinal || 0,
      precioFinal:        item.precioFinal || item.precio      || 0,
      quantity:           item.quantity    || 1,
      foto1:              item.foto1       || item.foto_1_1    || '',
    }));

    const subtotal = itemsNorm.reduce((acc, item) => {
      return acc + (item.precioFinal || item.precio) * item.quantity;
    }, 0);
    const total = Math.max(0, subtotal + costoEnvio - descuentoCupon);

    // ── Validar y registrar uso del cupón ────────────────────────────────────
    let cuponDoc = null;
    if (codigoCupon) {
      cuponDoc = await Cupon.findOne({ codigo: codigoCupon.toUpperCase(), activo: true });
      if (cuponDoc) {
        await Cupon.findByIdAndUpdate(cuponDoc._id, { $inc: { usosActuales: 1 } });
      }
    }

    const orderId = generateOrderId();

    const orderData = {
      orderId,
      userId: user?.id,
      customerInfo: customerInfoNorm,
      items: itemsNorm,
      subtotal,
      costoEnvio,
      descuentoCupon,
      total,
      metodoPago,
      tipoEnvio: tipoEnvio || 'pickit',
    };

    // Persistir info del cupón si fue aplicado
    if (cuponDoc) {
      orderData.cupon = {
        codigo:    cuponDoc.codigo,
        tipo:      cuponDoc.tipo,
        valor:     cuponDoc.valor,
        descuento: descuentoCupon,
      };
    }

    if (vendedorId) {
      const vendedor = await User.findById(vendedorId);
      if (vendedor) {
        const comisionTotal = (total * vendedor.porcentajeComision) / 100;
        orderData.vendedor = {
          vendedorId:         vendedor._id,
          nombre:             `${vendedor.nombre} ${vendedor.apellido}`,
          email:              vendedor.email,
          porcentajeComision: vendedor.porcentajeComision,
          comisionTotal,
        };
      }
    }

    // Registrar estado inicial en historial
    orderData.historialEstados = [{
      estado: 'pendiente',
      fecha:  new Date(),
      nota:   'Pedido creado',
    }];

    const order = await Order.create(orderData);

    // ── Emails de notificación (no bloqueante) ────────────────────────────────
    try {
      const [branding, config] = await Promise.all([
        BrandingConfig.findOne({ activo: true }, { nombreTienda: 1, colores: 1 }).lean(),
        Configuracion.findOne({ activo: true }, { correoAdministracion: 1 }).lean(),
      ]);
      const nombreTienda  = branding?.nombreTienda || 'Mi Tienda';
      const colorPrimary  = branding?.colores?.primary || '#3B82F6';
      const adminEmail    = config?.correoAdministracion;

      await Promise.allSettled([
        enviarConfirmacionPedido({ order: order.toObject(), nombreTienda, colorPrimary }),
        notificarAdminNuevoPedido({ order: order.toObject(), nombreTienda, colorPrimary, adminEmail }),
      ]);
    } catch (emailErr) {
      // Los errores de email no deben romper la creación del pedido
      console.error('[Pedido Email Error]', emailErr.message);
    }

    // ── Descontar stock de cada producto ──────────────────────────────────────
    // Lo hacemos con $inc para evitar condiciones de carrera
    // Si el stock queda negativo, un proceso de conciliación lo detectará
    await Promise.allSettled(
      itemsNorm.map(item =>
        Producto.updateOne(
          { cod_producto: item.cod_producto, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        )
      )
    );

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/pedidos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
