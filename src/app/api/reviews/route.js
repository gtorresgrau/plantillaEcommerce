// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getAuthUser, requireRole } from '@/lib/auth';

// ── GET: listar reseñas de un producto (/api/reviews?cod_producto=X) ─────────
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const cod  = searchParams.get('cod_producto');
    const all  = searchParams.get('all') === 'true'; // admin: incluir no aprobadas

    if (!cod) return NextResponse.json({ error: 'cod_producto requerido' }, { status: 400 });

    const filter = { cod_producto: cod };
    if (!all) filter.aprobado = true;

    const reviews = await Review.find(filter)
      .sort({ destacado: -1, createdAt: -1 })
      .lean();

    const promedio = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return NextResponse.json({ success: true, data: reviews, promedio, total: reviews.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: crear reseña (requiere autenticación) ──────────────────────────────
export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para dejar una reseña.' }, { status: 401 });

    await connectDB();
    const { cod_producto, rating, titulo = '', comentario } = await request.json();

    if (!cod_producto || !rating || !comentario?.trim()) {
      return NextResponse.json({ error: 'Campos obligatorios: cod_producto, rating, comentario.' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'El rating debe ser entre 1 y 5.' }, { status: 400 });
    }

    // Verificar si ya reseñó este producto
    const existente = await Review.findOne({ cod_producto, userId: user.id });
    if (existente) {
      return NextResponse.json({ error: 'Ya dejaste una reseña para este producto.' }, { status: 409 });
    }

    // Verificar si es comprador verificado
    const compra = await Order.findOne({
      userId:      user.id,
      orderStatus: { $in: ['pagado', 'enviado', 'entregado'] },
      'items.cod_producto': cod_producto,
    });

    const review = await Review.create({
      cod_producto,
      userId:   user.id,
      userName: `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.email,
      rating,
      titulo:   titulo.trim(),
      comentario: comentario.trim(),
      aprobado: false,    // requiere aprobación del admin
      compradorVerificado: !!compra,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya dejaste una reseña para este producto.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
