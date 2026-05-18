// src/app/api/pedidos/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
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

    const { customerInfo, items, metodoPago, tipoEnvio, costoEnvio = 0, vendedorId } = body;

    if (!customerInfo || !items?.length || !metodoPago) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 });
    }

    const subtotal = items.reduce((acc, item) => {
      return acc + (item.precioFinal || item.precio) * item.quantity;
    }, 0);
    const total = subtotal + costoEnvio;

    const orderId = generateOrderId();

    const orderData = {
      orderId,
      userId: user?.id,
      customerInfo,
      items,
      subtotal,
      costoEnvio,
      total,
      metodoPago,
      tipoEnvio: tipoEnvio || 'pickit',
    };

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

    const order = await Order.create(orderData);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/pedidos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
